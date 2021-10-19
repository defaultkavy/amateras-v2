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
var _VImage_amateras, _VImage_collection;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VImage = void 0;
const terminal_1 = require("./terminal");
class VImage {
    constructor(data, amateras) {
        _VImage_amateras.set(this, void 0);
        _VImage_collection.set(this, void 0);
        __classPrivateFieldSet(this, _VImage_amateras, amateras, "f");
        __classPrivateFieldSet(this, _VImage_collection, amateras.db.collection('v_images'), "f");
        this.id = data.id;
        this.url = data.url;
    }
    static createId(collection) {
        return __awaiter(this, void 0, void 0, function* () {
            let found = false;
            let newId = '';
            while (!found) {
                newId = '0x' + (0, terminal_1.idGenerator)(20);
                const result = yield collection.findOne({ id: newId });
                result ? found = false : found = true;
            }
            return newId;
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const find = yield __classPrivateFieldGet(this, _VImage_collection, "f").findOne({ id: this.id });
            if (find) {
                yield __classPrivateFieldGet(this, _VImage_collection, "f").replaceOne({ id: this.id }, this);
            }
            else {
                yield __classPrivateFieldGet(this, _VImage_collection, "f").insertOne(this);
            }
        });
    }
}
exports.VImage = VImage;
_VImage_amateras = new WeakMap(), _VImage_collection = new WeakMap();
//# sourceMappingURL=VImage.js.map