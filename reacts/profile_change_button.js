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
function profile_change_button(interact, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = interact.message.embeds[0].footer.text;
        const player = yield amateras.players.fetch(id);
        if (player === 404)
            return;
        const message = yield interact.channel.messages.fetch(interact.message.id);
        let embed;
        const action = new discord_js_1.MessageActionRow;
        const button = new discord_js_1.MessageButton;
        if (message.embeds[0].author && message.embeds[0].author.name === 'Player') {
            if (!player.v)
                return interact.deferUpdate();
            embed = player.v.infoEmbed();
            button.label = '切换到 Player';
            button.style = 'PRIMARY';
            button.customId = '#profile_change_button';
        }
        else if (message.embeds[0].author && message.embeds[0].author.name === 'VTuber') {
            embed = yield player.infoEmbed(interact);
            button.label = '切换到 VTuber';
            button.style = 'PRIMARY';
            button.customId = '#profile_change_button';
        }
        else
            return;
        action.addComponents(button);
        if (typeof embed === 'number')
            return interact.deferUpdate();
        message.edit({ embeds: [embed], components: [action] });
        interact.deferUpdate();
    });
}
exports.default = profile_change_button;
//# sourceMappingURL=profile_change_button.js.map