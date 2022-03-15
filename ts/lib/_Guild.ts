import { Guild, GuildMember, TextChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { ForumManager } from "./ForumManager";
import { LobbyManager, LobbyManagerData } from "./LobbyManager";
import { GuildLog, LogData } from "./GuildLog";
import { cloneObj, removeArrayItem } from "./terminal";
import { _ChannelManager, _ChannelManagerData } from "./_ChannelManager";
import { GuildCommandManager } from "./GuildCommandManager";
import { _RoleManager, _RoleManagerData } from "./_RoleManager";
import { Err } from "./Err";
import { MusicPlayer } from "./MusicPlayer";
import { _GuildManager } from "./_GuildManager";
import cmd from "./cmd";
import { GameManager } from "./GameManager";

export class _Guild {
    #amateras: Amateras;
    #collection: Collection;
    #manager: _GuildManager;
    id: string;
    get: Guild;
    log: GuildLog;
    lobby: LobbyManager;
    forums: ForumManager;
    commands: GuildCommandManager;
    roles: _RoleManager;
    channels: _ChannelManager;
    moderators: string[]
    musicPlayer: MusicPlayer;
    available: boolean;
    ready: boolean;
    amateras?: GuildMember;
    lang: 'zh-s' | 'en';
    games: GameManager;
    constructor(data: _GuildData, guild: Guild, manager: _GuildManager, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = this.#amateras.db.collection('guilds')
        this.#manager = manager
        this.get = guild
        this.id = data.id
        this.commands = new GuildCommandManager(data.commands, this, this.#amateras)
        this.log = new GuildLog(data.log, this, this.#amateras)
        this.lobby = new LobbyManager(data.lobby, this, this.#amateras)
        this.forums = new ForumManager(data.forums, this, this.#amateras)
        this.roles = new _RoleManager(data.roles, this, this.#amateras)
        this.channels = new _ChannelManager(data.channels, this, this.#amateras)
        this.moderators = data.moderators ? data.moderators : [guild.ownerId]
        this.musicPlayer = new MusicPlayer(this, amateras)
        this.available = data.available ? data.available : true
        this.ready = false
        this.lang = data.lang ? data.lang : amateras.system.lang
        this.games = new GameManager(this, amateras)
    }

    async init() {
        this.amateras = await this.get.members.fetch(this.#amateras.id).catch(() => undefined)
        console.log(cmd.Green, `Guild Initializing: ${this.get.name}`)
        console.time('| Guild Command deployed')
        await this.commands.init()
        console.timeEnd('| Guild Command deployed')
        console.time('| Guild Log Channel loaded')
        await this.log.init()
        console.timeEnd('| Guild Log Channel loaded')
        console.time('| Lobby loaded')
        await this.lobby.init()
        console.timeEnd('| Lobby loaded')
        console.time('| Forum loaded')
        await this.forums.init()
        console.timeEnd('| Forum loaded')
        console.time('| Channel loaded')
        await this.channels.init()
        console.timeEnd('| Channel loaded')
        console.time('| Role loaded')
        await this.roles.init()
        console.timeEnd('| Role loaded')
        console.time('| Music loaded')
        await this.musicPlayer.init()
        console.timeEnd('| Music loaded')
        await this.save()
        console.log(cmd.Green, `Guild Initialized: ${this.get.name}`)
        this.ready = true
    }

    async save() {
        const data = cloneObj(this, ['get', 'roles', 'musicPlayer', 'ready', 'amateras', 'games'])
        data.commands = this.commands.toData()
        data.log = this.log.toData()
        data.lobby = this.lobby.toData()
        data.forums = this.forums.toData()
        data.roles = this.roles.toData()
        data.channels = this.channels.toData()
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

    /**
     * @returns 100 - Success
     * @returns 101 - Already set 
     */
    async setLanguage(lang: 'zh-s' | 'en') {
        if (this.lang === lang) return 101
        this.lang = lang
        await this.log.initMessage()
        await this.musicPlayer.initMessage()
        await this.lobby.updateInitMessage()
        await this.save()
        return 100
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
    roles?: _RoleManagerData
    channels?: _ChannelManagerData
    lang?: 'zh-s' | 'en'
}