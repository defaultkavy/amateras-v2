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
    return __awaiter(this, void 0, void 0, function* () {
        if (!amateras.players) {
            interaction.reply({ content: '命令无法使用：资料库不存在。', ephemeral: true });
            return;
        }
        const options = interaction.options.data;
        switch (options[0].name) {
            case 'edit':
                if (options[0].options) {
                    const player = yield amateras.players.fetch(interaction.user.id);
                    for (const subcmd of options[0].options) {
                        switch (subcmd.name) {
                            case 'intro':
                                if (typeof subcmd.value !== 'string')
                                    return;
                                player.description = subcmd.value;
                                break;
                            case 'color':
                                if (typeof subcmd.value !== 'string')
                                    return;
                                player.color = subcmd.value;
                                break;
                            case 'twitter':
                                if (typeof subcmd.value !== 'string')
                                    return;
                                player.twitter = subcmd.value;
                                break;
                            case 'youtube':
                                if (typeof subcmd.value !== 'string')
                                    return;
                                player.youtube = subcmd.value;
                                break;
                            case 'aka':
                                if (typeof subcmd.value !== 'string')
                                    return;
                                player.aka = subcmd.value;
                        }
                    }
                    yield player.save();
                    interaction.reply({ content: '个人简介已更新。', ephemeral: true });
                }
                else {
                    interaction.reply({ content: '请选择输入选项。', ephemeral: true });
                }
                break;
            case 'info':
                if (interaction.guild) {
                    let player, share = false;
                    if (options[0].options) {
                        for (const subcmd of options[0].options) {
                            switch (subcmd.name) {
                                case 'user':
                                    if (typeof subcmd.value !== 'string')
                                        return;
                                    player = yield amateras.players.fetch(subcmd.value);
                                    break;
                                case 'share':
                                    if (typeof subcmd.value !== 'boolean')
                                        return;
                                    share = subcmd.value;
                                    break;
                            }
                        }
                        if (!player)
                            player = yield amateras.players.fetch(interaction.user.id);
                    }
                    else {
                        if (!player)
                            player = yield amateras.players.fetch(interaction.user.id);
                    }
                    if (player) {
                        player.sendInfo(interaction, share);
                    }
                }
                else {
                    console.error('interaction.guild is not defined. player.js => execute()');
                }
                break;
        }
    });
}
//# sourceMappingURL=player.js.map