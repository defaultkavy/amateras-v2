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
    return __awaiter(this, void 0, void 0, function* () {
        const row = new discord_js_1.MessageActionRow();
        const b1 = new discord_js_1.MessageButton()
            .setCustomId('meow')
            .setLabel('点我？')
            .setStyle('PRIMARY');
        const b2 = new discord_js_1.MessageButton()
            .setLabel('这是个链接！')
            .setStyle('LINK')
            .setURL('https://isekai.live');
        row.components.push(b1);
        row.components.push(b2);
        yield interaction.reply({ content: `点一个！`, components: [row] });
        amateras.buttons.addButton(b1, yield interaction.fetchReply(), meow);
        function meow(buttonInteraction) {
            buttonInteraction.reply(`${interaction.user} 喵！`);
            amateras.buttons.clearButton(buttonInteraction.message);
        }
    });
}
//# sourceMappingURL=button.js.map