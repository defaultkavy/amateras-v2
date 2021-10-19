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
var _VImageFolder_amateras, _VImageFolder_collection, _VImageFolder_images;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VImageFolder = void 0;
const terminal_1 = require("./terminal");
const VImage_1 = require("./VImage");
class VImageFolder {
    constructor(data, manager, amateras) {
        _VImageFolder_amateras.set(this, void 0);
        _VImageFolder_collection.set(this, void 0);
        _VImageFolder_images.set(this, void 0);
        __classPrivateFieldSet(this, _VImageFolder_amateras, amateras, "f");
        __classPrivateFieldSet(this, _VImageFolder_collection, amateras.db.collection('v_images'), "f");
        __classPrivateFieldSet(this, _VImageFolder_images, data.images, "f");
        this.images = new Map;
        this.id = data.id;
        this.name = data.name;
        this.manager = manager;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const imageId of __classPrivateFieldGet(this, _VImageFolder_images, "f")) {
                const imageData = yield __classPrivateFieldGet(this, _VImageFolder_collection, "f").findOne({ id: imageId });
                if (imageData) {
                    const image = new VImage_1.VImage(imageData, __classPrivateFieldGet(this, _VImageFolder_amateras, "f"));
                    this.images.set(imageId, image);
                }
            }
        });
    }
    add(imageObj) {
        return __awaiter(this, void 0, void 0, function* () {
            const imageData = (0, terminal_1.cloneObj)(imageObj);
            imageData.id = yield VImage_1.VImage.createId(__classPrivateFieldGet(this, _VImageFolder_collection, "f"));
            const image = new VImage_1.VImage(imageData, __classPrivateFieldGet(this, _VImageFolder_amateras, "f"));
            this.images.set(imageData.id, image);
            __classPrivateFieldGet(this, _VImageFolder_images, "f").push(imageData.id);
            yield image.save();
            yield this.manager.save();
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    set(folderObj) {
        return __awaiter(this, void 0, void 0, function* () {
            this.manager.folders.delete(this.id);
            this.name = folderObj.name ? folderObj.name : this.name;
            this.id = folderObj.id === '' ? this.id : folderObj.id;
            this.manager.folders.set(this.id, this);
            yield this.manager.save();
        });
    }
    toData() {
        return {
            id: this.id,
            name: this.name,
            images: __classPrivateFieldGet(this, _VImageFolder_images, "f")
        };
    }
    toArray() {
        return Array.from(this.images.values());
    }
}
exports.VImageFolder = VImageFolder;
_VImageFolder_amateras = new WeakMap(), _VImageFolder_collection = new WeakMap(), _VImageFolder_images = new WeakMap();
//# sourceMappingURL=VImageFolder.js.map