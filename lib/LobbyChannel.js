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
var _LobbyManager_amateras, _LobbyManager_channels;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobbyManager = void 0;
class LobbyManager {
    constructor(data, amateras) {
        _LobbyManager_amateras.set(this, void 0);
        _LobbyManager_channels.set(this, void 0);
        __classPrivateFieldSet(this, _LobbyManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, _LobbyManager_channels, data.channels, "f");
        this.cache = new Map;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.LobbyManager = LobbyManager;
_LobbyManager_amateras = new WeakMap(), _LobbyManager_channels = new WeakMap();
//# sourceMappingURL=LobbyChannel.js.map