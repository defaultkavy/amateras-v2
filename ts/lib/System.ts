import { User } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";

export class System {
    #amateras: Amateras;
    #collection: Collection;
    #adminId: string;
    admin?: User
    constructor(admin: string, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('system')
        this.#adminId = admin
    }

    async init() {
        const player = await this.#amateras.players.fetch(this.#adminId)
        if (player === 404) throw new Error('Amateras Fatal Error: System Admin User fetch failed')
        this.admin = player.get
    }
}