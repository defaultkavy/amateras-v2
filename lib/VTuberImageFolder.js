"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _VImageFolder_amateras, _VImageFolder_collection;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VImageFolder = void 0;
class VImageFolder {
    constructor(data, amateras) {
        _VImageFolder_amateras.set(this, void 0);
        _VImageFolder_collection.set(this, void 0);
        __classPrivateFieldSet(this, _VImageFolder_amateras, amateras, "f");
        __classPrivateFieldSet(this, _VImageFolder_collection, amateras.db.collection('vtuber_images'), "f");
        this.images = new Map;
    }
}
exports.VImageFolder = VImageFolder;
_VImageFolder_amateras = new WeakMap(), _VImageFolder_collection = new WeakMap();
//# sourceMappingURL=VTuberImageFolder.js.map