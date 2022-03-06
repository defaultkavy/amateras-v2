import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Command } from "./Command";
import { removeArrayItem } from "./terminal";
const { global_commands } = require('../../command_list.json')

export class CommandManager {
    #amateras: Amateras;
    #commandsList: [];
    #commands?: {[key: string]: string};
    cache: Map<string, Command>
    #collection: Collection<CommandData>;
    constructor(amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection<CommandData>('commands')
        this.#commandsList = global_commands
        this.cache = new Map
    }

    async init() {
        if (!this.#commandsList) return console.log('| Global Command Disabled')
        const admin = this.#amateras.system.admin
        if (!admin) throw new Error('Amateras Fatal Error: System Admin User fetch failed')

        this.#collection.findOne({id: admin.id})
        await this.deploy() // Deploy command setup 
        const appCommands = await this.#amateras.client.application!.commands.fetch()
        if (this.#commands) {
            for (const appCommand of appCommands) {
                const data = await this.#collection.findOne({id: appCommand[0]})
                const command = new Command(data, appCommand[1], this.#amateras)
                this.cache.set(appCommand[1].name, command)
                await command.init()
            }
        } else {
            for (const appCommand of appCommands) {
                const command = new Command(null, appCommand[1], this.#amateras)
                this.cache.set(appCommand[1].name, command)
                await command.init()
            }
        }
    }

    async edited() {
        const collection = this.#amateras.db.collection('sys')
        const data = await collection.findOne({name: 'commands'})
        // Check if database no record OR record different with commandsList
        if (!data || (data && JSON.stringify(data.commands) !== JSON.stringify(this.#commandsList))) {
            // [] reset guild list
            await this.record()
            return true
        }
        
        await this.record(data)
        return true
    }

    private async record(data?: any) {
        const collection = this.#amateras.db.collection('sys')
        const newData = {
            name: 'commands',
            commands: this.#commandsList
        }
        if (data) {
            await collection.replaceOne({name: 'commands'}, newData)
        } else {
            await collection.insertOne(newData)
        }
    }

    private async removeRecord() {
        const collection = this.#amateras.db.collection('sys')
        const data = await collection.findOne({name: 'commands'})
        if (data) {
            await collection.replaceOne({name: 'commands'}, data)
        } else {
            return
        }
    }

    async deploy() {
        const rest = new REST({ version: '9' }).setToken(this.#amateras.client.token!);

        try {
            await rest.put(
                Routes.applicationCommands(this.#amateras.id),
                { body: this.#commandsList },
            );
        } catch(err) {
            await this.removeRecord()
            console.error(err);
        }
    }
}