"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _LobbyChannel_amateras, _LobbyChannel_message;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobbyChannel = void 0;
class LobbyChannel {
    constructor(data, amateras) {
        _LobbyChannel_amateras.set(this, void 0);
        _LobbyChannel_message.set(this, void 0);
        __classPrivateFieldSet(this, _LobbyChannel_amateras, amateras, "f");
        this.id = data.id;
        this.channel = {};
        __classPrivateFieldSet(this, _LobbyChannel_message, data.messages, "f");
        this.message = {};
    }
}
exports.LobbyChannel = LobbyChannel;
_LobbyChannel_amateras = new WeakMap(), _LobbyChannel_message = new WeakMap();
//# sourceMappingURL=LobbyChannel.js.map