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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _TransactionManager_amateras, _TransactionManager_collection;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionManager = void 0;
const Transaction_1 = __importDefault(require("./Transaction"));
class TransactionManager {
    constructor(amateras) {
        _TransactionManager_amateras.set(this, void 0);
        _TransactionManager_collection.set(this, void 0);
        __classPrivateFieldSet(this, _TransactionManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, _TransactionManager_collection, amateras.db.collection('transactions'), "f");
        this.cache = new Map;
    }
    create(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = Object.assign({}, obj);
            data.date = new Date();
            data.id = yield Transaction_1.default.createId(__classPrivateFieldGet(this, _TransactionManager_collection, "f"));
            const transaction = new Transaction_1.default(data, __classPrivateFieldGet(this, _TransactionManager_amateras, "f"));
            this.cache.set(transaction.id, transaction);
            yield transaction.init();
            if (transaction.devote)
                transaction.receiver.owner.expUp(transaction.amount);
            return transaction;
        });
    }
}
exports.TransactionManager = TransactionManager;
_TransactionManager_amateras = new WeakMap(), _TransactionManager_collection = new WeakMap();
//# sourceMappingURL=TransactionManager.js.map