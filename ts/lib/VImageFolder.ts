import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { cloneObj, idGenerator } from "./terminal";
import { VImage } from "./VImage";
import { VImageFolderManager } from "./VImageFolderManager";

export class VImageFolder {
    #amateras: Amateras;
    #collection: Collection;
    #images: string[]
    images: Map<string, VImage>
    id: string;
    name: string | undefined;
    manager: VImageFolderManager;
    constructor(data: VImageFolderData, manager: VImageFolderManager, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('v_images')
        this.#images = data.images
        this.images = new Map
        this.id = data.id
        this.name = data.name
        this.manager = manager
    }

    async init() {
        for (const imageId of this.#images) {
            const imageData = <VImageData>await this.#collection.findOne({id: imageId})
            if (imageData) {
                const image = new VImage(imageData, this.#amateras)
                this.images.set(imageId, image)
            }
        }
    }

    async add(imageObj: VImageObj) {
        const imageData: VImageData = cloneObj(imageObj)
        imageData.id = await VImage.createId(this.#collection)
        const image = new VImage(imageData, this.#amateras)
        this.images.set(imageData.id, image)
        this.#images.push(imageData.id)
        await image.save()
        await this.manager.save()
    }

    async remove(id: string) {

    }

    async set(folderObj: VImageFolderObj) {
        this.manager.folders.delete(this.id)
        this.name = folderObj.name ? folderObj.name : this.name
        this.id = folderObj.id === '' ? this.id : folderObj.id
        this.manager.folders.set(this.id, this)
        await this.manager.save()
        
    }

    toData() {
        return {
            id: this.id,
            name: this.name,
            images: this.#images
        }
    }

    toArray() {
        return Array.from(this.images.values())
    }
}