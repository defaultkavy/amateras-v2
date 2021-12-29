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
function lobby_close(interact, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!interact.guild)
            return;
        const _guild = amateras.guilds.cache.get(interact.guild.id);
        if (!_guild)
            return console.error('_guild is' + _guild);
        const lobby = yield _guild.lobby.fetch(interact.user.id);
        if (lobby === 101 || lobby === 404)
            return interact.reply({ content: '房间不存在。', ephemeral: true });
        yield lobby.close();
        interact.reply({ content: '房间已关闭~', ephemeral: true });
        _guild.log.send(`${yield _guild.log.name(interact.user.id)} 关闭了房间`);
    });
}
exports.default = lobby_close;
//# sourceMappingURL=lobby_close.js.map