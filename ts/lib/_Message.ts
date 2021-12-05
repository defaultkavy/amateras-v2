import { BaseGuildTextChannel, Channel, DMChannel, Guild, Message, TextChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { cloneObj } from "./terminal";

export class _Message {
    #amateras: Amateras
    #collection: Collection | undefined
    id: string;
    #guild: string;
    guild: Guild;
    #channel: string;
    channel: BaseGuildTextChannel | DMChannel | null;
    actions?: (ButtonData | SelectMenuData)[][]
    get: Message;
    constructor(msg: MsgData, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db?.collection('messages')
        this.id = msg.id
        this.#guild = msg.guild;
        this.guild = <Guild>{}
        this.#channel = msg.channel;
        this.channel = <BaseGuildTextChannel>{};
        this.actions = msg.actions
        this.get = <Message>{}
    }

    async init() {
        const _guild = this.#amateras.guilds.cache.get(this.#guild)
        if (!_guild) {
            return false
        }
        this.guild = _guild.get
        this.channel = <BaseGuildTextChannel | DMChannel>await this.guild.channels.fetch(this.#channel)
        if (this.channel && this.channel.type === 'GUILD_TEXT') {
            this.get = await this.channel.messages.fetch(this.id)
        }
        return true
    }

    async save(): Promise<{ status: PromiseStatus, msg: _Message }> {
        const data = cloneObj(this, ['get'])
        data.guild = this.#guild
        data.channel = this.#channel
        // Check collection 'missions' exist
        if (!this.#collection) {
            console.error(`Collection "messages" undefined.(Msg.js)`)
            return { status: { success: false, message: 'Save Message failed.' }, msg: this}
        }
        // Find mission from database
        const find = await this.#collection.findOne({ id: this.id })
        // Check if mission found
        if (find) {
            await this.#collection.replaceOne({ id: this.id }, data)
        } else {
            await this.#collection.insertOne(data)
        }
        return { status: { success: true, message: 'Message saved.' }, msg: this}
    }

    async updateVInfo() {
        const player = await this.#amateras.players.fetch(this.get.embeds[0].footer!.text!)
        const defaultFolder = player.v!.imageFolders.default
        if (defaultFolder) this.get.edit({embeds: [await player.v!.infoEmbed(defaultFolder, Array.from(defaultFolder.images.values())[0])]})
    }
}