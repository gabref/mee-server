import * as http from 'http'
import { Application } from 'express'
import { Server } from 'socket.io'

import SocketListener from '../../../src/socket'

const options = {
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false,
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
}

export default (app: Application): http.Server => {
    const httpServer = http.createServer(app)
    const io = new Server(httpServer, options)

    SocketListener.use(io)

    return httpServer
}
