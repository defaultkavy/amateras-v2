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
var _ItemManager_amateras, _ItemManager_collection;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemManager = void 0;
const Item_1 = require("./Item");
class ItemManager {
    constructor(amateras) {
        _ItemManager_amateras.set(this, void 0);
        _ItemManager_collection.set(this, void 0);
        __classPrivateFieldSet(this, _ItemManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, _ItemManager_collection, amateras.db.collection('items'), "f");
        this.cache = new Map();
    }
    fetch(id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield ((_a = __classPrivateFieldGet(this, _ItemManager_collection, "f")) === null || _a === void 0 ? void 0 : _a.findOne({ id: id }));
            if (!data) {
                console.error(`Item "${id}" fetch failed.`);
                return;
            }
            if (this.cache.has(id)) {
                const item = this.cache.get(id);
                yield item.init();
                return item;
            }
            const item = new Item_1.Item(data, __classPrivateFieldGet(this, _ItemManager_amateras, "f"));
            this.cache.set(id, item);
            yield item.init();
            return item;
        });
    }
    create(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = Object.assign({}, obj);
            data.id = yield Item_1.Item.createId(__classPrivateFieldGet(this, _ItemManager_collection, "f"));
            const item = new Item_1.Item(data, __classPrivateFieldGet(this, _ItemManager_amateras, "f"));
            this.cache.set(data.id, item);
            yield item.init();
            yield item.save();
            return item;
        });
    }
}
exports.ItemManager = ItemManager;
_ItemManager_amateras = new WeakMap(), _ItemManager_collection = new WeakMap();
//# sourceMappingURL=ItemManager.js.map