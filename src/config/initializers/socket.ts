import * as http from 'http'
import { Application } from 'express'
import { Server, ServerOptions } from 'socket.io'

import SocketListener from '../../../src/socket'

const options: Partial<ServerOptions> = {
    serveClient: false,
    pingInterval: 30000,
    pingTimeout: 50000,
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
