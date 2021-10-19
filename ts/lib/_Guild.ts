import { BaseGuildTextChannel, Guild, TextChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { LobbyManager } from "./LobbyManager";
import { cloneObj } from "./terminal";
import { _ChannelManager } from "./_ChannelManager";

export class _Guild {
    #amateras: Amateras;
    #collection: Collection;
    id: string;
    #channels: _ChannelManagerData | undefined;
    channels: _ChannelManager;
    get: Guild;
    #lobbies: LobbyManagerData | undefined;
    lobbies?: LobbyManager;

    constructor(data: _GuildData, guild: Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = this.#amateras.db.collection('guilds')
        this.get = guild
        this.id = data.id
        this.#channels = data.channels
        this.channels = <_ChannelManager>{}
        this.#lobbies = data.lobbies
    }

    async init() {
        this.channels = new _ChannelManager(this.#channels, this.get, this, this.#amateras)
        await this.channels.init()
        if (this.#lobbies) {
            this.lobbies = new LobbyManager(this.#lobbies, this, this.#amateras)
            await this.lobbies.init()
        }
    }

    async save() {
        const data = cloneObj(this, ['get'])
        data.channels = {
            settings: this.channels.settings?.data,
            notify: this.channels.notify?.data
        }
        data.lobbies = this.lobbies ? this.lobbies.toData() : undefined
        const guild = await this.#collection.findOne({ id: this.id })
        if (guild) {
            await this.#collection.replaceOne({ id: this.id }, data)
        } else {
            await this.#collection.insertOne(data)
        }
    }

    async setupLobbyManager(channel: TextChannel) {
        if (this.lobbies) {
            await this.lobbies.setup(channel)
        } else {
            const data: LobbyManagerData = {
                channel: channel.id,
                lobby: [],
                message: undefined
            }
            this.lobbies = new LobbyManager(data, this, this.#amateras)
            await this.lobbies.init()
        }
    }

    async closeLobbyManager() {
        if (this.lobbies) {
            if (this.lobbies.cache.size !== 0) {
                for (const lobby of this.lobbies.cache.values()) {
                    await lobby.close()
                }
            }
            if (this.lobbies.message) {
                try { this.lobbies.message.delete() } catch { }
            }
        }
        this.lobbies = undefined
        this.#lobbies = undefined
        await this.save()
        console.log(`Guild ${this.id} Lobby Function is close.`)
    }
}