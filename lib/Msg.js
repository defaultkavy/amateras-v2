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
var _Msg_amateras, _Msg_collection;
Object.defineProperty(exports, "__esModule", { value: true });
class Msg {
    constructor(msg, amateras) {
        var _a;
        _Msg_amateras.set(this, void 0);
        _Msg_collection.set(this, void 0);
        __classPrivateFieldSet(this, _Msg_amateras, amateras, "f");
        __classPrivateFieldSet(this, _Msg_collection, (_a = amateras.db) === null || _a === void 0 ? void 0 : _a.collection('messages'), "f");
        this.id = msg.id;
        this.actions = msg.actions;
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check collection 'missions' exist
            if (!__classPrivateFieldGet(this, _Msg_collection, "f")) {
                console.error(`Collection "messages" undefined.(Msg.js)`);
                return { status: { success: false, message: 'Save Message failed.' }, msg: this };
            }
            // Find mission from database
            const find = yield __classPrivateFieldGet(this, _Msg_collection, "f").findOne({ id: this.id });
            // Check if mission found
            if (find) {
                yield __classPrivateFieldGet(this, _Msg_collection, "f").replaceOne({ id: this.id }, this);
            }
            else {
                yield __classPrivateFieldGet(this, _Msg_collection, "f").insertOne(this);
            }
            return { status: { success: true, message: 'Message saved.' }, msg: this };
        });
    }
}
exports.default = Msg;
_Msg_amateras = new WeakMap(), _Msg_collection = new WeakMap();
//# sourceMappingURL=Msg.js.map