import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { TRoom } from '../../config/types/customTypes'

/**
 * A Class to function like a simple local database
 */
export class Room {
    public static rooms: Map<string, TRoom> = new Map<string, TRoom>()
    private static dbPath: string = join(__dirname, './roomsJsonDB.json')

    /**
     * Save current value of rooms to file
     */
    public static save () {
        Room.persist(Room.dbPath, Room.rooms)
    }
    
    /**
     * method that reads the contents saved
     * @example <caption> to update the static value of rooms, do the following: </caption>
     * const fileRooms = Room.read()
     * fileRooms.forEach((value, key) => { Room.rooms.set(key, value) })
     * 
     * @returns { Map<string, TRoom> } current value saved in file
     */
    public static read (): Map<string, TRoom> {
        if (!existsSync(Room.dbPath)) return new Map<string, TRoom>()
        const fileData = readFileSync(Room.dbPath).toString()
        return Room.JsonStringToMap(fileData)
    }

    private static persist (dbPath: string, data: Map<string, TRoom>) {
        data.forEach(value => {
            value.user = null
            value.room.available = false,
            value.room.ready = true
        })
        writeFileSync(dbPath, Room.mapToJsonString(data))
    }    

    private static mapToJsonString (map: Map<string, TRoom>) {
        return JSON.stringify(Object.fromEntries(map))
    }

    private static JsonStringToMap (jsonString: string): Map<string, TRoom> {
        return new Map(Object.entries(JSON.parse(jsonString)))
    }
}