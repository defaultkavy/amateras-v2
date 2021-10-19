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
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const options = interaction.options.data;
        const moder = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.cache.get(interaction.user.id);
        switch (options[0].name) {
            case 'player':
                if (options[0].options) {
                    for (const subcmd of options[0].options) {
                        switch (subcmd.name) {
                            case 'aka':
                                let player, aka, reason;
                                for (const input of subcmd.options) {
                                    switch (input.name) {
                                        case 'user':
                                            if (typeof input.value !== 'string')
                                                return;
                                            player = yield amateras.players.fetch(input.value);
                                            break;
                                        case 'content':
                                            if (typeof input.value !== 'string')
                                                return;
                                            aka = input.value;
                                            break;
                                        case 'reason':
                                            if (input.value && typeof input.value === 'string') {
                                                reason = input.value;
                                            }
                                            break;
                                    }
                                }
                                const lastAka = player.aka;
                                player.aka = aka ? aka : null;
                                yield player.save();
                                const target = (_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.members.cache.get(player.id);
                                interaction.reply({ content: `${moder} 修改了 ${target} 的称号：${lastAka ? lastAka : '无'} => ${aka}${reason ? '\n> ' + reason : ''}` });
                                break;
                        }
                    }
                }
                else {
                    interaction.reply({ content: '请选择输入选项。', ephemeral: true });
                }
                break;
            case 'coin':
                for (const subcmd of options[0].options) {
                    switch (subcmd.name) {
                        case 'set':
                            let wallet, amount, reason;
                            for (const ssubcmd of subcmd.options) {
                                switch (ssubcmd.name) {
                                    case 'user':
                                        if (ssubcmd.value && typeof ssubcmd.value === 'string') {
                                            const fetch = yield amateras.wallets.fetch((yield amateras.players.fetch(ssubcmd.value)).wallets[0].id);
                                            if (!fetch) {
                                                terminal_1.cmd.err(`Wallet not exist. (mod.js)`);
                                                interaction.reply({ content: '命令无法使用：Wallet 不存在。', ephemeral: true });
                                                return;
                                            }
                                            wallet = fetch;
                                        }
                                        break;
                                    case 'amount':
                                        if (ssubcmd.value && typeof ssubcmd.value === 'number') {
                                            amount = ssubcmd.value;
                                        }
                                        break;
                                    case 'reason':
                                        if (ssubcmd.value && typeof ssubcmd.value === 'string') {
                                            reason = ssubcmd.value;
                                        }
                                        break;
                                }
                            }
                            const lastBalance = wallet.balance;
                            if (!amount) {
                                amount = 0;
                            }
                            else if (amount <= 0) {
                                interaction.reply({ content: `请输入有效数字。`, ephemeral: true });
                                return;
                            }
                            wallet.balance = amount;
                            wallet.save();
                            const target = (_c = interaction.guild) === null || _c === void 0 ? void 0 : _c.members.cache.get(wallet.owner.id);
                            interaction.reply({ content: `${moder} 修改了 ${target} 的资产：${lastBalance}G => ${wallet.balance}G${reason ? '\n' + reason : ''}`, ephemeral: false });
                            break;
                    }
                }
                break;
            case 'setup':
                if (!options[0].options)
                    return;
                for (const subcmd1 of options[0].options) {
                    switch (subcmd1.name) {
                        case 'lobby':
                            if (!subcmd1.options)
                                return;
                            let channelId = '';
                            for (const subcmd2 of subcmd1.options) {
                                switch (subcmd2.name) {
                                    case 'channel':
                                        if (typeof subcmd2.value === 'string') {
                                            channelId = subcmd2.value;
                                        }
                                        break;
                                }
                            }
                            const channel = yield interaction.guild.channels.fetch(channelId);
                            if (channel && channel.type === 'GUILD_TEXT') {
                                const _guild = amateras.guilds.cache.get(interaction.guild.id);
                                if (_guild)
                                    _guild.setupLobbyManager(channel);
                            }
                            else {
                                interaction.reply({ content: '错误：必须是文字频道', ephemeral: true });
                            }
                            break;
                    }
                }
                break;
            case 'unset':
                if (!options[0].options)
                    return;
                for (const subcmd1 of options[0].options) {
                    switch (subcmd1.name) {
                        case 'lobby':
                            const _guild = amateras.guilds.cache.get(interaction.guild.id);
                            if (_guild)
                                yield _guild.closeLobbyManager();
                            interaction.reply({ content: '设定完成', ephemeral: true });
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
        }
    });
}
//# sourceMappingURL=mod.js.map