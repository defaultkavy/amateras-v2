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
function lobby_create(interact, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        const footer = interact.message.embeds[0].footer;
        if (!footer || footer.text !== interact.user.id) {
            interact.reply({ content: '你无法更改别人的形象。', ephemeral: true });
            return;
        }
        const player = yield amateras.players.fetch(interact.user.id);
        const message = yield interact.channel.messages.fetch(interact.message.id);
        const comp = message.components;
        const action = new discord_js_1.MessageActionRow;
        const select = new discord_js_1.MessageSelectMenu;
        select.placeholder = '选择你的文件夹';
        select.customId = interact.id + '_v_set_default_folder_select';
        for (const folder of player.v.imageFolders.folders.values()) {
            select.addOptions({
                label: folder.name ? folder.name : '未命名',
                description: `${folder.id} - ${folder.images.size}张图片`,
                value: folder.id
            });
        }
        action.addComponents(select);
        message.edit({ components: [action] });
        interact.deferUpdate();
        const collector = message.channel.createMessageComponentCollector({
            time: 1000 * 60,
            filter: (interact2) => {
                if (interact2.user.id === player.id) {
                    if (interact2.message.id === interact.message.id &&
                        interact2.customId === select.customId)
                        return true;
                    return false;
                }
                else
                    return false;
            }
        });
        collector.on('collect', (interact2) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const set = (_a = player.v) === null || _a === void 0 ? void 0 : _a.imageFolders.setDefault(interact2.values[0]);
            if (!set) {
                interact2.reply({ content: '文件夹不存在', ephemeral: true });
                return;
            }
            const image = set.images.entries().next().value[1];
            yield message.edit({ embeds: [yield player.v.infoEmbed(set, image)], components: comp });
            interact2.deferUpdate();
        }));
    });
}
exports.default = lobby_create;
//# sourceMappingURL=v_set_default_folder.js.map