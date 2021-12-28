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
var _GuildCommand_amateras, _GuildCommand_collection, _GuildCommand__guild, _GuildCommand_data;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildCommand = void 0;
const terminal_1 = require("./terminal");
class GuildCommand {
    constructor(data, appCommand, _guild, amateras) {
        _GuildCommand_amateras.set(this, void 0);
        _GuildCommand_collection.set(this, void 0);
        _GuildCommand__guild.set(this, void 0);
        _GuildCommand_data.set(this, void 0);
        __classPrivateFieldSet(this, _GuildCommand_amateras, amateras, "f");
        __classPrivateFieldSet(this, _GuildCommand_collection, amateras.db.collection('commands'), "f");
        __classPrivateFieldSet(this, _GuildCommand__guild, _guild, "f");
        __classPrivateFieldSet(this, _GuildCommand_data, data, "f");
        this.id = data ? data.id : '';
        this.get = appCommand;
        this.name = appCommand.name;
        this.permissions = data ? data.permissions : [];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!__classPrivateFieldGet(this, _GuildCommand_data, "f")) {
                this.id = this.get.id;
            }
            // Set owner permissions
            if (this.get.defaultPermission === false) {
                const ownerPermission = {
                    id: __classPrivateFieldGet(this, _GuildCommand__guild, "f").get.ownerId,
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
                if (!__classPrivateFieldGet(this, _GuildCommand_data, "f")) {
                    yield this.save();
                }
            }
        });
    }
    permissionSet(permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.get.permissions.set({
                permissions: permissions
            });
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (0, terminal_1.cloneObj)(this, ['get']);
            const guild = yield __classPrivateFieldGet(this, _GuildCommand_collection, "f").findOne({ id: this.id });
            if (guild) {
                yield __classPrivateFieldGet(this, _GuildCommand_collection, "f").replaceOne({ id: this.id }, data);
            }
            else {
                yield __classPrivateFieldGet(this, _GuildCommand_collection, "f").insertOne(data);
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
    /**
     * @returns 100 - Success
     * @returns 101 - Failed
     * @returns 105 - Already exist
     */
    permissionEnable(id, type) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, terminal_1.arrayHasObj)(this.permissions, { id: id, type: type, permission: true })) {
                return 105; // Already exist
            }
            (0, terminal_1.removeArrayItem)(this.permissions, { id: id, type: type, permission: false });
            this.permissions.push({
                id: id,
                type: type,
                permission: true
            });
            try {
                yield this.get.permissions.set({
                    permissions: this.permissions
                });
                yield this.save();
                return 100; // Success
            }
            catch (err) {
                return 101; // Failed
            }
        });
    }
    /**
     * @returns 100 - Success
     * @returns 101 - Failed
     * @returns 105 - Already exist
     */
    permissionDisable(id, type) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, terminal_1.arrayHasObj)(this.permissions, { id: id, type: type, permission: false })) {
                return 105; // Already exist
            }
            (0, terminal_1.removeArrayItem)(this.permissions, { id: id, type: type, permission: true });
            this.permissions.push({
                id: id,
                type: type,
                permission: false
            });
            try {
                yield this.get.permissions.set({
                    permissions: this.permissions
                });
                yield this.save();
                return 100; // Success
            }
            catch (err) {
                return 101; // Failed
            }
        });
    }
    hasPermission(id) {
        for (const permission of this.permissions) {
            if (permission.id === id) {
                if (permission.permission) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
        if (this.get.defaultPermission)
            return true;
        else
            return false;
    }
}
exports.GuildCommand = GuildCommand;
_GuildCommand_amateras = new WeakMap(), _GuildCommand_collection = new WeakMap(), _GuildCommand__guild = new WeakMap(), _GuildCommand_data = new WeakMap();
//# sourceMappingURL=GuildCommand.js.map