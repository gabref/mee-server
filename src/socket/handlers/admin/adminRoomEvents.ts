import { Server, Socket } from 'socket.io'
import { CODE, EVENTS } from '../../../config/data/events'
import { TBroadcaster, TRoom, TUser } from '../../../config/types/customTypes'
import { Room } from '../../../repositories/Room'
import { Logger } from '../../../helpers/logger'
import { deleteSpecificRooms, getAllRooms, getRoomOfSocketId, getRoomsOfBroadcasterByBroadcasterId, getRoomsOfBroadcasterBySocketId } from '../utils'

export default function roomsEvents (io: Server, socket: Socket) {

    function onDisconnect(reason: string) {
        if (!socket) return

        Logger.info(`admin ${socket?.id} disconnected - reason: ${reason}`)

        // get rooms of socket id
        const roomsOfBroadcaster = getRoomsOfBroadcasterBySocketId(socket.id)
        for (const roomName of roomsOfBroadcaster) {
            const room = Room.rooms.get(roomName)
            if (!room) continue
            Room.rooms.set(roomName, {
                ...room,
                broadcaster: {
                    ...room.broadcaster,
                    disconnectionTime: Date.now()
                }
            })
        }
    }

    function onExit(broadcasterId: string) {
        // const _rooms = getRoomsOfBroadcasterBySocketId(socket.id)
        const _rooms = getRoomsOfBroadcasterByBroadcasterId(broadcasterId)
        if (_rooms.length === 0) return

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

    function onConnect(broadcasterUser: TBroadcaster) {
        console.log('on connect', broadcasterUser)
        const { id, socketId } = broadcasterUser
        const broadcasterRooms = getRoomsOfBroadcasterByBroadcasterId(id)
        console.log('broadcaster rooms', broadcasterRooms)
        if (broadcasterRooms.length === 0) return

        // update the socketId of broadcaster in rooms
        for (const roomName of broadcasterRooms) {
            const room = Room.rooms.get(roomName)
            if (room) {
                Room.rooms.set(roomName, {
                    ...room,
                    broadcaster: {
                        ...room.broadcaster,
                        socketId: socketId,
                        disconnectionTime: undefined
                    }
                })
            }
        }
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
        const roomsNames = getRoomsOfBroadcasterBySocketId(adminSocketId)
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
                socketId: room.broadcaster.socketId,
                id: room.broadcaster.id
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
        onEnd(roomName)
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

    socket.on(EVENTS.ADMIN.CONNECT, onConnect)
    socket.on(EVENTS.ADMIN.EXIT, onExit)
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