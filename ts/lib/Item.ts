import { CommandInteraction, Message, MessageEmbed, MessageEmbedOptions } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Player } from "./Player";
import { checkImage, cloneObj, idGenerator, validURL } from "./terminal";

export class Item {
    #amateras: Amateras;
    #collection: Collection;
    id: string;
    #creator: string;
    creator: Player;
    name: string;
    date: Date;
    description: string;
    url: string;
    image?: string;
    value: number | undefined;
    #message: string;
    message: Message;
    constructor(itemData: ItemData, amateras: Amateras){
        this.#amateras = amateras
        this.#collection = amateras.db.collection('items')
        this.id = itemData.id
        this.#creator = itemData.creator
        this.creator = <Player>{}
        this.name = itemData.name
        this.date = new Date()
        this.description = itemData.description
        this.url = itemData.url
        this.image = itemData.image
        this.#message = ''
        this.message = <Message>{}
    }

    async init() {
        this.creator = await this.#amateras.players.fetch(this.#creator)
        if (this.#message) {
            const _message = await this.#amateras.messages.fetch(this.#message)
            if (_message) {
                this.message = _message.get
            } else {
                console.error('_message is ' + _message)
            }
        }
    }

    async save() {
        const data = cloneObj(this)
        data.creator = this.#creator
        data.message = this.#message
        // Check collection exist
        if (!this.#collection) {
            console.error(`Collection is ${this.#collection}`)
            return { status: { success: false, message: 'Save failed.' }, mission: this}
        }
        // Find from database
        const find = await this.#collection.findOne({ id: this.id })
        // Check if found
        if (find) {
            await this.#collection.replaceOne({ id: this.id }, data)
        } else {
            await this.#collection.insertOne(data)
        }
        return { status: { success: true, message: 'saved.' }, mission: this}
    }

    static async createId(collection: Collection) {
        let found = false
        let newId = ''
        while (!found) {
            newId = '0x' + idGenerator(20)
            const result = await collection.findOne({ id: newId })
            result? found = false : found = true
        }
        return newId
    }

    static checkPublish(itemObj: ItemObj) {
        if (!validURL(itemObj.url)) {
            return { pass: false, note: '无效的URL链接，请输入导向你作品网页的链接。' }
        } else if (itemObj.image && !checkImage(itemObj.image)) {
            return { pass: false, note: '无效的图片链接，请输入导向你作品网页的链接。' }
        }
        return { pass: true, note: '' }
    }

    async sendItem(interact: CommandInteraction) {
        const member = await interact.guild!.members.fetch(this.creator.id)
        const embed: MessageEmbedOptions = {
            title: this.name,
            author: {
                name: member.displayName + '的物品',
                iconURL: member.displayAvatarURL({ size: 512 })
            },
            description: this.description,
            thumbnail: {
                url: this.image
            },
            footer: {
                text: this.id
            },
            fields: [
                {
                    name: '创作者：' + member.displayName,
                    value: `[物品链接](${ this.url })`
                }
            ]
        }
        await interact.reply({embeds: [embed]})
        const message = <Message>await interact.fetchReply()
        this.message = message
        this.#message = message.id
        await this.#amateras.messages.create(message)
    }

}