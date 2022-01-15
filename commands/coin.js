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
const lang_json_1 = require("../lang.json");
exports.default = execute;
function execute(interaction, amateras) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!amateras.players) {
            interaction.reply({ content: 'Error: Player fetch failed', ephemeral: true });
            return;
        }
        const player = yield amateras.players.fetch(interaction.user.id);
        if (player === 404)
            return;
        if (!interaction.guild)
            return;
        const _guild = amateras.guilds.cache.get(interaction.guild.id);
        if (!_guild)
            return;
        const lang = _guild.lang;
        for (const subcmd0 of interaction.options.data) {
            switch (subcmd0.name) {
                case 'give':
                    if (!subcmd0.options) {
                        return;
                    }
                    let receiverWallets, senderWallets = player.wallets, amount, message;
                    for (const subcmd1 of subcmd0.options) {
                        switch (subcmd1.name) {
                            case 'user':
                                if (subcmd1.value && typeof subcmd1.value === 'string') {
                                    const receiver = yield amateras.players.fetch(subcmd1.value);
                                    if (receiver === 404)
                                        return;
                                    receiverWallets = receiver.wallets;
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
                        interaction.reply({ content: 'Error: Wallet fetch failed', ephemeral: true });
                        return;
                    }
                    if (receiverWallets[0].id === senderWallets[0].id) {
                        interaction.reply({ content: lang_json_1._coin_.err_same_acc[lang], ephemeral: true });
                        return;
                    }
                    if (senderWallets[0].balance < amount) {
                        interaction.reply({ content: `${lang_json_1._coin_.err_balances_exceed[lang]} ${senderWallets[0].balance}G`, ephemeral: true });
                        return;
                    }
                    else if (!amount || amount <= 0) {
                        interaction.reply({ content: lang_json_1._coin_.err_number[lang], ephemeral: true });
                        return;
                    }
                    yield senderWallets[0].transfer(receiverWallets[0].id, amount, `/coin give: ${message}`, false);
                    const members = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.cache;
                    interaction.reply({ content: `${members === null || members === void 0 ? void 0 : members.get(senderWallets[0].owner.id)} ${lang_json_1._coin_.transfer[lang]} ${members === null || members === void 0 ? void 0 : members.get(receiverWallets[0].owner.id)} ${amount}G${message ? '\n> ' + message : ''}`, ephemeral: false });
                    amateras.log.send(`${yield amateras.log.name(senderWallets[0].owner.id)} ${lang_json_1._coin_.transfer[lang]} ${yield amateras.log.name(receiverWallets[0].owner.id)} ${amount}G${message ? '\n> ' + message : ''}`);
                    break;
            }
        }
    });
}
//# sourceMappingURL=coin.js.map