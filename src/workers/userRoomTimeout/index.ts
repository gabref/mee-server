import { Server } from "socket.io"
import { EVENTS } from "../../config/data/events"
import { Logger } from "../../helpers/logger"
import { Room } from "../../repositories/Room"

export default (io: Server): void => {

    // get a list of all the tokens and expiration times from the backend
    const roomsList: { roomName: string, expirationTime: number, clientSocketId: string }[] = []
    Room.rooms.forEach((value) => {
        if (value.user)
            roomsList.push({ 
                roomName: value.room.roomName,
                expirationTime: value.user.expirationTime,
                clientSocketId: value.user.socketId
            })
    })

    // filter the list to only include tokens that have expired
    const expiredRooms = roomsList.filter(room => room.expirationTime < new Date().getTime())
    const expiredClientSocketIds: string[] = expiredRooms.map(room => room.clientSocketId)

    // disconnect the sockets associated with the expired tokens
    if (expiredClientSocketIds.length > 0)
        expiredClientSocketIds.forEach(clientSocketId => {
            io.of(EVENTS.NAMESPACE.CLIENT).in(clientSocketId).disconnectSockets()
        })
}