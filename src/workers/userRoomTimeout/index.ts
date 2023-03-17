import { Server } from "socket.io"
import { EVENTS } from "../../config/data/events"
import { TRoom } from "../../config/types/customTypes"
import { Logger } from "../../helpers/logger"
import { Room } from "../../repositories/Room"
import { getAllRooms } from "../../socket/handlers/utils"

export default (io: Server): void => {
    Logger.debug('worker user room time out')

    try {

        // get a list of all the tokens and expiration times from the backend
        const roomsList: { roomName: string, expirationTime: number, clientId: string, room: TRoom }[] = []
        Room.rooms.forEach((value) => {
            if (value.user)
                roomsList.push({ 
                    roomName: value.room.roomName,
                    expirationTime: value.user.expirationTime,
                    clientId: value.user.id,
                    room: value
                })
        })
    
        // filter the list to only include tokens that have expired
        if (!roomsList.length) return
        const expiredRooms = roomsList.filter(room => room.expirationTime < Date.now())
        const expiredClientIds: string[] = expiredRooms.map(room => room.clientId)

        if (!expiredClientIds.length) return
    
        Logger.debug(roomsList[0].expirationTime < Date.now())
        Logger.debug('expiration time', roomsList[0].expirationTime)
        Logger.debug('now time', Date.now())
        Logger.debug('expiration DIFFERENCE: ', (roomsList[0].expirationTime - Date.now())/(1000), 'sec')
        Logger.debug('expiration DIFFERENCE: ', (roomsList[0].expirationTime - Date.now())/(1000 * 60), 'min')
        Logger.debug('expired Rooms', expiredRooms)
        Logger.debug('expired clients', expiredClientIds)
    
        // disconnect the sockets associated with the expired tokens
        if (expiredClientIds.length > 0)
            expiredClientIds.forEach(clientId => {
                // delete rooms of client
                for (const room of expiredRooms) {
                    Room.rooms.set(room.roomName, {
                        broadcaster: room.room.broadcaster,
                        room: {
                            ...room.room.room,
                            ready: true,
                            available: !room.room.user?.kicked
                        },
                        user: null
                    })

                    // unjoin configs in host
                    io.of(EVENTS.NAMESPACE.ADMIN)
                    .to(room.room?.broadcaster.socketId!)
                    .emit(EVENTS.CLIENT.UNJOINED, room.room.room.roomName)
                    // disconnects host peer
                    io.of(EVENTS.NAMESPACE.ADMIN)
                        .to(room.room.broadcaster.socketId)
                        .emit(EVENTS.DISCONNECT_PEER, {
                            id: room.room.user?.socketId,
                            roomName: room.room.room.roomName
                        })
                    console.log('disconnecting userRoomTimeout', room.room.room.roomName, room.room.user?.socketId)
                    // to client new list of rooms
                    const roomsArray = getAllRooms()
                    io.of(EVENTS.NAMESPACE.CLIENT)
                    .emit(EVENTS.CLIENT.UNJOINED, {
                        rooms: roomsArray
                    })
                }
                // disconnect sockets
                io.of(EVENTS.NAMESPACE.CLIENT).in(clientId).disconnectSockets()
            })
            
    } catch (err) {
        console.error(err)
    }
}