import Amateras from "./Amateras";
import { Err } from "./Err";
import { _Channel } from "./_Channel";
import { _Guild } from "./_Guild";

export class _ChannelManager {
    #amateras: Amateras;
    #_guild: _Guild;
    cache: Map<string, _Channel>;
    constructor(_guild: _Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#_guild = _guild
        this.cache = new Map
    }

    async init() {
        for (const channel of this.#_guild.get.channels.cache.values()) {
            const _channel = new _Channel(channel, this.#amateras)
            this.cache.set(channel.id, _channel)
            await _channel.init()
        }
    }

    /**
     * @returns 101 - Id is undefined
     * @returns 404 - Channel not found 
     */
    async fetch(id: string) {
        if (!id) return 101
        try {
            const channel = await this.#_guild.get.channels.fetch(id)
            if (!channel) {
                new Err(`Channel fetch failed. (Channel)${ id }`)
                return 404 // Channel not found
            }
            const _channel = new _Channel(channel, this.#amateras)
            this.cache.set(id, _channel)
            await _channel.init()
            return _channel
        } catch(err) {
            new Err(`Channel fetch failed. (Channel)${ id }`)
            return 404
        }
    }
}