import { Namespace, Server, Socket } from 'socket.io'

import { THandler } from '../../../config/types/customTypes'
import { Logger } from '../../../helpers/logger'
import { updateRooms } from '../utils'
import roomsEvents from './adminRoomEvents'
import webrtcEvents from './adminWebRTCEvents'

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

            updateRooms(socket.id)
            roomsEvents(this.io, socket)
            webrtcEvents(this.io, socket)
        }) 
    }

}

export { AdminHandler }
