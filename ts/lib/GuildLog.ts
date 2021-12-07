import { Message, TextChannel } from "discord.js";
import Amateras from "./Amateras";
import { cloneObj } from "./terminal";
import { _Guild } from "./_Guild";

export class GuildLog {
    #amateras: Amateras;
    #channelId?: string;
    #_guild: _Guild;
    channel: TextChannel;
    #messageId?: string;
    message?: Message;
    messageCount: number;
    constructor(data: LogData | undefined, _guild: _Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#channelId = data ? data.channel : undefined
        this.#_guild = _guild
        this.channel = <TextChannel>{}
        this.#messageId = data ? data.message : undefined
        this.message = undefined
        this.messageCount = data ? data.messageCount ? data.messageCount : 1 : 1
    }

    async init() {
        await this.fetchChannel()
        await this.fetchMessage()
    }

    async create() {
        return await this.#_guild.get.channels.create('消息频道', {
            type: 'GUILD_TEXT',
            permissionOverwrites: [{
                id: this.#_guild.get.roles.everyone,
                deny: 'SEND_MESSAGES'
            }]
        })
    }

    async send(content: string) {
        await this.fetchChannel()
        const fetch = await this.fetchMessage()
        if (fetch === 101 || fetch === 404) {
            await this.newMessage()
        }
        const date = new Date
        const time = `# ${date.toLocaleString('en-ZA')}\n`
        const prevContent = this.message!.content.slice(3, this.message!.content.length - 3)
        let resultContent = '```' + prevContent + `\n` + time + content + `\`\`\``
        //Check message word count
        if (resultContent.length > 2000) {
            this.messageCount += 1
            await this.newMessage()
            resultContent = '```' + time + this.message!.content.slice(3, this.message!.content.length - 3) + `\n` + time + content + `\`\`\``
        }
        this.message!.edit({
            content: resultContent
        })
    }

    async name(id: string) {
        const user = await this.#amateras.client.users.fetch(id)
        return `${user.username}(${user.id})`
    }
    
    private async newMessage() {
        const format = 'py\n'
        this.message = await this.channel.send({
            content: `\`\`\`${format}${this.messageCount}\`\`\``
        })
        this.#messageId = this.message.id
        this.#_guild.save()
    }

    private async fetchMessage() {
        if (this.#messageId) {
            try {
                const message = await this.channel.messages.fetch(this.#messageId)
                this.message = message
                this.#messageId = message.id
                return message
            } catch {
                return 404
            }
        } else return 101
    }

    private async fetchChannel() {
        if (this.#channelId) {
            try {
                const channel = await this.#_guild.get.channels.fetch(this.#channelId)
                if (channel && channel.type === 'GUILD_TEXT') {
                    this.channel = channel
                } else await this.channelCreate()
            } catch {
                await this.channelCreate()
            }
        } else await this.channelCreate()
    }

    private async channelCreate() {
        this.channel = await this.create()
        this.#channelId = this.channel.id
    }

    toData() {
        let data = <LogData>cloneObj(this)
        data.channel = this.channel.id
        data.message = this.message ? this.message.id : undefined
        return data
    }
}