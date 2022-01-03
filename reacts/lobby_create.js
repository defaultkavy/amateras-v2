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
function lobby_create(interact, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            interact.deferReply({ ephemeral: true });
            if (!interact.guild)
                return;
            const _guild = amateras.guilds.cache.get(interact.guild.id);
            if (!_guild)
                return console.error('_guild is' + _guild);
            if (!_guild.lobby.enabled)
                return interact.followUp({ content: '房间系统尚未开启', ephemeral: true });
            const lobby = _guild.lobby.cache.get(interact.user.id);
            if (lobby && lobby.state === 'OPEN') {
                interact.followUp({ content: '你只能创建一个房间！', ephemeral: true });
                return;
            }
            const createLobby = yield _guild.lobby.create(interact.user.id);
            if (createLobby === 101) {
                interact.followUp({ content: '你需要权限', ephemeral: true });
            }
            else {
                interact.followUp({ content: `房间已创建！点击这里跳转到你的房间：${createLobby.textChannel}`, ephemeral: true });
            }
        }
        catch (err) {
            console.debug(err);
        }
    });
}
exports.default = lobby_create;
//# sourceMappingURL=lobby_create.js.map