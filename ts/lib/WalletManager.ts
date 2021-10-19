import Amateras from "./Amateras"
import Wallet from "./Wallet"

export default class WalletManager {
    #amateras
    #collection
    cache: Map<string, Wallet>
    constructor(amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('wallets')
        this.cache = new Map()
    }
    async fetch(id: string): Promise<Wallet | undefined> {
        const wallet = this.cache.get(id)
        if (wallet) {
            return wallet
        } else {
            const walletData = <WalletData>await this.#collection.findOne({id: id})
            if (walletData) {
                const wallet = new Wallet(walletData, this.#amateras)
                this.cache.set(wallet.id, wallet)
                await wallet.init()
                return wallet
            }
        }
    }

    async create(owner: string): Promise<{status: PromiseStatus, wallet: Wallet | null}> {
        const newId = await Wallet.createId(this.#amateras)
        if (!newId) {
            console.error(`newId undefined. (WalletManager.js)`)
            return {status: {success: false, message: `Create Wallet ID failed.`}, wallet: null}
        }
        const wallet = new Wallet({
            id: newId,
            owner: owner,
            balance: 0
        }, this.#amateras)

        this.cache.set(wallet.id, wallet)
        wallet.save()
        return {status: {success: true, message: `Create Wallet success.`}, wallet: wallet}
    }
}