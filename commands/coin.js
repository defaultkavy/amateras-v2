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
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!amateras.players) {
            interaction.reply({ content: '命令无法使用：资料库不存在。', ephemeral: true });
            return;
        }
        const player = yield amateras.players.fetch(interaction.user.id);
        for (const subcmd0 of interaction.options.data) {
            switch (subcmd0.name) {
                case 'give':
                    if (!subcmd0.options) {
                        interaction.reply({ content: '错误：请输入参数。', ephemeral: true });
                        return;
                    }
                    let receiverWallets, senderWallets = player.wallets, amount, message;
                    for (const subcmd1 of subcmd0.options) {
                        switch (subcmd1.name) {
                            case 'user':
                                if (subcmd1.value && typeof subcmd1.value === 'string') {
                                    receiverWallets = (yield amateras.players.fetch(subcmd1.value)).wallets;
                                }
                                break;
                            case 'amount':
                                if (subcmd1.value && typeof subcmd1.value === 'number') {
                                    amount = subcmd1.value;
                                }
                                break;
                            case 'message':
                                if (subcmd1.value && typeof subcmd1.value === 'string') {
                                    message = subcmd1.value;
                                }
                                break;
                        }
                    }
                    if (!receiverWallets || !senderWallets) {
                        console.error(`Wallet not exist. (mod.js)`);
                        interaction.reply({ content: '命令无法使用：对象账户不存在。', ephemeral: true });
                        return;
                    }
                    if (receiverWallets[0].id === senderWallets[0].id) {
                        interaction.reply({ content: `对象不能是同样的账户。`, ephemeral: true });
                        return;
                    }
                    if (senderWallets[0].balance < amount) {
                        interaction.reply({ content: `你的资产余额不足: ${senderWallets[0].balance}G`, ephemeral: true });
                        return;
                    }
                    else if (!amount || amount <= 0) {
                        interaction.reply({ content: `请输入有效数字。`, ephemeral: true });
                        return;
                    }
                    yield senderWallets[0].transfer(receiverWallets[0].id, amount, `/coin give: ${message}`, false);
                    const members = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.cache;
                    interaction.reply({ content: `${members === null || members === void 0 ? void 0 : members.get(senderWallets[0].owner.id)} 汇给 ${members === null || members === void 0 ? void 0 : members.get(receiverWallets[0].owner.id)} ${amount}G${message ? '\n> ' + message : ''}`, ephemeral: false });
                    amateras.log.send(`${yield amateras.log.name(senderWallets[0].owner.id)} 汇给 ${yield amateras.log.name(receiverWallets[0].owner.id)} ${amount}G${message ? '\n> ' + message : ''}`);
                    break;
            }
        }
    });
}
//# sourceMappingURL=coin.js.map