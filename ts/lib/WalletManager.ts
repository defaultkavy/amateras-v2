import Amateras from "./Amateras"
import { Player } from "./Player"
import { cmd } from "./terminal"
import Wallet from "./Wallet"

export default class WalletManager {
    #amateras
    #collection
    cache: Map<string, Wallet>
    constructor(amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db?.collection('wallets')
        this.cache = new Map()
    }
    async fetch(id: string): Promise<Wallet | undefined> {
        const walletData = await <Promise<WalletData | null>>this.#collection?.findOne({ id: id })
        if (walletData) {
            if (this.cache.get(id)) {
                const wallet = this.cache.get(id)!
                return wallet
            }
            this.cache.set(id, new Wallet(walletData, this.#amateras))
            const wallet = this.cache.get(id)
            await wallet!.init()
            return wallet
        } else {
            return undefined
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