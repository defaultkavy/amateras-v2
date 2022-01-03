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
function kick(interact, amateras) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!interact.guild)
            return;
        const guild = amateras.guilds.cache.get(interact.guild.id);
        if (!guild)
            return;
        const lobby = yield ((_a = guild.lobby) === null || _a === void 0 ? void 0 : _a.fetch(interact.user.id));
        if (lobby === 101 || lobby === 404)
            return interact.reply({ content: '你没有创建房间', ephemeral: true });
        if (!interact.options.data) {
            interact.reply({ content: '请输入必要参数。', ephemeral: true });
            return;
        }
        let userId = '';
        for (const subcmd1 of interact.options.data) {
            if (!subcmd1.value)
                return;
            switch (subcmd1.name) {
                case 'user':
                    userId = subcmd1.value;
                    break;
            }
        }
        const result = yield lobby.removeMember(userId);
        if (result === 101) {
            interact.reply({ content: '对象不在你的房间中', ephemeral: true });
        }
        else {
            guild.log.send(`${yield guild.log.name(interact.user.id)} 将 ${yield guild.log.name(userId)} 移出房间`);
            if (lobby.textChannel && interact.channelId === lobby.textChannel.id) {
                yield interact.deferReply();
                interact.deleteReply();
                return;
            }
            interact.reply({ content: '已移除', ephemeral: true });
        }
    });
}
exports.default = kick;
//# sourceMappingURL=kick.js.map