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
function v_set_folder_button(interact, amateras, options) {
    return __awaiter(this, void 0, void 0, function* () {
        console.debug(1);
        const footer = interact.message.embeds[0].footer;
        if (!footer || footer.text !== interact.user.id) {
            interact.reply({ content: '你无法更改别人的形象。', ephemeral: true });
            return;
        }
        const player = yield amateras.players.fetch(interact.user.id);
        if (player === 404)
            return;
        let message = undefined;
        if (!options)
            message = yield interact.channel.messages.fetch(interact.message.id);
        const comp = message ? message.components : options === null || options === void 0 ? void 0 : options.messageEle.comp;
        const action = new discord_js_1.MessageActionRow;
        const select = new discord_js_1.MessageSelectMenu;
        select.placeholder = '选择你的文件夹';
        select.customId = interact.id + '_v_set_default_folder_select';
        if (player.v.imageFolders.folders.size === 0)
            return interact.reply({ content: `Error: Folder not exist`, ephemeral: true });
        for (const folder of player.v.imageFolders.folders.values()) {
            select.addOptions({
                label: folder.name ? folder.name : '未命名',
                description: `${folder.id} - ${folder.images.size}张图片`,
                value: folder.id
            });
        }
        action.addComponents(select);
        console.debug(action);
        if (message)
            message.edit({ components: [action] });
        else if (options)
            options.interactOld.editReply({ components: [action] });
        interact.deferUpdate();
        const collector = interact.channel.createMessageComponentCollector({
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
        let status = 0;
        collector.on('collect', (interact2) => __awaiter(this, void 0, void 0, function* () {
            let set;
            const guild = amateras.guilds.cache.get(interact.guild.id);
            if (!guild)
                return console.error('guild is ' + guild);
            const channel = interact.channel;
            const lobby = yield guild.lobby.fetchByCategory(channel.parent.id);
            if (interact.customId === '#v_set_default_folder')
                set = yield player.v.imageFolders.setDefault(interact2.values[0]);
            if (interact.customId === '#v_set_once_folder') {
                if (!lobby)
                    return console.error('lobby is ' + lobby);
                set = yield lobby.setFolder(interact.user.id, interact2.values[0]);
            }
            if (!set) {
                interact2.reply({ content: '文件夹不存在', ephemeral: true });
                return;
            }
            if (lobby) {
                set = lobby.vFolder.get(interact.user.id);
                if (!set) {
                    set = player.v.imageFolders.default;
                }
            }
            const image = set.images.entries().next().value ? set.images.entries().next().value[1] : undefined;
            if (!image) {
                interact2.reply({ content: '文件夹中没有图片', ephemeral: true });
                return;
            }
            comp[1].components[1].customId = `${set.id}$${set.toArray().indexOf(image) + 1}` + '#v_info_next_button';
            comp[1].components[0].customId = `${set.id}$${set.toArray().indexOf(image) + 1}` + '#v_info_prev_button';
            if (message)
                yield message.edit({ embeds: [], components: comp });
            else if (options)
                options.interactOld.editReply({ embeds: [], components: comp });
            interact2.deferUpdate();
            status = 1;
        }));
        collector.on('end', (collection) => __awaiter(this, void 0, void 0, function* () {
            if (status === 0) {
                if (message)
                    message.edit({ components: comp });
                else if (options)
                    options.interactOld.editReply({ components: [] });
            }
        }));
    });
}
exports.default = v_set_folder_button;
//# sourceMappingURL=v_set_folder_button.js.map