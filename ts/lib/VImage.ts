import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { idGenerator } from "./terminal";

export class VImage {
    #amateras: Amateras;
    #collection: Collection;
    id: string;
    url: string;
    constructor(data: VImageData, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('v_images')
        this.id = data.id
        this.url = data.url
    }
    
    static async createId(collection: Collection) {
        let found = false
        let newId = ''
        while (!found) {
            newId = '0x' + idGenerator(20)
            const result = await collection.findOne({ id: newId })
            result? found = false : found = true
        }
        return newId
    }

    async save() {
        const find = await this.#collection.findOne({id: this.id})
        if (find) {
            await this.#collection.replaceOne({id: this.id}, this)
        } else {
            await this.#collection.insertOne(this)
        }
    }
}