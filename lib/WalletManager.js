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
var _WalletManager_amateras, _WalletManager_collection;
Object.defineProperty(exports, "__esModule", { value: true });
const Wallet_1 = __importDefault(require("./Wallet"));
class WalletManager {
    constructor(amateras) {
        var _a;
        _WalletManager_amateras.set(this, void 0);
        _WalletManager_collection.set(this, void 0);
        __classPrivateFieldSet(this, _WalletManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, _WalletManager_collection, (_a = amateras.db) === null || _a === void 0 ? void 0 : _a.collection('wallets'), "f");
        this.cache = new Map();
    }
    fetch(id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const walletData = yield ((_a = __classPrivateFieldGet(this, _WalletManager_collection, "f")) === null || _a === void 0 ? void 0 : _a.findOne({ id: id }));
            if (walletData) {
                if (this.cache.get(id)) {
                    const wallet = this.cache.get(id);
                    return wallet;
                }
                this.cache.set(id, new Wallet_1.default(walletData, __classPrivateFieldGet(this, _WalletManager_amateras, "f")));
                const wallet = this.cache.get(id);
                yield wallet.init();
                return wallet;
            }
            else {
                return undefined;
            }
        });
    }
    create(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            const newId = yield Wallet_1.default.createId(__classPrivateFieldGet(this, _WalletManager_amateras, "f"));
            if (!newId) {
                console.error(`newId undefined. (WalletManager.js)`);
                return { status: { success: false, message: `Create Wallet ID failed.` }, wallet: null };
            }
            const wallet = new Wallet_1.default({
                id: newId,
                owner: owner,
                balance: 0
            }, __classPrivateFieldGet(this, _WalletManager_amateras, "f"));
            this.cache.set(wallet.id, wallet);
            wallet.save();
            return { status: { success: true, message: `Create Wallet success.` }, wallet: wallet };
        });
    }
}
exports.default = WalletManager;
_WalletManager_amateras = new WeakMap(), _WalletManager_collection = new WeakMap();
//# sourceMappingURL=WalletManager.js.map