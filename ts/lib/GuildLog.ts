import { Channel, Guild, Message, MessageEmbedOptions, NewsChannel, TextChannel, ThreadChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { cloneObj, timestampDate } from "./terminal";
import { _Guild, _GuildData } from "./_Guild";

export class GuildLog {
    readonly #amateras: Amateras;
    readonly #collection: Collection;
    readonly #_guild: _Guild;
    #data: LogData | undefined;
    channel?: TextChannel | NewsChannel;
    message?: Message;
    messageCount: number;
    thread?: ThreadChannel | null;
    logMessage?: Message;
    lastLog?: string;
    isValid: () => this is Valid;
    constructor(data: LogData | undefined, _guild: _Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('guilds')
        this.#_guild = _guild
        this.#data = data
        this.messageCount = data ? data.messageCount ? data.messageCount : 1 : 1
        this.lastLog = data ? data.lastLog : ''
        this.isValid = () => { return !!this.channel && !!this.message && !!this.thread }
    }

    async init() {
        const data = await this.#collection.findOne({id: this.#_guild.id})
        this.#data = (data as _GuildData).log
        this.channel = await this.fetchChannel()
        this.message = await this.fetchMessage()
        this.message = await this.initMessage()
        this.thread = await this.fetchThread()
        this.logMessage = await this.fetchLog()
        this.#_guild.save()
    }

    private async initMessage() {
        if (!this.channel) return undefined
        if (!this.message) return this.channel.send({embeds: [await embed.call(this)]}).catch()
        else return this.message.edit({ embeds: [await embed.call(this)] }).catch()

        async function embed(this: GuildLog) { 
            const member = await this.#_guild.get.members.fetch(this.#amateras.id).catch(() => undefined)
            const embed: MessageEmbedOptions = {
                title: `天照正在服务中`,
                description: `欢迎使用天照 BOT，输入 / 能够查看所有请求指令。`,
                color: 'GREEN',
                fields: [
                    {
                        name: `加入伺服器的时间`,
                        value: member ? member.joinedTimestamp ? timestampDate(member.joinedTimestamp) : '-' : '-',
                        inline: true
                    },
                    {
                        name: `本次开机时间`,
                        value: `${timestampDate(this.#amateras.system.uptime)}`,
                        inline: true
                    },
                    {
                        name: `消息记录`,
                        value: `\`\`\`py\n${this.lastLog ? this.lastLog : '-'}\`\`\``
                    }
                ]
            }
            return embed
        }
    }

    private async fetchMessage() {
        const data = this.#data ? this.#data.message : undefined
        const messageFetch = () => data ? this.channel ? this.channel.messages.fetch(data).catch(() => undefined) : undefined : undefined
        return data ? messageFetch() : undefined
    }

    private async fetchChannel() {
        const data = this.#data ? this.#data.channel : undefined
        const createChannel = async () => {
            return this.#_guild.get.channels.create('消息频道', {
                type: 'GUILD_TEXT',
                permissionOverwrites: [{
                    id: this.#_guild.get.roles.everyone,
                    deny: 'SEND_MESSAGES'
                }]
            }).catch(() => undefined)
        }
        const channelFetch = () => data ? this.#_guild.get.channels.fetch(data).catch(() => createChannel()) : undefined
        const channel = await channelFetch()
        const checkText = () => channel ? channel.isText() ? channel : createChannel() : createChannel()
        return data ? checkText() : createChannel()
    }

    private async fetchThread() {
        const thread = this.message ? this.message.thread : undefined
        const unsetArchived = () => { return thread ? thread.archived ? thread.edit({archived: false}).catch(() => {return undefined}) : thread : undefined }
        const startThread = () => { return this.message ? this.message.startThread({name: '消息记录', autoArchiveDuration: 'MAX'}).catch(() => {return undefined}) : undefined }
        return thread ? unsetArchived() : startThread()
    }

    private async fetchLog() {
        const data = this.#data ? this.#data.logMessage : undefined
        const messageFetch = () => data && this.thread ? this.thread.messages.fetch(data).catch(() => this.newMessage()) : this.newMessage()
        const messageCheck = () => this.logMessage ? this.logMessage.deleted ? this.newMessage() : this.logMessage : messageFetch()
        return this.thread ? messageCheck() : undefined
    }

    /**
     * @returns 101 - Message fetch failed 
     */
    async send(content: string, type?: 'MOD' | 'SYS') {
        const date = new Date
        const time = `# ${date.toLocaleString('en-ZA')}\n`
        this.lastLog = (type === 'MOD' ? '@MOD ' : type === 'SYS' ? '@SYS ' : '') + time + content
        await this.init()
        if (!this.isValid()) return 101
        if (!this.logMessage) return 101
        const embed = this.logMessage.embeds[0]
        const field = embed.fields[embed.fields.length - 1]
        const prevContent = field.value.slice(3, this.logMessage.content.length - 3)
        let resultContent = '```' + prevContent + `\n` + (type === 'MOD' ? '@MOD ' : type === 'SYS' ? '@SYS ' : '') + time + content + `\`\`\``
        //Check message word count
        if (resultContent.length > 1000) {
            if (embed.fields.length >= 25) {
                this.logMessage = await this.newMessage()
                if (!this.logMessage) return 
                const newField = this.logMessage.embeds[0].fields[embed.fields.length - 1]
                resultContent = '```' + newField.value.slice(3, this.message!.content.length - 3) + `\n` + (type === 'MOD' ? '@MOD ' : type === 'SYS' ? '@SYS ' : '') + time + content + `\`\`\``

            } else {
                this.messageCount += 1
                resultContent = '```' + `py\n` + (type === 'MOD' ? '@MOD ' : type === 'SYS' ? '@SYS ' : '') + time + content + `\`\`\``
                embed.addField(`${this.messageCount}`, resultContent)
            }
        } else {
            field.value = resultContent
        }
        return await this.logMessage.edit({embeds: [embed]})
    }

    async name(id: string) {
        const user = await this.#amateras.client.users.fetch(id)
        return `${user.username}(${user.id})`
    }
    
    private async newMessage() {
        if (!this.isValid()) return
        this.messageCount += 1
        const format = 'py\n'
        const embed: MessageEmbedOptions = {
            color: 'DARK_BUT_NOT_BLACK',
            fields: [
                {
                    name: `${this.messageCount}`,
                    value: `\`\`\`${format}${this.lastLog ? this.lastLog : '-'}\`\`\``
                }
            ]
        }
        return await this.thread.send({embeds: [embed]}).catch(() => undefined)
    }

    toData() {
        let data = <LogData>cloneObj(this, ['thread'])
        data.channel = this.channel ? this.channel.id : undefined
        data.message = this.message ? this.message.id : undefined
        data.logMessage = this.logMessage ? this.logMessage.id : undefined
        return data
    }
}

interface Valid {
    channel: Channel;
    message: Message;
    thread: ThreadChannel;
}

export interface LogData {
    channel?: string;
    message?: string;
    messageCount?: number;
    logMessage?: string;
    lastLog?: string;
}