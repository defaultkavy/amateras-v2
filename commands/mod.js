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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = execute;
function execute(interaction, amateras) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __awaiter(this, void 0, void 0, function* () {
        const subcmd0 = interaction.options.data[0];
        const _guild = amateras.guilds.cache.get(interaction.guild.id);
        if (!_guild)
            return interaction.reply({ content: 'Unknown _Guild', ephemeral: true });
        switch (subcmd0.name) {
            case 'lobby':
                if (!subcmd0.options)
                    return;
                const lobbyChannel = interaction.channel;
                if (!_guild)
                    return;
                for (const subcmd1 of subcmd0.options) {
                    switch (subcmd1.name) {
                        case 'setup':
                            if (lobbyChannel && lobbyChannel.type === 'GUILD_TEXT') {
                                _guild.setupLobbyManager(lobbyChannel);
                                interaction.reply({ content: '房间频道设定完成', ephemeral: true });
                            }
                            else {
                                interaction.reply({ content: '错误：必须是文字频道', ephemeral: true });
                            }
                            break;
                        case 'unset':
                            if ((yield _guild.closeLobbyManager()) === 100) {
                                interaction.reply({ content: '房间系统已关闭', ephemeral: true });
                            }
                            else {
                                interaction.reply({ content: '错误：房间系统未开启', ephemeral: true });
                            }
                            break;
                        case 'permission':
                            if (!subcmd1.options)
                                return;
                            if (!(_guild === null || _guild === void 0 ? void 0 : _guild.lobby))
                                return;
                            let role = '';
                            let boolean = null;
                            for (const subcmd2 of subcmd1.options) {
                                switch (subcmd2.name) {
                                    case 'role':
                                        role = subcmd2.value;
                                        break;
                                    case 'switch':
                                        boolean = subcmd2.value;
                                        break;
                                }
                            }
                            if (boolean === null) {
                                interaction.reply({ content: `${_guild.get.roles.cache.get(role)}创建房间权限：${(_guild === null || _guild === void 0 ? void 0 : _guild.lobby.permissions.includes(role)) ? '开' : '关'}`, ephemeral: true });
                            }
                            else if (boolean === true) {
                                yield (_guild === null || _guild === void 0 ? void 0 : _guild.lobby.permissionAdd(role));
                                interaction.reply({ content: `${_guild.get.roles.cache.get(role)}开启创建房间权限`, ephemeral: true });
                            }
                            else if (boolean === false) {
                                yield (_guild === null || _guild === void 0 ? void 0 : _guild.lobby.permissionRemove(role));
                                interaction.reply({ content: `${_guild.get.roles.cache.get(role)}关闭创建房间权限`, ephemeral: true });
                            }
                            break;
                    }
                }
                break;
            case 'forum':
                if (!subcmd0.options)
                    return;
                const forumChannel = interaction.channel;
                if (!_guild)
                    return;
                for (const subcmd1 of subcmd0.options) {
                    switch (subcmd1.name) {
                        case 'setup':
                            if (forumChannel && forumChannel.type === 'GUILD_TEXT') {
                                if ((yield ((_a = _guild.forums) === null || _a === void 0 ? void 0 : _a.create(forumChannel))) === 101) {
                                    interaction.reply({ content: '错误：此频道论坛模式未关闭', ephemeral: true });
                                }
                                else {
                                    interaction.reply({ content: '论坛模式已开启', ephemeral: true });
                                }
                            }
                            else {
                                interaction.reply({ content: '错误：必须是文字频道', ephemeral: true });
                            }
                            break;
                        case 'unset':
                            if (forumChannel && forumChannel.type === 'GUILD_TEXT') {
                                if ((yield ((_b = _guild.forums) === null || _b === void 0 ? void 0 : _b.closeForum(forumChannel))) === 101) {
                                    interaction.reply({ content: '错误：此频道论坛模式未开启', ephemeral: true });
                                }
                                else {
                                    interaction.reply({ content: '论坛模式已关闭', ephemeral: true });
                                }
                            }
                            else {
                                interaction.reply({ content: '错误：必须是文字频道', ephemeral: true });
                            }
                            break;
                    }
                }
                break;
            case 'message':
                if (!subcmd0.options)
                    return;
                for (const subcmd1 of subcmd0.options) {
                    switch (subcmd1.name) {
                        case 'delete':
                            if (!subcmd1.options)
                                return;
                            let amount = 1;
                            for (const subcmd2 of subcmd1.options) {
                                switch (subcmd2.name) {
                                    case 'amount':
                                        amount = subcmd2.value;
                                        break;
                                }
                            }
                            if (amount < 1 || amount > 100) {
                                interaction.reply({ content: '请输入大于1且小于100的数字', ephemeral: true });
                            }
                            else {
                                interaction.channel.bulkDelete(amount);
                            }
                            interaction.reply({ content: '已删除完毕', ephemeral: true });
                            break;
                    }
                }
                break;
            case 'permission':
                if (!subcmd0.options)
                    return;
                let user, role, enable;
                for (const subcmd1 of subcmd0.options) {
                    switch (subcmd1.name) {
                        case 'user':
                            user = subcmd1.value;
                            break;
                        case 'role':
                            role = subcmd1.value;
                            break;
                        case 'enable':
                            enable = subcmd1.value;
                            break;
                    }
                }
                if (user) {
                    // For user permission
                    const player = yield amateras.players.fetch(user);
                    if (player === 404)
                        return;
                    // Check parameter Enable filled / No -> Reply permission status
                    if (enable === undefined) {
                        return interaction.reply({ content: `${player.mention()} mod 权限：${((_c = _guild.commands.cache.get('mod')) === null || _c === void 0 ? void 0 : _c.hasPermission(user)) ? '开' : '关'}`, ephemeral: true });
                    }
                    // Block who are not guild owner to use change permission function
                    if (interaction.user.id !== _guild.get.ownerId)
                        return interaction.reply({ content: `此功能仅限伺服器所有者使用`, ephemeral: true });
                    // Check if permission not change
                    if (enable && (yield ((_d = _guild === null || _guild === void 0 ? void 0 : _guild.commands.cache.get('mod')) === null || _d === void 0 ? void 0 : _d.permissionEnable(user, 'USER'))) === 105) {
                        return interaction.reply({ content: `${player.mention()} mod 权限保持为：${enable ? '开' : '关'}`, ephemeral: true });
                    }
                    else if (enable === false && (yield ((_e = _guild === null || _guild === void 0 ? void 0 : _guild.commands.cache.get('mod')) === null || _e === void 0 ? void 0 : _e.permissionDisable(user, 'USER'))) === 105)
                        return interaction.reply({ content: `${player.mention()} mod 权限保持为：${enable ? '开' : '关'}`, ephemeral: true });
                    // Reply permission change message
                    return interaction.reply({ content: `${player.mention()} mod 权限更改为：${enable ? '开' : '关'}`, ephemeral: true });
                }
                if (role) {
                    let target = yield (_guild === null || _guild === void 0 ? void 0 : _guild.role(role));
                    if (enable === undefined) {
                        return interaction.reply({ content: `${target} mod 权限更改为：${((_f = _guild.commands.cache.get('mod')) === null || _f === void 0 ? void 0 : _f.hasPermission(role)) ? '开' : '关'}`, ephemeral: true });
                    }
                    if (interaction.user.id !== _guild.get.ownerId)
                        return interaction.reply({ content: `此功能仅限伺服器所有者使用`, ephemeral: true });
                    if (enable && (yield ((_g = _guild === null || _guild === void 0 ? void 0 : _guild.commands.cache.get('mod')) === null || _g === void 0 ? void 0 : _g.permissionEnable(role, 'ROLE'))) === 105)
                        return interaction.reply({ content: `${target} mod 权限保持为：${enable ? '开' : '关'}`, ephemeral: true });
                    else if (enable === false && (yield ((_h = _guild === null || _guild === void 0 ? void 0 : _guild.commands.cache.get('mod')) === null || _h === void 0 ? void 0 : _h.permissionDisable(role, 'ROLE'))) === 105)
                        return interaction.reply({ content: `${target} mod 权限保持为：${enable ? '开' : '关'}`, ephemeral: true });
                    return interaction.reply({ content: `${target} mod 权限更改为：${enable ? '开' : '关'}`, ephemeral: true });
                }
                // User and Role part is not filled
                return interaction.reply({ content: '请选择目标', ephemeral: true });
                break;
        }
    });
}
//# sourceMappingURL=mod.js.map