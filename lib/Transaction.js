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
var _Transaction_amateras, _Transaction_collection, _Transaction_sender, _Transaction_receiver;
Object.defineProperty(exports, "__esModule", { value: true });
const terminal_1 = require("./terminal");
class Transaction {
    /**
     * Create new transaction object.
     * @param sender Sender's wallet ID.
     * @param receiver Receiver's wallet ID.
     * @param amount Transfer amount.
     * @param amateras Amateras.
     */
    constructor(data, amateras) {
        _Transaction_amateras.set(this, void 0);
        _Transaction_collection.set(this, void 0);
        _Transaction_sender.set(this, void 0);
        _Transaction_receiver.set(this, void 0);
        __classPrivateFieldSet(this, _Transaction_amateras, amateras, "f");
        __classPrivateFieldSet(this, _Transaction_collection, amateras.db.collection('transactions'), "f");
        this.id = data.id;
        __classPrivateFieldSet(this, _Transaction_sender, data.sender, "f");
        this.sender = {};
        __classPrivateFieldSet(this, _Transaction_receiver, data.receiver, "f");
        this.receiver = {};
        this.amount = data.amount;
        this.date = data.date;
        this.note = data.note;
        this.devote = data.devote;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.sender = (yield __classPrivateFieldGet(this, _Transaction_amateras, "f").wallets.fetch(__classPrivateFieldGet(this, _Transaction_sender, "f")));
            this.receiver = (yield __classPrivateFieldGet(this, _Transaction_amateras, "f").wallets.fetch(__classPrivateFieldGet(this, _Transaction_receiver, "f")));
        });
    }
    static createId(collection) {
        return __awaiter(this, void 0, void 0, function* () {
            let found = false;
            let newId = '';
            while (!found) {
                newId = '0x' + (0, terminal_1.idGenerator)(20);
                const result = yield collection.findOne({ id: newId });
                result ? found = false : found = true;
            }
            return newId;
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (0, terminal_1.cloneObj)(this);
            data.sender = __classPrivateFieldGet(this, _Transaction_sender, "f");
            data.receiver = __classPrivateFieldGet(this, _Transaction_receiver, "f");
            const find = yield __classPrivateFieldGet(this, _Transaction_collection, "f").findOne({ id: this.id });
            if (!find) {
                yield __classPrivateFieldGet(this, _Transaction_collection, "f").insertOne(data);
            }
            else {
                yield __classPrivateFieldGet(this, _Transaction_collection, "f").replaceOne({ id: this.id }, data);
            }
        });
    }
}
exports.default = Transaction;
_Transaction_amateras = new WeakMap(), _Transaction_collection = new WeakMap(), _Transaction_sender = new WeakMap(), _Transaction_receiver = new WeakMap();
//# sourceMappingURL=Transaction.js.map