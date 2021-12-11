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
var __MessageManager_amateras, __MessageManager_collection;
Object.defineProperty(exports, "__esModule", { value: true });
const _Message_1 = require("./_Message");
class _MessageManager {
    constructor(amateras) {
        var _a;
        __MessageManager_amateras.set(this, void 0);
        __MessageManager_collection.set(this, void 0);
        __classPrivateFieldSet(this, __MessageManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, __MessageManager_collection, (_a = amateras.db) === null || _a === void 0 ? void 0 : _a.collection('messages'), "f");
        this.cache = new Map;
    }
    fetch(msgId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!msgId)
                return; // Mission create will fetch msg with undefined string
            const msgData = yield ((_a = __classPrivateFieldGet(this, __MessageManager_collection, "f")) === null || _a === void 0 ? void 0 : _a.findOne({ id: msgId }));
            if (!msgData) {
                console.error(`Mission "${msgId}" fetch failed.`);
                return;
            }
            if (this.cache.has(msgId)) {
                return this.cache.get(msgId);
            }
            const msg = new _Message_1._Message(msgData, __classPrivateFieldGet(this, __MessageManager_amateras, "f"));
            this.cache.set(msgId, msg);
            yield msg.init();
            return msg;
        });
    }
    /**
     * Create new mission to cache and database.
     * @param message Required Discord.Message type Object.
     * @returns Return a Mission type dynamic object.
     */
    create(message, fn) {
        return __awaiter(this, void 0, void 0, function* () {
            // Clone missionObj become MissionData type
            const msgData = {
                id: message.id,
                guild: message.guild.id,
                channel: message.channel.id,
                actions: this.componentsInit(message, fn)
            };
            // Create Mission object
            const msg = new _Message_1._Message(msgData, __classPrivateFieldGet(this, __MessageManager_amateras, "f"));
            this.cache.set(msg.id, msg);
            yield msg.init();
            yield msg.save();
            return msg;
        });
    }
    componentsInit(message, fn) {
        let actions = [];
        if (!message.components) {
            return undefined;
        }
        for (const action of message.components) {
            let comps = [];
            for (const component of action.components) {
                let componentData;
                if (component.type === 'BUTTON') {
                    const s = component.customId ? component.customId.split('#') : undefined;
                    const customId = s ? s[s.length - 1] : undefined;
                    componentData = {
                        customId: customId,
                        fn: fn ? fn[customId] : undefined,
                        type: 'BUTTON'
                    };
                }
                else if (component.type === 'SELECT_MENU') {
                    let options = {};
                    for (const selection of component.options) {
                        options[selection.value] = fn ? fn[selection.value] : undefined;
                    }
                    componentData = {
                        customId: component.customId,
                        options: options,
                        type: 'SELECT_MENU'
                    };
                }
                comps.push(componentData);
            }
            actions.push(comps);
        }
        return actions;
    }
}
exports.default = _MessageManager;
__MessageManager_amateras = new WeakMap(), __MessageManager_collection = new WeakMap();
//# sourceMappingURL=_MessageManager.js.map