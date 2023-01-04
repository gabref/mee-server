import { Namespace, Server, Socket } from 'socket.io'
import { EVENTS } from '../../../config/data/events'

import { THandler } from '../../../config/types/customTypes'
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

            socket.on(EVENTS.DISCONNECT, (reason) => this.disconnect(reason))
            socket.on(EVENTS.ADMIN.CONNECT_ERROR, (err) => {
                Logger.error(`connect_error due to ${err.message}`)
            })

            socket.on(EVENTS.ADMIN.START, () => this.onStart())
            socket.on(EVENTS.ADMIN.BRADCASTER, (payload) => this.onBroadcaster(payload))
            socket.on(EVENTS.ADMIN.OFFER, (payload) => this.onOffer(payload))
            socket.on(EVENTS.ADMIN.CANDIDATE, (payload) => this.onCandidate(payload))
            socket.on(EVENTS.ADMIN.END, () => this.onEnd())
        }) 
    }

    disconnect(reason: string) {
        Logger.info(`admin ${this.socket?.id} disconnected - reason: ${reason}`)
        // users.delete(this.socket!)
        this.io.of(EVENTS.NAMESPACE.CLIENT)
        .to('myRoom')
        .emit(EVENTS.DISCONNECT_PEER)
    }

    onBroadcaster({ room , user }: { room: string, user: string }) {
        if (!this.socket) return

        // Room.instance.rooms.set(room, {
        //     broadcaster: this.socket.id,
        //     room: room,
        //     user: user
        // })
        // this.socket.join(room)

        this.io.of(EVENTS.NAMESPACE.CLIENT)
        .emit(EVENTS.CLIENT.EMIT.BROADCASTER)
    }

    onOffer({ socketClientId, adminLocalDescription }: { socketClientId: string, adminLocalDescription: string }) {
        if (!this.socket) return
        this.io.of(EVENTS.NAMESPACE.CLIENT)
            .to(socketClientId)
            .emit(EVENTS.CLIENT.EMIT.OFFER, 
                  this.socket.id,
                  adminLocalDescription)
    }

    onCandidate({ id, message }: { id: string, message: string }) {
        if (!this.socket) return
        this.io.of(EVENTS.NAMESPACE.CLIENT)
        .to(id)
        .emit(EVENTS.CLIENT.EMIT.CANDIDATE,
              this.socket.id, 
              message)
    }

    onStart() {
        this.socket?.emit(EVENTS.ADMIN.START)
    }

    onEnd() {
        // get the connection which ended
        this.io.of(EVENTS.NAMESPACE.CLIENT)
        .emit(EVENTS.CLIENT.EMIT.END_BROADCAST)
    }
}

export { AdminHandler }
