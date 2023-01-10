import { Server, Socket } from 'socket.io'
import { EVENTS } from '../../../config/data/events'
import { Room } from '../../../repositories/Room'

export default function webrtcEvents (io: Server, socket: Socket) {
    // after join
    function onWatcher( roomName: string ) {
        if (!socket) return
        // get room
        const _room = Room.rooms.get(roomName)
        // emit event to broadcaster
        io.of(EVENTS.NAMESPACE.ADMIN)
        .to(_room?.broadcaster.socketId!)
        .emit(EVENTS.ADMIN.EMIT.WATCHER, socket.id, roomName )
    }

    // after offer
    function onAnswer( adminSocketId: string, clientLocalDescription: string, roomName: string ) {
        if (!socket) return
        io.of(EVENTS.NAMESPACE.ADMIN)
        .to(adminSocketId)
        .emit(EVENTS.ADMIN.EMIT.ANSWER, socket.id, clientLocalDescription, roomName )
    }

    // after offer
    function onCandidate( adminSocketId: string, eventCandidate: string, roomName: string ) {
        if (!socket) return
        io.of(EVENTS.NAMESPACE.ADMIN)
        .to(adminSocketId)
        .emit(EVENTS.ADMIN.EMIT.CANDIDATE, socket.id, eventCandidate, roomName )
    }

    socket.on(EVENTS.CLIENT.WATCHER, onWatcher)
    socket.on(EVENTS.CLIENT.ANSWER, onAnswer)
    socket.on(EVENTS.CLIENT.CANDIDATE, onCandidate)
}