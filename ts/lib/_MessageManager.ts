import { APIMessage } from "discord-api-types";
import { Message } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { _Message } from "./_Message";

export default class _MessageManager {
    #amateras: Amateras
    #collection: Collection | undefined
    cache: Map<string, _Message>
    constructor(amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db?.collection('messages')
        this.cache = new Map
        
    }

    async fetch(msgId: string) {
        if (!msgId) return // Mission create will fetch msg with undefined string
        const msgData = <MsgData>await this.#collection?.findOne({ id: msgId })
        if (!msgData) {
            console.error(`Mission "${msgId}" fetch failed.`)
            return
        }
        if (this.cache.has(msgId)) {
            return this.cache.get(msgId)
        }
        const msg = new _Message(msgData, this.#amateras)
        this.cache.set(msgId, msg)
        await msg.init()
        return msg
    }

    /**
     * Create new mission to cache and database.
     * @param message Required Discord.Message type Object.
     * @returns Return a Mission type dynamic object.
     */
     async create(message: Message, fn?: {[keys: string]: string}) {
        // Clone missionObj become MissionData type
        const msgData: MsgData = {
            id: message.id,
            guild: message.guild!.id,
            channel: message.channel.id,
            actions: this.componentsInit(message, fn)
        }
        // Create Mission object
        const msg = new _Message(msgData, this.#amateras)
        await msg.init()
        await msg.save()
        return msg
    }

    private componentsInit(message: Message | APIMessage, fn: {[keys: string]: string} | undefined) {
        let actions = []
        if (!message.components) {
            return undefined
        }
        for (const action of message.components) {
            let comps: (ButtonData | SelectMenuData)[] = []
            for (const component of action.components) {
                let componentData: ButtonData | SelectMenuData
                if (component.type === 'BUTTON') {
                    const s = component.customId ? component.customId.split('#') : undefined
                    const customId = s ? s[s.length - 1] : undefined
                    componentData = {
                        customId: customId!,
                        fn: fn ? fn[customId!] : undefined,
                        type: 'BUTTON'
                    }
                } else if (component.type === 'SELECT_MENU') {
                    let options: {[keys: string]: string | undefined} = {}
                    for (const selection of component.options) {
                        options[selection.value] = fn ? fn[selection.value] : undefined
                    }
                    componentData = {
                        customId: <string>component.customId,
                        options: options,
                        type: 'SELECT_MENU'
                    }
                }
                comps.push(componentData!)
            }
            actions.push(comps)
        }
        return actions
    }

}