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
function item(interact, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        const v = yield amateras.players.v.fetch(interact.user.id);
        if (v === 404 || v === 101)
            return interact.reply({ content: 'VTuber 限定功能。', ephemeral: true });
        for (const subcmd0 of interact.options.data) {
            if (subcmd0.name === 'image') {
                if (!subcmd0.options) {
                    interact.reply({ content: '请输入必要参数。', ephemeral: true });
                    return;
                }
                const imageObj = {
                    url: undefined
                };
                for (const subcmd1 of subcmd0.options) {
                    if (subcmd1.name === 'url') {
                        imageObj.url === imageObj.url;
                    }
                }
                if (imageObj.url && (0, terminal_1.checkImage)(imageObj.url)) {
                    v.image = imageObj.url;
                    interact.reply({ content: '图片设定完成', ephemeral: true });
                }
                else {
                    interact.reply({ content: '图片链接无效', ephemeral: true });
                }
            }
            if (subcmd0.name === 'info') {
                const embed = v.infoEmbed();
                if (embed === 101)
                    return interact.reply('Error: User is not defined');
                if (!subcmd0.options) {
                    interact.reply({ embeds: [embed], ephemeral: true });
                    return;
                }
                let share = false, user;
                for (const subcmd1 of subcmd0.options) {
                    if (subcmd1.name === 'share') {
                        share = subcmd1.value;
                    }
                    else if (subcmd1.name === 'user') {
                        user = subcmd1.value;
                    }
                }
                if (user) {
                    const target = yield amateras.players.v.fetch(user);
                    if (target === 404 || target === 101)
                        return interact.reply({ content: '对方不是 V', ephemeral: true });
                    const embed2 = target.infoEmbed();
                    if (embed2 === 101)
                        return interact.reply('Error: User is not defined');
                    interact.reply({ embeds: [embed2], ephemeral: !share });
                }
                else {
                    interact.reply({ embeds: [embed], ephemeral: !share });
                }
            }
        }
    });
}
exports.default = item;
//# sourceMappingURL=v.js.map