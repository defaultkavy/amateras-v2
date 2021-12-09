import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { GuildCommand } from "./GuildCommand";
import { cloneObj } from "./terminal";
import { _Guild } from "./_Guild";
const { commands } = require('../command_list.json')

export class GuildCommandManager {
    #amateras: Amateras;
    #commandsList: Command[];
    cache: Map<string, GuildCommand>
    #_guild: _Guild;
    #commands?: {[key: string]: string};
    #collection: Collection;
    constructor(data: GuildCommandManagerData | undefined, _guild: _Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('commands')
        this.#commandsList = commands
        this.#commands = data ? data.commands : undefined
        this.#_guild = _guild
        this.cache = new Map
    }

    async init() {
        if (!this.#commandsList) return console.log('| Guild Command Disabled')

        await this.deploy() // Deploy command setup to Discord Guild

        const appCommands = await this.#_guild.get.commands.fetch()
        if (this.#commands) {
            for (const appCommand of appCommands) {
                const data = <GuildCommandData | null>await this.#collection.findOne({id: appCommand[0]})
                const command = new GuildCommand(data, appCommand[1], this.#_guild, this.#amateras)
                this.cache.set(appCommand[1].name, command)
                await command.init()
            }
        } else {
            for (const appCommand of appCommands) {
                const command = new GuildCommand(null, appCommand[1], this.#_guild, this.#amateras)
                this.cache.set(appCommand[1].name, command)
                await command.init()
            }
        }
    }

    async deploy() {
        const rest = new REST({ version: '9' }).setToken(this.#amateras.client.token!);

        try {
            await rest.put(
                Routes.applicationGuildCommands(this.#amateras.id, this.#_guild.id),
                { body: this.#commandsList },
            );
        } catch(err) {
            console.error(err);
        }
    }

    toData() {
        const data = cloneObj(this, ['cache'])
        data.commands = {}
        for (const command of this.cache.values()) {
            data.commands[command.name] = command.id
        }
        return data
    }
}