import { Role } from "discord.js";
import Amateras from "./Amateras";
import { Player } from "./Player";
import { V } from "./V";
import { _Guild } from "./_Guild";

export class _Role {
    #amateras: Amateras;
    #_guild: _Guild;
    get: Role
    id: string;
    isDefaultRole: boolean;
    constructor(role: Role, _guild: _Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#_guild = _guild
        this.id = role.id
        this.get = role
        this.isDefaultRole = false
    }

    async init() {
        
    }

    async fetch() {
        const fetch = await this.#_guild.get.roles.fetch(this.id).catch(() => undefined)
        // If role deleted, unset default role automatic
        if (!fetch) {
            this.#_guild.roles.unsetDefaultRole(this.id)
        }
        return fetch
    }

    /**
     * 
     * @returns 100 - Success
     * @returns 101 - Already set
     * @returns 102 - Player fetch failed
     */
    async setVTuber() {
        const result: {[key: string]: 100 | 101 | 102} = {}
        await this.get.guild.members.fetch()
        for (const member of this.get.members.values()) {
            const player = await this.#amateras.players.fetch(member.id)
            if (player instanceof Player) {
                const set = await player.setVTuber()
                if (set instanceof V) {
                    result[member.id] = 100
                } else {
                    result[member.id] = set
                }
            }
        }
        return result
    }
    
    /**
     * 
     * @returns 100 - Success
     * @returns 101 - Already set
     */
    async unsetVTuber() {
        const result: {[key: string]:  100 | 101} = {}
        await this.get.guild.members.fetch()
        for (const member of this.get.members.values()) {
            const player = await this.#amateras.players.fetch(member.id)
            if (player instanceof Player) {
                const set = await player.unsetVTuber()
                result[member.id] = set
            }
        }
        return result
    }
    
    mention() {
        if (!this.get) return this.id
        let result: Role | string = this.get
        if (!result) {
            result = this.get.name
        }
        return result
    }
}