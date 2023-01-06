import { Namespace, Server, Socket } from 'socket.io'
import { Logger } from '../../../helpers/logger'
import { THandler, TRoom, TUser } from '../../../config/types/customTypes'
import { CODE, EVENTS } from '../../../config/data/events'
import { Room } from '../../../database/db'
import webrtcEvents from './clientWebRTCEvents'
import roomsEvents from './clientRoomEvents'

class ClientHandler implements THandler {
    private io: Server

    constructor(io: Server) {
        this.io = io
    }

    handle(namespace: Namespace) {
        namespace.on('connection', (socket) => {
            Logger.info(`user ${socket.id} connected`)

            roomsEvents(this.io, socket)
            webrtcEvents(this.io, socket)
        })
    }
}

export { ClientHandler }
