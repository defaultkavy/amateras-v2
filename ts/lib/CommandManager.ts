import Amateras from "./Amateras";
const { global_commands } = require('../command_list.json')

export class CommandManager {
    #amateras: Amateras;
    #commands: [];
    constructor(amateras: Amateras) {
        this.#amateras = amateras
        this.#commands = global_commands
    }

    async init() {
        if (!this.#commands) return console.log('| Global Command Disabled')
    }
}