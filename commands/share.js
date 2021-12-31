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
function execute(interact, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        // Filter
        for (const subcmd0 of interact.options.data) {
            // First sub-command
            // Command values capture
            let value = {
                url: ''
            };
            switch (subcmd0.name) {
                case 'url':
                    value.url = subcmd0.value;
                    break;
            }
            // Check url is fill
            if (value.url.length > 0) {
                // Check url is discord message link
                const path = /https:\/\/discord.com\/channels\//;
                const snowflakes = value.url.replace(path, '').split('/');
                const guildId = snowflakes[0];
                const channelId = snowflakes[1];
                const messageId = snowflakes[2];
                if (!path.test(value.url))
                    return;
                const _guild = amateras.guilds.cache.get(guildId);
                if (!_guild)
                    return interact.reply({ content: '无法找到此讯息的来源伺服器', ephemeral: true });
                const _channel = yield _guild.channels.fetch(channelId);
                if (_channel === 404 || _channel === 101)
                    return interact.reply({ content: '无法读取频道', ephemeral: true });
                if (_channel.get.type !== 'GUILD_TEXT')
                    return interact.reply({ content: '无效的频道类型', ephemeral: true });
                // Check channel is forum
                const forum = yield _guild.forums.fetch(_channel.id);
                if (forum === 404)
                    return interact.reply({ content: '该频道不是论坛', ephemeral: true });
                if (forum.state === 'CLOSED')
                    return interact.reply({ content: '该频道论坛模式已关闭', ephemeral: true });
                try {
                    const message = yield _channel.get.messages.fetch(messageId);
                    if (!message)
                        return interact.reply('讯息不存在');
                    // Everything pass
                    return interact.reply({ content: forum.share(message), files: message.attachments.toJSON(), allowedMentions: { parse: [] } });
                }
                catch (_a) {
                    return interact.reply({ content: '讯息不存在', ephemeral: true });
                }
            }
        }
    });
}
exports.default = execute;
//# sourceMappingURL=share.js.map