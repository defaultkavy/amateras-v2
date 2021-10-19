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
var _Item_amateras, _Item_collection, _Item_creator, _Item_message;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
const terminal_1 = require("./terminal");
class Item {
    constructor(itemData, amateras) {
        _Item_amateras.set(this, void 0);
        _Item_collection.set(this, void 0);
        _Item_creator.set(this, void 0);
        _Item_message.set(this, void 0);
        __classPrivateFieldSet(this, _Item_amateras, amateras, "f");
        __classPrivateFieldSet(this, _Item_collection, amateras.db.collection('items'), "f");
        this.id = itemData.id;
        __classPrivateFieldSet(this, _Item_creator, itemData.creator, "f");
        this.creator = {};
        this.name = itemData.name;
        this.date = new Date();
        this.description = itemData.description;
        this.url = itemData.url;
        this.image = itemData.image;
        __classPrivateFieldSet(this, _Item_message, '', "f");
        this.message = {};
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.creator = yield __classPrivateFieldGet(this, _Item_amateras, "f").players.fetch(__classPrivateFieldGet(this, _Item_creator, "f"));
            if (__classPrivateFieldGet(this, _Item_message, "f")) {
                const _message = yield __classPrivateFieldGet(this, _Item_amateras, "f").messages.fetch(__classPrivateFieldGet(this, _Item_message, "f"));
                if (_message) {
                    this.message = _message.get;
                }
                else {
                    console.error('_message is ' + _message);
                }
            }
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (0, terminal_1.cloneObj)(this);
            data.creator = __classPrivateFieldGet(this, _Item_creator, "f");
            data.message = __classPrivateFieldGet(this, _Item_message, "f");
            // Check collection exist
            if (!__classPrivateFieldGet(this, _Item_collection, "f")) {
                console.error(`Collection is ${__classPrivateFieldGet(this, _Item_collection, "f")}`);
                return { status: { success: false, message: 'Save failed.' }, mission: this };
            }
            // Find from database
            const find = yield __classPrivateFieldGet(this, _Item_collection, "f").findOne({ id: this.id });
            // Check if found
            if (find) {
                yield __classPrivateFieldGet(this, _Item_collection, "f").replaceOne({ id: this.id }, data);
            }
            else {
                yield __classPrivateFieldGet(this, _Item_collection, "f").insertOne(data);
            }
            return { status: { success: true, message: 'saved.' }, mission: this };
        });
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
    static checkPublish(itemObj) {
        if (!(0, terminal_1.validURL)(itemObj.url)) {
            return { pass: false, note: '无效的URL链接，请输入导向你作品网页的链接。' };
        }
        else if (itemObj.image && !(0, terminal_1.checkImage)(itemObj.image)) {
            return { pass: false, note: '无效的图片链接，请输入导向你作品网页的链接。' };
        }
        return { pass: true, note: '' };
    }
    sendItem(interact) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = yield interact.guild.members.fetch(this.creator.id);
            const embed = {
                title: this.name,
                author: {
                    name: member.displayName + '的物品',
                    iconURL: member.displayAvatarURL({ size: 512 })
                },
                description: this.description,
                thumbnail: {
                    url: this.image
                },
                footer: {
                    text: this.id
                },
                fields: [
                    {
                        name: '创作者：' + member.displayName,
                        value: `[物品链接](${this.url})`
                    }
                ]
            };
            yield interact.reply({ embeds: [embed] });
            const message = yield interact.fetchReply();
            this.message = message;
            __classPrivateFieldSet(this, _Item_message, message.id, "f");
            yield __classPrivateFieldGet(this, _Item_amateras, "f").messages.create(message);
        });
    }
}
exports.Item = Item;
_Item_amateras = new WeakMap(), _Item_collection = new WeakMap(), _Item_creator = new WeakMap(), _Item_message = new WeakMap();
//# sourceMappingURL=Item.js.map