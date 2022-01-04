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
const google_spreadsheet_1 = require("google-spreadsheet");
const config = require('../bot_config.json');
function execute(interact, amateras) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        interact.deferReply({ ephemeral: true });
        if (interact.user !== amateras.system.admin)
            return interact.followUp({ content: '仅限系统管理员使用', ephemeral: true });
        const admin = interact.user;
        for (const subcmd0 of interact.options.data) {
            switch (subcmd0.name) {
                case 'player':
                    if (subcmd0.options) {
                        for (const subcmd1 of subcmd0.options) {
                            switch (subcmd1.name) {
                                case 'aka':
                                    let user, aka, reason;
                                    for (const subcmd2 of subcmd1.options) {
                                        switch (subcmd2.name) {
                                            case 'user':
                                                user = subcmd2.value;
                                                break;
                                            case 'content':
                                                aka = subcmd2.value;
                                                break;
                                            case 'reason':
                                                reason = subcmd2.value;
                                                break;
                                        }
                                    }
                                    if (!user)
                                        return;
                                    const player = yield amateras.players.fetch(user);
                                    if (player === 404)
                                        return;
                                    const lastAka = player.aka;
                                    player.aka = aka ? aka : null;
                                    yield player.save();
                                    const target = (_a = interact.guild) === null || _a === void 0 ? void 0 : _a.members.cache.get(player.id);
                                    interact.followUp({ content: `${admin} 修改了 ${target} 的称号：${lastAka ? lastAka : '无'} => ${aka}${reason ? '\n> ' + reason : ''}` });
                                    break;
                            }
                        }
                    }
                    else {
                        interact.followUp({ content: '请选择输入选项。', ephemeral: true });
                    }
                    break;
                case 'coin':
                    for (const subcmd1 of subcmd0.options) {
                        switch (subcmd1.name) {
                            case 'set':
                                let wallet, amount, reason;
                                for (const subcmd2 of subcmd1.options) {
                                    switch (subcmd2.name) {
                                        case 'user':
                                            if (subcmd2.value && typeof subcmd2.value === 'string') {
                                                const receiver = yield amateras.players.fetch(subcmd2.value);
                                                if (receiver === 404)
                                                    return;
                                                const fetch = yield amateras.wallets.fetch(receiver.wallets[0].id);
                                                if (!fetch) {
                                                    console.error(`Wallet not exist. `);
                                                    interact.followUp({ content: '命令无法使用：Wallet 不存在。', ephemeral: true });
                                                    return;
                                                }
                                                wallet = fetch;
                                            }
                                            break;
                                        case 'amount':
                                            amount = subcmd2.value;
                                            break;
                                        case 'reason':
                                            reason = subcmd2.value;
                                            break;
                                    }
                                }
                                const lastBalance = wallet.balance;
                                if (!amount) {
                                    amount = 0;
                                }
                                else if (amount <= 0) {
                                    interact.followUp({ content: `请输入有效数字。`, ephemeral: true });
                                    return;
                                }
                                if (!wallet)
                                    return;
                                wallet.balance = amount;
                                wallet.save();
                                const target = (_b = interact.guild) === null || _b === void 0 ? void 0 : _b.members.cache.get(wallet.owner.id);
                                interact.followUp({ content: `${admin} 修改了 ${target} 的资产：${lastBalance}G => ${wallet.balance}G${reason ? '\n' + reason : ''}`, ephemeral: false });
                                break;
                        }
                    }
                    break;
                case 'v':
                    if (!subcmd0.options)
                        return;
                    for (const subcmd1 of subcmd0.options) {
                        switch (subcmd1.name) {
                            case 'set':
                                if (!subcmd1.options)
                                    return;
                                let user, role, enable;
                                for (const subcmd2 of subcmd1.options) {
                                    switch (subcmd2.name) {
                                        case 'user':
                                            user = subcmd2.value;
                                            break;
                                        case 'role':
                                            role = subcmd2.value;
                                            break;
                                        case 'enable':
                                            enable = subcmd2.value;
                                            break;
                                    }
                                }
                                if (user) {
                                    // For user permission
                                    const player = yield amateras.players.fetch(user);
                                    if (player === 404)
                                        return interact.followUp({ content: `Error: Player fetch failed` });
                                    // Check parameter Enable filled / No -> followUp permission status
                                    if (enable === undefined) {
                                        return interact.followUp({ content: `${player.mention()} V 状态为 ${player.v ? '开' : '关'}`, ephemeral: true });
                                    }
                                    // Check if permission not change
                                    if (enable) {
                                        const set = yield player.setVTuber();
                                        if (set === 101)
                                            return interact.followUp({ content: `${player.mention()} VTuber 状态保持为：${enable ? '开' : '关'}`, ephemeral: true });
                                        if (set === 102)
                                            return interact.followUp({ content: `Error: Player fetch failed`, ephemeral: true });
                                    }
                                    else if (enable === false && (yield player.unsetVTuber()) === 101)
                                        return interact.followUp({ content: `${player.mention()} V 状态保持为：${enable ? '开' : '关'}`, ephemeral: true });
                                    // followUp permission change message
                                    return interact.followUp({ content: `${player.mention()} V 状态更改为：${enable ? '开' : '关'}`, ephemeral: true });
                                }
                                if (role) {
                                    if (!interact.guildId)
                                        return interact.followUp({ content: `\`role 参数只能在伺服器中使用\``, ephemeral: true });
                                    const _guild = amateras.guilds.cache.get(interact.guildId);
                                    if (!_guild)
                                        return interact.followUp({ content: 'Error: Guild is not cached', ephemeral: true });
                                    const _role = yield _guild.roles.fetch(role);
                                    if (_role === 404)
                                        return interact.followUp({ content: `Error: Role fetch failed` });
                                    if (enable === undefined) {
                                        return interact.followUp({ content: `${_role.mention()} V 状态为：${((_c = _guild.commands.cache.get('mod')) === null || _c === void 0 ? void 0 : _c.hasPermission(role)) ? '开' : '关'}`, ephemeral: true });
                                    }
                                    let status = { success: 0, failed: 0, preserve: 0 };
                                    if (enable) {
                                        const result = yield _role.setVTuber();
                                        for (const id in result) {
                                            if (result[id] === 100)
                                                status.success += 1;
                                            if (result[id] === 101)
                                                status.preserve += 1;
                                            if (result[id] === 102)
                                                status.failed += 1;
                                        }
                                    }
                                    else if (enable === false) {
                                        const result = yield _role.unsetVTuber();
                                        for (const id in result) {
                                            if (result[id] === 100)
                                                status.success += 1;
                                            if (result[id] === 101)
                                                status.preserve += 1;
                                        }
                                    }
                                    if (status.failed > 0 || status.preserve > 0) {
                                        return interact.followUp({ content: `${_role.mention()} V 状态变更结果：\`\`\`py\n成功：${status.success}\n失败：${status.failed}\n保持：${status.preserve}\`\`\``, ephemeral: true });
                                    }
                                    return interact.followUp({ content: `${_role.mention()} V 状态更改为：${enable ? '开' : '关'}`, ephemeral: true });
                                }
                                // User and Role part is not filled
                                return interact.followUp({ content: '请选择目标', ephemeral: true });
                                break;
                        }
                    }
                    break;
                case 'data':
                    const doc = new google_spreadsheet_1.GoogleSpreadsheet('1vf1AzwVggPXZB9bCy9l8i1-jhUZYp87vV3WFACyhoS8');
                    yield doc.useServiceAccountAuth({
                        client_email: config.google.client_email,
                        private_key: config.google.private_key
                    });
                    yield doc.loadInfo();
                    const sheets = doc.sheetsByIndex;
                    const data = [];
                    const rows = yield sheets[0].getRows();
                    const header = sheets[0].headerValues;
                    // create JSON from sheet
                    for (let r = 0; r < rows.length; r++) {
                        const obj = {};
                        header.forEach(varname => {
                            obj[varname] = rows[r][varname];
                        });
                        data.push(obj);
                    }
                    console.log('Starting load V Data...');
                    console.time('V Data loaded');
                    for (const vData of data) {
                        if (vData.discordId === '')
                            continue;
                        const v = yield amateras.players.v.fetch(vData.discordId);
                        if (v === 404 || v === 101)
                            continue;
                        v.description = vData.description;
                        v.me.youtube = vData.youtube_id;
                        v.me.twitter = vData.id;
                        yield v.setInfo({
                            description: vData.description,
                            name: vData.nameCh_front + vData.nameCh_back,
                            image: vData.character_Img
                        });
                    }
                    console.timeEnd('V Data loaded');
                    interact.followUp({ content: 'Command: Data', ephemeral: true });
                    break;
                case 'sleep':
                    if (!amateras.ready)
                        return interact.followUp({ content: '天照已休眠，操作无效', ephemeral: true });
                    interact.followUp({ content: '天照已休眠', ephemeral: true });
                    amateras.sleep();
                    break;
                case 'wake':
                    if (amateras.ready)
                        return interact.followUp({ content: '天照已上线，操作无效', ephemeral: true });
                    interact.followUp({ content: '天照已上线', ephemeral: true });
                    amateras.wake();
                    break;
            }
        }
    });
}
exports.default = execute;
//# sourceMappingURL=sys.js.map