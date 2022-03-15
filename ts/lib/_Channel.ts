import { ChannelType } from "discord-api-types";
import { Channel, GuildChannelTypes } from "discord.js";
import Amateras from "./Amateras";
import { _TextChannel } from "./_TextChannel";
import { _ThreadChannel } from "./_ThreadChannel";

export class _Channel {
    #amateras: Amateras;
    get: Channel
    id: string;
    type: Channel['type'];
    constructor(channel: Channel, amateras: Amateras) {
        this.#amateras = amateras
        this.id = channel.id
        this.get = channel
        this.type = channel.type
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

    isText(): this is _TextChannel {
        return this.get.isText()
    }

    isThread(): this is _ThreadChannel {
        return this.get.isThread()
    }
}