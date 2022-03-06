import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { _Character } from "./_Character";

export class _CharacterManager {
    #amateras: Amateras;
    cache: Map<string, _Character>
    #collection: Collection<_CharacterData>;
    constructor(amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection<_CharacterData>('characters')
        this.cache = new Map()
    }

    async fetch(id: string) {
        const character = this.cache.get(id)
        if (character) {
            return character
        }
        const data = await this.#collection.findOne({id: id})
        if (data) {
            const character = new _Character(data, this.#amateras)
            this.cache.set(id, character)
            await character.init()
            return character
        }
    }

    async create(obj: _CharacterObj) {
        const data = <_CharacterData>{...obj}
        data.id = await _Character.createId(this.#collection)
        const character = new _Character(data, this.#amateras)
        this.cache.set(data.id, character)
        await character.init()
        await character.save()
        return character
    }
    
}