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
var _VManager_amateras, _VManager_collection;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VManager = void 0;
const Player_1 = require("./Player");
const V_1 = require("./V");
class VManager {
    constructor(amateras) {
        _VManager_amateras.set(this, void 0);
        _VManager_collection.set(this, void 0);
        __classPrivateFieldSet(this, _VManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, _VManager_collection, amateras.db.collection('v'), "f");
        this.cache = new Map();
    }
    fetch(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield __classPrivateFieldGet(this, _VManager_amateras, "f").players.fetch(id);
            const data = yield __classPrivateFieldGet(this, _VManager_collection, "f").findOne({ id: id });
            if (!data) {
                return 404; // V not found in Database
            }
            else if (player === 404) {
                return 101; // Player fetch failed
            }
            else {
                const v = new V_1.V(data, player, __classPrivateFieldGet(this, _VManager_amateras, "f"));
                this.cache.set(id, v);
                yield v.init();
                yield v.save();
                return v;
            }
        });
    }
    /**
     * Create V object with this player
     * @returns 101 - Player fetch failed
     */
    create(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = __classPrivateFieldGet(this, _VManager_amateras, "f").players.cache.get(id);
            if (player instanceof Player_1.Player) {
                const vData = {
                    id: id
                };
                const v = new V_1.V(vData, player, __classPrivateFieldGet(this, _VManager_amateras, "f"));
                this.cache.set(id, v);
                yield v.init();
                yield v.initInfoInLobby();
                yield v.save();
                return v;
            }
            else
                return 101; // Player fetch failed.
        });
    }
}
exports.VManager = VManager;
_VManager_amateras = new WeakMap(), _VManager_collection = new WeakMap();
//# sourceMappingURL=VManager.js.map