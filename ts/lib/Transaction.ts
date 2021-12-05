import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { cloneObj, idGenerator } from "./terminal";
import Wallet from "./Wallet";

export default class Transaction {
    #amateras: Amateras;
    #collection: Collection;
    id: string;
    #sender: string;
    sender: Wallet;
    #receiver: string;
    receiver: Wallet;
    amount: number;
    date: Date;
    note: string;
    devote: boolean;
    /**
     * Create new transaction object.
     * @param sender Sender's wallet ID.
     * @param receiver Receiver's wallet ID.
     * @param amount Transfer amount.
     * @param amateras Amateras.
     */
    constructor(data: TransactionData, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('transactions')
        this.id = data.id
        this.#sender = data.sender
        this.sender = <Wallet>{}
        this.#receiver = data.receiver
        this.receiver = <Wallet>{}
        this.amount = data.amount
        this.date = data.date
        this.note = data.note
        this.devote = data.devote
    }

    async init() {
        this.sender = <Wallet>await this.#amateras.wallets.fetch(this.#sender)
        this.receiver = <Wallet>await this.#amateras.wallets.fetch(this.#receiver)
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

    async save() {
        const data = cloneObj(this)
        data.sender = this.#sender
        data.receiver = this.#receiver
        const find = await this.#collection.findOne({id: this.id})
        if (!find) {
            await this.#collection.insertOne(data)
        } else {
            await this.#collection.replaceOne({ id: this.id }, data)
        }
    }
}