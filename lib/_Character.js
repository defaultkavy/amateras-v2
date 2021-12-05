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
var __Character_amateras, __Character_collection;
Object.defineProperty(exports, "__esModule", { value: true });
exports._Character = void 0;
const terminal_1 = require("./terminal");
class _Character {
    constructor(character, amateras) {
        __Character_amateras.set(this, void 0);
        __Character_collection.set(this, void 0);
        __classPrivateFieldSet(this, __Character_amateras, amateras, "f");
        __classPrivateFieldSet(this, __Character_collection, amateras.db.collection('characters'), "f");
        this.id = character.id;
        this.name = character.name;
        this.description = character.description;
        this.gender = character.gender;
        this.url = character.url;
        this.avatar = character.avatar;
        this.age = character.age;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
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
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (0, terminal_1.cloneObj)(this);
            // Check collection exist
            if (!__classPrivateFieldGet(this, __Character_collection, "f")) {
                console.error(`Collection is ${__classPrivateFieldGet(this, __Character_collection, "f")}`);
                return { status: { success: false, message: 'Save failed.' }, mission: this };
            }
            // Find from database
            const find = yield __classPrivateFieldGet(this, __Character_collection, "f").findOne({ id: this.id });
            // Check if found
            if (find) {
                yield __classPrivateFieldGet(this, __Character_collection, "f").replaceOne({ id: this.id }, data);
            }
            else {
                yield __classPrivateFieldGet(this, __Character_collection, "f").insertOne(data);
            }
            return { status: { success: true, message: 'saved.' }, mission: this };
        });
    }
    static checkPublish(obj) {
        if (!(0, terminal_1.validURL)(obj.url)) {
            return { pass: false, note: '无效的URL链接，请输入导向角色介绍网页的链接。' };
        }
        else if (obj.avatar && !(0, terminal_1.checkImage)(obj.avatar)) {
            return { pass: false, note: '无效的图片链接，请输入角色图片的链接。（你可以在 Discord 上传图片后，右键复制图片链接）' };
        }
        return { pass: true, note: '' };
    }
    sendItem(interact) {
        return __awaiter(this, void 0, void 0, function* () {
            const embed = {
                title: this.name,
                author: {
                    name: '角色',
                },
                description: this.description,
                thumbnail: {
                    url: this.avatar
                },
                footer: {
                    text: this.id
                },
                fields: [
                    {
                        name: '性别',
                        value: this.gender === 'Female' ? `女` : `男`
                    },
                    {
                        name: '年龄',
                        value: `${this.age} 岁`
                    },
                    {
                        name: '相关链接',
                        value: `[角色资讯](${this.url})`
                    }
                ]
            };
            yield interact.reply({ embeds: [embed] });
        });
    }
}
exports._Character = _Character;
__Character_amateras = new WeakMap(), __Character_collection = new WeakMap();
//# sourceMappingURL=_Character.js.map