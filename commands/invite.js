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
function invite(interact, amateras) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let lobby;
        if (interact.guild) {
            const guild = amateras.guilds.cache.get(interact.guild.id);
            if (guild) {
                lobby = yield ((_a = guild.lobby) === null || _a === void 0 ? void 0 : _a.fetch(interact.user.id));
            }
            else
                return;
        }
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
        if (!lobby)
            return interact.reply({ content: '你没有创建房间', ephemeral: true });
        yield lobby.addMember(userId);
        interact.reply({ content: '已邀请', ephemeral: true });
    });
}
exports.default = invite;
//# sourceMappingURL=invite.js.map