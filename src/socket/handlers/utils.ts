import { TRoom } from "../../config/types/customTypes"
import { Logger } from "../../helpers/logger"
import { Room } from "../../repositories/Room"

export function getRoomOfSocketId(socketId: string) {
    const values = Room.rooms.values()
    for (let value of values) {
        if (socketId == value.user?.socketId)
            return { room: value }
    }
    return { room: null }
}

export function getRoomOfUserId(userId: string) {
    const values = Room.rooms.values()
    for (let value of values) {
        if (userId == value.user?.id)
            return { room: value }
    }
    return { room: null }
}

export function getAllRooms() {
    const roomsArray: TRoom[] = []
    const rooms = Room.rooms.values()
    for (const room of rooms) {
        roomsArray.push(room)
    }
    return roomsArray
}

/**
 * update rooms variable to saved config in file
 */
export function updateRooms(adminSocketId: string) {
    let fileRooms: Map<string, TRoom>
    if (!Room.rooms.size) fileRooms = Room.read()
    else fileRooms = Room.rooms

    fileRooms.forEach((value, key) => {
        Room.rooms.set(key, {
            room: {
                ...value.room,
                available: value.room.ready && !value.user
            },
            user: value.user,
            broadcaster: {
                ...value.broadcaster,
                socketId: adminSocketId,
                disconnectionTime: undefined
            }
        }) 
    })

    Logger.debug('admin connected', Room.rooms)
}

export function getRoomsOfBroadcasterBySocketId(id: string) {
    const broadcasterRooms: string[] = []
    Room.rooms.forEach((value) => {
        if (id === value.broadcaster.socketId)
            broadcasterRooms.push(value.room.roomName)
    })
    return broadcasterRooms
}

export function getRoomsOfBroadcasterByBroadcasterId(id: string) {
    const broadcasterRooms: string[] = []
    Room.rooms.forEach((value) => {
        Logger.debug('value ', value.broadcaster.id)
        if (id === value.broadcaster.id)
            broadcasterRooms.push(value.room.roomName)
    })
    return broadcasterRooms
}

export function deleteSpecificRooms(rooms: string[]) {
    for (const room of rooms) {
        Room.rooms.delete(room)
    }
}