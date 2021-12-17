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
function v_info_page_button(interact, amateras, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const footer = interact.message.embeds[0].footer;
        if (!footer || footer.text !== interact.user.id) {
            interact.reply({ content: '你无法更改别人的形象。', ephemeral: true });
            return;
        }
        const player = yield amateras.players.fetch(interact.user.id);
        if (player === 404)
            return;
        const param = interact.customId.split('#')[0];
        const folderId = param.split('$')[0];
        let message = undefined;
        if (!options)
            message = yield interact.channel.messages.fetch(interact.message.id);
        const comp = options ? options.messageEle.comp : message.components;
        const folder = player.v.imageFolders.folders.get(folderId);
        if (!folder) {
            // folder not found
            return;
        }
        const page = param.split('$')[1];
        let i = +page;
        const imageId = Array.from(folder.images.keys());
        const customId = interact.customId.split('#')[1];
        if (customId !== 'v_info_next_button') {
            if (i === 1) {
                i = imageId.length;
            }
            else
                i -= 1;
        }
        else {
            if (i === imageId.length) {
                i = 1;
            }
            else
                i += 1;
        }
        const image = folder.images.get(imageId[i - 1]);
        comp[1].components[1].customId = `${folderId}$${i}` + '#v_info_next_button';
        comp[1].components[0].customId = `${folderId}$${i}` + '#v_info_prev_button';
        if (message)
            yield message.edit({ embeds: [], components: comp });
        else
            yield options.interactOld.editReply({ embeds: [], components: comp });
        interact.deferUpdate();
    });
}
exports.default = v_info_page_button;
//# sourceMappingURL=v_info_page_button.js.map