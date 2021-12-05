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
var __CharacterManager_amateras, __CharacterManager_collection;
Object.defineProperty(exports, "__esModule", { value: true });
exports._CharacterManager = void 0;
const _Character_1 = require("./_Character");
class _CharacterManager {
    constructor(amateras) {
        __CharacterManager_amateras.set(this, void 0);
        __CharacterManager_collection.set(this, void 0);
        __classPrivateFieldSet(this, __CharacterManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, __CharacterManager_collection, amateras.db.collection('characters'), "f");
        this.cache = new Map();
    }
    fetch(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const character = this.cache.get(id);
            if (character) {
                return character;
            }
            const data = yield __classPrivateFieldGet(this, __CharacterManager_collection, "f").findOne({ id: id });
            if (data) {
                const character = new _Character_1._Character(data, __classPrivateFieldGet(this, __CharacterManager_amateras, "f"));
                this.cache.set(id, character);
                yield character.init();
                return character;
            }
        });
    }
    create(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = Object.assign({}, obj);
            data.id = yield _Character_1._Character.createId(__classPrivateFieldGet(this, __CharacterManager_collection, "f"));
            const character = new _Character_1._Character(data, __classPrivateFieldGet(this, __CharacterManager_amateras, "f"));
            this.cache.set(data.id, character);
            yield character.init();
            yield character.save();
            return character;
        });
    }
}
exports._CharacterManager = _CharacterManager;
__CharacterManager_amateras = new WeakMap(), __CharacterManager_collection = new WeakMap();
//# sourceMappingURL=_CharacterManager.js.map