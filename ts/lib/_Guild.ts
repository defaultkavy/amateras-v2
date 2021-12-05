import { BaseGuildTextChannel, Guild, TextChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { ForumManager } from "./ForumManager";
import { LobbyManager } from "./LobbyManager";
import { cloneObj } from "./terminal";
import { _ChannelManager } from "./_ChannelManager";

export class _Guild {
    #amateras: Amateras;
    #collection: Collection;
    id: string;
    // #channels: _ChannelManagerData | undefined;
    // channels: _ChannelManager;
    get: Guild;
    #lobby: LobbyManagerData | undefined;
    lobby?: LobbyManager;
    #forums: ForumManagerData | undefined;
    forums?: ForumManager;

    constructor(data: _GuildData, guild: Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = this.#amateras.db.collection('guilds')
        this.get = guild
        this.id = data.id
        // this.#channels = data.channels
        // this.channels = <_ChannelManager>{}
        this.#lobby = data.lobby
        this.#forums = data.forums
    }

    async init() {
        // this.channels = new _ChannelManager(this.#channels, this.get, this, this.#amateras)
        // await this.channels.init()
        if (this.#lobby) {
            this.lobby = new LobbyManager(this.#lobby, this, this.#amateras)
            console.time('| Lobby loaded')
            await this.lobby.init()
            console.timeEnd('| Lobby loaded')
        }
        this.forums = new ForumManager(this.#forums, this, this.#amateras)
        console.time('| Forum loaded')
        await this.forums.init()
        console.timeEnd('| Forum loaded')
    }

    async save() {
        const data = cloneObj(this, ['get'])
        // data.channels = {
        //     settings: this.channels.settings?.data,
        //     notify: this.channels.notify?.data
        // }
        data.lobby = this.lobby ? this.lobby.toData() : undefined
        data.forums = this.forums ? this.forums.toData() : undefined
        const guild = await this.#collection.findOne({ id: this.id })
        if (guild) {
            await this.#collection.replaceOne({ id: this.id }, data)
        } else {
            await this.#collection.insertOne(data)
        }
    }

    async setupLobbyManager(channel: TextChannel) {
        if (this.lobby) {
            await this.lobby.setup(channel)
        } else {
            const data: LobbyManagerData = {
                channel: channel.id,
                lobbies: [],
                message: undefined,
                permissions: []
            }
            this.lobby = new LobbyManager(data, this, this.#amateras)
            await this.lobby.init()
        }
        console.log(`Guild ${this.id} Lobby Function is on.`)
    }

    async closeLobbyManager() {
        if (this.lobby) {
            if (this.lobby.cache.size !== 0) {
                for (const lobby of this.lobby.cache.values()) {
                    await lobby.close()
                }
            }
            if (this.lobby.message) {
                try { this.lobby.message.delete() } catch { }
            }
        } else return 101
        this.lobby = undefined
        this.#lobby = undefined
        await this.save()
        console.log(`Guild ${this.id} Lobby Function is off.`)
        return 100
    }
}