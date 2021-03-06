import { Channel, Guild, Message, MessageEmbedOptions, NewsChannel, TextChannel, ThreadChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { cloneObj, timestampDate } from "./terminal";
import { _Guild, _GuildData } from "./_Guild";
import { _log_init_, _system_ } from '../lang.json'

export class GuildLog {
    readonly #amateras: Amateras;
    readonly #collection: Collection<_GuildData>;
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
        this.#collection = amateras.db.collection<_GuildData>('guilds')
        this.#_guild = _guild
        this.#data = data
        this.messageCount = data ? data.messageCount ? data.messageCount : 0 : 0
        this.lastLog = data ? data.lastLog : ''
        this.isValid = () => { return !!this.channel && !!this.message && !!this.thread }
    }

    async init() {
        const data = await this.#collection.findOne({id: this.#_guild.id})
        if (data) this.#data = data.log
        this.channel = await this.fetchChannel()
        this.message = await this.fetchMessage()
        this.message = await this.initMessage()
        this.thread = await this.fetchThread()
        this.logMessage = await this.fetchLog()
        await this.#_guild.save()
    }

    async initMessage() {
        if (!this.channel) return undefined
        if (!this.message) return this.channel.send({embeds: [await embed.call(this)]}).catch()
        else return this.message.edit({ embeds: [await embed.call(this)] }).catch()

        async function embed(this: GuildLog) { 
            const member = await this.#_guild.get.members.fetch(this.#amateras.id).catch(() => undefined)
            const lang = this.#_guild.lang
            const embed: MessageEmbedOptions = {
                title: this.#amateras.ready ? _system_.serving[lang] : _system_.sleeping[lang],
                description: _log_init_.description[lang],
                color: this.#amateras.ready ? 'GREEN' : 'GREY',
                fields: [
                    {
                        name: _log_init_.join_date[lang],
                        value: member ? member.joinedTimestamp ? timestampDate(member.joinedTimestamp) : '-' : '-',
                        inline: true
                    },
                    {
                        name: _log_init_.start_time[lang],
                        value: `${timestampDate(this.#amateras.system.uptime)}`,
                        inline: true
                    },
                    {
                        name: _log_init_.logs[lang],
                        value: `\`\`\`py\n${this.lastLog ? this.lastLog : '-'}\`\`\``
                    }
                ]
            }
            return embed
        }
    }

    private async fetchMessage() {
        const data = this.#data ? this.#data.message : undefined
        const messageFetch = async () => data ? this.channel ? await this.channel.messages.fetch(data).catch(() => undefined) : undefined : undefined
        return data ? await messageFetch() : undefined
    }

    private async fetchChannel() {
        const data = this.#data ? this.#data.channel : undefined
        const createChannel = async () => {
            return this.#_guild.get.channels.create('????????????', {
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
        const startThread = () => { return this.message ? this.message.startThread({name: '????????????', autoArchiveDuration: 'MAX'}).catch(() => {return undefined}) : undefined }
        return thread ? unsetArchived() : startThread()
    }

    private async fetchLog() {
        const data = this.#data ? this.#data.logMessage : undefined
        const messageFetch = async () => data && this.thread ? await this.thread.messages.fetch(data).catch(() => this.newMessage()) : undefined
        const messageCheck = async () => this.logMessage ? await this.logMessage.fetch().catch(() => this.newMessage()) : await messageFetch()
        return this.thread ? await messageCheck() : undefined
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
        const newMessage = async() => {
            this.logMessage = await this.newMessage()
            if (!this.logMessage) return 
            resultContent = '```' + `py\n` + (type === 'MOD' ? '@MOD ' : type === 'SYS' ? '@SYS ' : '') + time + content + `\`\`\``
        }
        if (resultContent.length > 1000) {
            if (embed.fields.length >= 6) {
                await newMessage()
            } else {
                this.messageCount += 1
                resultContent = '```' + `py\n` + (type === 'MOD' ? '@MOD ' : type === 'SYS' ? '@SYS ' : '') + time + content + `\`\`\``
                embed.addField(`${this.messageCount}`, resultContent)
            }
        } else {
            if (embed.fields.length >= 6) {
                await newMessage()
            } else field.value = resultContent
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