import { Message, MessageActionRow, MessageButton, MessageEmbedOptions, OverwriteResolvable, TextChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Err } from "./Err";
import { Lobby } from "./Lobby";
import { cloneObj, removeArrayItem } from "./terminal";
import { _Channel } from "./_Channel";
import { _Guild } from "./_Guild";

export class LobbyManager {
    #amateras: Amateras;
    #collection: Collection;
    #_guild: _Guild;
    #data?: LobbyManagerData;
    channel?: TextChannel;
    cache: Map<string, Lobby>
    message?: Message;
    threadMessage?: Message;
    #resolve: Map<string, Lobby>
    permissions: string[]
    enabled: boolean
    constructor(data: LobbyManagerData | undefined, _guild: _Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('lobbies')
        this.#_guild = _guild
        this.#data = data
        this.channel = <TextChannel>{}
        this.cache = new Map
        this.message
        this.threadMessage
        this.#resolve = new Map
        this.permissions = this.#data ? this.#data.permissions : []
        this.enabled = false
    }

    async init() {
        if (!this.#data) {
            this.enabled = false
            return
        }
        try {
            const channel = await this.#_guild.channels.fetch(this.#data?.channel)
                if (channel === 404) { 
                    new Err(`Lobby channel fetch failed`)
                    return 404
                }
                    this.channel = <TextChannel>channel.get
            if (this.#data.lobbies && this.#data.lobbies.length !== 0) {
                for (const lobbyId of this.#data.lobbies) {
                    const lobbyData = <LobbyData>await this.#collection.findOne({owner: lobbyId, state: "OPEN"})
                    if (lobbyData) {
                        const lobby = new Lobby(lobbyData, this.#_guild, this, this.#amateras)
                        this.cache.set(lobbyId, lobby)
                        if (await lobby.init()) this.#resolve.set(lobby.categoryChannel.id, lobby)
                        else this.cache.delete(lobbyId)
                    }
                }
            }
            if (this.#data.message) {
                try {
                    this.message = await this.channel.messages.fetch(this.#data.message)
                } catch {
                    new Err(`Lobby message fetch failed`)
                }
            }

            if (this.#data.threadMessage) {
                try {
                    if (this.message && this.message.thread) {
                        this.threadMessage = await this.message.thread.messages.fetch(this.#data.threadMessage)
                    }
                } catch {
                    new Err(`Lobby thread message fetch failed`)
                }
            }
            await this.updateInitMessage()
        } catch {
            return 404
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
        if (this.message && !this.message.deleted) this.message.delete()
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
        if (this.message && !this.message.deleted) this.message.delete()
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
        const lobbyData = <LobbyData>await this.#collection.findOne({owner: id, state: "OPEN"})
        if (lobbyData) {
            const lobby = new Lobby(lobbyData, this.#_guild, this, this.#amateras)
            this.cache.set(id, lobby)
            await lobby.init()
            this.#resolve.set(lobby.categoryChannel.id, lobby)
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
        let lobbyData = <LobbyData>await this.#collection.findOne({categoryChannel: id, state: "OPEN"})
        if (lobbyData) {
            const lobby = new Lobby(lobbyData, this.#_guild, this, this.#amateras)
            this.cache.set(lobby.owner.id, lobby)
            await lobby.init()
            this.#resolve.set(lobby.categoryChannel.id, lobby)
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
        textChannel.lockPermissions()
        voiceChannel.lockPermissions()
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
        lobby.textChannel.send({content: `${member}创建了房间`})
        this.#_guild.log.send(`${await this.#_guild.log.name(id)} 创建了房间`)
        if (lobby.owner.v) lobby.owner.v.sendInfoLobby(lobby)

        return lobby
    }

    toData() {
        const data = cloneObj(this, ['cache'])
        data.channel = this.channel ? this.channel.id : undefined
        data.lobbies = Array.from(this.cache.keys())
        data.message = this.message ? this.message.id : undefined
        data.threadMessage = this.threadMessage ? this.threadMessage.id : undefined
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

    }

    async updateInitMessage() {
        const embed = this.initEmbed()
        if (this.message) {
            await this.message.edit({embeds: [embed]})
            if (!this.message.thread) {
                if (this.message.channel.type !== 'GUILD_TEXT') return
                await this.message.channel.threads.create({startMessage: this.message, name: '房间列表', autoArchiveDuration: 60})
            }
            let list = ``
            for (const lobby of this.cache) {
                if (lobby[1].state === 'OPEN') list += `\n${lobby[1].owner.mention()} - ${new Date(lobby[1].categoryChannel.createdTimestamp).toLocaleString('en-ZA')}`
            }
            const listEmbed: MessageEmbedOptions = {
                description: list
            }
            if (this.message.thread) {
                if (this.threadMessage) {
                    this.threadMessage.edit({embeds: [listEmbed], allowedMentions: {parse: []}})
                } else {
                    this.threadMessage = await this.message.thread.send({embeds: [listEmbed], allowedMentions: {parse: []}})
                }
            }
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