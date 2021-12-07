import Amateras from "./Amateras";

export class Log {
    #amateras: Amateras;
    constructor(amateras: Amateras) {
        this.#amateras = amateras
    }

    async send(content: string) {
        for (const guild of this.#amateras.guilds.cache.values()) {
            guild.log.send(content)
        }
    }

    async name(id: string) {
        const user = await this.#amateras.client.users.fetch(id)
        return `${user.username}(${user.id})`
    }
}