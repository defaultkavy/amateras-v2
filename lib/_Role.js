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
var __Role_amateras;
Object.defineProperty(exports, "__esModule", { value: true });
exports._Role = void 0;
const Player_1 = require("./Player");
const V_1 = require("./V");
class _Role {
    constructor(role, amateras) {
        __Role_amateras.set(this, void 0);
        __classPrivateFieldSet(this, __Role_amateras, amateras, "f");
        this.id = role.id;
        this.get = role;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    /**
     *
     * @returns 100 - Success
     * @returns 101 - Already set
     * @returns 102 - Player fetch failed
     */
    setVTuber() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = {};
            yield this.get.guild.members.fetch();
            for (const member of this.get.members.values()) {
                const player = yield __classPrivateFieldGet(this, __Role_amateras, "f").players.fetch(member.id);
                if (player instanceof Player_1.Player) {
                    const set = yield player.setVTuber();
                    if (set instanceof V_1.V) {
                        result[member.id] = 100;
                    }
                    else {
                        result[member.id] = set;
                    }
                }
            }
            return result;
        });
    }
    /**
     *
     * @returns 100 - Success
     * @returns 101 - Already set
     */
    unsetVTuber() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = {};
            yield this.get.guild.members.fetch();
            for (const member of this.get.members.values()) {
                const player = yield __classPrivateFieldGet(this, __Role_amateras, "f").players.fetch(member.id);
                if (player instanceof Player_1.Player) {
                    const set = yield player.unsetVTuber();
                    result[member.id] = set;
                }
            }
            return result;
        });
    }
    mention() {
        if (!this.get)
            return this.id;
        let result = this.get;
        if (!result) {
            result = this.get.name;
        }
        return result;
    }
}
exports._Role = _Role;
__Role_amateras = new WeakMap();
//# sourceMappingURL=_Role.js.map