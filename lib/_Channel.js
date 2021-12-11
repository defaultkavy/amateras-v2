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
var __Channel_amateras;
Object.defineProperty(exports, "__esModule", { value: true });
exports._Channel = void 0;
class _Channel {
    constructor(channel, amateras) {
        __Channel_amateras.set(this, void 0);
        __classPrivateFieldSet(this, __Channel_amateras, amateras, "f");
        this.id = channel.id;
        this.get = channel;
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
    mention() {
        if (!this.get)
            return this.id;
        let result = this.get;
        return result;
    }
}
exports._Channel = _Channel;
__Channel_amateras = new WeakMap();
//# sourceMappingURL=_Channel.js.map