import { Guild } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { _Guild, _GuildData } from "./_Guild";

export class _GuildManager {
    #amateras: Amateras;
    #collection: Collection<_GuildData>;
    cache: Map<string, _Guild>
    constructor(amateras: Amateras) {
        this.#amateras = amateras;
        this.#collection = amateras.db.collection<_GuildData>('guilds');
        this.cache = new Map
    }

    async init() {
        const guilds = this.#amateras.client.guilds.cache
        for (const guild of guilds.values()) {
            await this.create(guild)
        }
        await this.checkAvailable()
    }

    async create(guild: Guild) {
        const _guildData = await this.#collection.findOne({id: guild.id})
        if (_guildData) {
            // Guild data exist
            const _guild = new _Guild(_guildData, guild, this, this.#amateras)
            this.cache.set(_guild.id, _guild)
            await _guild.init()
            await _guild.save()
        } else {
            // Guild data not exist, create one to database
            const _newGuildData: _GuildData = {
                id: guild.id,
                moderators: [guild.ownerId]
            }
            const _guild = new _Guild(_newGuildData, guild, this, this.#amateras)
            this.cache.set(_guild.id, _guild)
            await _guild.init()
            await _guild.save()
        }
    }

    async checkAvailable() {
        const guilds = this.#amateras.client.guilds.cache
        const list = <_GuildData[]>await this.#collection.find({available: true}).toArray()
        for (const guildData of list) {
            if (!guilds.has(guildData.id)) {
                guildData.available = false
                await this.#collection.replaceOne({id: guildData.id}, guildData)
            }
        }

    }
}