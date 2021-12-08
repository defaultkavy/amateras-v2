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
function execute(interact, amateras) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const admin = interact.user;
        for (const subcmd0 of interact.options.data) {
            switch (subcmd0.name) {
                case 'player':
                    if (subcmd0.options) {
                        for (const subcmd1 of subcmd0.options) {
                            switch (subcmd1.name) {
                                case 'aka':
                                    let player, aka, reason;
                                    for (const subcmd2 of subcmd1.options) {
                                        switch (subcmd2.name) {
                                            case 'user':
                                                player = yield amateras.players.fetch(subcmd2.value);
                                                break;
                                            case 'content':
                                                aka = subcmd2.value;
                                                break;
                                            case 'reason':
                                                reason = subcmd2.value;
                                                break;
                                        }
                                    }
                                    if (!player)
                                        return;
                                    const lastAka = player.aka;
                                    player.aka = aka ? aka : null;
                                    yield player.save();
                                    const target = (_a = interact.guild) === null || _a === void 0 ? void 0 : _a.members.cache.get(player.id);
                                    interact.reply({ content: `${admin} 修改了 ${target} 的称号：${lastAka ? lastAka : '无'} => ${aka}${reason ? '\n> ' + reason : ''}` });
                                    break;
                            }
                        }
                    }
                    else {
                        interact.reply({ content: '请选择输入选项。', ephemeral: true });
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
                                                const fetch = yield amateras.wallets.fetch((yield amateras.players.fetch(subcmd2.value)).wallets[0].id);
                                                if (!fetch) {
                                                    console.error(`Wallet not exist. `);
                                                    interact.reply({ content: '命令无法使用：Wallet 不存在。', ephemeral: true });
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
                                    interact.reply({ content: `请输入有效数字。`, ephemeral: true });
                                    return;
                                }
                                if (!wallet)
                                    return;
                                wallet.balance = amount;
                                wallet.save();
                                const target = (_b = interact.guild) === null || _b === void 0 ? void 0 : _b.members.cache.get(wallet.owner.id);
                                interact.reply({ content: `${admin} 修改了 ${target} 的资产：${lastBalance}G => ${wallet.balance}G${reason ? '\n' + reason : ''}`, ephemeral: false });
                                break;
                        }
                    }
                    break;
            }
        }
    });
}
exports.default = execute;
//# sourceMappingURL=sys.js.map