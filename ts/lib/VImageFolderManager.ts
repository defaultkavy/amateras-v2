import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Player } from "./Player";
import { cloneObj } from "./terminal";
import { VImageFolder } from "./VImageFolder";

export class VImageFolderManager {
    #amateras: Amateras;
    #collection: Collection;
    #folders: {[keys: string]: VImageFolderData}
    folders: Map<string, VImageFolder>
    owner: Player;
    #default?: string;
    default?: VImageFolder;
    constructor(data: VImageFolderManagerData, owner: Player, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('v')
        this.#folders = data.folders
        this.folders = new Map
        this.owner = owner
        this.#default = data.default
        this.default
    }

    async init() {
        for (const folderData in this.#folders) {
            const folder = new VImageFolder(this.#folders[folderData], this, this.#amateras)
            this.folders.set(folderData, folder)
            await folder.init()
        }
        if (!this.#default) {
            const folder = this.folders.entries().next()
            if (folder.value) this.default = folder.value[1]
        } else {
            this.default = this.folders.get(this.#default)
        }
    }

    async fetch(id: string) {
        let folder = this.folders.get(id)
        if (folder) {
            return folder
        } else {
            const folderData = {
                id: id,
                name: undefined,
                images: []
            }
            const folder = await this.create(folderData)
            this.folders.set(id, folder)
            await folder.init()
            return folder
        }
    }

    async create(folderObj: VImageFolderObj) {
        const folderData: VImageFolderData = cloneObj(folderObj)
        folderData.images = []
        const folder = new VImageFolder(folderData, this, this.#amateras)
        this.folders.set(folderData.id, folder)
        await folder.init()
        await this.save()
        if (!this.default) {
            this.default = folder
            this.#default = folder.id
        }
        return folder
    }

    async setDefault(id: string) {
        const folder = this.folders.get(id)
        if (!folder) return
        this.#default = id
        this.default = folder
        await this.save()
        for (const lobby of this.owner.joinedLobbies.values()) {
            const _message = lobby.messages.get(this.owner.id)
            if (_message) {
                if (lobby.vFolder.has(this.owner.id)) continue
                // _message.updateVInfo()
            }
        }
        return folder
    }

    toData() {
        const folders = new Map
        for (const folder of this.folders) {
            folders.set(folder[0], folder[1].toData())
        }
        return {
            default: this.#default,
            folders: folders
        }
    }
    
    async save() {
        await this.#collection.updateOne({id: this.owner.id}, {$set: { imageFolders: this.toData() }})
    }
}