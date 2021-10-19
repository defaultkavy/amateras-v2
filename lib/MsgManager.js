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
var _MsgManager_amateras, _MsgManager_collection;
Object.defineProperty(exports, "__esModule", { value: true });
const Msg_1 = __importDefault(require("./Msg"));
class MsgManager {
    constructor(amateras) {
        var _a;
        _MsgManager_amateras.set(this, void 0);
        _MsgManager_collection.set(this, void 0);
        __classPrivateFieldSet(this, _MsgManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, _MsgManager_collection, (_a = amateras.db) === null || _a === void 0 ? void 0 : _a.collection('messages'), "f");
        this.cache = new Map;
    }
    fetch(msgId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const msgData = yield ((_a = __classPrivateFieldGet(this, _MsgManager_collection, "f")) === null || _a === void 0 ? void 0 : _a.findOne({ id: msgId }));
            if (!msgData) {
                console.error(`Mission "${msgId}" fetch failed.`);
                return;
            }
            if (this.cache.get(msgId)) {
                return this.cache.get(msgId);
            }
            const msg = new Msg_1.default(msgData, __classPrivateFieldGet(this, _MsgManager_amateras, "f"));
            this.cache.set(msgId, msg);
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
                actions: this.componentsInit(message, fn)
            };
            // Create Mission object
            const msg = new Msg_1.default(msgData, __classPrivateFieldGet(this, _MsgManager_amateras, "f"));
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
                    componentData = {
                        customId: component.customId,
                        fn: fn ? fn[component.customId] : undefined,
                        type: 'BUTTON'
                    };
                }
                else if (component.type === 'SELECT_MENU') {
                    let optionArr = [];
                    for (const selection of component.options) {
                        optionArr.push(selection.label);
                    }
                    componentData = {
                        customId: component.customId,
                        options: optionArr,
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
exports.default = MsgManager;
_MsgManager_amateras = new WeakMap(), _MsgManager_collection = new WeakMap();
//# sourceMappingURL=MsgManager.js.map