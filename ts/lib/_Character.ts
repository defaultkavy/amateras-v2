import { CommandInteraction, MessageEmbedOptions } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { checkImage, cloneObj, idGenerator, validURL } from "./terminal";

export class _Character {
    #amateras: Amateras;
    #collection: Collection<_CharacterData>;
    id: string;
    name: string;
    description: string;
    gender: 'Male' | 'Female';
    url: string;
    avatar: string | undefined;
    age: number;

    constructor(character: _CharacterData, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection<_CharacterData>('characters')
        this.id = character.id
        this.name = character.name
        this.description = character.description
        this.gender = character.gender
        this.url = character.url
        this.avatar = character.avatar
        this.age = character.age

    }

    async init() {

    }

    static async createId(collection: Collection<_CharacterData>) {
        let found = false
        let newId = ''
        while (!found) {
            newId = '0x' + idGenerator(20)
            const result = await collection.findOne({ id: newId })
            result? found = false : found = true
        }
        return newId
    }

    async save() {
        const data = cloneObj(this)
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

    static checkPublish(obj: _CharacterObj) {
        if (!validURL(obj.url)) {
            return { pass: false, note: '?????????URL??????????????????????????????????????????????????????' }
        } else if (obj.avatar && !checkImage(obj.avatar)) {
            return { pass: false, note: '???????????????????????????????????????????????????????????????????????? Discord ?????????????????????????????????????????????' }
        }
        return { pass: true, note: '' }
    }

    async sendItem(interact: CommandInteraction) {
        const embed: MessageEmbedOptions = {
            title: this.name,
            author: {
                name: '??????',
            },
            description: this.description,
            thumbnail: {
                url: this.avatar
            },
            footer: {
                text: this.id
            },
            fields: [
                {
                    name: '??????',
                    value: this.gender === 'Female' ? `???` : `???`
                },
                {
                    name: '??????',
                    value: `${this.age} ???`
                },
                {
                    name: '????????????',
                    value: `[????????????](${ this.url })`
                }
            ]
        }
        await interact.reply({embeds: [embed]})
    }
}