"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _VImage_amateras, _VImage_collection;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VImage = void 0;
class VImage {
    constructor(data, amateras) {
        _VImage_amateras.set(this, void 0);
        _VImage_collection.set(this, void 0);
        __classPrivateFieldSet(this, _VImage_amateras, amateras, "f");
        __classPrivateFieldSet(this, _VImage_collection, amateras.db.collection('v_images'), "f");
        this.name = data.name;
        this.url = data.url;
    }
}
exports.VImage = VImage;
_VImage_amateras = new WeakMap(), _VImage_collection = new WeakMap();
//# sourceMappingURL=VTuberImage.js.map