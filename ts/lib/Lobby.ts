import { CategoryChannel, Message, MessageEmbedOptions, TextChannel, VoiceChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Err } from "./Err";
import { LobbyManager } from "./LobbyManager";
import { Player } from "./Player";
import { cloneObj, removeArrayItem } from "./terminal";
import { VImageFolder } from "./VImageFolder";
import { _Guild, _GuildData } from "./_Guild";
import { _Message } from "./_Message";

export class Lobby {
    #amateras: Amateras;
    #collection: Collection;
    #data: LobbyData
    #_guild: _Guild;
    categoryChannel?: CategoryChannel;
    voiceChannel?: VoiceChannel;
    textChannel?: TextChannel;
    infoChannel?: TextChannel;
    #owner: string;
    owner: Player;
    #member: string[];
    member: Map<string, Player>;
    state: 'OPEN' | 'CLOSED'
    #vFolder: {[keys: string]: string};
    vFolder: Map<string, VImageFolder>;
    #manager: LobbyManager;
    #messages: {[keys: string]: string};
    messages: Map<string, _Message>
    lobbyMessage?: Message
    constructor(data: LobbyData, _guild: _Guild, manager: LobbyManager, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('lobbies')
        this.#data = data
        this.#_guild = _guild
        this.#owner = data.owner
        this.owner = <Player>{}
        this.#member = data.member
        this.member = new Map
        this.#vFolder = data.vFolder
        this.vFolder = new Map
        this.state = data.state
        this.#manager = manager
        this.#messages = data.messages
        this.messages = new Map
    }

