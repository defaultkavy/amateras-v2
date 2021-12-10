import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Player } from "./Player";
import { V } from "./V";

export class VManager {
    #amateras: Amateras;
    #collection: Collection;
    cache: Map<string, V>;
    constructor(amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('v')
        this.cache = new Map()
    }

    async fetch(id: string) {
        const player = await this.#amateras.players.fetch(id)
        const data = <VData>await this.#collection.findOne({id: id})
        if (!data) {
            return 404 // V not found in Database
        } else if (player === 404) {
            return 101 // Player fetch failed
        } else {
            const v = new V(data, player, this.#amateras)
            this.cache.set(id, v)
            await v.init()
            await v.save()
            return v
        }
    }

    /**
     * Create V object with this player
     * @returns 101 - Player fetch failed
     */
    async create(id: string) {
        const player = this.#amateras.players.cache.get(id)
        if (player instanceof Player) {
            const vData = {
                id: id
            }
            const v = new V(vData, player, this.#amateras)
            this.cache.set(id, v)
            await v.init()
            await v.save()
            return v
        } else return 101 // Player fetch failed.
    }
}