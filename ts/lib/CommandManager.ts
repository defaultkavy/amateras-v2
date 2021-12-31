import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Command } from "./Command";
const { global_commands } = require('../command_list.json')

export class CommandManager {
    #amateras: Amateras;
    #commandsList: [];
    #commands?: {[key: string]: string};
    cache: Map<string, Command>
    #collection: Collection;
    constructor(amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('commands')
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
                const data = <CommandData | null>await this.#collection.findOne({id: appCommand[0]})
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

    async deploy() {
        const rest = new REST({ version: '9' }).setToken(this.#amateras.client.token!);

        try {
            await rest.put(
                Routes.applicationCommands(this.#amateras.id),
                { body: this.#commandsList },
            );
        } catch(err) {
            console.error(err);
        }
    }
}