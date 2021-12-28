import { ApplicationCommand, ApplicationCommandPermissionData, ApplicationCommandPermissions } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { arrayEqual, arrayHasObj, cloneObj, idGenerator, removeArrayItem } from "./terminal";
import { _Guild } from "./_Guild";

export class GuildCommand {
    #amateras: Amateras;
    #collection: Collection;
    #_guild: _Guild;
    #data: GuildCommandData | null;
    id: string;
    name: string;
    permissions: ApplicationCommandPermissionData[];
    get: ApplicationCommand<{}>;
    constructor(data: GuildCommandData | null, appCommand: ApplicationCommand, _guild: _Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('commands')
        this.#_guild = _guild
        this.#data = data
        this.id = data ? data.id : ''
        this.get = appCommand
        this.name = appCommand.name
        this.permissions = data ? data.permissions : []
    }

    async init() {
        if (!this.#data) {
            this.id = this.get.id
        }
        // Set owner permissions
        if (this.get.defaultPermission === false) {
            const ownerPermission: ApplicationCommandPermissionData = {
                id: this.#_guild.get.ownerId,
                type: 'USER',
                permission: true
            }
            if (!arrayHasObj(this.permissions, ownerPermission)) {
                this.permissions.push(ownerPermission)
            }
        }
        let deployedPermissions = await this.permissionFetch()
        // If permissions is different in Database and Discord server
        if (!arrayEqual(deployedPermissions, this.permissions)) {
            await this.permissionSet(this.permissions)
            await this.save()
        } else {
            if (!this.#data) {
                await this.save()
            }
        }

    }

    async permissionSet(permissions: ApplicationCommandPermissionData[]) {
        await this.get.permissions.set({
            permissions: permissions
        })
    }

    async save() {
        const data = cloneObj(this, ['get'])
        const guild = await this.#collection.findOne({ id: this.id })
        if (guild) {
            await this.#collection.replaceOne({ id: this.id }, data)
        } else {
            await this.#collection.insertOne(data)
        }
    }

    async permissionFetch() {
        let permission: ApplicationCommandPermissions[] = []
        // If fetched permission is empty array, will cause error
        try { permission = await this.get.permissions.fetch({}) } catch {}
        return permission
    }

    /**
     * @returns 100 - Success
     * @returns 101 - Failed
     * @returns 105 - Already exist
     */
    async permissionEnable(id: string, type: 'USER' | 'ROLE') {
        if (arrayHasObj(this.permissions, {id: id, type: type, permission: true})) {
            return 105 // Already exist
        } 
        removeArrayItem(this.permissions, {id: id, type: type, permission: false})
        
        this.permissions.push({
            id: id,
            type: type,
            permission: true
        })
        
        try {
            await this.get.permissions.set({
                permissions: this.permissions
            })
            await this.save()
            return 100 // Success
        } catch(err) {
            return 101 // Failed
        }
    }
    
    /**
     * @returns 100 - Success
     * @returns 101 - Failed
     * @returns 105 - Already exist
     */
    async permissionDisable(id: string, type: 'USER' | 'ROLE') {
        if (arrayHasObj(this.permissions, {id: id, type: type, permission: false})) {
            return 105 // Already exist
        }
        removeArrayItem(this.permissions, {id: id, type: type, permission: true})
        
        this.permissions.push({
            id: id,
            type: type,
            permission: false
        })
            
        try {
            await this.get.permissions.set({
                permissions: this.permissions
            })
            await this.save()
            return 100 // Success
        } catch(err) {
            return 101 // Failed
        }
    }

    hasPermission(id: string) {
        for (const permission of this.permissions) {
            if (permission.id === id) {
                if (permission.permission) {
                    return true
                } else {
                    return false
                }
            }
        }
        if (this.get.defaultPermission) return true
        else return false
    }
}