    /**
     * @returns 100 - Success
     * @returns 404 - Channel fetch failed
     * @returns 405 - Player fetch failed
     */
    async init() {
        
        try {
            this.categoryChannel = <CategoryChannel> this.#_guild.get.channels.cache.get(this.#data.categoryChannel)
            this.voiceChannel = <VoiceChannel> this.#_guild.get.channels.cache.get(this.#data.voiceChannel)
            this.textChannel = <TextChannel> this.#_guild.get.channels.cache.get(this.#data.textChannel)
            this.infoChannel = <TextChannel> this.#_guild.get.channels.cache.get(this.#data.infoChannel)
            if (this.voiceChannel.deleted && this.textChannel.deleted) {
                this.state = 'CLOSED'
            }
        } catch {
            console.error(`Channel is deleted.`)
            this.state = 'CLOSED'
            await this.save()
            return 404
        }
        const player = await this.#amateras.players.fetch(this.#owner)
        if (player === 404) return 405
        this.owner = player
        this.owner.joinLobby(this)
        for (const memberId of this.#member) {
            const member = await this.#amateras.players.fetch(memberId)
            if (member === 404) continue
            this.member.set(memberId, member)
            member.joinLobby(this)
        }
        try {
            this.categoryChannel.permissionOverwrites.edit(await this.categoryChannel.guild.members.fetch(this.owner.id), {
                VIEW_CHANNEL: true,
                MANAGE_CHANNELS: true
            })
            
            this.infoChannel.permissionOverwrites.edit(await this.categoryChannel.guild.members.fetch(this.owner.id), {
                VIEW_CHANNEL: true,
                MANAGE_CHANNELS: false
            })
    
            this.textChannel.permissionOverwrites.edit(await this.categoryChannel.guild.members.fetch(this.owner.id), {
                VIEW_CHANNEL: true,
                MANAGE_CHANNELS: false
            })
            
            this.voiceChannel.permissionOverwrites.edit(await this.categoryChannel.guild.members.fetch(this.owner.id), {
                VIEW_CHANNEL: true,
                MANAGE_CHANNELS: false
            })
        } catch(err) {
            new Err(`${err}`)
        }

        //VImage
        if (this.#vFolder && Object.entries(this.#vFolder).length !== 0) {
            for (const folderOwner in this.#vFolder) {
                const player = this.member.get(folderOwner)
                if (player && player.v) {
                    const folder = player.v.imageFolders.folders.get(this.#vFolder[folderOwner])
                    if (folder) {
                        this.vFolder.set(folderOwner, folder)
                    }
                }
            }
        } else {
            this.#vFolder = {}
        }
        for (const v in this.#messages) {
            const _message = await this.#amateras.messages.fetch(this.#messages[v])
            if (_message) {
                this.messages.set(v, _message)
            }
        }
        await this.initLobbyMessage()
        return 100
    }

    async save() {
        const data = cloneObj(this)
        data.categoryChannel = this.categoryChannel ? this.categoryChannel.id : undefined
        data.textChannel = this.textChannel ? this.textChannel.id : undefined
        data.voiceChannel = this.voiceChannel ? this.voiceChannel.id : undefined
        data.infoChannel = this.infoChannel ? this.infoChannel.id : undefined
        data.owner = this.#owner
        data.member = [...this.member.keys()]
        data.vFolder = this.#vFolder
        data.guild = this.#_guild.id
        data.messages = {}
        data.lobbyMessage = this.lobbyMessage ? this.lobbyMessage.id : undefined
        if (this.state !== 'CLOSED') for (const id of this.messages.keys()) {
            data.messages[id] = this.messages.get(id)!.id
        }
        const lobby = <_GuildData>await this.#collection.findOne({ owner: this.owner.id, guild: this.#_guild.id } )
        if (lobby) {
            await this.#collection.replaceOne({ owner: this.owner.id}, data)
        } else {
            await this.#collection.insertOne(data)
        }
    }

    async close() {
        try {
            if (this.textChannel && !this.textChannel.deleted) await this.textChannel.delete()
            if (this.voiceChannel && !this.voiceChannel.deleted) await this.voiceChannel.delete()
            if (this.infoChannel && !this.infoChannel.deleted) await this.infoChannel.delete()
            if (this.categoryChannel) {
                if (this.categoryChannel.children.size !== 0) {
                    for (const channel of this.categoryChannel.children.values()) {
                        if (!channel.deleted) await channel.delete()
                    }
                }
                if (!this.categoryChannel.deleted) {
                await this.categoryChannel.delete()
                }
            }
        } catch(err) { 
            console.error('Lobby delete channel failed. Retry. \n' + err)
            if (this.categoryChannel) await this.categoryChannel.delete()
        }
        this.state = 'CLOSED'
        if (this.lobbyMessage) this.lobbyMessage.delete().catch()
        await this.save()
        this.#manager.cache.delete(this.owner.id)
        await this.#manager.updateInitMessage()
    }

    /**
     * @returns 100 - Success
     * @returns 101 - Member already in lobby
     * @returns 102 - Missing channel
     * @returns 404 - Player fetch failed
     */
    async addMember(id: string) {
        if (this.member.get(id)) return 101
        const player = await this.#amateras.players.fetch(id)
        if (player === 404) return 404
        this.member.set(player.id, player)
        player.joinLobby(this)
        if (!this.textChannel || !this.categoryChannel || !this.voiceChannel || !this.infoChannel) return 102
        const member = await this.textChannel.guild.members.fetch(id)
        this.textChannel.send({content: `${member}加入了房间`})
        if (player.v) await player.v.sendInfoLobby(this)
        this.categoryChannel.permissionOverwrites.create(await this.#amateras.client.users.fetch(id), { VIEW_CHANNEL: true })
        this.textChannel.permissionOverwrites.create(await this.#amateras.client.users.fetch(id), { VIEW_CHANNEL: true })
        this.voiceChannel.permissionOverwrites.create(await this.#amateras.client.users.fetch(id), { VIEW_CHANNEL: true })
        this.infoChannel.permissionOverwrites.create(await this.#amateras.client.users.fetch(id), { VIEW_CHANNEL: true })
        await this.initLobbyMessage()
        await this.save()
        return 100
    }

    /**
     * @returns 100 - Success
     * @returns 101 - Member not in lobby
     * @returns 102 - Missing channel
     */
    async removeMember(id: string) {
        if (!this.member.get(id)) return 101
        if (!this.textChannel || !this.categoryChannel || !this.voiceChannel || !this.infoChannel) return 102
        const member = await this.textChannel.guild.members.fetch(id)
        const player = this.member.get(id)
        if (member.voice.channel === this.voiceChannel) {
            member.voice.disconnect()
        }
        this.member.delete(id)
        if (player) player.leaveLobby(this)
        this.categoryChannel.permissionOverwrites.create(await this.#amateras.client.users.fetch(id), { VIEW_CHANNEL: false })
        this.textChannel.permissionOverwrites.create(await this.#amateras.client.users.fetch(id), { VIEW_CHANNEL: false })
        this.voiceChannel.permissionOverwrites.create(await this.#amateras.client.users.fetch(id), { VIEW_CHANNEL: false })
        this.infoChannel.permissionOverwrites.create(await this.#amateras.client.users.fetch(id), { VIEW_CHANNEL: false })
        this.deleteMessage(id)
        this.textChannel.send({content: `${member}退出了房间`})
        await this.initLobbyMessage()
        await this.save()
        return 100
    }

    async setFolder(id: string, folderId: string) {
        let player
        if (this.owner.id === id) {
            player = this.owner
        } else {
            player = this.member.get(id)
        }
        if (player && player.v) {
            const folder = player.v.imageFolders.folders.get(folderId)
            if (folder) {
                this.vFolder.set(id, folder)
                this.#vFolder[id] = folderId
                await this.save()
                return folder
            }
        } else console.error('player is' + player)
        return
    }

    async setMessage(id: string, _message: _Message) {
        this.messages.set(id, _message)
        await this.save()
    }

    async deleteMessage(id: string) {
        const _message = this.messages.get(id)
        if (_message && !_message.get.deleted) await _message.get.delete()
        this.messages.delete(id)
    }

    async initLobbyMessage() {
        const unsetThreadArchived = () => this.#manager.thread ? this.#manager.thread.archived ? this.#manager.thread.edit({archived: false}).catch(() => undefined) : this.#manager.thread : undefined
        if (this.#manager.thread) {
            if (!await unsetThreadArchived()) return
            if (this.lobbyMessage) {
                if (await this.lobbyMessage.fetch().catch(() => undefined)) {
                    this.lobbyMessage = await this.#manager.thread.send({embeds: [this.lobbyMessageEmbed()]})
                    await this.save()
                } else {
                    await this.lobbyMessage.edit({embeds: [this.lobbyMessageEmbed()]})
                }
            } else {
                if (this.#data.lobbyMessage) {
                    this.lobbyMessage = await this.#manager.thread.messages.fetch(this.#data.lobbyMessage)
                } else {
                    this.lobbyMessage = await this.#manager.thread.send({embeds: [this.lobbyMessageEmbed()]})
                    await this.save()
                }
            }
        }

    }

    lobbyMessageEmbed() {
        const embed: MessageEmbedOptions = {
            description: `${this.owner.mention()} 的房间`,
            thumbnail: {
                url: this.owner.get ? this.owner.get.displayAvatarURL({format: "jpg", size: 512}) : undefined
            },
            fields: [
                {
                    name: `人数`,
                    value: `${this.member.size + 1}人`
                }
            ],
            timestamp: this.infoChannel ? new Date(this.infoChannel.createdTimestamp) : undefined
        }

        return embed
    }
}