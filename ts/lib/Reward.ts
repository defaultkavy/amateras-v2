import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Player } from "./Player";
import { cloneObj, idGenerator } from "./terminal";

export class Reward {
    #amateras: Amateras;
    #collection: Collection;
    #owner: string;
    owner: Player;
    id: string;
    name: string;
    title: string;
    description: string;
    pay: number;
    count: number;
    reach: number;
    times: number;
    constructor(data: RewardData, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('rewards')
        this.#owner = data.owner
        this.owner = <Player>{}
        this.id = data.id
        this.name = data.name
        this.title = data.title
        this.description = data.description
        this.pay = data.pay
        this.count = data.count
        this.reach = data.reach
        this.times = data.times
    }

    async init() {
        this.owner = await this.#amateras.players.fetch(this.#owner)
    }
    
    static async createId(collection: Collection) {
        let found = false
        let newId = ''
        while (!found) {
            newId = '0x' + idGenerator(20)
            const result = await collection.findOne({ id: newId })
            result? found = false : found = true
        }
        return newId
    }

    async add() {
        this.count += 1
        if (this.count >= this.reach) {
            this.count = 0
            this.times += 1
            await this.#amateras.me.wallets[0].transfer(this.owner.wallets[0].id, this.pay, `Reward complete: ${ this.name }`, true)
        }
        await this.save()
    }

    async save() {
        const data = cloneObj(this)
        data.owner = this.#owner
        const find = await this.#collection.findOne({id: this.id})
        if (!find) {
            await this.#collection.insertOne(data)
        } else {
            await this.#collection.replaceOne({ id: this.id }, data)
        }
    }
}