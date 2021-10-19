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
var _PlayerManager_amateras;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerManager = void 0;
const Player_1 = require("./Player");
class PlayerManager {
    constructor(amateras) {
        _PlayerManager_amateras.set(this, void 0);
        __classPrivateFieldSet(this, _PlayerManager_amateras, amateras, "f");
        this.cache = new Map();
    }
    /**
     * Get player data from Database
     * @param id Player id.
     */
    fetch(id, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = __classPrivateFieldGet(this, _PlayerManager_amateras, "f").db.collection('player');
            let playerData = yield collection.findOne({ id: id });
            if (!playerData) {
                playerData = { id: id };
            }
            if (this.cache.get(id)) {
                const player = this.cache.get(id);
                if (callback)
                    callback(player);
                return player;
            }
            else {
                const player = new Player_1.Player(playerData, __classPrivateFieldGet(this, _PlayerManager_amateras, "f"));
                this.cache.set(id, player);
                yield player.init();
                if (callback)
                    callback(player);
                return player;
            }
        });
    }
    /**
     * Clear player cache from Player Manager. (Not from database)
     * @param id Player id.
     */
    clear(id) {
        this.cache.delete(id);
    }
}
exports.PlayerManager = PlayerManager;
_PlayerManager_amateras = new WeakMap();
//# sourceMappingURL=PlayerManager.js.map