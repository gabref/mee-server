import { Namespace, Server, Socket } from 'socket.io'

import { THandler } from '../../../config/types/customTypes'
import { Logger } from '../../../helpers/logger'
import { updateRooms } from '../utils'
import roomsEvents from './adminRoomEvents'
import webrtcEvents from './adminWebRTCEvents'

class AdminHandler implements THandler {
    private io: Server

    constructor(io: Server) {
        this.io = io
    }

    handle(namespace: Namespace) {
        namespace.on('connection', (socket) => {
            Logger.info(`admin ${socket.id} connected`)

            updateRooms(socket.id)
            roomsEvents(this.io, socket)
            webrtcEvents(this.io, socket)
        }) 
    }

}

export { AdminHandler }
