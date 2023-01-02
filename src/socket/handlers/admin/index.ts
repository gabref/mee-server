import { Namespace, Server, Socket } from 'socket.io'

import { THandler } from '../../../config/types/customTypes'
import { Logger } from '../../../helpers/logger'

class AdminHandler implements THandler {
    private io: Server
    private socket: Socket | null

    constructor(io: Server) {
        this.io = io
        this.socket = null
        // new Room()
    }

    handle(namespace: Namespace) {
        namespace.on('connection', (socket) => {
            this.socket = socket
            Logger.info(`admin ${socket.id} connected`)

            socket.on('disconnect', (reason) => this.disconnect(reason))
            socket.on('admin:connect_error', (err) => {
                Logger.error(`connect_error due to ${err.message}`)
            })
        })
    }

    disconnect(reason: string) {
        Logger.info(`admin ${this.socket?.id} disconnected - reason: ${reason}`)
        // users.delete(this.socket!)
        this.io.of('/client').to('myroom').emit('disconnectPeer')
    }
}

export { AdminHandler }
