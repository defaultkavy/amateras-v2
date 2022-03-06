import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { GuildCommand } from "./GuildCommand";
import { cloneObj, objectEqual, removeArrayItem } from "./terminal";
import { _Guild } from "./_Guild";
const { commands } = require('../../command_list.json')

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
        if (await this.edited() === true) await this.deploy() // Deploy command setup to Guild

        const appCommands = await this.#_guild.get.commands.fetch()
        
        if (this.#commands) {
            for (const appCommand of appCommands) {
                const data = <GuildCommandData | null>await this.#collection.findOne({id: appCommand[0], guild: this.#_guild.id})
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

    async edited() {
        const collection = this.#amateras.db.collection('sys')
        const data = await collection.findOne({name: 'guild_commands'})
        // Check if database no record OR record different with commandsList
        if (!data || (data && JSON.stringify(data.commands) !== JSON.stringify(this.#commandsList))) {
            // [] reset guild list
            await this.record([])
            return true
        }
        if (data.guilds instanceof Array && data.guilds.includes(this.#_guild.id)) {
            return false
        } else {
            // Pass guild[] from record
            await this.record(data.guilds, data)
            return true
        }
    }

    private async record(guilds: string[], data?: any) {
        const collection = this.#amateras.db.collection('sys')
        guilds.push(this.#_guild.id)
        const newData = {
            name: 'guild_commands',
            commands: this.#commandsList,
            guilds: guilds
        }
        if (data) {
            await collection.replaceOne({name: 'guild_commands'}, newData)
        } else {
            await collection.insertOne(newData)
        }
    }

    private async removeRecord() {
        const collection = this.#amateras.db.collection('sys')
        const data = await collection.findOne({name: 'guild_commands'})
        if (data) {
            if (data.guilds instanceof Array && data.guilds.includes(this.#_guild.id)) {
                data.guilds = removeArrayItem(data.guilds, this.#_guild.id)
                await collection.replaceOne({name: 'guild_commands'}, data)
            } else return
        } else {
            return
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
            await this.removeRecord()
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