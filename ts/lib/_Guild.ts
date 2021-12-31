import { Guild, TextChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { ForumManager } from "./ForumManager";
import { LobbyManager, LobbyManagerData } from "./LobbyManager";
import { GuildLog } from "./GuildLog";
import { cloneObj, removeArrayItem } from "./terminal";
import { _ChannelManager } from "./_ChannelManager";
import { GuildCommandManager } from "./GuildCommandManager";
import { _RoleManager } from "./_RoleManager";
import { Err } from "./Err";
import { MusicPlayer } from "./MusicPlayer";
import { _GuildManager } from "./_GuildManager";
import cmd from "./cmd";

export class _Guild {
    #amateras: Amateras;
    #collection: Collection;
    #manager: _GuildManager;
    id: string;
    get: Guild;
    log: GuildLog;
    lobby: LobbyManager;
    #forums?: ForumManagerData;
    forums: ForumManager;
    commands: GuildCommandManager;
    roles: _RoleManager;
    channels: _ChannelManager;
    moderators: string[]
    musicPlayer: MusicPlayer;
    available: boolean;
    ready: boolean;
    constructor(data: _GuildData, guild: Guild, manager: _GuildManager, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = this.#amateras.db.collection('guilds')
        this.#manager = manager
        this.get = guild
        this.id = data.id
        this.commands = new GuildCommandManager(data.commands, this, this.#amateras)
        this.log = new GuildLog(data.log, this, this.#amateras)
        this.lobby = new LobbyManager(data.lobby, this, this.#amateras)
        this.#forums = data.forums
        this.forums = <ForumManager>{}
        this.roles = new _RoleManager(this, this.#amateras)
        this.channels = new _ChannelManager(this, this.#amateras)
        this.moderators = data.moderators ? data.moderators : [guild.ownerId]
        this.musicPlayer = new MusicPlayer(this, amateras)
        this.available = data.available ? data.available : true
        this.ready = false
    }

    async init() {
        console.log(cmd.Green, `Guild Initializing: ${this.id}`)
        console.time('| Guild Command deployed')
        await this.commands.init()
        console.timeEnd('| Guild Command deployed')
        console.time('| Guild Log Channel loaded')
        await this.log.init()
        console.timeEnd('| Guild Log Channel loaded')
        console.time('| Lobby loaded')
        await this.lobby.init()
        console.timeEnd('| Lobby loaded')
        this.forums = new ForumManager(this.#forums, this, this.#amateras)
        console.time('| Forum loaded')
        await this.forums.init()
        console.timeEnd('| Forum loaded')
        console.time('| Role loaded')
        await this.roles.init()
        console.timeEnd('| Role loaded')
        console.time('| Music loaded')
        await this.musicPlayer.init()
        console.timeEnd('| Music loaded')
        await this.save()
        console.log(cmd.Green, `Guild Initialized: ${this.id}`)
        this.ready = true
    }

    async save() {
        const data = cloneObj(this, ['get', 'roles', 'channels', 'musicPlayer', 'ready'])
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

    /**
     * @returns 100 - Success
     * @returns 101 - Mod command get failed
     * @returns 102 - Command permission change failed
     * @returns 105 - Already set
     * @returns 404 - Player fetch failed
     * @returns 405 - Role fetch failed
     */
    async setModerator(id: string, type: 'USER' | 'ROLE') {
        const command = this.commands.cache.get('mod')
        if (!command) return 101
        if (type === 'USER') {
            const player = await this.#amateras.players.fetch(id)
            if (player === 404) return 404
            const enable = await command.permissionEnable(id, 'USER')
            if (enable === 105) return 105
            if (enable === 101) return 102
            this.moderators.push(id)
            await this.save()
            return 100
        } else {
            const role = await this.roles.fetch(id)
            if (role === 404) return 405
            const enable = await command.permissionEnable(id, 'ROLE')
            if (enable === 105) return 105
            if (enable === 101) return 102
            for (const member of role.get.members) {
                this.moderators.push(member[1].id)
            }
            await this.save()
            return 100
        }
    }
    
    /**
     * @returns 100 - Success
     * @returns 101 - Mod command get failed
     * @returns 102 - Command permission change failed
     * @returns 105 - Already set
     * @returns 405 - Role fetch failed
     */
     async removeModerator(id: string, type: 'USER' | 'ROLE') {
        const command = this.commands.cache.get('mod')
        if (!command) return 101
        if (!this.moderators.includes(id)) return 102
        if (type === 'USER') {
            const disable = await command.permissionDisable(id, 'USER')
            if (disable === 105) return 105
            if (disable === 101) return 102
            this.moderators = removeArrayItem(this.moderators, id)
            await this.save()
            return 100
        } else {
            const role = await this.roles.fetch(id)
            if (role === 404) return 405
            const disable = await command.permissionDisable(id, 'ROLE')
            if (disable === 105) return 105
            if (disable === 101) return 102
            for (const member of role.get.members) {
                this.moderators.push(member[1].id)
            }
            await this.save()
            return 100
        }
    }

    async leave() {
        this.available = false
        await this.save()
        this.#manager.cache.delete(this.id)
    }
}

export interface _GuildData {
    id: string;
    log?: LogData;
    lobby?: LobbyManagerData;
    forums?: ForumManagerData;
    commands?: GuildCommandManagerData;
    moderators: string[];
    available?: boolean;
}