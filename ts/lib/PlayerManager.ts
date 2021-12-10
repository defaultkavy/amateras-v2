import Amateras from "./Amateras";
import { Player } from "./Player";
import { VManager } from "./VManager";

export class PlayerManager {
    #amateras: Amateras
    cache: Map<string, Player>;
    v: VManager
    
    constructor(amateras: Amateras) {
        this.#amateras = amateras
        this.cache = new Map()
        this.v = new VManager(amateras)
    }

    /**
     * Get player data from Database
     * @param id Player id.
     */
    async fetch(id: string, callback?: (player: Player) => void) {
        const cache = this.cache.get(id)
        if (cache) {
            return cache
        }
        const collection = this.#amateras.db!.collection('player')
        let playerData = await collection.findOne({ id: id })
        if (!playerData) {
            playerData = { id: id }
        }
        const player = new Player(<PlayerData>playerData, this.#amateras)
        this.cache.set(id, player)
        if (await player.init() === 404) {
            this.cache.delete(id)
            return 404
        }
        if (callback) callback(player)
        return player
    }

    /**
     * Clear player cache from Player Manager. (Not from database)
     * @param id Player id.
     */
    clear(id: string): void {
        this.cache.delete(id)!
    }

}