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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _V_amateras, _V_collection, _V_imageFolders;
Object.defineProperty(exports, "__esModule", { value: true });
exports.V = void 0;
const discord_js_1 = require("discord.js");
const v_info_page_button_1 = __importDefault(require("../reacts/v_info_page_button"));
const v_set_folder_button_1 = __importDefault(require("../reacts/v_set_folder_button"));
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
            yield this.save();
        });
    }
    sendInfo(interact, share) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = interact.channel;
            const messageEle = yield this.infoMessage(interact.user.id, channel.parentId, share);
            interact.reply({ embeds: [messageEle.embed], components: messageEle.comp, ephemeral: !share });
            if (share && messageEle.inLobby) {
                __classPrivateFieldGet(this, _V_amateras, "f").messages.create(yield interact.fetchReply(), {
                    v_set_default_folder: 'v_set_folder_button',
                    v_info_prev_button: 'v_info_page_button',
                    v_info_next_button: 'v_info_page_button',
                    v_set_once_folder: 'v_set_folder_button'
                });
            }
            if (!share) {
                const collector = interact.channel.createMessageComponentCollector({
                    filter: (interact2) => {
                        if (!interact2.message.interaction)
                            return false;
                        if (interact.user.id === interact2.user.id && interact2.message.interaction.id === interact.id)
                            return true;
                        return false;
                    },
                    time: 1000 * 60
                });
                collector.on('collect', (interact2) => {
                    if (interact2.customId === messageEle.next_button.customId || interact2.customId === messageEle.prev_button.customId) {
                        if (interact2.isButton())
                            (0, v_info_page_button_1.default)(interact2, __classPrivateFieldGet(this, _V_amateras, "f"), { interactOld: interact, messageEle: messageEle });
                    }
                    else {
                        if (interact2.isButton())
                            (0, v_set_folder_button_1.default)(interact2, __classPrivateFieldGet(this, _V_amateras, "f"), { interactOld: interact, messageEle: messageEle });
                    }
                });
                collector.on('end', () => {
                    interact.editReply({ components: [] });
                });
            }
        });
    }
    sendInfoLobby(lobby) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageEle = yield this.infoMessage(this.id, lobby.infoChannel.parentId);
            const message = yield lobby.infoChannel.send({ embeds: [messageEle.embed], components: messageEle.comp });
            const _message = yield __classPrivateFieldGet(this, _V_amateras, "f").messages.create(message, {
                v_set_default_folder: 'v_set_folder_button',
                v_info_prev_button: 'v_info_page_button',
                v_info_next_button: 'v_info_page_button',
                v_set_once_folder: 'v_set_folder_button'
            });
            yield lobby.setMessage(this.id, _message);
        });
    }
    infoMessage(userId, channelId, share) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let inLobby;
            if (!channelId) {
                inLobby = false;
            }
            else {
                inLobby = this.me.joinedLobbies.has(channelId);
            }
            let image = undefined;
            let folder = undefined;
            if (!share || inLobby) {
                const lobbyDefaultFolder = (_a = this.me.joinedLobbies.get(channelId)) === null || _a === void 0 ? void 0 : _a.vFolder.get(userId);
                folder = inLobby ? lobbyDefaultFolder ? lobbyDefaultFolder : this.imageFolders.default : this.imageFolders.default;
                if (folder) {
                    image = folder.images.entries().next().value[1];
                }
            }
            const embed = yield this.infoEmbed(folder, image);
            const action = new discord_js_1.MessageActionRow();
            const action2 = new discord_js_1.MessageActionRow();
            let comp = [];
            if (folder && image) {
                if (!share || inLobby) {
                    const set_default_button = new discord_js_1.MessageButton();
                    set_default_button.label = '设定预设直播形象';
                    set_default_button.style = 'PRIMARY';
                    set_default_button.customId = '#v_set_default_folder';
                    action.addComponents(set_default_button);
                    const prev_button = new discord_js_1.MessageButton();
                    prev_button.label = '上一页';
                    prev_button.style = 'SECONDARY';
                    prev_button.customId = `${folder.id}$${folder.toArray().indexOf(image) + 1}` + '#v_info_prev_button';
                    const next_button = new discord_js_1.MessageButton();
                    next_button.label = '下一页';
                    next_button.style = 'SECONDARY';
                    next_button.customId = `${folder.id}$${folder.toArray().indexOf(image) + 1}` + '#v_info_next_button';
                    action2.addComponents(prev_button);
                    action2.addComponents(next_button);
                    if (inLobby) {
                        const set_once_button = new discord_js_1.MessageButton;
                        set_once_button.label = '设定本次直播形象';
                        set_once_button.style = 'PRIMARY';
                        set_once_button.customId = '#v_set_once_folder';
                        action.addComponents(set_once_button);
                    }
                    comp.push(action);
                    comp.push(action2);
                }
            }
            return {
                inLobby: inLobby,
                embed: embed,
                comp: comp,
                set_default_button: action.components[0],
                set_once_button: action.components[1],
                prev_button: action2.components[0],
                next_button: action2.components[1],
            };
        });
    }
    infoEmbed(folder, image) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield __classPrivateFieldGet(this, _V_amateras, "f").client.users.fetch(this.id);
            const embed = new discord_js_1.MessageEmbed({
                author: {
                    name: 'VTuber'
                },
                title: this.name ? this.name : '未命名',
                description: this.description ? this.description : this.me.description ? this.me.description : undefined,
                thumbnail: {
                    url: this.avatar ? this.avatar : user.displayAvatarURL({ size: 512 })
                },
                image: {},
                footer: {
                    text: this.id
                },
                color: this.me.color
            });
            if (image) {
                embed.setImage(image.url);
                if (folder) {
                    embed.addField(`${folder.name ? folder.name : '未命名'}`, `${folder.toArray().indexOf(image) + 1} / ${folder.toArray().length}`, true);
                }
            }
            return embed;
        });
    }
}
exports.V = V;
_V_amateras = new WeakMap(), _V_collection = new WeakMap(), _V_imageFolders = new WeakMap();
//# sourceMappingURL=V.js.map