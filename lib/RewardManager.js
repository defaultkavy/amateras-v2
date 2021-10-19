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
var _RewardManager_amateras, _RewardManager_collection;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardManager = void 0;
const Reward_1 = require("./Reward");
class RewardManager {
    constructor(amateras) {
        _RewardManager_amateras.set(this, void 0);
        _RewardManager_collection.set(this, void 0);
        __classPrivateFieldSet(this, _RewardManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, _RewardManager_collection, amateras.db.collection('rewards'), "f");
        this.cache = new Map;
    }
    fetch(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let reward = this.cache.get(id);
            if (reward) {
                return reward;
            }
            const rewardData = yield __classPrivateFieldGet(this, _RewardManager_collection, "f").findOne({ id: id });
            if (rewardData) {
                reward = new Reward_1.Reward(rewardData, __classPrivateFieldGet(this, _RewardManager_amateras, "f"));
                this.cache.set(id, reward);
                reward.init();
                return reward;
            }
            return;
        });
    }
    create(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = Object.assign({}, obj);
            data.id = yield Reward_1.Reward.createId(__classPrivateFieldGet(this, _RewardManager_collection, "f")),
                data.count = 0;
            data.times = 0;
            const reward = new Reward_1.Reward(data, __classPrivateFieldGet(this, _RewardManager_amateras, "f"));
            this.cache.set(reward.id, reward);
            yield reward.init();
            yield reward.save();
            return reward;
        });
    }
}
exports.RewardManager = RewardManager;
_RewardManager_amateras = new WeakMap(), _RewardManager_collection = new WeakMap();
//# sourceMappingURL=RewardManager.js.map