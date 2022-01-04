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
const Music_1 = require("../lib/Music");
module.exports = {
    name: 'messageCreate',
    once: false,
    execute(message, amateras) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.system || message.author.bot || !message.guild)
                return;
            const player = yield amateras.players.fetch(message.author.id);
            if (player === 404)
                return;
            const _guild = amateras.guilds.cache.get(message.guild.id);
            if (_guild && _guild.ready === false)
                return;
            // Reward
            const reward = player.rewards.get('message');
            if (reward)
                reward.add();
            if (message.type === 'REPLY') {
                const repliedMessage = yield message.channel.messages.fetch(message.reference.messageId);
                if (message.author.id === repliedMessage.author.id)
                    return;
                const repliedPlayer = yield amateras.players.fetch(repliedMessage.author.id);
                if (repliedPlayer === 404)
                    return;
                const repliedReward = repliedPlayer.rewards.get('replied');
                if (repliedReward)
                    repliedReward.add();
            }
            // Forum
            if (!amateras.ready)
                return;
            if (_guild && _guild.forums) {
                const forum = _guild.forums.cache.get(message.channel.id);
                if (forum)
                    forum.post(message);
            }
            // Music
            if (_guild && _guild.musicPlayer.channel) {
                if (!amateras.ready) {
                    if (!message.deleted)
                        message.delete();
                    _guild.musicPlayer.notify.push(player, `天照进入休眠中，无法播放歌曲`, 3000);
                    return;
                }
                if (_guild.musicPlayer.channel.id === message.channelId) {
                    if (!message.deleted)
                        message.delete();
                    const music = yield _guild.musicPlayer.link(message, player);
                    if (music instanceof Music_1.Music) {
                        _guild.musicPlayer.notify.push(player, `添加了歌曲 - ${music.title}`, 3000);
                    }
                    else {
                        _guild.musicPlayer.notify.push(player, `链接错误`, 3000);
                    }
                }
            }
        });
    }
};
//# sourceMappingURL=messageCreate.js.map