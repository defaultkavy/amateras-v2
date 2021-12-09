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
const terminal_1 = require("../lib/terminal");
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
            //Reward
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
            //Forum
            if (_guild && _guild.forums) {
                const forum = _guild.forums.cache.get(message.channel.id);
                if (forum && message.channel.type === "GUILD_TEXT") {
                    let content = '';
                    if (message.cleanContent) {
                        content = message.cleanContent;
                    }
                    else if (message.attachments.first()) {
                        content = Array.from(message.attachments)[0][1].name;
                    }
                    const name = (0, terminal_1.wordCounter)(content, 20);
                    yield message.channel.threads.create({
                        name: name,
                        autoArchiveDuration: 1440,
                        startMessage: message
                    });
                }
            }
        });
    }
};
//# sourceMappingURL=messageCreate.js.map