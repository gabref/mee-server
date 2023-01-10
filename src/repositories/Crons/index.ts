import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { TCron } from '../../config/types/customTypes'

/**
 * A Class to function like a simple local database
 */
export class CronsRepository {
    public static crons: Map<string, TCron> = new Map<string, TCron>()
    private static dbPath: string = join(__dirname, './cronsJsonDB.json')

    /**
     * Save current value of crons to file
     */
    public static save () {
        CronsRepository.persist(CronsRepository.dbPath, CronsRepository.crons)
    }
    
    /**
     * method that reads the contents saved
     * @example <caption> to update the static value of crons, do the following: </caption>
     * const fileCrons = CronsRepository.read()
     * fileCrons.forEach((value, key) => { CronsRepository.crons.set(key, value) })
     * 
     * @returns { Map<string, TCron> } current value saved in file
     */
    public static read (): Map<string, TCron> {
        if (!existsSync(CronsRepository.dbPath)) return new Map<string, TCron>()
        const fileData = readFileSync(CronsRepository.dbPath).toString()
        return CronsRepository.JsonStringToMap(fileData)
    }

    private static persist (dbPath: string, data: Map<string, TCron>) {
        writeFileSync(dbPath, CronsRepository.mapToJsonString(data))
    }    

    private static mapToJsonString (map: Map<string, TCron>) {
        return JSON.stringify(Object.fromEntries(map))
    }

    private static JsonStringToMap (jsonString: string): Map<string, TCron> {
        return new Map(Object.entries(JSON.parse(jsonString)))
    }
}