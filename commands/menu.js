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
const discord_js_1 = require("discord.js");
exports.default = execute;
function execute(interaction, amateras) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const menuId = interaction.id + 'cute';
        const row = new discord_js_1.MessageActionRow()
            .addComponents(new discord_js_1.MessageSelectMenu()
            .setCustomId(menuId)
            .setPlaceholder('这还需要选的吗？')
            .addOptions([
            {
                label: '宇宙第一可爱',
                description: '不想被踢的话请选这个噢♥️',
                value: 'true',
                emoji: '♥️',
            },
            {
                label: '不可爱',
                description: '你想退出公会吗？',
                value: 'false',
                emoji: '💀',
            },
        ]));
        yield interaction.reply({ content: '我可爱吗？', components: [row] });
        const collector = (_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.createMessageComponentCollector({
            filter: (interact2) => {
                if (interact2.customId === menuId)
                    return true;
                return false;
            },
            time: 1000 * 60
        });
        if (!collector)
            return;
        collector.on('collect', (interact2) => {
            reply(interact2);
        });
        collector.on('end', (interact2) => {
            interaction.editReply({ content: '不想问了！', components: [] });
        });
        function reply(fbInteraction) {
            if (fbInteraction.values[0] === 'true') {
                fbInteraction.reply(`${fbInteraction.user} 乖 ♥️`);
            }
            else if (fbInteraction.values[0] === 'false') {
                fbInteraction.reply(`${fbInteraction.user} 拜拜 💀`);
            }
        }
    });
}
//# sourceMappingURL=menu.js.map