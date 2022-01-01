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
function music_repeat(interact, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        const player = yield amateras.players.fetch(interact.user.id);
        if (player === 404)
            return;
        if (!interact.guild)
            return;
        const _guild = amateras.guilds.cache.get(interact.guild.id);
        if (!_guild)
            return;
        const member = yield interact.guild.members.fetch(interact.user.id);
        if (!member)
            return;
        if (!member.voice.channel)
            return interact.reply({ content: `你必须在一个语音频道内`, ephemeral: true });
        const result = _guild.musicPlayer.control.repeat();
        interact.deferUpdate();
        if (result === 'ALL') {
            _guild.musicPlayer.notify.push(player, `曲列循环`, 3000);
        }
        else if (result === 'ONE') {
            _guild.musicPlayer.notify.push(player, `单曲循环`, 3000);
        }
        else {
            _guild.musicPlayer.notify.push(player, `关闭循环`, 3000);
        }
    });
}
exports.default = music_repeat;
//# sourceMappingURL=music_repeat.js.map