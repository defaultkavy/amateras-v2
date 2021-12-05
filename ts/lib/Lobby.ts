import { CategoryChannel, Message, PermissionOverwrites, TextChannel, VoiceChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { LobbyManager } from "./LobbyManager";
import { Player } from "./Player";
import { cloneObj, removeArrayItem } from "./terminal";
import { VImageFolder } from "./VImageFolder";
import { _Guild } from "./_Guild";
import { _Message } from "./_Message";

export class Lobby {
    #amateras: Amateras;
    #collection: Collection;
    #_guild: _Guild;
    #categoryChannel: string;
    categoryChannel: CategoryChannel;
    #voiceChannel: string;
    voiceChannel: VoiceChannel;
    #textChannel: string;
    textChannel: TextChannel;
    #infoChannel: string;
    infoChannel: TextChannel;
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
    constructor(data: LobbyData, _guild: _Guild, manager: LobbyManager, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('lobbies')
        this.#_guild = _guild
        this.#owner = data.owner
        this.owner = <Player>{}
        this.#member = data.member
        this.member = new Map
        this.#vFolder = data.vFolder
        this.vFolder = new Map
        this.#categoryChannel = data.categoryChannel
        this.categoryChannel = <CategoryChannel>{}
        this.#voiceChannel = data.voiceChannel
        this.voiceChannel = <VoiceChannel>{}
        this.#textChannel = data.textChannel
        this.textChannel = <TextChannel>{}
        this.#infoChannel = data.infoChannel
        this.infoChannel = <TextChannel>{}
        this.state = data.state
        this.#manager = manager
        this.#messages = data.messages
        this.messages = new Map
    }

    async init() {
        try {
            this.categoryChannel = <CategoryChannel>await this.#_guild.get.channels.fetch(this.#categoryChannel)
            this.voiceChannel = <VoiceChannel>await this.#_guild.get.channels.fetch(this.#voiceChannel)
            this.textChannel = <TextChannel>await this.#_guild.get.channels.fetch(this.#textChannel)
            this.infoChannel = <TextChannel>await this.#_guild.get.channels.fetch(this.#infoChannel)
        } catch {
            console.error(`Channel is deleted.`)
            this.state = 'CLOSED'
            await this.save()
            return false
        }
        if (this.voiceChannel.deleted && this.textChannel.deleted) {
            this.state = 'CLOSED'
        }
        this.owner = await this.#amateras.players.fetch(this.#owner)
        this.owner.joinLobby(this)
        for (const memberId of this.#member) {
            const member = await this.#amateras.players.fetch(memberId)
            this.member.set(memberId, member)
            member.joinLobby(this)
        }
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
        return true
    }

    async save() {
        const data = cloneObj(this)
        data.categoryChannel = this.#categoryChannel
        data.textChannel = this.#textChannel
        data.voiceChannel = this.#voiceChannel
        data.infoChannel = this.#infoChannel
        data.owner = this.#owner
        data.member = this.#member
        data.vFolder = this.#vFolder
        data.guild = this.#_guild.id
        data.messages = {}
        if (this.state !== 'CLOSED') for (const id of this.messages.keys()) {
            data.messages[id] = this.messages.get(id)!.id
        }
        const lobby = <_GuildData>await this.#collection.findOne({ owner: this.owner.id } )
        if (lobby) {
            await this.#collection.replaceOne({ owner: this.owner.id}, data)
        } else {
            await this.#collection.insertOne(data)
        }
    }

    async close() {
        try {
            if (!this.textChannel.deleted) await this.textChannel.delete()
            if (!this.voiceChannel.deleted) await this.voiceChannel.delete()
            if (!this.infoChannel.deleted) await this.infoChannel.delete()
            if (!this.categoryChannel.deleted) await this.categoryChannel.delete()
        } catch { }
        this.state = 'CLOSED'
        await this.save()
        this.#manager.cache.delete(this.owner.id)
        await this.#manager.updateInitMessage()
    }

    async addMember(id: string) {
        const player = await this.#amateras.players.fetch(id)
        this.member.set(player.id, player)
        this.#member.push(id)
        player.joinLobby(this)
        const member = await this.textChannel.guild.members.fetch(id)
        this.textChannel.send({content: `${member}加入了房间`})
        if (player.v) await player.v.sendInfoLobby(this)
        this.categoryChannel.permissionOverwrites.create(await this.#amateras.client.users.fetch(id), { VIEW_CHANNEL: true })
        await this.save()
    }

    async removeMember(id: string) {
        const member = await this.textChannel.guild.members.fetch(id)
        const player = this.member.get(id)
        if (member.voice.channel === this.voiceChannel) {
            member.voice.disconnect()
        }
        this.member.delete(id)
        if (player) player.leaveLobby(this)
        this.#member = removeArrayItem(this.#member, id)
        this.categoryChannel.permissionOverwrites.create(await this.#amateras.client.users.fetch(id), { VIEW_CHANNEL: false })
        this.deleteMessage(id)
        this.textChannel.send({content: `${member}退出了房间`})
        await this.save()
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
}