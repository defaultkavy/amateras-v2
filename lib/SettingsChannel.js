"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _SettingsChannel_amateras;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsChannel = void 0;
const _Channel_1 = require("./_Channel");
class SettingsChannel extends _Channel_1._Channel {
    constructor(data, _guild, guild, amateras) {
        super(data, 'settings', _guild, guild, amateras);
        _SettingsChannel_amateras.set(this, void 0);
        __classPrivateFieldSet(this, _SettingsChannel_amateras, amateras, "f");
    }
}
exports.SettingsChannel = SettingsChannel;
_SettingsChannel_amateras = new WeakMap();
//# sourceMappingURL=SettingsChannel.js.map