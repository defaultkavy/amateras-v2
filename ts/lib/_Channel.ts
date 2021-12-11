import { Channel } from "discord.js";
import Amateras from "./Amateras";

export class _Channel {
    #amateras: Amateras;
    get: Channel
    id: string;
    constructor(channel: Channel, amateras: Amateras) {
        this.#amateras = amateras
        this.id = channel.id
        this.get = channel
    }

    async init() {

    }

    /**
     * 
     * @returns 100 - Success
     * @returns 101 - Already set
     * @returns 102 - Player fetch failed
     */
    
    mention() {
        if (!this.get) return this.id
        let result: Channel | string = this.get
        return result
    }
}