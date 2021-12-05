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
function lobby(interact, amateras) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        let lobby;
        let currentLobby;
        let _guild;
        if (interact.guild) {
            _guild = amateras.guilds.cache.get(interact.guild.id);
            if (_guild) {
                lobby = yield ((_a = _guild.lobby) === null || _a === void 0 ? void 0 : _a.fetch(interact.user.id));
                currentLobby = yield ((_b = _guild.lobby) === null || _b === void 0 ? void 0 : _b.fetchByCategory((_c = interact.channel.parent) === null || _c === void 0 ? void 0 : _c.id));
            }
            else
                return;
        }
        for (const subcmd0 of interact.options.data) {
            switch (subcmd0.name) {
                case 'create':
                    if (lobby && lobby.state === 'OPEN') {
                        interact.reply({ content: '你只能创建一个房间！', ephemeral: true });
                        return;
                    }
                    if ((yield _guild.lobby.create(interact.user.id)) === 101) {
                        interact.reply({ content: '你需要权限', ephemeral: true });
                    }
                    else {
                        interact.reply({ content: '房间已创建！找找频道列表中有没有你的名字~', ephemeral: true });
                    }
                    break;
                case 'close':
                    if (!lobby)
                        return interact.reply({ content: '你没有创建房间', ephemeral: true });
                    interact.reply({ content: '房间已关闭', ephemeral: true });
                    yield (lobby === null || lobby === void 0 ? void 0 : lobby.close());
                    break;
                case 'invite':
                    if (!subcmd0.options) {
                        interact.reply({ content: '请输入必要参数。', ephemeral: true });
                        return;
                    }
                    let userId = '';
                    for (const subcmd1 of subcmd0.options) {
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
                    break;
                case 'exit':
                    if (!currentLobby)
                        return interact.reply({ content: '你不在房间频道内', ephemeral: true });
                    interact.reply({ content: '正在退出', ephemeral: true });
                    yield currentLobby.removeMember(interact.user.id);
            }
        }
    });
}
exports.default = lobby;
//# sourceMappingURL=lobby.js.map