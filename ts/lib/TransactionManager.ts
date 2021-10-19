import { Collection } from "mongodb";
import Amateras from "./Amateras";
import Transaction from "./Transaction";

export class TransactionManager {
    #amateras: Amateras;
    #collection: Collection;
    cache: Map<string, Transaction>;

    constructor(amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('transactions')
        this.cache = new Map
    }

    async create(obj: TransactionObj) {
        const data = <TransactionData>{...obj}
        data.date = new Date()
        data.id = await Transaction.createId(this.#collection)
        const transaction = new Transaction(data, this.#amateras)
        this.cache.set(transaction.id, transaction)
        await transaction.init()
        console.debug(transaction.receiver)
        if (transaction.devote) transaction.receiver.owner.expUp(transaction.amount)
        return transaction
    }
}