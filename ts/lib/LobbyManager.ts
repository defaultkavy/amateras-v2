import { BaseGuildTextChannel, ButtonInteraction, CategoryChannel, Channel, Guild, Message, MessageActionRow, MessageButton, MessageEmbedOptions, OverwriteResolvable, PermissionOverwrites, TextChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Lobby } from "./Lobby";
import { cloneObj } from "./terminal";
import { _Channel } from "./_Channel";
import { _Guild } from "./_Guild";

export class LobbyManager {
    #amateras: Amateras;
    #collection: Collection;
    #_guild: _Guild;
    #lobby: string[];
    #channel: string;
    channel: TextChannel;
    cache: Map<string, Lobby>
    #message?: string;
    message?: Message;
    #resolve: Map<string, Lobby>
    constructor(data: LobbyManagerData, _guild: _Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('lobbies')
        this.#_guild = _guild
        this.#channel = data.channel
        this.channel = <TextChannel>{}
        this.#lobby = data.lobby
        this.cache = new Map
        this.#message = data.message
        this.message
        this.#resolve = new Map
    }

    async init() {
        const channel = await this.#_guild.get.channels.fetch(this.#channel)
        if (!channel) {
            console.error('channel is ' + channel)
            return
        }
        this.channel = <TextChannel>channel
        if (this.#lobby && this.#lobby.length !== 0) {
            for (const lobbyId of this.#lobby) {
                const lobbyData = <LobbyData>await this.#collection.findOne({owner: lobbyId, state: "OPEN"})
                if (lobbyData) {
                    const lobby = new Lobby(lobbyData, this.#_guild, this, this.#amateras)
                    this.cache.set(lobbyId, lobby)
                    await lobby.init()
                    this.#resolve.set(lobby.categoryChannel.id, lobby)
                }
            }
        }
        if (this.#message) this.message = await this.channel.messages.fetch(this.#message)
        if (!this.message) await this.sendInitMessage()
        else await this.updateInitMessage()
        await this.#_guild.save()
    }

    async setup(channel: TextChannel) {
        this.channel = channel
        this.#channel = channel.id
        if (this.message && !this.message.deleted) this.message.delete()
        await this.sendInitMessage()
        await this.#_guild.save()
    }

    async fetch(id: string) {
        const lobby = this.cache.get(id)
        if (lobby && lobby.state === 'OPEN') {
            return lobby
        } else if (lobby && lobby.state === 'CLOSED') {
            return
        }
        const lobbyData = <LobbyData>await this.#collection.findOne({owner: id, state: "OPEN"})
        if (lobbyData) {
            const lobby = new Lobby(lobbyData, this.#_guild, this, this.#amateras)
            this.cache.set(id, lobby)
            await lobby.init()
            this.#resolve.set(lobby.categoryChannel.id, lobby)
            return lobby
        } else return
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

    async create(interact: ButtonInteraction) {
        const member = await this.#_guild.get.members.fetch(interact.user.id)
        const ownerPermission: OverwriteResolvable = {
            id: interact.user.id,
            allow: 'VIEW_CHANNEL'
        }
        const otherPermission: OverwriteResolvable = {
            id: this.#_guild.get.roles.everyone,
            deny: 'VIEW_CHANNEL'
        }
        const category = await this.#_guild.get.channels.create(member.displayName + '的房间', {
            type: 'GUILD_CATEGORY',
            permissionOverwrites: [ownerPermission, otherPermission],
            position: this.channel.parent ? this.channel.parent.position + 1 : this.channel.position + 1
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
            owner: interact.user.id,
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
        await this.#_guild.save()
        await this.updateInitMessage()
        if (lobby.owner.v) lobby.owner.v.sendInfoLobby(lobby)
    }

    toData() {
        const data = cloneObj(this, ['cache'])
        data.channel = this.#channel
        data.lobby = Array.from(this.cache.keys())
        data.message = this.#message
        return data
    }

    private async sendInitMessage() {
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
        this.#message = message.id
        this.#amateras.messages.create(message, {
            lobby_create: 'lobby_create',
            lobby_close: 'lobby_close'
        })

    }

    async updateInitMessage() {
        const embed = this.initEmbed()
        if (this.message) await this.message.edit({embeds: [embed]})
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
}