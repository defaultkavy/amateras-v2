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
var __RoleManager_amateras, __RoleManager__guild, __RoleManager_collection, __RoleManager_data;
Object.defineProperty(exports, "__esModule", { value: true });
exports._RoleManager = void 0;
const Err_1 = require("./Err");
const terminal_1 = require("./terminal");
const _Role_1 = require("./_Role");
class _RoleManager {
    constructor(data, _guild, amateras) {
        __RoleManager_amateras.set(this, void 0);
        __RoleManager__guild.set(this, void 0);
        __RoleManager_collection.set(this, void 0);
        __RoleManager_data.set(this, void 0);
        __classPrivateFieldSet(this, __RoleManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, __RoleManager_collection, amateras.db.collection('roles'), "f");
        __classPrivateFieldSet(this, __RoleManager__guild, _guild, "f");
        __classPrivateFieldSet(this, __RoleManager_data, data, "f");
        this.cache = new Map;
        this.defaultRoles = new Map;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const role of __classPrivateFieldGet(this, __RoleManager__guild, "f").get.roles.cache.values()) {
                const _role = new _Role_1._Role(role, __classPrivateFieldGet(this, __RoleManager_amateras, "f"));
                this.cache.set(role.id, _role);
                yield _role.init();
            }
            if (__classPrivateFieldGet(this, __RoleManager_data, "f") && __classPrivateFieldGet(this, __RoleManager_data, "f").defaultRoles instanceof Array) {
                for (const roleId of __classPrivateFieldGet(this, __RoleManager_data, "f").defaultRoles) {
                    const _role = this.cache.get(roleId);
                    if (_role) {
                        this.defaultRoles.set(roleId, _role);
                        _role.isDefaultRole = true;
                    }
                }
            }
        });
    }
    /**
     *
     * @returns 404 - Role not found
     */
    fetch(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const get = this.cache.get(id);
            if (get)
                return get;
            try {
                const role = yield __classPrivateFieldGet(this, __RoleManager__guild, "f").get.roles.fetch(id);
                if (!role) {
                    new Err_1.Err(`Role fetch failed. (Role)${id}`);
                    return 404; // Role not found
                }
                const _role = new _Role_1._Role(role, __classPrivateFieldGet(this, __RoleManager_amateras, "f"));
                this.cache.set(id, _role);
                yield _role.init();
                return _role;
            }
            catch (err) {
                new Err_1.Err(`Role fetch failed. (Role)${id}`);
                return 404;
            }
        });
    }
    /**
     * @returns 100 - Success
     * @returns 101 - Already set
     * @returns 404 - Role not found
     */
    setDefaultRole(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const _role = this.cache.get(id);
            if (!_role) {
                return 404;
            }
            else {
                if (_role.isDefaultRole === true)
                    return 101;
                _role.isDefaultRole = true;
                this.defaultRoles.set(id, _role);
                __classPrivateFieldGet(this, __RoleManager__guild, "f").save();
                return 100;
            }
        });
    }
    /**
     * @returns 100 - Success
     * @returns 101 - Already unset
     * @returns 404 - Role not found
     */
    unsetDefaultRole(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const _role = this.cache.get(id);
            if (!_role) {
                return 404;
            }
            else {
                if (_role.isDefaultRole === false)
                    return 101;
                _role.isDefaultRole = false;
                this.defaultRoles.delete(id);
                __classPrivateFieldGet(this, __RoleManager__guild, "f").save();
                return 100;
            }
        });
    }
    toData() {
        const data = (0, terminal_1.cloneObj)(this, ['cache']);
        data.defaultRoles = [];
        for (const role of this.defaultRoles.values()) {
            data.defaultRoles.push(role.id);
        }
        return data;
    }
}
exports._RoleManager = _RoleManager;
__RoleManager_amateras = new WeakMap(), __RoleManager__guild = new WeakMap(), __RoleManager_collection = new WeakMap(), __RoleManager_data = new WeakMap();
//# sourceMappingURL=_RoleManager.js.map