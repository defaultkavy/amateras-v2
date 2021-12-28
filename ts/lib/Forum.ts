import { Message, MessageEmbed, MessageEmbedOptions, TextChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Err } from "./Err";
import { ForumManager } from "./ForumManager";
import { cloneObj, wordCounter } from "./terminal";
import { _Guild } from "./_Guild";

export class Forum {
    #amateras: Amateras;
    #collection: Collection;
    id: string;
    get: TextChannel;
    #_guild: _Guild;
    #manager: ForumManager;
    state: "OPEN" | "CLOSED"
    
    constructor(data: ForumData, _guild: _Guild, manager: ForumManager, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('forums')
        this.#_guild = _guild
        this.#manager = manager
        this.id = data.id
        this.get = <TextChannel>{}
        this.state = data.state
    }

    async init() {
        try {
            this.get = <TextChannel>await this.#_guild.get.channels.fetch(this.id)
            return 100
        } catch {
            new Err(`Channel fetch failed. (Channel)${this.id}`)
            return 101
        }
    }

    async save() {
        let data = cloneObj(this, ['get'])
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
        this.get.setRateLimitPerUser(0)
        await this.save()
        this.#manager.cache.delete(this.id)
        await this.#_guild.save()
    }

    async post(message: Message) {
        if (this.state === "OPEN" && message.channel.type === "GUILD_TEXT") {
            let content = ''
            if (message.cleanContent) {
                content = message.cleanContent
            } else if (message.attachments.first()) {
                content = Array.from(message.attachments)[0][1].name!
            }
            
            const name = wordCounter(content, 20)
            await message.channel.threads.create({
                name: name,
                autoArchiveDuration: 1440,
                startMessage: message
            })
        } else return
    }

    share(message: Message) {
        return `Author: ${message.author} From: ${this.get} ${message.thread}\n\n${message.content}`
    }
}