import { Message, MessageActionRow, MessageButton, MessageEmbedOptions, NewsChannel, OverwriteResolvable, TextChannel, ThreadChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Err } from "./Err";
import { Lobby } from "./Lobby";
import { cloneObj, removeArrayItem } from "./terminal";
import { _Channel } from "./_Channel";
import { _Guild } from "./_Guild";
import { _TextChannel } from "./_TextChannel";

export class LobbyManager {
    #amateras: Amateras;
    #collection: Collection;
    #_guild: _Guild;
    #data?: LobbyManagerData;
    channel?: TextChannel | NewsChannel;
    cache: Map<string, Lobby>
    message?: Message;
    thread?: ThreadChannel | null;
    #resolve: Map<string, Lobby>
    permissions: string[]
    enabled: boolean
    constructor(data: LobbyManagerData | undefined, _guild: _Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('lobbies')
        this.#_guild = _guild
        this.#data = data
        this.cache = new Map
        this.#resolve = new Map
        this.permissions = this.#data ? this.#data.permissions : []
        this.enabled = false
    }

    /**
     * @returns 100 - Success
     * @returns 101 - Lobby data undefined
     * @returns 102 - Lobby Manager init failed
     */
    async init() {
        if (!this.#data) return 101
        try {
            if (!this.#data.channel) return 101
            const _channel = await this.#_guild.channels.fetch(this.#data.channel)
            if (!(_channel instanceof _TextChannel)) { 
                new Err(`Lobby channel fetch failed`)
                return 404
            }
            this.channel = _channel.get
            if (!this.channel) return
            if (this.#data.message) {
                try {
                    this.message = await this.channel.messages.fetch(this.#data.message)
                } catch {
                    new Err(`Lobby message fetch failed`)
                }
            }
            try {
                if (this.message) {
                    this.thread = this.message.thread
                    if (!this.thread) {
                        this.thread = await this.message.startThread({name: `房间列表`, autoArchiveDuration: 60})
                    }
                }
            } catch {
                new Err(`Lobby thread message fetch failed`)
            }
            if (this.#data.lobbies && this.#data.lobbies[0]) {
                for (const lobbyId of this.#data.lobbies) {
                    const lobbyData = <LobbyData>await this.#collection.findOne({owner: lobbyId, state: "OPEN"})
                    if (lobbyData) {
                        const lobby = new Lobby(lobbyData, this.#_guild, this, this.#amateras)
                        this.cache.set(lobbyId, lobby)
                        if (await lobby.init() !== 100) {
                            this.cache.delete(lobbyId)
                            continue
                        }
                        if (lobby.categoryChannel) this.#resolve.set(lobby.categoryChannel.id, lobby)
                    }
                }
            }
            await this.updateInitMessage()
            this.enabled = true
            return 100
        } catch {
            return 102
        }
    }

    /**
     * Setup lobby channel
     * @returns 101 - Already set
     */
    async setup(channel: TextChannel) {
        if (this.channel && this.channel.id === channel.id) return 101
        this.enabled = true
        this.channel = channel
        if (this.message) this.message.delete().catch()
        await this.sendInitMessage()
        await this.#_guild.save()
        return this.channel
    }

    /**
     * Unset lobby channel
     * @returns 100 - Success
     * @returns 101 - Lobby channel never set
     * @returns 102 - Not a lobby channel
     */
    async unset(channel: TextChannel) {
        if (!this.channel) return 101
        if (this.channel.id !== channel.id) return 102
        this.enabled = false
        this.channel = undefined
        if (this.message) this.message.delete().catch()
        await this.#_guild.save()
        return 100
    }

    /**
     * @returns 101 - Lobby closed
     * @returns 404 - Lobby fetch failed
     */
    async fetch(id: string) {
        const lobby = this.cache.get(id)
        if (lobby && lobby.state === 'OPEN') {
            return lobby
        } else if (lobby && lobby.state === 'CLOSED') {
            return 101
        }
        const lobbyData = <LobbyData>await this.#collection.findOne({owner: id, state: "OPEN", guild: this.#_guild.id})
        if (lobbyData) {
            const lobby = new Lobby(lobbyData, this.#_guild, this, this.#amateras)
            this.cache.set(id, lobby)
            await lobby.init()
            if (lobby.categoryChannel) this.#resolve.set(lobby.categoryChannel!.id, lobby)
            return lobby
        } else return 404
    }

    async fetchByCategory(id: string) {
        const lobby = this.#resolve.get(id)
        if (lobby && lobby.state === 'OPEN') {
            return lobby
        } else if (lobby && lobby.state === 'CLOSED') {
            return
        }
        let lobbyData = <LobbyData>await this.#collection.findOne({categoryChannel: id, state: "OPEN", guild: this.#_guild.id})
        if (lobbyData) {
            const lobby = new Lobby(lobbyData, this.#_guild, this, this.#amateras)
            this.cache.set(lobby.owner.id, lobby)
            await lobby.init()
            if (lobby.categoryChannel) this.#resolve.set(lobby.categoryChannel.id, lobby)
            return lobby
        }
        return 
    }

    async create(id: string) {
        const member = await this.#_guild.get.members.fetch(id)
        for (let i = 0; i < this.permissions.length; i++) {
            if (member.roles.cache.has(this.permissions[i])) {
                break;
            } else if (i === this.permissions.length - 1) {
                return 101
            }
        }
        const ownerPermission: OverwriteResolvable = {
            id: id,
            allow: ['VIEW_CHANNEL', 'MANAGE_CHANNELS']
        }
        const otherPermission: OverwriteResolvable = {
            id: this.#_guild.get.roles.everyone,
            deny: ['VIEW_CHANNEL']
        }
        const category = await this.#_guild.get.channels.create(member.displayName + '的房间', {
            type: 'GUILD_CATEGORY',
            permissionOverwrites: [ownerPermission, otherPermission]
        })
        const infoChannel = await category.createChannel('素材频道', {
            type: 'GUILD_TEXT'
        })
        const textChannel = await category.createChannel('文字频道', {
            type: 'GUILD_TEXT'
        })
        const voiceChannel = await category.createChannel('语音频道', {
            type: 'GUILD_VOICE'
        })
        const data: LobbyData = {
            owner: id,
            member: [],
            vFolder: {},
            categoryChannel: category.id,
            textChannel: textChannel.id,
            voiceChannel: voiceChannel.id,
            infoChannel: infoChannel.id,
            state: 'OPEN',
            guild: this.#_guild.id,
            messages: {}
        }
        const lobby = new Lobby(data, this.#_guild, this, this.#amateras)
        this.cache.set(data.owner, lobby)
        await lobby.init()
        await lobby.save()
        await this.#_guild.save()
        await this.updateInitMessage()
        // Lobby hint
        const embed: MessageEmbedOptions = {
            title: `欢迎`,
            description: `这里是 ${lobby.owner.mention()} 的房间。\n这里只有房主和被房主邀请的对象以及伺服器管理员可见。房主能够自行创建更多的文字和语音频道，但是无法删除初始设定的三个频道。\n\n每当新的V成员加入房间时，${infoChannel} 将会更新成员的V身份资料，包含了简介、人物立绘、跳图链接等。`,
            fields: [
                {
                    name: `房主可使用的请求`,
                    value: `\`\`\`/invite\n- 邀请指定对象（右键对方头像，选择菜单中的 Apps（应用程式）> Invite 也能够实现邀请）\n/kick\n- 移除指定对象\n/lobby close\n- 关闭房间\`\`\``,
                    inline: false
                },
                {
                    name: `成员可使用的请求`,
                    value: `\`\`\`/lobby exit\n- 退出房间\`\`\``,
                    inline: false
                }
            ]
        }
        if (lobby.textChannel) {
            lobby.textChannel.send({embeds: [embed]})
            lobby.textChannel.send({content: `${member}创建了房间`})
        }
        this.#_guild.log.send(`${await this.#_guild.log.name(id)} 创建了房间`)
        if (lobby.owner.v) lobby.owner.v.sendInfoLobby(lobby)

        return lobby
    }

    toData() {
        const data = cloneObj(this, ['cache', 'thread'])
        data.channel = this.channel ? this.channel.id : undefined
        data.lobbies = Array.from(this.cache.keys())
        data.message = this.message ? this.message.id : undefined
        return data
    }

    private async sendInitMessage() {
        if (!this.channel) return 101
        const embed = this.initEmbed()
        const create_button = new MessageButton
        create_button.label = '创建房间'
        create_button.customId = '#lobby_create'
        create_button.style = 'PRIMARY'
        const close_button = new MessageButton
        close_button.label = '关闭房间'
        close_button.customId = '#lobby_close'
        close_button.style = 'DANGER'
        const action = new MessageActionRow
        action.addComponents(create_button)
        action.addComponents(close_button)
        const message = await this.channel.send({embeds: [embed], components: [action]})
        this.message = message
        this.#amateras.messages.create(message, {
            lobby_create: 'lobby_create',
            lobby_close: 'lobby_close'
        })
        this.thread = await this.message.startThread({name: `房间列表`, autoArchiveDuration: 60})

    }

    async updateInitMessage() {
        const embed = this.initEmbed()
        if (this.message) {
            await this.message.edit({embeds: [embed]})
        } else await this.sendInitMessage()
    }

    private initEmbed() {
        const embed: MessageEmbedOptions = {
            title: '创建你的房间，和好友一起联动',
            description: '点击下方按钮，将会立即创建一个只对你可见的文字频道和语音频道！\n创建后便可以邀请朋友加入啦！',
            fields: [
                {
                    name: '当前已创建的房间',
                    value: this.cache.size + '个'
                }
            ]
        }
        return embed
    }

    /**
     * Remove user from permission list
     * @returns 100 - Success
     * @returns 101 - Already added
     */
    async permissionAdd(id: string) {
        if (this.permissions.includes(id)) return 101
        this.permissions.push(id)
        await this.#_guild.save()
        return 100
    }

    /**
     * Remove user from permission list
     * @returns 100 - Success
     * @returns 101 - Already removed
     */
    async permissionRemove(id: string) {
        if (!this.permissions.includes(id)) return 101
        this.permissions = removeArrayItem(this.permissions, id)
        await this.#_guild.save()
        return 100
    }
}

export interface LobbyManagerData {
    channel?: string;
    lobbies: string[];
    message?: string;
    permissions: string[]
}