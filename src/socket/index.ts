import { Server } from 'socket.io'
import { Listener } from './helpers/Listener'
import { AdminHandler } from './handlers/admin'
import { ClientHandler } from './handlers/client'

function use (io: Server) {
    const listener = new Listener(io)
    const adminHandler = new AdminHandler(io)
    const clientHandler = new ClientHandler(io)

    listener.listen('/admin', adminHandler)
    listener.listen('/client', clientHandler)
}

export default { use }
