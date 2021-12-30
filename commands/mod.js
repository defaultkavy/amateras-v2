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
const terminal_1 = require("../lib/terminal");
exports.default = execute;
function execute(interaction, amateras) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const subcmd0 = interaction.options.data[0];
        const _guild = amateras.guilds.cache.get(interaction.guild.id);
        if (!_guild)
            return interaction.reply({ content: 'Unknown _Guild', ephemeral: true });
        // Get moderator player profile
        const moderator = yield amateras.players.fetch(interaction.user.id);
        if (moderator === 404)
            return interaction.reply({ content: `管理员不存在`, ephemeral: true });
        // Check is moderator
        if (!_guild.moderators.includes(moderator.id))
            return interaction.reply({ content: `你不是管理员`, ephemeral: true });
        switch (subcmd0.name) {
            case 'lobby':
                if (!subcmd0.options)
                    return;
                const lobbyChannel = interaction.channel;
                if (!lobbyChannel || lobbyChannel.type !== 'GUILD_TEXT')
                    return interaction.reply({ content: 'Error: Channel is not GUILD_TEXT' });
                if (!_guild)
                    return;
                for (const subcmd1 of subcmd0.options) {
                    switch (subcmd1.name) {
                        case 'set':
                            // Check sub-command is filled
                            if (subcmd1.options) {
                                const value = { enable: false };
                                for (const subcmd2 of subcmd1.options) {
                                    switch (subcmd2.name) {
                                        case 'enable':
                                            value.enable = subcmd2.value;
                                            break;
                                    }
                                }
                                if (value.enable === true) {
                                    if ((yield _guild.lobby.setup(lobbyChannel)) === 101) {
                                        interaction.reply({ content: `此频道房间模式保持为：${value.enable ? '开' : '关'}`, ephemeral: true });
                                    }
                                    else {
                                        interaction.reply({ content: `此频道房间模式更改为：${value.enable ? '开' : '关'}`, ephemeral: true });
                                    }
                                }
                                else if (value.enable === false) {
                                    const unset = yield _guild.lobby.unset(lobbyChannel);
                                    if (unset === 101) {
                                        interaction.reply({ content: `当前没有设立的房间频道`, ephemeral: true });
                                    }
                                    else if (unset === 102) {
                                        interaction.reply({ content: `此频道不是房间频道`, ephemeral: true });
                                    }
                                    else {
                                        interaction.reply({ content: `此频道房间模式更改为：${value.enable ? '开' : '关'}`, ephemeral: true });
                                    }
                                }
                            }
                            else {
                                if (!_guild.lobby.channel) {
                                    interaction.reply({ content: `房间模式：关`, ephemeral: true });
                                }
                                else {
                                    if (_guild.lobby.channel)
                                        return interaction.reply({ content: `房间模式：开，${_guild.lobby.channel}`, ephemeral: true });
                                    interaction.reply({ content: `房间模式：开`, ephemeral: true });
                                }
                            }
                            break;
                        case 'permission':
                            if (!subcmd1.options)
                                return;
                            if (!(_guild === null || _guild === void 0 ? void 0 : _guild.lobby))
                                return;
                            const value = {
                                user: undefined,
                                role: undefined,
                                enable: undefined
                            };
                            for (const subcmd2 of subcmd1.options) {
                                switch (subcmd2.name) {
                                    case 'user':
                                        value.user = subcmd2.value;
                                        break;
                                    case 'role':
                                        value.role = subcmd2.value;
                                        break;
                                    case 'enable':
                                        value.enable = subcmd2.value;
                                        break;
                                }
                            }
                            if (value.user) {
                                const player = yield amateras.players.fetch(value.user);
                                if (player === 404)
                                    return interaction.reply({ content: 'Error: Player fetch failed' });
                                if (value.enable === undefined) {
                                    interaction.reply({ content: `${player.mention()}创建房间权限：${_guild.lobby.permissions.includes(value.user) ? '开' : '关'}`, ephemeral: true });
                                }
                                else {
                                    if (value.enable === true) {
                                        if ((yield _guild.lobby.permissionAdd(value.user)) === 101)
                                            return interaction.reply({ content: `${player.mention()}创建房间权限保持为：${value.enable ? '开' : '关'}`, ephemeral: true });
                                    }
                                    else {
                                        if ((yield _guild.lobby.permissionRemove(value.user)) === 101)
                                            return interaction.reply({ content: `${player.mention()}创建房间权限保持为：${value.enable ? '开' : '关'}`, ephemeral: true });
                                    }
                                    interaction.reply({ content: `${player.mention()}创建房间权限更改为：${_guild.lobby.permissions.includes(value.user) ? '开' : '关'}`, ephemeral: true });
                                }
                            }
                            if (value.role) {
                                const _role = yield _guild.roles.fetch(value.role);
                                if (_role === 404)
                                    return interaction.reply({ content: 'Error: Role fetch failed' });
                                if (value.enable === undefined) {
                                    interaction.reply({ content: `${_role.mention()}创建房间权限：${_guild.lobby.permissions.includes(value.role) ? '开' : '关'}`, ephemeral: true });
                                }
                                else {
                                    if (value.enable === true) {
                                        if ((yield _guild.lobby.permissionAdd(value.role)) === 101)
                                            return interaction.reply({ content: `${_role.mention()}创建房间权限保持为：${value.enable ? '开' : '关'}`, ephemeral: true });
                                    }
                                    else {
                                        if ((yield _guild.lobby.permissionRemove(value.role)) === 101)
                                            return interaction.reply({ content: `${_role.mention()}创建房间权限保持为：${value.enable ? '开' : '关'}`, ephemeral: true });
                                    }
                                    interaction.reply({ content: `${_role.mention()}创建房间权限更改为：${_guild.lobby.permissions.includes(value.role) ? '开' : '关'}`, ephemeral: true });
                                }
                            }
                            break;
                        case "close":
                            if (!subcmd1.options)
                                return interaction.reply({ content: `请输入必要参数`, ephemeral: true });
                            const value3 = { user: '' };
                            for (const subcmd2 of subcmd1.options) {
                                switch (subcmd2.name) {
                                    case "user":
                                        value3.user = subcmd2.value;
                                        break;
                                }
                            }
                            if (!value3.user)
                                return interaction.reply({ content: `对象不存在`, ephemeral: true });
                            else {
                                const player = yield amateras.players.fetch(value3.user);
                                if (player === 404)
                                    return interaction.reply({ content: `Error: Player fetch failed` });
                                else {
                                    const lobby = yield _guild.lobby.fetch(value3.user);
                                    if (lobby === 404 || lobby === 101)
                                        return interaction.reply({ content: `房间不存在`, ephemeral: true });
                                    else
                                        yield lobby.close();
                                    interaction.reply({ content: `${player.mention()} 房间已关闭`, ephemeral: true });
                                    _guild.log.send(`${yield _guild.log.name(moderator.id)} 关闭了 ${yield _guild.log.name(player.id)} 的房间`, true);
                                }
                            }
                            break;
                    }
                }
                break;
            case 'forum':
                if (!subcmd0.options)
                    return;
                // Check channel is text channel
                const forumChannel = interaction.channel;
                if (!forumChannel || forumChannel.type !== 'GUILD_TEXT')
                    return interaction.reply({ content: 'Error: Channel is not GUILD_TEXT' });
                if (!_guild)
                    return;
                for (const subcmd1 of subcmd0.options) {
                    switch (subcmd1.name) {
                        case 'set':
                            // Check sub-command is filled
                            if (subcmd1.options) {
                                const value = { enable: false };
                                for (const subcmd2 of subcmd1.options) {
                                    switch (subcmd2.name) {
                                        case 'enable':
                                            value.enable = subcmd2.value;
                                            break;
                                    }
                                }
                                if (value.enable === true) {
                                    if ((yield _guild.forums.create(forumChannel)) === 101) {
                                        interaction.reply({ content: `此频道论坛模式保持为：${value.enable ? '开' : '关'}`, ephemeral: true });
                                    }
                                    else {
                                        interaction.reply({ content: `此频道论坛模式更改为：${value.enable ? '开' : '关'}`, ephemeral: true });
                                    }
                                }
                                else if (value.enable === false) {
                                    const forum = yield _guild.forums.fetch(forumChannel.id);
                                    if (forum === 404 || forum.state === 'CLOSED') {
                                        interaction.reply({ content: `此频道论坛模式保持为：${value.enable ? '开' : '关'}`, ephemeral: true });
                                    }
                                    else {
                                        yield forum.close();
                                        interaction.reply({ content: `此频道论坛模式更改为：${value.enable ? '开' : '关'}`, ephemeral: true });
                                    }
                                }
                            }
                            else {
                                const forum = yield _guild.forums.fetch(forumChannel.id);
                                if (forum === 404 || forum.state === 'CLOSED') {
                                    interaction.reply({ content: `此频道论坛模式：关`, ephemeral: true });
                                }
                                else {
                                    interaction.reply({ content: `此频道论坛模式：开`, ephemeral: true });
                                }
                            }
                            break;
                    }
                }
                break;
            case 'music':
                if (!subcmd0.options)
                    return;
                const channel = interaction.channel;
                if (!channel || channel.type !== 'GUILD_TEXT')
                    return interaction.reply({ content: 'Error: Channel is not GUILD_TEXT' });
                if (!_guild)
                    return;
                for (const subcmd1 of subcmd0.options) {
                    switch (subcmd1.name) {
                        case 'set':
                            // Check sub-command is filled
                            if (subcmd1.options) {
                                const value = { enable: false };
                                for (const subcmd2 of subcmd1.options) {
                                    switch (subcmd2.name) {
                                        case 'enable':
                                            value.enable = subcmd2.value;
                                            break;
                                    }
                                }
                                if (value.enable === true) {
                                    if ((yield _guild.musicPlayer.setup(channel)) === 101) {
                                        interaction.reply({ content: `此频道音乐模式保持为：${value.enable ? '开' : '关'}`, ephemeral: true });
                                    }
                                    else {
                                        interaction.reply({ content: `此频道音乐模式更改为：${value.enable ? '开' : '关'}`, ephemeral: true });
                                    }
                                }
                                else if (value.enable === false) {
                                    const unset = yield _guild.musicPlayer.unset(channel);
                                    if (unset === 101) {
                                        interaction.reply({ content: `当前没有设立的音乐频道`, ephemeral: true });
                                    }
                                    else if (unset === 102) {
                                        interaction.reply({ content: `此频道不是音乐频道`, ephemeral: true });
                                    }
                                    else {
                                        interaction.reply({ content: `此频道音乐模式更改为：${value.enable ? '开' : '关'}`, ephemeral: true });
                                    }
                                }
                            }
                            else {
                                if (!_guild.musicPlayer.channel) {
                                    interaction.reply({ content: `音乐模式：关`, ephemeral: true });
                                }
                                else {
                                    if (_guild.musicPlayer.channel)
                                        return interaction.reply({ content: `音乐模式：开，${_guild.musicPlayer.channel}`, ephemeral: true });
                                    interaction.reply({ content: `音乐模式：开`, ephemeral: true });
                                }
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
                        return interaction.reply({ content: `${player.mention()} mod 权限：${((_a = _guild.commands.cache.get('mod')) === null || _a === void 0 ? void 0 : _a.hasPermission(user)) ? '开' : '关'}`, ephemeral: true });
                    }
                    // Block who are not guild owner to use change permission function
                    if (interaction.user.id !== _guild.get.ownerId)
                        return interaction.reply({ content: `此功能仅限伺服器所有者使用`, ephemeral: true });
                    // Check if permission not change
                    if (enable) {
                        const set = yield _guild.setModerator(user, 'USER');
                        if ((0, terminal_1.equalOneOf)(set, [101, 102, 405, 404]))
                            return interaction.reply({ content: `Error: Setting failed` });
                        // Check if nothing change
                        if (set === 105)
                            return interaction.reply({ content: `${player.mention()} mod 权限保持为：${enable ? '开' : '关'}`, ephemeral: true });
                    }
                    else if (enable === false) {
                        const set = yield _guild.removeModerator(user, 'USER');
                        if ((0, terminal_1.equalOneOf)(set, [101, 102, 405, 404]))
                            return interaction.reply({ content: `Error: Setting failed` });
                        if (set === 105)
                            return interaction.reply({ content: `${player.mention()} mod 权限保持为：${enable ? '开' : '关'}`, ephemeral: true });
                    }
                    // Reply permission change message
                    return interaction.reply({ content: `${player.mention()} mod 权限更改为：${enable ? '开' : '关'}`, ephemeral: true });
                }
                if (role) {
                    const _role = yield _guild.roles.fetch(role);
                    if (_role === 404)
                        return interaction.reply({ content: `Error: Role fetch failed` });
                    if (enable === undefined) {
                        return interaction.reply({ content: `${_role.mention} mod 权限更改为：${((_b = _guild.commands.cache.get('mod')) === null || _b === void 0 ? void 0 : _b.hasPermission(role)) ? '开' : '关'}`, ephemeral: true });
                    }
                    if (interaction.user.id !== _guild.get.ownerId)
                        return interaction.reply({ content: `此功能仅限伺服器所有者使用`, ephemeral: true });
                    if (enable) {
                        const set = yield _guild.setModerator(role, 'ROLE');
                        if ((0, terminal_1.equalOneOf)(set, [101, 102, 405, 404]))
                            return interaction.reply({ content: `Error: Setting failed` });
                        if (set === 105)
                            return interaction.reply({ content: `${_role.mention} mod 权限保持为：${enable ? '开' : '关'}`, ephemeral: true });
                    }
                    else if (enable === false) {
                        const set = yield _guild.removeModerator(role, 'ROLE');
                        if ((0, terminal_1.equalOneOf)(set, [101, 102, 405, 404]))
                            return interaction.reply({ content: `Error: Setting failed` });
                        if (set === 105)
                            return interaction.reply({ content: `${_role.mention} mod 权限保持为：${enable ? '开' : '关'}`, ephemeral: true });
                    }
                    return interaction.reply({ content: `${_role.mention} mod 权限更改为：${enable ? '开' : '关'}`, ephemeral: true });
                }
                // User and Role part is not filled
                return interaction.reply({ content: '请选择目标', ephemeral: true });
                break;
        }
    });
}
//# sourceMappingURL=mod.js.map