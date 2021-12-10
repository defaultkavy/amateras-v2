import Amateras from "./Amateras";
import { Err } from "./Err";
import { _Guild } from "./_Guild";
import { _Role } from "./_Role";

export class _RoleManager {
    #amateras: Amateras;
    #_guild: _Guild;
    cache: Map<string, _Role>;
    constructor(_guild: _Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#_guild = _guild
        this.cache = new Map
    }

    async init() {
        for (const role of this.#_guild.get.roles.cache.values()) {
            const _role = new _Role(role, this.#amateras)
            this.cache.set(role.id, _role)
            await _role.init()
        }
    }

    /**
     * 
     * @returns 404 - Role not found 
     */
    async fetch(id: string) {
        try {
            const role = await this.#_guild.get.roles.fetch(id)
            if (!role) {
                new Err(`Role fetch failed. (Role)${ id }`)
                return 404 // Role not found
            }
            const _role = new _Role(role, this.#amateras)
            this.cache.set(id, _role)
            await _role.init()
            return _role
        } catch(err) {
            new Err(`Role fetch failed. (Role)${ id }`)
            return 404
        }
    }
}