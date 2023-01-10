import { Server, Socket } from 'socket.io'
import { CODE, EVENTS } from '../../../config/data/events'
import { TRoom } from '../../../config/types/customTypes'
import { Room } from '../../../repositories/Room'
import { Logger } from '../../../helpers/logger'
import { deleteSpecificRooms, getAllRooms, getRoomOfSocketId, getRoomsOfBroadcaster } from '../utils'

export default function roomsEvents (io: Server, socket: Socket) {

    function onDisconnect(reason: string) {
        if (!socket) return

        Logger.info(`admin ${socket?.id} disconnected - reason: ${reason}`)
        const _rooms = getRoomsOfBroadcaster(socket.id)
        if (!_rooms) return

        deleteSpecificRooms(_rooms)

        io.of(EVENTS.NAMESPACE.CLIENT)
        .to(_rooms)
        .emit(EVENTS.DISCONNECT_PEER)
        // send to client new list of rooms
        const roomsArray = getAllRooms()
        io.of(EVENTS.NAMESPACE.CLIENT)
        .emit(EVENTS.ADMIN.UPDATE_DESCRIPTION_IMAGE, {
            rooms: roomsArray
        })
    }


    function onEnd(roomName: string) {
        // kick user on session
        io.of(EVENTS.NAMESPACE.CLIENT)
        .to(roomName)
        .emit(EVENTS.CLIENT.EMIT.END_BROADCAST)
    }

    function onCreateRoom(room: TRoom) {
        if (!socket) return
        // check if room already exists
        if (Room.rooms.get(room.room.roomName)) // emit back to sender
            return socket.emit(EVENTS.ADMIN.ROOM_CREATED, {
                roomCode: CODE.ROOM.ALREADY_EXISTS,
                room: null
            })
        // create room
        Room.rooms.set(room.room.roomName, room)
        socket.emit(EVENTS.ADMIN.ROOM_CREATED, {
            roomCode: CODE.ROOM.OK,
            room: room
        })
        // send to client
        const roomsArray = getAllRooms()
        io.of(EVENTS.NAMESPACE.CLIENT)
        .emit(EVENTS.ADMIN.CREATE_ROOM, {
            rooms: roomsArray
        })
    }

    function onGetRooms({ adminSocketId }: { adminSocketId: string }, callback: Function) {
        const roomsArrayB: TRoom[] = []
        const roomsNames = getRoomsOfBroadcaster(adminSocketId)
        roomsNames.forEach((roomName) => {
            const room = Room.rooms.get(roomName)
            if (room) roomsArrayB.push(room)
        })
        callback(roomsArrayB)


        // send to client
        const roomsArray = getAllRooms()
        io.of(EVENTS.NAMESPACE.CLIENT)
        .emit(EVENTS.ADMIN.CREATE_ROOM, {
            rooms: roomsArray
        })
    }

    function onSaveRooms() {
        Room.save()
    }

    function onUpdateDescriptionAndImage({ room, description, image }: { room: TRoom, description: string, image: string }, callback: Function) {
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
        // send to client
        const roomsArray = getAllRooms()
        io.of(EVENTS.NAMESPACE.CLIENT)
        .emit(EVENTS.ADMIN.UPDATE_DESCRIPTION_IMAGE, {
            rooms: roomsArray
        })
        callback(CODE.ROOM.OK)
    }

    function onReady(roomName: string) {
        const room = Room.rooms.get(roomName)
        if (!room) return

        Room.rooms.set(roomName, {
            broadcaster: room.broadcaster,
            user: room.user,
            room: {
                roomName: room.room.roomName,
                title: room.room.title,
                preview: room.room.preview,
                ready: true,
                available: false
            }
        })
        socket?.emit(EVENTS.ADMIN.READY, { room: Room.rooms.get(room.room.roomName) })
    }

    function onUnready(roomName: string) {
        const room = Room.rooms.get(roomName)
        if (!room) return

        Room.rooms.set(roomName, {
            broadcaster: room.broadcaster,
            user: room.user,
            room: {
                roomName: room.room.roomName,
                title: room.room.title,
                preview: room.room.preview,
                ready: false,
                available: false
            }
        })
        socket?.emit(EVENTS.ADMIN.UNREADY, { room: Room.rooms.get(room.room.roomName) })
    }

    function onToggleAvailable({ availableRoom }: { availableRoom : TRoom }, callback: Function) {
        Room.rooms.set(availableRoom.room.roomName, availableRoom)
        callback(availableRoom)
        // send to client
        const roomsArray = getAllRooms()
        io.of(EVENTS.NAMESPACE.CLIENT)
        .emit(EVENTS.ADMIN.UPDATE_DESCRIPTION_IMAGE, {
            rooms: roomsArray
        })
    }

    function onDeleteRoom({ iRoom, clientSocketId }: { iRoom: TRoom, clientSocketId: string }, callback: Function) {
        Room.rooms.delete(iRoom.room.roomName)
        const rooms = getAllRooms()
        callback({ rooms: rooms, clientSocketId: clientSocketId })
        // send to client
        io.of(EVENTS.NAMESPACE.CLIENT)
        .emit(EVENTS.ADMIN.DELETE_ROOM, { rooms })

        io.of(EVENTS.NAMESPACE.CLIENT)
        .to(iRoom.room.roomName)
        .emit(EVENTS.ADMIN.DELETE_THIS_ROOM)
    }


    socket.on(EVENTS.DISCONNECT, onDisconnect)
    socket.on(EVENTS.ADMIN.CONNECT_ERROR, (err) => {
        Logger.error(`connect_error due to ${err.message}`)
    })

    socket.on(EVENTS.ADMIN.END, onEnd)

    socket.on(EVENTS.ADMIN.CREATE_ROOM, onCreateRoom)
    socket.on(EVENTS.ADMIN.GET_ROOMS, onGetRooms)
    socket.on(EVENTS.ADMIN.SAVE_ROOMS, onSaveRooms)
    socket.on(EVENTS.ADMIN.UPDATE_DESCRIPTION_IMAGE, onUpdateDescriptionAndImage)
    socket.on(EVENTS.ADMIN.TOGGLE_AVAILABLE, onToggleAvailable)
    socket.on(EVENTS.ADMIN.DELETE_ROOM, onDeleteRoom)
    socket.on(EVENTS.ADMIN.READY, onReady)
    socket.on(EVENTS.ADMIN.UNREADY, onUnready)

}