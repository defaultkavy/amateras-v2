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
function music_like(interact, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        const player = yield amateras.players.fetch(interact.user.id);
        if (player === 404)
            return;
        if (!interact.guild)
            return;
        const _guild = amateras.guilds.cache.get(interact.guild.id);
        if (!_guild)
            return;
        const current = _guild.musicPlayer.queue[0];
        if (!current)
            return interact.reply({ content: `操作无效`, ephemeral: true });
        const playerMusic = yield player.musics.add(current.music);
        const result = yield playerMusic.setLike();
        interact.deferUpdate();
        if (result === 100) {
            _guild.musicPlayer.notify.push(player, '加入了收藏', 3000);
            return;
        }
        else {
            playerMusic.unsetLike();
            _guild.musicPlayer.notify.push(player, '从收藏中移除', 3000);
        }
    });
}
exports.default = music_like;
//# sourceMappingURL=music_like.js.map