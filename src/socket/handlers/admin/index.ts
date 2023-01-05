import { Namespace, Server, Socket } from 'socket.io'
import { CODE, EVENTS } from '../../../config/data/events'

import { THandler, TRoom, TRoomInfo, TUser } from '../../../config/types/customTypes'
import { Room } from '../../../database/db'
import { Logger } from '../../../helpers/logger'

class AdminHandler implements THandler {
    private io: Server
    private socket: Socket | null

    constructor(io: Server) {
        this.io = io
        this.socket = null
    }

    handle(namespace: Namespace) {
        namespace.on('connection', (socket) => {
            this.socket = socket
            Logger.info(`admin ${socket.id} connected`)

            socket.on(EVENTS.DISCONNECT, (reason) => this.onDisconnect(reason))
            socket.on(EVENTS.ADMIN.CONNECT_ERROR, (err) => {
                Logger.error(`connect_error due to ${err.message}`)
            })

            socket.on(EVENTS.ADMIN.START_VIDEO, () => this.onStart())
            socket.on(EVENTS.ADMIN.BRADCASTER, (payload) => this.onBroadcaster(payload))
            socket.on(EVENTS.ADMIN.OFFER, (payload) => this.onOffer(payload))
            socket.on(EVENTS.ADMIN.CANDIDATE, (payload) => this.onCandidate(payload))
            socket.on(EVENTS.ADMIN.END, () => this.onEnd())

            socket.on(EVENTS.ADMIN.CREATE_ROOM, (payload, cb) => this.onCreateRoom(payload))
            socket.on(EVENTS.ADMIN.GET_ROOMS, (payload, cb) => this.onGetRooms(payload, cb))
            socket.on(EVENTS.ADMIN.SAVE_ROOMS, () => this.onSaveRooms())
            socket.on(EVENTS.ADMIN.UPDATE_DESCRIPTION_IMAGE, (payload) => this.onUpdateDescriptionAndImage(payload))
            socket.on(EVENTS.ADMIN.TOGGLE_AVAILABLE, (payload, cb) => this.onToggleAvailable(payload, cb))
            socket.on(EVENTS.ADMIN.DELETE_ROOM, (payload, cb) => this.onDeleteRoom(payload, cb))

            this.updateRooms()
        }) 
    }

    onDisconnect(reason: string) {
        if (!this.socket) return

        Logger.info(`admin ${this.socket?.id} disconnected - reason: ${reason}`)
        const _rooms = this.getRoomsOfBroadcaster(this.socket.id)
        if (!_rooms) return

        this.deleteSpecificRooms(_rooms)

        this.io.of(EVENTS.NAMESPACE.CLIENT)
        .to(_rooms)
        .emit(EVENTS.DISCONNECT_PEER)
    }

    onBroadcaster({ room , user }: { room: string, user: string }) {
        if (!this.socket) return

        // Room.instance.rooms.set(room, {
        //     broadcaster: this.socket.id,
        //     room: room,
        //     user: user
        // })
        this.socket.join(room)

        this.io.of(EVENTS.NAMESPACE.CLIENT)
        .emit(EVENTS.CLIENT.EMIT.BROADCASTER)
    }

    // after onWatcher
    onOffer({ socketClientId, adminLocalDescription }: { socketClientId: string, adminLocalDescription: string }) {
        if (!this.socket) return
        this.io.of(EVENTS.NAMESPACE.CLIENT)
            .to(socketClientId)
            .emit(EVENTS.CLIENT.EMIT.OFFER, {
                adminSocketId: this.socket.id,
                remoteDescription: adminLocalDescription
            })
    }

    // after onWatcher
    onCandidate({ clientSocketId, eventCandidate }: { clientSocketId: string, eventCandidate: string }) {
        if (!this.socket) return
        this.io.of(EVENTS.NAMESPACE.CLIENT)
        .to(clientSocketId)
        .emit(EVENTS.CLIENT.EMIT.CANDIDATE, {
            adminSocketId: this.socket.id,
            candidate: eventCandidate
        })
    }

