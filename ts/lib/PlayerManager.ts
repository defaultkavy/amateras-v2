import Amateras from "./Amateras";
import { Player } from "./Player";

export class PlayerManager {
    #amateras: Amateras
    cache: Map<string, Player>;
    
    constructor(amateras: Amateras) {
        this.#amateras = amateras
        this.cache = new Map()
    }

    /**
     * Get player data from Database
     * @param id Player id.
     */
    async fetch(id: string, callback?: (player: Player) => void) {
        const collection = this.#amateras.db!.collection('player')
        let playerData = await collection.findOne({ id: id })
        if (!playerData) {
            playerData = { id: id }
        }
        if (this.cache.get(id)) {
            const player = this.cache.get(id)!
            if (callback) callback(player)
            return player
        } else {
            const player = new Player(<PlayerData>playerData, this.#amateras)
            this.cache.set(id, player)
            if (await player.init() === 404) return 404
            if (callback) callback(player)
            return player
        }
    }

    /**
     * Clear player cache from Player Manager. (Not from database)
     * @param id Player id.
     */
    clear(id: string): void {
        this.cache.delete(id)!
    }

}