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
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const options = interaction.options.data;
        const _guild = amateras.guilds.cache.get(interaction.guild.id);
        const moder = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.cache.get(interaction.user.id);
        switch (options[0].name) {
            case 'lobby':
                if (!options[0].options)
                    return;
                const lobbyChannel = interaction.channel;
                if (!_guild)
                    return;
                for (const subcmd1 of options[0].options) {
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
                if (!options[0].options)
                    return;
                const forumChannel = interaction.channel;
                if (!_guild)
                    return;
                for (const subcmd1 of options[0].options) {
                    switch (subcmd1.name) {
                        case 'setup':
                            if (forumChannel && forumChannel.type === 'GUILD_TEXT') {
                                if ((yield ((_b = _guild.forums) === null || _b === void 0 ? void 0 : _b.create(forumChannel))) === 101) {
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
                                if ((yield ((_c = _guild.forums) === null || _c === void 0 ? void 0 : _c.closeForum(forumChannel))) === 101) {
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
            case 'vtuber':
                if (!options[0].options)
                    return;
                for (const subcmd1 of options[0].options) {
                    switch (subcmd1.name) {
                        case 'set':
                            if (!subcmd1.options)
                                return;
                            let userId = '';
                            for (const subcmd2 of subcmd1.options) {
                                switch (subcmd2.name) {
                                    case 'user':
                                        if (typeof subcmd2.value === 'string') {
                                            userId = subcmd2.value;
                                        }
                                        break;
                                }
                            }
                            const player = yield amateras.players.fetch(userId);
                            yield player.setVTuber();
                            interaction.reply({ content: '设定完成', ephemeral: true });
                            break;
                        case 'unset':
                            if (!subcmd1.options)
                                return;
                            let userId_v = '';
                            for (const subcmd2 of subcmd1.options) {
                                switch (subcmd2.name) {
                                    case 'user':
                                        if (typeof subcmd2.value === 'string') {
                                            userId_v = subcmd2.value;
                                        }
                                        break;
                                }
                            }
                            const player_v = yield amateras.players.fetch(userId_v);
                            yield player_v.unsetVTuber();
                            interaction.reply({ content: '设定完成', ephemeral: true });
                            break;
                    }
                }
                break;
            case 'message':
                if (!options[0].options)
                    return;
                for (const subcmd1 of options[0].options) {
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
        }
    });
}
//# sourceMappingURL=mod.js.map