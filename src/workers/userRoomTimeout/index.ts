import { Server } from "socket.io"
import { EVENTS } from "../../config/data/events"
import { TRoom } from "../../config/types/customTypes"
import { Room } from "../../repositories/Room"
import { getAllRooms } from "../../socket/handlers/utils"

export default (io: Server): void => {
    console.log('worker user room time out')

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
        const expiredRooms = roomsList.filter(room => room.expirationTime < new Date().getTime())
        const expiredClientIds: string[] = expiredRooms.map(room => room.clientId)
    
        console.log(roomsList[0].expirationTime < new Date().getTime())
        console.log('expiration time', roomsList[0].expirationTime)
        console.log('now time', Date.now())
        console.log('expiration DIFFERENCE: ', (roomsList[0].expirationTime - Date.now())/(1000), 'sec')
        console.log('expiration DIFFERENCE: ', (roomsList[0].expirationTime - Date.now())/(1000 * 60), 'min')
        console.log('expired Rooms', expiredRooms)
        console.log('expired clients', expiredClientIds)
    
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