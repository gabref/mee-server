import { Namespace, Server, Socket } from 'socket.io'
import { Logger } from '../../../helpers/logger'
import { THandler } from '../../../config/types/customTypes'
import { EVENTS } from '../../../config/data/events'

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
        })
    }

    onDisconnect(reason: string) {
        Logger.info(`user ${this.socket?.id} disconnected - reason: ${reason}`)
        // users.delete(this.socket!)
        // this.socket?.to('myRoom').emit('disconnectPeer', this.socket.id)
        this.io.of(EVENTS.NAMESPACE.ADMIN)
            // .to('myRoom')
            .emit(EVENTS.DISCONNECT_PEER,
                this.socket?.id)
    }

    onWatcher({ room }: { room: string }) {
        if (!this.socket) return
        // Room.instance.rooms.get(room)
        // const broadcast = { broadcaster: 'admin' }
        this.io.of(EVENTS.NAMESPACE.ADMIN)
        // .to(broadcast.broadcaster)
        .emit(EVENTS.ADMIN.EMIT.WATCHER,
              this.socket.id)
    }

    onAnswer({ adminSocketId, clientLocalDescription }: { adminSocketId: string, clientLocalDescription: string }) {
        if (!this.socket) return
        this.io.of(EVENTS.NAMESPACE.ADMIN)
        .to(adminSocketId)
        .emit(EVENTS.ADMIN.EMIT.ANSWER,
              this.socket.id,
              clientLocalDescription)
    }

    onCandidate({ id, message }: { id: string, message: string }) {
        if (!this.socket) return
        this.io.of(EVENTS.NAMESPACE.ADMIN)
        .to(id)
        .emit(EVENTS.ADMIN.EMIT.CANDIDATE,
              this.socket.id,
              message)
    }

    onEnd({ room }: { room: string }) {
        // Room.instance.rooms.delete(room)
        // this.io.to(room).emit('end-broadcast')
    }
}

export { ClientHandler }
