import { Server, Socket } from 'socket.io'
import { EVENTS } from '../../../config/data/events'
import { Logger } from '../../../helpers/logger'
import { Room } from '../../../repositories/Room'

export default function webrtcEvents (io: Server, socket: Socket) {

    function onBroadcaster( room: string, user: string ) {
        if (!socket) return

        // Room.instance.rooms.set(room, {
        //     broadcaster: socket.id,
        //     room: room,
        //     user: user
        // })
        socket.join(room)

        // io.of(EVENTS.NAMESPACE.CLIENT)
        // .emit(EVENTS.CLIENT.EMIT.BROADCASTER)
    }

    // after onWatcher
    function onOffer( socketClientId: string, adminLocalDescription: string ) {
        Logger.debug('on offer', socketClientId, adminLocalDescription)
        if (!socket) return
        io.of(EVENTS.NAMESPACE.CLIENT)
            .to(socketClientId)
            .emit(EVENTS.CLIENT.EMIT.OFFER, socket.id, adminLocalDescription )
    }

    // after onWatcher
    function onCandidate( clientSocketId: string, eventCandidate: string ) {
        Logger.debug('on candidate', clientSocketId, eventCandidate)
        if (!socket) return
        io.of(EVENTS.NAMESPACE.CLIENT)
        .to(clientSocketId)
        .emit(EVENTS.CLIENT.EMIT.CANDIDATE, socket.id, eventCandidate )
    }

    function onStart( roomName: string ) {
        if (!socket) return 
        socket.emit(EVENTS.ADMIN.START_VIDEO, roomName )
    }

    function onStop( clientSocketId: string, roomName: string ) {
        if (!socket) return
        socket.emit(EVENTS.ADMIN.STOP_VIDEO, clientSocketId, roomName )
    }

    socket.on(EVENTS.ADMIN.START_VIDEO, onStart)
    socket.on(EVENTS.ADMIN.STOP_VIDEO, onStop)
    socket.on(EVENTS.ADMIN.BROADCASTER, onBroadcaster)
    socket.on(EVENTS.ADMIN.OFFER, onOffer)
    socket.on(EVENTS.ADMIN.CANDIDATE, onCandidate)
}