import { Role } from "discord.js";
import Amateras from "./Amateras";
import { Player } from "./Player";
import { V } from "./V";

export class _Role {
    #amateras: Amateras;
    get: Role
    id: string;
    isDefaultRole: boolean;
    constructor(role: Role, amateras: Amateras) {
        this.#amateras = amateras
        this.id = role.id
        this.get = role
        this.isDefaultRole = false
    }

    async init() {
        
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