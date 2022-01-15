import Amateras from "./Amateras";

export class Log {
    #amateras: Amateras;
    constructor(amateras: Amateras) {
        this.#amateras = amateras
    }

    async send(...optional: ({[key: string]: string} | string)[]) {
        for (const guild of this.#amateras.guilds.cache.values()) {
            let result = ''
            for (const content of optional) {
                if (typeof content === 'string') result += content
                else result += content[guild.lang]
            }
            guild.log.send(result)
        }
    }
    
    async sysSend(...optional: ({[key: string]: string} | string)[]) {
        for (const guild of this.#amateras.guilds.cache.values()) {
            let result = ''
            for (const content of optional) {
                if (typeof content === 'string') result += content
                else result += content[guild.lang]
            }
            guild.log.send(result, 'SYS')
        }
    }

    async name(id: string) {
        const user = await this.#amateras.client.users.fetch(id)
        return `${user.username}(${user.id})`
    }
}