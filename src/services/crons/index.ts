import { TCron } from "../../config/types/customTypes"
import { CronsRepository } from "../../repositories/Crons"

type TCronsCreate = {
    name: string,
    value: TCron
}

export class CronsService {

    async create({ name, value }: TCronsCreate) {
        CronsRepository.crons.set(name, value)
        return CronsRepository.crons.get(name)
    }

    getByValue(name: string) {
        return CronsRepository.crons.get(name)
    }

}