import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Err } from "./Err";
import { cloneObj } from "./terminal";
import { _Guild } from "./_Guild";
import { _Role } from "./_Role";

export class _RoleManager {
    #amateras: Amateras;
    #_guild: _Guild;
    #collection: Collection;
    #data: _RoleManagerData | undefined;
    cache: Map<string, _Role>;
    defaultRoles: Map<string, _Role>;
    constructor(data: _RoleManagerData | undefined, _guild: _Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('roles')
        this.#_guild = _guild
        this.#data = data
        this.cache = new Map
        this.defaultRoles = new Map
    }

    async init() {
        for (const role of this.#_guild.get.roles.cache.values()) {
            const _role = new _Role(role, this.#_guild, this.#amateras)
            this.cache.set(role.id, _role)
            await _role.init()
        }
        if (this.#data && this.#data.defaultRoles instanceof Array) {
            for (const roleId of this.#data.defaultRoles) {
                const _role = this.cache.get(roleId)
                if (_role) {
                    this.defaultRoles.set(roleId, _role)
                    _role.isDefaultRole = true
                }
            }
        }
    }

    /**
     * 
     * @returns 404 - Role not found 
     */
    async fetch(id: string) {
        const get = this.cache.get(id)
        if (get) return get
        try {
            const role = await this.#_guild.get.roles.fetch(id)
            if (!role) {
                new Err(`Role fetch failed. (Role)${ id }`)
                return 404 // Role not found
            }
            const _role = new _Role(role, this.#_guild, this.#amateras)
            this.cache.set(id, _role)
            await _role.init()
            return _role
        } catch(err) {
            new Err(`Role fetch failed. (Role)${ id }`)
            return 404
        }
    }

    /**
     * @returns 100 - Success 
     * @returns 101 - Already set
     * @returns 404 - Role not found
     */
    async setDefaultRole(id: string) {
        const _role = this.cache.get(id)
        if (!_role) {
            return 404
        } else {
            if (_role.isDefaultRole === true) return 101
            _role.isDefaultRole = true
            this.defaultRoles.set(id, _role)
            this.#_guild.save()
            return 100
        }
    }

    /**
     * @returns 100 - Success 
     * @returns 101 - Already unset
     * @returns 404 - Role not found
     */
    async unsetDefaultRole(id: string) {
        const _role = this.cache.get(id)
        if (!_role) {
            return 404
        } else {
            if (_role.isDefaultRole === false) return 101
            _role.isDefaultRole = false
            this.defaultRoles.delete(id)
            this.#_guild.save()
            return 100
        }
    }

    toData() {
        const data = cloneObj(this, ['cache'])
        data.defaultRoles = []
        for (const role of this.defaultRoles.values()) {
            data.defaultRoles.push(role.id)
        }
        return data
    }
}

export interface _RoleManagerData {
    defaultRoles: string[]
}