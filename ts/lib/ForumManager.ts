import { TextChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Err } from "./Err";
import { Forum } from "./Forum";
import { cloneObj } from "./terminal";
import { _Guild } from "./_Guild";

export class ForumManager {
    #amateras: Amateras;
    #collection: Collection<ForumData>;
    #forums?: string[];
    cache: Map<string, Forum>;
    #_guild: _Guild;
    constructor(data: ForumManagerData | undefined, _guild: _Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection<ForumData>('forums')
        this.#_guild = _guild
        this.#forums = data ? data.list : undefined
        this.cache = new Map()
    }
    
    async init() {
        if (this.#forums && this.#forums.length > 0) {
            for (const forumId of this.#forums) {
                const forumData = await this.#collection.findOne({id: forumId})
                if (forumData && forumData.state === 'OPEN') {
                    const forum = new Forum(forumData, this.#_guild, this, this.#amateras)
                    this.cache.set(forumId, forum)
                    if (await forum.init() === 101) {
                        this.cache.delete(forumId)
                        forum.state = 'CLOSED'
                        console.log(`Forum state set to 'CLOSED'. (Channel)${forum.id}`)
                        await forum.save()
                    }
                }
            }
        }
    }

    async fetch(id: string) {
        const data = <ForumData>await this.#collection?.findOne({ id: id })
        if (!data) {
            return 404 // Forum not found
        } else {
            const forum = new Forum(data, this.#_guild, this, this.#amateras)
            this.cache.set(id, forum)
            await forum.init()
            return forum 
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
}