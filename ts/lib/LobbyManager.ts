import { Message, MessageActionRow, MessageButton, MessageEmbedOptions, NewsChannel, OverwriteResolvable, TextChannel, ThreadChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Err } from "./Err";
import { Lobby } from "./Lobby";
import { cloneObj, removeArrayItem } from "./terminal";
import { _Channel } from "./_Channel";
import { _Guild } from "./_Guild";
import { _TextChannel } from "./_TextChannel";
import { _lobby_init_ } from '../lang.json'

export class LobbyManager {
    #amateras: Amateras;
    #collection: Collection<LobbyData>;
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
        this.#collection = amateras.db.collection<LobbyData>('lobbies')
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
                        this.thread = await this.message.startThread({name: `????????????`, autoArchiveDuration: 60})
                    }
                }
            } catch {
                new Err(`Lobby thread message fetch failed`)
            }
            if (this.#data.lobbies && this.#data.lobbies[0]) {
                for (const lobbyId of this.#data.lobbies) {
                    const lobbyData = await this.#collection.findOne({owner: lobbyId, state: "OPEN"})
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
        //if (this.message) this.message.delete().catch()
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
        const lobbyData = await this.#collection.findOne({owner: id, state: "OPEN", guild: this.#_guild.id})
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
        let lobbyData = await this.#collection.findOne({categoryChannel: id, state: "OPEN", guild: this.#_guild.id})
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
        const category = await this.#_guild.get.channels.create(member.displayName + '?????????', {
            type: 'GUILD_CATEGORY',
            permissionOverwrites: [ownerPermission, otherPermission]
        })
        const infoChannel = await category.createChannel('????????????', {
            type: 'GUILD_TEXT'
        })
        const textChannel = await category.createChannel('????????????', {
            type: 'GUILD_TEXT'
        })
        const voiceChannel = await category.createChannel('????????????', {
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
            title: `??????`,
            description: `????????? ${lobby.owner.mention} ????????????\n???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????\n\n????????????V????????????????????????${infoChannel} ?????????????????????V??????????????????????????????????????????????????????????????????`,
            fields: [
                {
                    name: `????????????????????????`,
                    value: `\`\`\`/invite\n- ???????????????????????????????????????????????????????????? Apps??????????????????> Invite ????????????????????????\n/kick\n- ??????????????????\n/lobby close\n- ????????????\`\`\``,
                    inline: false
                },
                {
                    name: `????????????????????????`,
                    value: `\`\`\`/lobby exit\n- ????????????\`\`\``,
                    inline: false
                }
            ]
        }
        if (lobby.textChannel) {
            lobby.textChannel.send({embeds: [embed]})
            lobby.textChannel.send({content: `${member}???????????????`})
        }
        this.#_guild.log.send(`${await this.#_guild.log.name(id)} ???????????????`)
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
        const lang = this.#_guild.lang
        const embed = this.initEmbed()
        const create_button = new MessageButton
        create_button.label = _lobby_init_.lobby_create[lang]
        create_button.customId = '#lobby_create'
        create_button.style = 'PRIMARY'
        const close_button = new MessageButton
        close_button.label = _lobby_init_.lobby_close[lang]
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
        this.thread = await this.message.startThread({name: _lobby_init_.lobby_thread[lang], autoArchiveDuration: 60})

    }

    async updateInitMessage() {
        const embed = this.initEmbed()
        if (this.message) {
            await this.message.edit({embeds: [embed]})
        } else await this.sendInitMessage()
    }

    private initEmbed() {
        const lang = this.#_guild.lang
        const embed: MessageEmbedOptions = {
            title: _lobby_init_.title[lang],
            description: _lobby_init_.description[lang],
            fields: [
                {
                    name: _lobby_init_.room_count[lang],
                    value: this.cache.size + '???'
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