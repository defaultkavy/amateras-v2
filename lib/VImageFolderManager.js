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
var _VImageFolderManager_amateras, _VImageFolderManager_collection, _VImageFolderManager_folders, _VImageFolderManager_default;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VImageFolderManager = void 0;
const terminal_1 = require("./terminal");
const VImageFolder_1 = require("./VImageFolder");
class VImageFolderManager {
    constructor(data, owner, amateras) {
        _VImageFolderManager_amateras.set(this, void 0);
        _VImageFolderManager_collection.set(this, void 0);
        _VImageFolderManager_folders.set(this, void 0);
        _VImageFolderManager_default.set(this, void 0);
        __classPrivateFieldSet(this, _VImageFolderManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, _VImageFolderManager_collection, amateras.db.collection('v'), "f");
        __classPrivateFieldSet(this, _VImageFolderManager_folders, data.folders, "f");
        this.folders = new Map;
        this.owner = owner;
        __classPrivateFieldSet(this, _VImageFolderManager_default, data.default, "f");
        this.default;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const folderData in __classPrivateFieldGet(this, _VImageFolderManager_folders, "f")) {
                const folder = new VImageFolder_1.VImageFolder(__classPrivateFieldGet(this, _VImageFolderManager_folders, "f")[folderData], this, __classPrivateFieldGet(this, _VImageFolderManager_amateras, "f"));
                this.folders.set(folderData, folder);
                yield folder.init();
            }
            if (!__classPrivateFieldGet(this, _VImageFolderManager_default, "f")) {
                const folder = this.folders.entries().next();
                if (folder.value)
                    this.default = folder.value[1];
            }
            else {
                this.default = this.folders.get(__classPrivateFieldGet(this, _VImageFolderManager_default, "f"));
            }
        });
    }
    fetch(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let folder = this.folders.get(id);
            if (folder) {
                return folder;
            }
            else {
                const folderData = {
                    id: id,
                    name: undefined,
                    images: []
                };
                const folder = yield this.create(folderData);
                this.folders.set(id, folder);
                yield folder.init();
                return folder;
            }
        });
    }
    create(folderObj) {
        return __awaiter(this, void 0, void 0, function* () {
            const folderData = (0, terminal_1.cloneObj)(folderObj);
            folderData.images = [];
            const folder = new VImageFolder_1.VImageFolder(folderData, this, __classPrivateFieldGet(this, _VImageFolderManager_amateras, "f"));
            this.folders.set(folderData.id, folder);
            yield folder.init();
            yield this.save();
            if (!this.default) {
                this.default = folder;
                __classPrivateFieldSet(this, _VImageFolderManager_default, folder.id, "f");
            }
            return folder;
        });
    }
    setDefault(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const folder = this.folders.get(id);
            if (!folder)
                return;
            __classPrivateFieldSet(this, _VImageFolderManager_default, id, "f");
            this.default = folder;
            yield this.save();
            for (const lobby of this.owner.joinedLobbies.values()) {
                const _message = lobby.messages.get(this.owner.id);
                if (_message) {
                    if (lobby.vFolder.has(this.owner.id))
                        continue;
                    // _message.updateVInfo()
                }
            }
            return folder;
        });
    }
    toData() {
        const folders = new Map;
        for (const folder of this.folders) {
            folders.set(folder[0], folder[1].toData());
        }
        return {
            default: __classPrivateFieldGet(this, _VImageFolderManager_default, "f"),
            folders: folders
        };
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            yield __classPrivateFieldGet(this, _VImageFolderManager_collection, "f").updateOne({ id: this.owner.id }, { $set: { imageFolders: this.toData() } });
        });
    }
}
exports.VImageFolderManager = VImageFolderManager;
_VImageFolderManager_amateras = new WeakMap(), _VImageFolderManager_collection = new WeakMap(), _VImageFolderManager_folders = new WeakMap(), _VImageFolderManager_default = new WeakMap();
//# sourceMappingURL=VImageFolderManager.js.map