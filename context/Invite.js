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
function Invite(interact, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!interact.guild)
            return;
        const _guild = amateras.guilds.cache.get(interact.guild.id);
        if (!_guild)
            return;
        if (!_guild.lobby) {
            return;
        }
        const lobby = yield _guild.lobby.fetch(interact.user.id);
        if (lobby === 101 || lobby === 404)
            return interact.reply({ content: '你还没创建房间！', ephemeral: true });
        if (lobby.state === 'OPEN') {
            if (lobby.member.has(interact.targetId)) {
                lobby.removeMember(interact.targetId);
                interact.reply({ content: (yield _guild.get.members.fetch(interact.targetId)).displayName + '从你的房间成员名单移除了。', ephemeral: true });
                return;
            }
            else {
                lobby.addMember(interact.targetId);
                interact.reply({ content: (yield _guild.get.members.fetch(interact.targetId)).displayName + '加入了你的房间成员名单。', ephemeral: true });
                return;
            }
        }
    });
}
exports.default = Invite;
//# sourceMappingURL=Invite.js.map