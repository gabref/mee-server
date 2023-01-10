import { Server } from 'socket.io'
import { Listener } from './helpers/Listener'
import { AdminHandler } from './handlers/admin'
import { ClientHandler } from './handlers/client'
import { initWorkers } from '../workers'

function use (io: Server) {
    const listener = new Listener(io)
    const adminHandler = new AdminHandler(io)
    const clientHandler = new ClientHandler(io)

    listener.listen('/admin', adminHandler)
    listener.listen('/client', clientHandler)

    // starts the cronjobs
    initWorkers(io)
}

export default { use }
