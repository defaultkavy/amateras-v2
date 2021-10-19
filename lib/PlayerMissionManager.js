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
var _PlayerMissionManager_amateras, _PlayerMissionManager_collection, _PlayerMissionManager_missions;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerMissionManager = void 0;
const terminal_1 = require("./terminal");
class PlayerMissionManager {
    constructor(missions, player, amateras) {
        var _a;
        _PlayerMissionManager_amateras.set(this, void 0);
        _PlayerMissionManager_collection.set(this, void 0);
        _PlayerMissionManager_missions.set(this, void 0);
        __classPrivateFieldSet(this, _PlayerMissionManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, _PlayerMissionManager_collection, (_a = __classPrivateFieldGet(this, _PlayerMissionManager_amateras, "f").db) === null || _a === void 0 ? void 0 : _a.collection('missions'), "f");
        __classPrivateFieldSet(this, _PlayerMissionManager_missions, missions, "f");
        this.player = player;
        this.cache = new Map;
    }
    /**
     * Fetch mission data from database.
     * @param missionId The target mission ID.
     */
    fetch() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            for (const missionId of __classPrivateFieldGet(this, _PlayerMissionManager_missions, "f")) {
                if (this.cache.get(missionId)) {
                    const mission = this.cache.get(missionId);
                    yield mission.init();
                }
                else {
                    const mission = yield ((_a = __classPrivateFieldGet(this, _PlayerMissionManager_amateras, "f").missions) === null || _a === void 0 ? void 0 : _a.fetch(missionId));
                    if (!mission) {
                        console.error(`Mission "${missionId}" fetch failed.`);
                        return;
                    }
                    this.cache.set(missionId, mission);
                }
            }
            return this.cache;
        });
    }
    add(mission) {
        return __awaiter(this, void 0, void 0, function* () {
            __classPrivateFieldGet(this, _PlayerMissionManager_missions, "f").push(mission.id);
            this.cache.set(mission.id, mission);
            yield this.player.save();
        });
    }
    remove(mission) {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _PlayerMissionManager_missions, "f").includes(mission.id)) {
                __classPrivateFieldSet(this, _PlayerMissionManager_missions, (0, terminal_1.removeArrayItem)(__classPrivateFieldGet(this, _PlayerMissionManager_missions, "f"), mission.id), "f");
            }
            if (this.cache.has(mission.id)) {
                this.cache.delete(mission.id);
            }
            yield this.player.save();
        });
    }
    complete(mission) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.player === mission.owner) {
                this.player.missions.requested.achieve.add(mission);
                this.remove(mission);
                yield this.player.save();
            }
            else if (mission.agents.includes(this.player)) {
                this.player.missions.accepted.achieve.add(mission);
                this.remove(mission);
                yield this.player.save();
            }
            else {
                // Error
                console.error(`Something wrong.[\n${this.player}\n${mission}\n] (PlayerMissionManager.js)`);
            }
        });
    }
}
exports.PlayerMissionManager = PlayerMissionManager;
_PlayerMissionManager_amateras = new WeakMap(), _PlayerMissionManager_collection = new WeakMap(), _PlayerMissionManager_missions = new WeakMap();
//# sourceMappingURL=PlayerMissionManager.js.map