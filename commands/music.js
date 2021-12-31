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
function execute(interact, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!interact.guild)
            return;
        const _guild = amateras.guilds.cache.get(interact.guild.id);
        if (!_guild)
            return;
        const player = yield amateras.players.fetch(interact.user.id);
        if (player === 404)
            return;
        const member = yield interact.guild.members.fetch(interact.user.id);
        if (!member)
            return;
        const channel = member.voice.channel;
        if (!channel)
            return;
        for (const subcmd0 of interact.options.data) {
            switch (subcmd0.name) {
                case 'play':
                    if (!subcmd0.options)
                        return;
                    var url = undefined;
                    for (const subcmd1 of subcmd0.options) {
                        switch (subcmd1.name) {
                            case 'url':
                                url = subcmd1.value;
                                break;
                        }
                    }
                    if (!url)
                        return;
                    const music = yield amateras.musics.add(url);
                    if (!(music instanceof Music_1.Music))
                        return;
                    yield _guild.musicPlayer.addSong({
                        music: music,
                        channel: channel,
                        player: player
                    });
                    _guild.musicPlayer.control.play();
                    interact.reply('play');
                    break;
                case 'next':
                    _guild.musicPlayer.control.next();
                    interact.reply('next');
                    break;
                case 'prev':
                    _guild.musicPlayer.control.prev();
                    interact.reply('prev');
                    break;
                case 'stop':
                    _guild.musicPlayer.control.stop();
                    interact.reply('stop');
                    break;
                case 'random':
                    yield _guild.musicPlayer.random(player, channel);
                    _guild.musicPlayer.control.play();
                    interact.reply('random');
                    break;
            }
        }
    });
}
exports.default = execute;
//# sourceMappingURL=music.js.map