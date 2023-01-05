import { Namespace, Server, Socket } from 'socket.io'
import { Logger } from '../../../helpers/logger'
import { THandler, TRoom, TUser } from '../../../config/types/customTypes'
import { CODE, EVENTS } from '../../../config/data/events'
import { Room } from '../../../database/db'

class ClientHandler implements THandler {
    private io: Server
    private socket: Socket | null

    constructor(io: Server) {
        this.io = io
        this.socket = null
    }

    handle(namespace: Namespace) {
        namespace.on('connection', (socket) => {
            this.socket = socket
            Logger.info(`user ${socket.id} connected`)

            socket.on(EVENTS.DISCONNECT, (reason) => this.onDisconnect(reason))
            socket.on(EVENTS.CLIENT.CONNECT_ERROR, (err) => {
                Logger.error(`connect_error due to ${err.message}`)
            })

            socket.on(EVENTS.CLIENT.WATCHER, (payload) => this.onWatcher(payload))
            socket.on(EVENTS.CLIENT.ANSWER, (payload) => this.onAnswer(payload))
            socket.on(EVENTS.CLIENT.CANDIDATE, (payload) => this.onCandidate(payload))
            socket.on(EVENTS.CLIENT.END, (payload) => this.onEnd(payload))

            socket.on(EVENTS.CLIENT.GET_ROOMS, (cb) => this.onGetRooms(cb))
            socket.on(EVENTS.CLIENT.JOIN, (payload, cb) => this.onJoin(payload, cb))
        })
    }

    onDisconnect(reason: string) {
        if (!this.socket) return
        Logger.info(`user ${this.socket.id} disconnected - reason: ${reason}`)

        const { room, broadcaster } = this.getRoomOfSocketId(this.socket.id)

        if(!room) return

        Room.rooms.set(room.roomName, {
            broadcaster: broadcaster,
            room: room,
            user: null
        })

        this.io.of(EVENTS.NAMESPACE.ADMIN)
            .to(broadcaster.socketId)
            .emit(EVENTS.DISCONNECT_PEER, {
                clientSocketId: this.socket.id
            })
    }

    // after join
    onWatcher({ room }: { room: string }) {
        if (!this.socket) return
        // get room
        const _room = Room.rooms.get(room)
        // emit event to broadcaster
        this.io.of(EVENTS.NAMESPACE.ADMIN)
        .to(_room?.broadcaster.socketId!)
        .emit(EVENTS.ADMIN.EMIT.WATCHER, {
            clientSocketId: this.socket.id
        })
    }

    // after offer
    onAnswer({ adminSocketId, clientLocalDescription }: { adminSocketId: string, clientLocalDescription: string }) {
        if (!this.socket) return
        this.io.of(EVENTS.NAMESPACE.ADMIN)
        .to(adminSocketId)
        .emit(EVENTS.ADMIN.EMIT.ANSWER, {
            clientSocketId: this.socket.id,
            remoteDescription: clientLocalDescription
        })
    }

    // after offer
    onCandidate({ adminSocketId, eventCandidate }: { adminSocketId: string, eventCandidate: string }) {
        if (!this.socket) return
        this.io.of(EVENTS.NAMESPACE.ADMIN)
        .to(adminSocketId)
        .emit(EVENTS.ADMIN.EMIT.CANDIDATE, {
            adminSocketId: this.socket.id,
            candidate: eventCandidate
        })
    }

    onEnd({ room }: { room: string }) {
        // Room.instance.rooms.delete(room)
        // this.io.to(room).emit('end-broadcast')
    }

    onGetRooms(callback: Function) {
        const roomsArray: TRoom[] = []
        const rooms = Room.rooms.values()
        for (const room of rooms) {
            roomsArray.push(room)
        }
        callback(roomsArray)
    }

    onJoin({ room, user }: { room: string, user: TUser }, callback: Function) {
        if (!this.socket) return callback(CODE.SOCKET.DOESNT_EXISTS)
        // check if room exists
        const _room = Room.rooms.get(room)
        if (!_room)
            return callback(CODE.ROOM.DOESNT_EXISTS)
        // check if room not empty
        if (_room.user)
            return callback(CODE.ROOM.NOT_EMPTY)
        // update and join room
        Room.rooms.set(room, { 
            broadcaster: _room.broadcaster,
            room: _room.room,
            user: user
        })
        this.socket.join(room)
    }

    private getRoomOfSocketId(socketId: string) {
        const values = Room.rooms.values()
        for (let value of values) {
            if (socketId === value.user?.socketId)
                return { room: value.room, broadcaster: value.broadcaster }
        }
        return { room: null, broadcaster: null }
    }
}

export { ClientHandler }
