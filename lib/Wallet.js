"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Wallet_amateras, _Wallet_collection, _Wallet_owner;
Object.defineProperty(exports, "__esModule", { value: true });
const terminal_1 = require("./terminal");
class Wallet {
    constructor(wallet, amateras) {
        _Wallet_amateras.set(this, void 0);
        _Wallet_collection.set(this, void 0);
        _Wallet_owner.set(this, void 0);
        __classPrivateFieldSet(this, _Wallet_amateras, amateras, "f");
        __classPrivateFieldSet(this, _Wallet_collection, amateras.db.collection('wallets'), "f");
        this.id = wallet.id;
        __classPrivateFieldSet(this, _Wallet_owner, wallet.owner, "f");
        this.owner = {};
        this.balance = wallet.balance;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.owner = yield __classPrivateFieldGet(this, _Wallet_amateras, "f").players.fetch(__classPrivateFieldGet(this, _Wallet_owner, "f"));
        });
    }
    /**
     * Transfer coin to others.
     * @param receiver Receiver wallet ID.
     * @param amount Transfer amount.
     */
    transfer(receiver, amount, note, devote) {
        return __awaiter(this, void 0, void 0, function* () {
            const receiverWallet = yield __classPrivateFieldGet(this, _Wallet_amateras, "f").wallets.fetch(receiver);
            if (!receiverWallet) {
                console.error('Wallet not exist');
                return { status: { success: false, message: `Wallet: "${receiver}" not exist` }, transaction: null };
            }
            this.balance -= amount;
            yield this.save();
            receiverWallet.balance += amount;
            yield receiverWallet.save();
            const transaction = yield __classPrivateFieldGet(this, _Wallet_amateras, "f").transactions.create({ sender: this.id, receiver: receiver, amount: amount, note: note, devote: devote });
            yield transaction.save();
            console.log(`${this.id} transfer ${amount}G to ${receiver}`);
            return { status: { success: true, message: `Transfer success.` }, transaction: transaction };
        });
    }
    static createId(amateras) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!amateras.db) {
                console.error(`Database undefined.`);
                return undefined;
            }
            let foundnew = false;
            let newId = '';
            const collection = amateras.db.collection('wallets');
            while (!foundnew) {
                newId = '0x' + (0, terminal_1.idGenerator)(20);
                const result = yield collection.findOne({ id: newId });
                result ? foundnew = false : foundnew = true;
            }
            return newId;
        });
    }
    /**
     * Save this wallet to database.
     */
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!__classPrivateFieldGet(this, _Wallet_collection, "f")) {
                return { status: { success: false, message: `Collection "wallets" not defined.` }, wallet: null };
            }
            const data = (0, terminal_1.cloneObj)(this);
            data.owner = __classPrivateFieldGet(this, _Wallet_owner, "f");
            const walletData = yield __classPrivateFieldGet(this, _Wallet_collection, "f").findOne({ id: this.id });
            if (!walletData) {
                yield __classPrivateFieldGet(this, _Wallet_collection, "f").insertOne(data);
            }
            else {
                yield __classPrivateFieldGet(this, _Wallet_collection, "f").replaceOne({ id: this.id }, data);
            }
            return { status: { success: true, message: 'Success' }, wallet: this };
        });
    }
}
exports.default = Wallet;
_Wallet_amateras = new WeakMap(), _Wallet_collection = new WeakMap(), _Wallet_owner = new WeakMap();
//# sourceMappingURL=Wallet.js.map