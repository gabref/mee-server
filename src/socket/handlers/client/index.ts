import { Namespace, Server, Socket } from 'socket.io'
import { Logger } from '../../../helpers/logger'
import { THandler } from '../../../config/types/customTypes'

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

            socket.on('client:connect_error', (err) => {
                Logger.error(`connect_error due to ${err.message}`)
            })
            socket.on('disconnect', (reason) => Logger.info('disconnect'))
        })
    }
}

export { ClientHandler }
