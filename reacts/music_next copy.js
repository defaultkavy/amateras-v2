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
function music_pause(interact, amateras) {
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
        if (!_guild.musicPlayer.queue[1])
            return interact.reply({ content: `没有下一首了`, ephemeral: true });
        _guild.musicPlayer.next();
        interact.deferUpdate();
    });
}
exports.default = music_pause;
//# sourceMappingURL=music_next%20copy.js.map