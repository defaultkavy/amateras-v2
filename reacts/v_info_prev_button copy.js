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
function v_info_prev_button(interact, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        const footer = interact.message.embeds[0].footer;
        if (!footer || footer.text !== interact.user.id) {
            interact.reply({ content: '你无法更改别人的形象。', ephemeral: true });
            return;
        }
        const player = yield amateras.players.fetch(interact.user.id);
        const message = yield interact.channel.messages.fetch(interact.message.id);
        const embed = message.embeds[0];
        const folder = player.v.imageFolders.folders.get(embed.fields[embed.fields.length - 2].value);
        if (!folder) {
            // folder not found
            return;
        }
        let i = +embed.fields[embed.fields.length - 1].value.split('/')[0];
        console.debug(i);
        const imageId = Array.from(folder.images.keys());
        console.debug(imageId);
        if (i === 1) {
            i = imageId.length;
        }
        else
            i -= 1;
        const image = folder.images.get(imageId[i - 1]);
        console.debug(image);
        yield message.edit({ embeds: [yield player.v.infoEmbed(folder, image)], components: message.components });
        interact.deferUpdate();
    });
}
exports.default = v_info_prev_button;
//# sourceMappingURL=v_info_prev_button%20copy.js.map