    onStart() {
        if (!this.socket) return 
        this.socket.emit(EVENTS.ADMIN.START_VIDEO)
    }

    onEnd() {
        // get the connection which ended
        this.io.of(EVENTS.NAMESPACE.CLIENT)
        .emit(EVENTS.CLIENT.EMIT.END_BROADCAST)
    }

    onCreateRoom(room: TRoom) {
        if (!this.socket) return
        // check if room already exists
        if (Room.rooms.get(room.room.roomName)) // emit back to sender
            return this.socket.emit(EVENTS.ADMIN.ROOM_CREATED, {
                roomCode: CODE.ROOM.ALREADY_EXISTS,
                room: null
            })
        // create room
        Room.rooms.set(room.room.roomName, room)
        this.socket.emit(EVENTS.ADMIN.ROOM_CREATED, {
            roomCode: CODE.ROOM.OK,
            room: room
        })
        // send to client
        const roomsArray = this.getAllRooms()
        this.io.of(EVENTS.NAMESPACE.CLIENT)
        .emit(EVENTS.ADMIN.CREATE_ROOM, {
            rooms: roomsArray
        })
    }

    onGetRooms({ broadcasterName }: { broadcasterName: string }, callback: Function) {
        const roomsArray: TRoom[] = []
        const roomsNames = this.getRoomsOfBroadcaster(broadcasterName)
        roomsNames.forEach((roomName) => {
            const room = Room.rooms.get(roomName)
            if (room) roomsArray.push(room)
        })
        callback(roomsArray)
    }

    onSaveRooms() {
        Room.save()
    }

    onUpdateDescriptionAndImage({ room, description, image }: { room: TRoom, description: string, image: string }) {
        Room.rooms.set(room.room.roomName, {
            broadcaster: {
                name: room.broadcaster.name,
                socketId: room.broadcaster.socketId
            },
            room: {
                roomName: room.room.roomName,
                title: description,
                preview: image,
                ready: true,
                available: false
            },
            user: null
        })
        this.socket?.emit(EVENTS.ADMIN.READY, { room: Room.rooms.get(room.room.roomName) })
        // send to client
        const roomsArray = this.getAllRooms()
        this.io.of(EVENTS.NAMESPACE.CLIENT)
        .emit(EVENTS.ADMIN.UPDATE_DESCRIPTION_IMAGE, {
            rooms: roomsArray
        })
    }

    onToggleAvailable({ availableRoom }: { availableRoom : TRoom }, callback: Function) {
        Room.rooms.set(availableRoom.room.roomName, availableRoom)
        callback(availableRoom)
        // send to client
        const roomsArray = this.getAllRooms()
        this.io.of(EVENTS.NAMESPACE.CLIENT)
        .emit(EVENTS.ADMIN.UPDATE_DESCRIPTION_IMAGE, {
            rooms: roomsArray
        })
    }

    onDeleteRoom({ iRoom }: { iRoom: TRoom }, callback: Function) {
        Room.rooms.delete(iRoom.room.roomName)
        const rooms = this.getAllRooms()
        callback(rooms)
        // send to client
        this.io.of(EVENTS.NAMESPACE.CLIENT)
        .emit(EVENTS.ADMIN.DELETE_ROOM, { rooms: rooms })
    }

    /**
     * update rooms variable to saved config in file
     */
    private updateRooms() {
        const fileRooms = Room.read()
        fileRooms.forEach((value, key) => { Room.rooms.set(key, value) })
    }

    private getRoomsOfBroadcaster(name: string) {
        const broadcasterRooms: string[] = []
        Room.rooms.forEach((value) => {
            if (name === value.broadcaster.name)
                broadcasterRooms.push(value.room.roomName)
        })
        return broadcasterRooms
    }

    private deleteSpecificRooms(rooms: string[]) {
        for (const room of rooms) {
            Room.rooms.delete(room)
        }
    }

    private getAllRooms() {
        const roomsArray: TRoom[] = []
        const rooms = Room.rooms.values()
        for (const room of rooms) {
            roomsArray.push(room)
        }
        return roomsArray
    }
}

export { AdminHandler }
