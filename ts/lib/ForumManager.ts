import { TextChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Forum } from "./Forum";
import { cloneObj } from "./terminal";
import { _Guild } from "./_Guild";

export class ForumManager {
    #amateras: Amateras;
    #collection: Collection;
    #forums?: string[];
    cache: Map<string, Forum>;
    #_guild: _Guild;
    constructor(data: ForumManagerData | undefined, _guild: _Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('forums')
        this.#_guild = _guild
        this.#forums = data ? data.list : undefined
        this.cache = new Map()
    }
    
    async init() {
        if (this.#forums && this.#forums.length > 0) {
            for (const forumId of this.#forums) {
                const forumData = <ForumData>await this.#collection.findOne({id: forumId})
                if (forumData) {
                    const forum = new Forum(forumData, this.#_guild, this, this.#amateras)
                    this.cache.set(forumId, forum)
                    await forum.init()
                }
            }
        }
    }

    async fetch(id: string) {
        const data = <ForumData>await this.#collection?.findOne({ id: id })
        if (!data) {
            console.error(`Forum "${id}" fetch failed.`)
            return
        } else {
            if (this.cache.has(id)) {
                const forum = this.cache.get(id)!
                await forum.init()
                return forum
            } else {
                const forum = new Forum(data, this.#_guild, this, this.#amateras)
                this.cache.set(id, forum)
                await forum.init()
                return forum 
            }
        }
    }

    async create(channel: TextChannel) {
        if (this.cache.has(channel.id)) return 101 // Forum exist already
        const forum = new Forum({id: channel.id, state: "OPEN"}, this.#_guild, this, this.#amateras)
        this.cache.set(channel.id, forum)
        await forum.init()
        channel.setRateLimitPerUser(300)
        await forum.save()
        await this.#_guild.save()
        return forum
    }

    toData() {
        const data = cloneObj(this, ['cache'])
        data.list = Array.from(this.cache.keys())
        return data
    }

    async closeForum(channel: TextChannel) {
        const forum = await this.fetch(channel.id)
        if (forum && forum.state === "OPEN") {
            await forum.close()
            await this.#_guild.save()
            return 100
        } else {
            return 101 // Forum not found.
        }
    }
}