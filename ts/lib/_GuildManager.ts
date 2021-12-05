import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { _Guild } from "./_Guild";

export class _GuildManager {
    #amateras: Amateras;
    #collection: Collection;
    cache: Map<string, _Guild>
    constructor(amateras: Amateras) {
        this.#amateras = amateras;
        this.#collection = amateras.db.collection('guilds');
        this.cache = new Map
    }

    async init() {
        const guilds = this.#amateras.client.guilds.cache
        for (const guild of guilds.values()) {
            const _guildData = <_GuildData>await this.#collection.findOne({id: guild.id})
            if (_guildData) {
                // Guild data exist
                const _guild = new _Guild(_guildData, guild, this.#amateras)
                this.cache.set(_guild.id, _guild)
                await _guild.init()
            } else {
                // Guild data not exist, create one to database
                const _newGuildData: _GuildData = {
                    id: guild.id,
                }
                const _guild = new _Guild(_newGuildData, guild, this.#amateras)
                await _guild.init()
                await _guild.save()
            }
        }
    }
}