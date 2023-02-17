import { Server, Socket } from 'socket.io'
import { CODE, EVENTS } from '../../../config/data/events'
import { TRoom } from '../../../config/types/customTypes'
import { Room } from '../../../repositories/Room'
import { Logger } from '../../../helpers/logger'
import { getAllRooms, getRoomOfSocketId, getRoomOfUserId } from '../utils'
import { v4 as uuid } from 'uuid'

export default function roomsEvents (io: Server, socket: Socket) {

    function onDisconnect(reason: string) {
        if (!socket) return
        Logger.info(`user ${socket.id} disconnected - reason: ${reason}`)

        const { room } = getRoomOfSocketId(socket.id)

        if(!room) return Logger.error(`Couldn\'t delete socket from room: ${socket.id}`)

        Room.rooms.set(room.room.roomName, {
            broadcaster: room.broadcaster,
            room: {
                roomName: room.room.roomName,
                preview: room.room.preview,
                title: room.room.title,
                ready: true,
                available: !room.user?.kicked,
            },
            user: null
        })
        // unjoin configs in host
        io.of(EVENTS.NAMESPACE.ADMIN)
        .to(room?.broadcaster.socketId!)
        .emit(EVENTS.CLIENT.UNJOINED, room.room.roomName)
        // disconnects host peer
        io.of(EVENTS.NAMESPACE.ADMIN)
            .to(room.broadcaster.socketId)
            .emit(EVENTS.DISCONNECT_PEER, {
                id: socket.id,
                roomName: room.room.roomName
            })
        // to client new list of rooms
        const roomsArray = getAllRooms()
        socket.broadcast.emit(EVENTS.CLIENT.UNJOINED, {
            rooms: roomsArray
        })
    }

    function onEnd( room: string ) {
        // Room.instance.rooms.delete(room)
        // io.to(room).emit('end-broadcast')
    }

    function onGetRooms(callback: Function) {
        const roomsArray: TRoom[] = []
        const rooms = Room.rooms.values()
        for (const room of rooms) {
            roomsArray.push(room)
        }
        callback(roomsArray)
    }

    function onJoin({ room }: { room: TRoom }, callback: Function) {

        if (!socket) return callback(CODE.SOCKET.DOESNT_EXISTS)
        // check if user has beign sent
        if (!room.user) return callback(CODE.ROOM.NO_USER)
        // check if room exists
        const _room = Room.rooms.get(room.room.roomName)
        if (!_room)
            return callback(CODE.ROOM.DOESNT_EXISTS)
        // check if room not empty
        if (_room.user)
            return callback(CODE.ROOM.NOT_EMPTY)
        // check if user already in other room
        const roomUserIn = getRoomOfUserId(room.user.id)
        if (roomUserIn.room)
            return callback(CODE.USER.ALREADY_IN_ROOM)
        // update and join room
        Logger.info(`user ${socket.id} is joining room ${room.room.roomName}`)

        // update the room user and joined time
        Room.rooms.set(room.room.roomName, {
            broadcaster: room.broadcaster,
            room: room.room,
            user: {
                name: room.user.name,
                socketId: room.user.socketId,
                id: room.user.id,
                kicked: room.user.kicked,
                expirationTime: new Date().getTime() + 1000 * 60 * 30
            }
        })
        socket.join(room.room.roomName)
        return callback(CODE.ROOM.OK)
    }

    function onJoined( roomName: string ) {
        // to admin
        const room = Room.rooms.get(roomName)
        io.of(EVENTS.NAMESPACE.ADMIN)
        .to(room?.broadcaster.socketId!)
        .emit(EVENTS.CLIENT.JOINED, room)
        // to client list of rooms
        const roomsArray = getAllRooms()
        socket.broadcast.emit(EVENTS.CLIENT.JOINED, {
            rooms: roomsArray
        })
        Logger.info(`user ${socket?.id} has joined room ${room?.room.roomName}`)
    }

    socket.on(EVENTS.DISCONNECT, onDisconnect)
    socket.on(EVENTS.CLIENT.CONNECT_ERROR, (err) => {
        Logger.error(`connect_error due to ${err.message}`)
    })

    socket.on(EVENTS.CLIENT.END, onEnd)

    socket.on(EVENTS.CLIENT.GET_ROOMS, onGetRooms)
    socket.on(EVENTS.CLIENT.JOIN, onJoin)
    socket.on(EVENTS.CLIENT.JOINED, onJoined)
}