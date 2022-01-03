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
var _V_amateras, _V_collection, _V_imageFolders;
Object.defineProperty(exports, "__esModule", { value: true });
exports.V = void 0;
const discord_js_1 = require("discord.js");
const terminal_1 = require("./terminal");
const VImageFolderManager_1 = require("./VImageFolderManager");
class V {
    constructor(data, player, amateras) {
        _V_amateras.set(this, void 0);
        _V_collection.set(this, void 0);
        _V_imageFolders.set(this, void 0);
        __classPrivateFieldSet(this, _V_amateras, amateras, "f");
        __classPrivateFieldSet(this, _V_collection, amateras.db.collection('v'), "f");
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.avatar = data.avatar;
        this.me = player;
        this.image = data.image;
        __classPrivateFieldSet(this, _V_imageFolders, data.imageFolders, "f");
        this.imageFolders = {};
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _V_imageFolders, "f")) {
                this.imageFolders = new VImageFolderManager_1.VImageFolderManager(__classPrivateFieldGet(this, _V_imageFolders, "f"), this.me, __classPrivateFieldGet(this, _V_amateras, "f"));
                yield this.imageFolders.init();
            }
            else {
                const foldersData = {
                    folders: {},
                    default: undefined
                };
                this.imageFolders = new VImageFolderManager_1.VImageFolderManager(foldersData, this.me, __classPrivateFieldGet(this, _V_amateras, "f"));
                yield this.imageFolders.init();
            }
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (0, terminal_1.cloneObj)(this, ['me']);
            data.imageFolders = this.imageFolders.toData();
            const find = yield __classPrivateFieldGet(this, _V_collection, "f").findOne({ id: this.id });
            if (find) {
                yield __classPrivateFieldGet(this, _V_collection, "f").replaceOne({ id: this.id }, data);
            }
            else {
                yield __classPrivateFieldGet(this, _V_collection, "f").insertOne(data);
            }
        });
    }
    setInfo(vObj) {
        return __awaiter(this, void 0, void 0, function* () {
            this.name = vObj.name ? vObj.name : this.name;
            this.description = vObj.description ? vObj.description : this.description;
            this.avatar = vObj.avatar ? vObj.avatar : this.avatar;
            this.image = vObj.image ? vObj.image : this.image;
            yield this.save();
            yield this.refreshInfoInLobby();
        });
    }
    sendInfoLobby(lobby) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if message already exist
            const _messageFind = lobby.messages.get(this.id);
            if (_messageFind) {
                yield _messageFind.delete();
            }
            const embed = this.infoEmbed();
            if (embed === 101)
                return 101;
            if (!lobby.infoChannel)
                return 102;
            const message = yield lobby.infoChannel.send({ embeds: [embed] });
            const _message = yield __classPrivateFieldGet(this, _V_amateras, "f").messages.create(message);
            yield lobby.setMessage(this.id, _message);
        });
    }
    infoEmbed() {
        const user = this.me.get;
        if (!user)
            return 101;
        const embed = new discord_js_1.MessageEmbed({
            author: {
                name: 'VTuber'
            },
            title: this.name ? this.name : '未命名',
            description: this.description ? this.description : this.me.description ? this.me.description : undefined,
            thumbnail: {
                url: this.avatar ? this.avatar : user.displayAvatarURL({ size: 512 })
            },
            image: {
                url: this.image
            },
            fields: [
                {
                    name: 'Links',
                    value: `[YouTube](https://www.youtube.com/channel/${this.me.youtube}) [Twitter](https://twitter.com/${this.me.twitter})\n[跳图链接](https://discord-reactive-images.fugi.tech/individual/${this.id})`
                }
            ],
            footer: {
                text: this.id
            },
            color: this.me.color
        });
        return embed;
    }
    initInfoInLobby() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const lobby of this.me.joinedLobbies) {
                this.sendInfoLobby(lobby[1]);
            }
        });
    }
    refreshInfoInLobby() {
        return __awaiter(this, void 0, void 0, function* () {
            const embed = this.infoEmbed();
            if (embed === 101)
                return 101;
            for (const lobby of this.me.joinedLobbies) {
                const _message = lobby[1].messages.get(this.id);
                if (_message) {
                    _message.get.edit({ embeds: [embed] });
                }
            }
        });
    }
}
exports.V = V;
_V_amateras = new WeakMap(), _V_collection = new WeakMap(), _V_imageFolders = new WeakMap();
//# sourceMappingURL=V.js.map