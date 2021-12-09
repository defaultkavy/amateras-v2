import { ApplicationCommand, ApplicationCommandPermissionData, ApplicationCommandPermissions } from "discord.js"
import { Collection } from "mongodb"
import Amateras from "./Amateras"
import { arrayEqual, arrayHasObj, cloneObj } from "./terminal"

export class Command {
    #amateras: Amateras
    #collection: Collection
    #data: GuildCommandData | null
    id: string
    get: ApplicationCommand<{}>
    name: string
    permissions: ApplicationCommandPermissionData[]
    constructor(data: GuildCommandData | null, appCommand: ApplicationCommand, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('commands')
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
        const admin = this.#amateras.system.admin
        if (!admin) throw new Error('Amateras Fatal Error: System Admin User fetch failed')
        // Set owner permissions
        if (this.get.defaultPermission === false) {
            const ownerPermission: ApplicationCommandPermissionData = {
                id: admin.id,
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
        await this.#amateras.client.application!.commands.permissions.set({
            guild: '744127668064092160',
            command: this.id,
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
}