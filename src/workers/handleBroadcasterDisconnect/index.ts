import { Server } from "socket.io"
import { EVENTS } from "../../config/data/events"
import { Room } from "../../repositories/Room"
import { deleteSpecificRooms, getAllRooms } from "../../socket/handlers/utils"
import { dateAdd } from "../../utils/dates"

export default (io: Server): void => {
    try {
        // get broadcaster list of ids and disconnectionTime
        const broadcasters: { broadcasterId: string, disconnectionTime: number, roomName: string }[] = []
        Room.rooms.forEach((room) => {
            if (!!room.broadcaster.disconnectionTime) {
                const { id, disconnectionTime } = room.broadcaster
                const { roomName } = room.room
                broadcasters.push({ broadcasterId: id, disconnectionTime, roomName })
            }
        })

        if (broadcasters.length === 0) return

        const expiredBroadcasters = broadcasters.filter((b) => {
            const currentTime = Date.now()
            const timeDiffInMinutes = (b.disconnectionTime - currentTime) / 60 * 1000
            console.log('timeDiffInMinutes', timeDiffInMinutes)
            return timeDiffInMinutes >= 1
        })

        const expiredRooms = expiredBroadcasters.map(e => e.roomName)

        if (!expiredRooms.length) return

        deleteSpecificRooms(expiredRooms)

        console.log('worker admin disconnect: expired Rooms', expiredRooms)

        // disconnect the connected clients
        io.of(EVENTS.NAMESPACE.CLIENT)
        .to(expiredRooms)
        .emit(EVENTS.DISCONNECT_PEER)
        // send to client new list of rooms
        const roomsArray = getAllRooms()
        io.of(EVENTS.NAMESPACE.CLIENT)
        .emit(EVENTS.ADMIN.UPDATE_DESCRIPTION_IMAGE, {
            rooms: roomsArray
        })
    } catch(err) {
        console.error('Error in broadcaster Disconnect', err)
    }
}