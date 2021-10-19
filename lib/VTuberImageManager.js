"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _VTuberImageFolderManager_amateras, _VTuberImageFolderManager_collection, _VTuberImageFolderManager_folders;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VTuberImageFolderManager = void 0;
class VTuberImageFolderManager {
    constructor(data, amateras) {
        _VTuberImageFolderManager_amateras.set(this, void 0);
        _VTuberImageFolderManager_collection.set(this, void 0);
        _VTuberImageFolderManager_folders.set(this, void 0);
        __classPrivateFieldSet(this, _VTuberImageFolderManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, _VTuberImageFolderManager_collection, amateras.db.collection('vtuber_images'), "f");
        __classPrivateFieldSet(this, _VTuberImageFolderManager_folders, data.imageFolders, "f");
        this.folders = new Map;
    }
}
exports.VTuberImageFolderManager = VTuberImageFolderManager;
_VTuberImageFolderManager_amateras = new WeakMap(), _VTuberImageFolderManager_collection = new WeakMap(), _VTuberImageFolderManager_folders = new WeakMap();
//# sourceMappingURL=VTuberImageManager.js.map