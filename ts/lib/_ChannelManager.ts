import { Channel, TextChannel, WelcomeChannel } from "discord.js";
import Amateras from "./Amateras";
import { Err } from "./Err";
import { cloneObj } from "./terminal";
import { _Channel } from "./_Channel";
import { _Guild } from "./_Guild";
import { _TextChannel } from "./_TextChannel";
import { _WelcomeChannel, _WelcomeChannelData } from "./_WelcomeChannel";

export class _ChannelManager {
    #amateras: Amateras;
    #_guild: _Guild;
    #data?: _ChannelManagerData;
    cache: Map<string, _Channel | _TextChannel | _WelcomeChannel>;
    welcomeChannel?: _Channel;
    constructor(data: _ChannelManagerData | undefined, _guild: _Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#_guild = _guild
        this.#data = data
        this.cache = new Map
    }

    async init() {
        for (const channel of this.#_guild.get.channels.cache.values()) {
            let _channel
            if (channel.isText() && !channel.isThread()) {
                _channel = new _TextChannel(channel, this.#amateras)
            }
            if (!_channel) continue
            this.cache.set(channel.id, _channel)
            await _channel.init()
        }
        
        if (this.#data) {
            if (this.#data.welcomeChannel) {
                const _channel = this.cache.get(this.#data.welcomeChannel)
                if (_channel instanceof _TextChannel) {
                    this.welcomeChannel = _channel
                    await this.welcomeChannel.init()
                }
            }
        }
    }

    /**
     * @returns 101 - Id is undefined
     * @returns 404 - Channel not found 
     */
    async fetch(id: string) {
        const get = this.cache.get(id)
        if (get) return get
        try {
            const channel = await this.#_guild.get.channels.fetch(id)
            if (!channel) {
                new Err(`Channel fetch failed. (Channel)${ id }`)
                return 404 // Channel not found
            }
            let _channel
            if (channel instanceof TextChannel) {
                _channel = new _TextChannel(channel, this.#amateras)
            }
            if (!_channel) return 404
            this.cache.set(id, _channel)
            await _channel.init()
            return _channel
        } catch(err) {
            new Err(`Channel fetch failed. (Channel)${ id }`)
            return 404
        }
    }

    /**
     * @returns 100 - Success 
     * @returns 101 - Already set
     * @returns 102 - Not a Text Channel
     * @returns 404 - Channel not found
     */
    async setWelcome(id: string) {
        const _channel = this.cache.get(id)
        if (!_channel) {
            return 404
        } else {
            if (!(_channel instanceof _TextChannel)) return 102
            if (_channel.isWelcomeChannel === true) return 101
            _channel.isWelcomeChannel = true
            this.welcomeChannel = _channel
            this.#_guild.save()
            return 100
        }
    }

    /**
     * @returns 100 - Success 
     * @returns 101 - Already unset
     * @returns 102 - Not a Text Channel
     * @returns 404 - Channel not found
     */
    async unsetWelcome(id: string) {
        const _channel = this.cache.get(id)
        if (!_channel) {
            return 404
        } else {
            if (!(_channel instanceof _TextChannel)) return 102
            if (_channel.isWelcomeChannel === false) return 101
            _channel.isWelcomeChannel = false
            this.welcomeChannel = undefined
            return 100
        }
    }

    toData() {
        const data = cloneObj(this, ['cache'])
        data.welcomeChannel = this.welcomeChannel
        return data
    }
}

export interface _ChannelManagerData {
    welcomeChannel?: string
}