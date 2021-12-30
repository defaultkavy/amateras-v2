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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _MusicPlayer_amateras, _MusicPlayer_collection, _MusicPlayer__guild, _MusicPlayer_data;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicPlayer = void 0;
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const Track_1 = require("./Track");
const Music_1 = require("./Music");
const PlayerMusic_1 = require("./PlayerMusic");
const terminal_1 = require("./terminal");
class MusicPlayer {
    constructor(_guild, amateras) {
        _MusicPlayer_amateras.set(this, void 0);
        _MusicPlayer_collection.set(this, void 0);
        _MusicPlayer__guild.set(this, void 0);
        _MusicPlayer_data.set(this, void 0);
        __classPrivateFieldSet(this, _MusicPlayer_amateras, amateras, "f");
        __classPrivateFieldSet(this, _MusicPlayer_collection, amateras.db.collection('music_player'), "f");
        __classPrivateFieldSet(this, _MusicPlayer__guild, _guild, "f");
        this.id = _guild.id;
        this.enabled = false;
        this.queue = [];
        this.prevQueue = [];
        this.state = 'STOPPED';
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield __classPrivateFieldGet(this, _MusicPlayer_collection, "f").findOne({ id: this.id });
            if (data) {
                __classPrivateFieldSet(this, _MusicPlayer_data, data, "f");
            }
            yield this.initMusicChannel();
            yield this.initMessage();
        });
    }
    initMusicChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _MusicPlayer_data, "f") && __classPrivateFieldGet(this, _MusicPlayer_data, "f").channel) {
                try {
                    const musicChannel = yield __classPrivateFieldGet(this, _MusicPlayer__guild, "f").get.channels.fetch(__classPrivateFieldGet(this, _MusicPlayer_data, "f").channel);
                    if (musicChannel && musicChannel.type === 'GUILD_TEXT') {
                        this.channel = musicChannel;
                        this.enabled = true;
                    }
                    else {
                        this.channel = undefined;
                        this.enabled = false;
                        yield this.save();
                    }
                }
                catch (_a) {
                    this.channel = undefined;
                    this.enabled = false;
                    yield this.save();
                }
            }
        });
    }
    initMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.channel) {
                if (__classPrivateFieldGet(this, _MusicPlayer_data, "f") && __classPrivateFieldGet(this, _MusicPlayer_data, "f").message) {
                    try {
                        const message = yield this.channel.messages.fetch(__classPrivateFieldGet(this, _MusicPlayer_data, "f").message);
                        if (message) {
                            this.message = message;
                            yield this.message.edit({ embeds: [this.embed()], components: this.components() });
                        }
                        else {
                            this.message = yield this.channel.send({ embeds: [this.embed()], components: this.components() });
                            yield this.save();
                        }
                    }
                    catch (err) {
                        this.message = yield this.channel.send({ embeds: [this.embed()], components: this.components() });
                        yield this.save();
                    }
                }
                else {
                    this.message = yield this.channel.send({ embeds: [this.embed()], components: this.components() });
                    yield this.save();
                }
            }
        });
    }
    embed() {
        let embed = {};
        if (this.queue[0] && this.audioPlayer) {
            const music = this.queue[0].music;
            embed = {
                author: {
                    name: music.author ? music.author.name : undefined,
                    url: music.author ? music.author.url : undefined,
                    iconURL: music.author ? music.author.avatar : undefined
                },
                color: this.state === 'PLAYING' ? 'GREEN' : this.state === 'PAUSE' ? 'DARKER_GREY' : 'DARK_BUT_NOT_BLACK',
                title: music.title,
                description: `${this.queue[0].player.mention()} 点了这首歌`,
                thumbnail: {
                    height: music.thumbnail ? music.thumbnail.height : undefined,
                    width: music.thumbnail ? music.thumbnail.height : undefined,
                    url: music.thumbnail ? music.thumbnail.url : undefined
                },
                fields: [
                    {
                        name: `天照已播放过这首歌 ${music.plays} 次`,
                        value: `曾有 ${music.players} 人播放过这首歌`
                    }
                ]
            };
        }
        else {
            embed = {
                author: {
                    name: `天照音乐`
                },
                color: 'DARK_BUT_NOT_BLACK',
                title: `没有播放的曲目`,
                description: `在此频道发送 YouTube Music 链接即可播放音乐`
            };
        }
        return embed;
    }
    components() {
        const actionRow1 = new discord_js_1.MessageActionRow;
        actionRow1.addComponents({
            label: `播放`,
            style: `PRIMARY`,
            customId: `music_play`,
            disabled: this.state === 'PLAYING' ? true : false,
            type: 'BUTTON'
        });
        actionRow1.addComponents({
            label: `暂停`,
            style: `SECONDARY`,
            customId: `music_pause`,
            disabled: this.state === 'STOPPED' ? true : false,
            type: 'BUTTON'
        });
        actionRow1.addComponents({
            label: `停止`,
            style: `SECONDARY`,
            customId: `music_stop`,
            disabled: this.state === 'STOPPED' ? true : false,
            type: 'BUTTON'
        });
        const actionRow2 = new discord_js_1.MessageActionRow;
        actionRow2.addComponents({
            label: `上首`,
            style: `SECONDARY`,
            customId: `music_prev`,
            disabled: this.prevQueue[0] ? false : true,
            type: 'BUTTON'
        });
        actionRow2.addComponents({
            label: `下首`,
            style: `SECONDARY`,
            customId: `music_next`,
            disabled: this.queue[1] ? false : true,
            type: 'BUTTON'
        });
        actionRow2.addComponents({
            label: ``,
            style: `DANGER`,
            customId: `music_like`,
            emoji: `🤍`,
            disabled: this.queue[0] ? false : true,
            type: 'BUTTON'
        });
        return [actionRow1, actionRow2];
    }
    initAudioPlayer() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.audioPlayer) {
                this.audioPlayer = (0, voice_1.createAudioPlayer)({
                    behaviors: {
                        noSubscriber: voice_1.NoSubscriberBehavior.Pause
                    }
                });
                // Set listener when song is end
                this.audioPlayer.on('stateChange', (oldState, newState) => {
                    if (this.state === 'CHANGING') {
                        this.play();
                        return;
                    }
                    if (oldState.status === voice_1.AudioPlayerStatus.Playing) {
                        if (newState.status === voice_1.AudioPlayerStatus.Idle || newState.status === 'autopaused') {
                            this.next();
                        }
                    }
                });
                this.audioPlayer.on('error', (err) => {
                    console.error(err);
                    this.next();
                });
            }
        });
    }
    /**
     * @returns 100 - Success
     * @returns 101 - Already joined
     */
    join(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                if (this.connection && this.connection.state.status === 'ready')
                    return resolve(101);
                this.connection = (0, voice_1.joinVoiceChannel)({
                    channelId: channel.id,
                    guildId: __classPrivateFieldGet(this, _MusicPlayer__guild, "f").id,
                    adapterCreator: channel.guild.voiceAdapterCreator
                });
                this.connection.once(voice_1.VoiceConnectionStatus.Ready, () => {
                    return resolve(100);
                });
            });
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (0, terminal_1.cloneObj)(this, ['queue', 'prevQueue', 'audioPlayer', 'connection']);
            data.channel = this.channel ? this.channel.id : undefined;
            data.message = this.message ? this.message.id : undefined;
            const find = yield __classPrivateFieldGet(this, _MusicPlayer_collection, "f").findOne({ id: __classPrivateFieldGet(this, _MusicPlayer__guild, "f").id });
            if (find) {
                yield __classPrivateFieldGet(this, _MusicPlayer_collection, "f").replaceOne({ id: __classPrivateFieldGet(this, _MusicPlayer__guild, "f").id }, data);
            }
            else {
                yield __classPrivateFieldGet(this, _MusicPlayer_collection, "f").insertOne(data);
            }
        });
    }
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.queue[0])
                return this.stop();
            // Init audio player
            yield this.initAudioPlayer();
            // If audio player is playing, return
            if (this.audioPlayer && this.audioPlayer.state.status === 'playing')
                return;
            // Join voice channel
            yield this.join(this.queue[0].channel);
            // Check connection and audio player is valid
            if (!this.connection || !this.audioPlayer)
                return;
            // Subscribe audio player to voice connection
            this.connection.subscribe(this.audioPlayer);
            //const info = await ytdl.getInfo(this.queue[0].music.url)
            if (!this.queue[0])
                return;
            this.queue[0].resource = (0, ytdl_core_1.default)(this.queue[0].music.url); //, {format: ytdl.chooseFormat(info.formats, { quality: '140' })}) //
            const resource = (0, voice_1.createAudioResource)(this.queue[0].resource);
            // Play
            this.audioPlayer.play(resource);
            this.state = 'PLAYING';
            this.initMessage();
        });
    }
    next() {
        if (!this.queue[1])
            return this.stop();
        const endTrack = this.queue.shift();
        if (!endTrack)
            return;
        this.prevQueue.unshift(endTrack);
        this.state = 'CHANGING';
        if (this.audioPlayer) {
            if (this.audioPlayer.state.status === 'idle') {
                this.play();
            }
            else {
                this.audioPlayer.stop();
            }
        }
        // Listener
    }
    prev() {
        if (!this.prevQueue[0])
            return;
        const prevTrack = this.prevQueue.shift();
        if (!prevTrack)
            return;
        this.queue.unshift(prevTrack);
        this.state = 'CHANGING';
        if (this.audioPlayer) {
            this.audioPlayer.stop();
        }
        else {
            this.play();
        }
        // Listener
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            const endTrack = this.queue.shift();
            if (!endTrack)
                return;
            this.prevQueue.unshift(endTrack);
            if (!this.audioPlayer)
                return;
            this.audioPlayer.stop();
            this.audioPlayer = undefined;
            if (!this.connection)
                return;
            this.connection.destroy();
            this.state = 'STOPPED';
            this.queue = [];
            yield this.initMessage();
        });
    }
    pause() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.audioPlayer)
                return;
            this.audioPlayer.pause();
            this.state = 'PAUSE';
            yield this.initMessage();
        });
    }
    resume() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.audioPlayer)
                return;
            if (this.audioPlayer.state.status === voice_1.AudioPlayerStatus.Paused) {
                this.audioPlayer.unpause();
                this.state = 'PLAYING';
                yield this.initMessage();
            }
        });
    }
    addSong(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const track = new Track_1.Track(data, __classPrivateFieldGet(this, _MusicPlayer_amateras, "f"));
            this.queue.push(track);
            // Record to music profile
            yield data.music.record();
            // Record to user profile
            const playerMusic = yield data.player.musics.add(data.music);
            if (playerMusic instanceof PlayerMusic_1.PlayerMusic)
                yield playerMusic.record();
            this.initMessage();
            return track;
        });
    }
    random(player, channel) {
        return __awaiter(this, void 0, void 0, function* () {
            yield player.musics.fetchAll();
            for (const playerMusic of player.musics.getTop()) {
                yield this.addSong({
                    music: playerMusic.music,
                    channel: channel,
                    player: player
                });
            }
        });
    }
    /**
     * @returns 100 - Success
     * @returns 101 - Not a valid url
     * @returns 103 - User not in voice channel
     */
    link(message, player) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ytdl_core_1.default.validateURL(message.content))
                return 101;
            if (!message.member)
                return 102;
            const music = yield __classPrivateFieldGet(this, _MusicPlayer_amateras, "f").musics.add(message.content);
            if (!(music instanceof Music_1.Music))
                return 101;
            if (!message.member.voice.channel)
                return 103;
            yield this.addSong({
                channel: message.member.voice.channel,
                music: music,
                player: player
            });
            this.play();
        });
    }
    /**
     * @returns 101 - Already set
     */
    setup(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.channel && this.channel.id === channel.id)
                return 101;
            this.enabled = true;
            this.channel = channel;
            if (this.message && !this.message.deleted)
                this.message.delete();
            yield this.initMessage();
            yield this.save();
            return this.channel;
        });
    }
    /**
     * @returns 100 - Success
     * @returns 101 - Music channel never set
     * @returns 102 - Not a music channel
     */
    unset(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.channel)
                return 101;
            if (this.channel.id !== channel.id)
                return 102;
            this.enabled = false;
            this.channel = undefined;
            if (this.message && !this.message.deleted)
                this.message.delete();
            yield this.save();
            return 100;
        });
    }
}
exports.MusicPlayer = MusicPlayer;
_MusicPlayer_amateras = new WeakMap(), _MusicPlayer_collection = new WeakMap(), _MusicPlayer__guild = new WeakMap(), _MusicPlayer_data = new WeakMap();
//# sourceMappingURL=MusicPlayer.js.map