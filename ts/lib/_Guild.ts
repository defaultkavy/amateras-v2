import { Guild, TextChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { ForumManager } from "./ForumManager";
import { LobbyManager } from "./LobbyManager";
import { GuildLog } from "./GuildLog";
import { cloneObj } from "./terminal";
import { _ChannelManager } from "./_ChannelManager";
import { GuildCommandManager } from "./GuildCommandManager";
import { _RoleManager } from "./_RoleManager";
import { Err } from "./Err";

export class _Guild {
    #amateras: Amateras;
    #collection: Collection;
    id: string;
    get: Guild;
    log: GuildLog;
    lobby: LobbyManager;
    #forums?: ForumManagerData;
    forums: ForumManager;
    commands: GuildCommandManager;
    roles: _RoleManager;
    channels: _ChannelManager;

    constructor(data: _GuildData, guild: Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = this.#amateras.db.collection('guilds')
        this.get = guild
        this.id = data.id
        this.commands = new GuildCommandManager(data.commands, this, this.#amateras)
        this.log = new GuildLog(data.log, this, this.#amateras)
        this.lobby = new LobbyManager(data.lobby, this, this.#amateras)
        this.#forums = data.forums
        this.forums = <ForumManager>{}
        this.roles = new _RoleManager(this, this.#amateras)
        this.channels = new _ChannelManager(this, this.#amateras)
    }

    async init() {
        console.time('| Guild Command deployed')
        await this.commands.init()
        console.timeEnd('| Guild Command deployed')
        console.time('| Guild Log Channel loaded')
        await this.log.init()
        console.timeEnd('| Guild Log Channel loaded')
        await this.lobby.init()
        console.timeEnd('| Lobby loaded')
        this.forums = new ForumManager(this.#forums, this, this.#amateras)
        console.time('| Forum loaded')
        await this.forums.init()
        console.timeEnd('| Forum loaded')
        console.time('| Role loaded')
        await this.roles.init()
        console.timeEnd('| Role loaded')
        await this.save()
    }

    async save() {
        const data = cloneObj(this, ['get', 'roles', 'channels'])
        data.commands = this.commands.toData()
        data.log = this.log ? this.log.toData() : undefined
        data.lobby = this.lobby ? this.lobby.toData() : undefined
        data.forums = this.forums ? this.forums.toData() : undefined
        const guild = await this.#collection.findOne({ id: this.id })
        if (guild) {
            await this.#collection.replaceOne({ id: this.id }, data)
        } else {
            await this.#collection.insertOne(data)
        }
    }

    async member(id: string) {
        try {
            return await this.get.members.fetch(id)
        } catch(err) {
            new Err(`Member fetch failed. (User)${id}`)
            return 404
        }
    }
}