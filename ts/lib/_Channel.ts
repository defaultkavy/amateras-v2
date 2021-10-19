import { Channel, Guild, TextChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { cloneObj } from "./terminal";
import { _Guild } from "./_Guild";

export class _Channel {
    #amateras: Amateras;
    #collection: Collection;
    #channel: _ChannelData;
    _guild: _Guild;
    guild: Guild;
    id: string;
    channel: TextChannel;
    type: string;
    
    constructor(data: _ChannelData, type: string, _guild: _Guild, guild: Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('guilds')
        this.#channel = data
        this._guild = _guild;
        this.guild = guild;
        this.id = data.id
        this.channel = <TextChannel>{}
        this.type = type
    }
    
    async init() {
        let channel
        try {
            channel = <TextChannel>await this.#amateras.client.channels.fetch(this.id)
        } catch(err) {
            console.error('Channel fetch from discord failed - User may delete the channel.')
            return false
        }
        this.#channel.id = channel!.id
        this.channel = channel!
        return true
    }

    // async save() {
    //     const data = cloneObj(this, ['type', 'channel'])
    //     const guild = await this.#collection.findOne({ id: this.#guild.id })
    //     console.debug(guild)
    //     if (guild) {
    //         if (!guild.channels) {
    //             guild.channels = {
    //                 [this.type]: data
    //             }
    //         } else {
    //             guild.channels[this.type] = data
    //         }
    //         console.log(guild)
    //         await this.#collection.replaceOne({ id: this.#guild.id }, guild)
    //     } else {
    //         const _guild = this.#amateras.guilds.cache.get(this.#guild.id)
    //         if (!_guild) {
    //             console.error('Missing Guild Object!')
    //             return
    //         }
    //         await _guild.save()
    //     }
    // }

    get data(): _ChannelData {
        return cloneObj(this, ['type', 'channel', 'guild', '_guild'])
    }

    async update() {
        await this._guild.save()
    }
}