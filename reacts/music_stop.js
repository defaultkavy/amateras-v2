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
const lang_json_1 = require("../lang.json");
function music_stop(interact, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        const player = yield amateras.players.fetch(interact.user.id);
        if (player === 404)
            return;
        if (!interact.guild)
            return;
        const _guild = amateras.guilds.cache.get(interact.guild.id);
        if (!_guild)
            return;
        const lang = _guild.lang;
        const member = yield interact.guild.members.fetch(interact.user.id);
        if (!member)
            return;
        if (!member.voice.channel)
            return interact.reply({ content: lang_json_1._music_button_.not_in_voice[lang], ephemeral: true });
        if (_guild.musicPlayer.state === 'STOPPED')
            return interact.reply({ content: lang_json_1._music_button_.is_stoped[lang], ephemeral: true });
        interact.deferUpdate();
        yield _guild.musicPlayer.control.stop();
        _guild.musicPlayer.notify.push(player, lang_json_1._music_button_.stop[lang], 3000);
    });
}
exports.default = music_stop;
//# sourceMappingURL=music_stop.js.map