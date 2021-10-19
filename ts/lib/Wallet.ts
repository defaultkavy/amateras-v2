import Transaction from "./Transaction";
import Amateras from "./Amateras";
import { cloneObj, cmd, idGenerator } from "./terminal";
import { Player } from "./Player";

export default class Wallet {
    #amateras
    #collection
    id: string;
    #owner: string;
    owner: Player;
    balance: number;
    constructor(wallet: WalletData, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db?.collection('wallets')
        this.id = wallet.id
        this.#owner = wallet.owner
        this.owner = <Player>{};
        this.balance = wallet.balance
    }

    async init() {
        this.owner = await this.#amateras.players!.fetch(this.#owner)
    }

    /**
     * Transfer coin to others.
     * @param receiver Receiver wallet ID.
     * @param amount Transfer amount.
     */
    async transfer(receiver: string, amount: number, note: string, devote: boolean): Promise<{status:PromiseStatus, transaction: Transaction | null}> {
        const receiverWallet = await this.#amateras.wallets!.fetch(receiver)
        if (!receiverWallet) {
            console.error('Wallet not exist')
            return {status: { success: false, message: `Wallet: "${receiver}" not exist`}, transaction: null}
        }
        this.balance -= amount;
        await this.save()
        receiverWallet.balance += amount;
        await receiverWallet.save()
        const transaction = await this.#amateras.transactions.create({sender: this.id, receiver: receiver, amount: amount, note: note, devote: devote})
        cmd.log(`${this.id} transfer ${amount}G to ${receiver}`)
        return {status:{ success: true, message: `Transfer success.`}, transaction: transaction}
    }

    static async createId(amateras: Amateras) {
        if (!amateras.db) {
            console.error(`Database undefined.`)
            return undefined
        }
        let foundnew = false
        let newId = ''
        const collection = amateras.db.collection('wallets')
        while (!foundnew) {
            newId = '0x' + idGenerator(20)
            const result = await collection.findOne({ id: newId })
            result ? foundnew = false : foundnew = true
        }
        return newId
    }

    /**
     * Save this wallet to database.
     */
    async save(): Promise<{status: PromiseStatus, wallet: Wallet | null}> {
        if (!this.#collection) {
            return {status: {success: false, message: `Collection "wallets" not defined.`}, wallet: null}
        }
        const data = cloneObj(this)
        data.owner = this.#owner
        const walletData = await this.#collection.findOne({ id: this.id })
        if (!walletData) {
            await this.#collection.insertOne(data)
        } else {
            await this.#collection.replaceOne({ id: this.id }, data)
        }
        return {status : { success: true, message: 'Success' }, wallet: this}
    }
}