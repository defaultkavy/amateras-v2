import { TextChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { ForumManager } from "./ForumManager";
import { cloneObj } from "./terminal";
import { _Guild } from "./_Guild";

export class Forum {
    #amateras: Amateras;
    #collection: Collection;
    id: string;
    channel: TextChannel;
    #_guild: _Guild;
    #manager: ForumManager;
    state: "OPEN" | "CLOSED"
    
    constructor(data: ForumData, _guild: _Guild, manager: ForumManager, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('forums')
        this.#_guild = _guild
        this.#manager = manager
        this.id = data.id
        this.channel = <TextChannel>{}
        this.state = data.state
    }

    async init() {
        this.channel = <TextChannel>await this.#_guild.get.channels.fetch(this.id)
    }

    async save() {
        let data = cloneObj(this, ['channel'])
        // Check collection exist
        if (!this.#collection) {
            console.error(`Collection is ${this.#collection}`)
            return 101
        }
        // Find from database
        const find = await this.#collection.findOne({ id: this.id })
        // Check if found
        if (find) {
            await this.#collection.replaceOne({ id: this.id }, data)
        } else {
            await this.#collection.insertOne(data)
        }
        return data
    }

    async close() {
        this.state = "CLOSED"
        this.channel.setRateLimitPerUser(0)
        await this.save()
        this.#manager.cache.delete(this.id)
    }
}