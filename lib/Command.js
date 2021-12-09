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
var _Command_amateras, _Command_collection, _Command_data;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
const terminal_1 = require("./terminal");
class Command {
    constructor(data, appCommand, amateras) {
        _Command_amateras.set(this, void 0);
        _Command_collection.set(this, void 0);
        _Command_data.set(this, void 0);
        __classPrivateFieldSet(this, _Command_amateras, amateras, "f");
        __classPrivateFieldSet(this, _Command_collection, amateras.db.collection('commands'), "f");
        __classPrivateFieldSet(this, _Command_data, data, "f");
        this.id = data ? data.id : '';
        this.get = appCommand;
        this.name = appCommand.name;
        this.permissions = data ? data.permissions : [];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!__classPrivateFieldGet(this, _Command_data, "f")) {
                this.id = this.get.id;
            }
            const admin = __classPrivateFieldGet(this, _Command_amateras, "f").system.admin;
            if (!admin)
                throw new Error('Amateras Fatal Error: System Admin User fetch failed');
            // Set owner permissions
            if (this.get.defaultPermission === false) {
                const ownerPermission = {
                    id: admin.id,
                    type: 'USER',
                    permission: true
                };
                if (!(0, terminal_1.arrayHasObj)(this.permissions, ownerPermission)) {
                    this.permissions.push(ownerPermission);
                }
            }
            let deployedPermissions = yield this.permissionFetch();
            // If permissions is different in Database and Discord server
            if (!(0, terminal_1.arrayEqual)(deployedPermissions, this.permissions)) {
                yield this.permissionSet(this.permissions);
                yield this.save();
            }
            else {
                if (!__classPrivateFieldGet(this, _Command_data, "f")) {
                    yield this.save();
                }
            }
        });
    }
    permissionSet(permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            yield __classPrivateFieldGet(this, _Command_amateras, "f").client.application.commands.permissions.set({
                guild: '744127668064092160',
                command: this.id,
                permissions: permissions
            });
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (0, terminal_1.cloneObj)(this, ['get']);
            const guild = yield __classPrivateFieldGet(this, _Command_collection, "f").findOne({ id: this.id });
            if (guild) {
                yield __classPrivateFieldGet(this, _Command_collection, "f").replaceOne({ id: this.id }, data);
            }
            else {
                yield __classPrivateFieldGet(this, _Command_collection, "f").insertOne(data);
            }
        });
    }
    permissionFetch() {
        return __awaiter(this, void 0, void 0, function* () {
            let permission = [];
            // If fetched permission is empty array, will cause error
            try {
                permission = yield this.get.permissions.fetch({});
            }
            catch (_a) { }
            return permission;
        });
    }
}
exports.Command = Command;
_Command_amateras = new WeakMap(), _Command_collection = new WeakMap(), _Command_data = new WeakMap();
//# sourceMappingURL=Command.js.map