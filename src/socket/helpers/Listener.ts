import { Server } from 'socket.io'
import { Logger } from '../../helpers/logger'
import { THandler } from '../../config/types/customTypes'

class Listener {
    private io: Server

    constructor(io: Server) {
        this.io = io
    }

    listen(namespace: string, handler: THandler) {
        try {
            handler.handle(this.io.of(namespace))
        } catch (err) {
            Logger.error(`Listen function not found for ${namespace} namespace`)
        }
    }
}

export { Listener }
