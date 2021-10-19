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
var _Reward_amateras, _Reward_collection, _Reward_owner;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reward = void 0;
const terminal_1 = require("./terminal");
class Reward {
    constructor(data, amateras) {
        _Reward_amateras.set(this, void 0);
        _Reward_collection.set(this, void 0);
        _Reward_owner.set(this, void 0);
        __classPrivateFieldSet(this, _Reward_amateras, amateras, "f");
        __classPrivateFieldSet(this, _Reward_collection, amateras.db.collection('rewards'), "f");
        __classPrivateFieldSet(this, _Reward_owner, data.owner, "f");
        this.owner = {};
        this.id = data.id;
        this.name = data.name;
        this.title = data.title;
        this.description = data.description;
        this.pay = data.pay;
        this.count = data.count;
        this.reach = data.reach;
        this.times = data.times;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.owner = yield __classPrivateFieldGet(this, _Reward_amateras, "f").players.fetch(__classPrivateFieldGet(this, _Reward_owner, "f"));
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
    add() {
        return __awaiter(this, void 0, void 0, function* () {
            this.count += 1;
            if (this.count >= this.reach) {
                this.count = 0;
                this.times += 1;
                yield __classPrivateFieldGet(this, _Reward_amateras, "f").me.wallets[0].transfer(this.owner.wallets[0].id, this.pay, `Reward complete: ${this.name}`, true);
            }
            yield this.save();
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (0, terminal_1.cloneObj)(this);
            data.owner = __classPrivateFieldGet(this, _Reward_owner, "f");
            const find = yield __classPrivateFieldGet(this, _Reward_collection, "f").findOne({ id: this.id });
            if (!find) {
                yield __classPrivateFieldGet(this, _Reward_collection, "f").insertOne(data);
            }
            else {
                yield __classPrivateFieldGet(this, _Reward_collection, "f").replaceOne({ id: this.id }, data);
            }
        });
    }
}
exports.Reward = Reward;
_Reward_amateras = new WeakMap(), _Reward_collection = new WeakMap(), _Reward_owner = new WeakMap();
//# sourceMappingURL=Reward.js.map