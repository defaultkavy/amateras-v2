import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Item } from "./Item";

export class ItemManager {
    #amateras: Amateras;
    #collection: Collection;
    cache: Map<string, Item>

    constructor(amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('items')
        this.cache = new Map()
    }

    async fetch(id: string) {
        const data = <ItemData>await this.#collection?.findOne({ id: id })
        if (!data) {
            console.error(`Item "${id}" fetch failed.`)
            return
        }
        if (this.cache.has(id)) {
            const item = this.cache.get(id)!
            await item.init()
            return item
        }
        const item = new Item(data, this.#amateras)
        this.cache.set(id, item)
        await item.init()
        return item 
    }

    async create(obj: ItemObj) {
        const data = <ItemData>{...obj}
        data.id = await Item.createId(this.#collection)
        const item = new Item(data, this.#amateras)
        this.cache.set(data.id, item)
        await item.init()
        await item.save()
        return item
    }
}