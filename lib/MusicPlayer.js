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
const terminal_1 = require("./terminal");
const PlayerMusic_1 = require("./PlayerMusic");
const MusicPlayerControl_1 = require("./MusicPlayerControl");
const MusicPlayerNotify_1 = require("./MusicPlayerNotify");
const lang_json_1 = require("../lang.json");
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
        this.control = new MusicPlayerControl_1.MusicPlayerControl(this, amateras);
        this.notify = new MusicPlayerNotify_1.MusicPlayerNotify(this, amateras);
        this.enabled = false;
        this.queue = [];
        this.prevQueue = [];
        this.state = 'STOPPED';
        this.repeatState = 'OFF';
        this.updateQueue = [];
        this.timer = setInterval(this.interval.bind(this), 500); // InitMessage interval
        this.messageUpdating = false;
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
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const lang = __classPrivateFieldGet(this, _MusicPlayer__guild, "f").lang;
            this.messageUpdating = true;
            if (this.channel) {
                const messageOptions = {
                    embeds: [embed.call(this)],
                    components: components.call(this)
                };
                if (this.notify.notifications.length > 0)
                    (_a = messageOptions.embeds) === null || _a === void 0 ? void 0 : _a.unshift(yield this.notify.init());
                if (this.message) {
                    yield this.message.edit(messageOptions);
                    return this.messageUpdating = false;
                }
                if (__classPrivateFieldGet(this, _MusicPlayer_data, "f") && __classPrivateFieldGet(this, _MusicPlayer_data, "f").message) {
                    try {
                        const message = yield this.channel.messages.fetch(__classPrivateFieldGet(this, _MusicPlayer_data, "f").message);
                        if (message) {
                            this.message = message;
                            yield this.message.edit(messageOptions);
                        }
                        else {
                            this.message = yield this.channel.send(messageOptions);
                            yield this.save();
                        }
                    }
                    catch (err) {
                        console.error(err);
                        this.message = yield this.channel.send(messageOptions);
                        yield this.save();
                    }
                }
                else {
                    this.message = yield this.channel.send(messageOptions);
                    yield this.save();
                }
            }
            this.messageUpdating = false;
            function embed() {
                let embed = {};
                if (this.queue[0] && !this.queue[0].music.updated) {
                    embed = {
                        author: {
                            name: lang_json_1.music_message.app_name[lang] // 天照音乐
                        },
                        color: 'NAVY',
                        title: lang_json_1.music_message.loading[lang],
                        description: lang_json_1.music_message.app_hint[lang] // 在此频道发送 YouTube Music 链接即可播放音乐
                    };
                }
                else if (this.queue[0] && this.audioPlayer) {
                    const music = this.queue[0].music;
                    embed = {
                        author: {
                            name: music.author ? music.author.name : undefined,
                            url: music.author ? music.author.url : undefined,
                            iconURL: music.author ? music.author.avatar : undefined
                        },
                        color: this.state === 'PLAYING' ? 'GREEN' : this.state === 'PAUSE' ? 'DARKER_GREY' : 'DARK_BUT_NOT_BLACK',
                        title: music.title,
                        url: music.url,
                        description: `${this.queue[0].player.mention()} ${lang_json_1.music_message.play_song[lang]}`,
                        image: {
                            height: music.thumbnail ? music.thumbnail.height : undefined,
                            width: music.thumbnail ? music.thumbnail.width : undefined,
                            url: music.thumbnail ? music.thumbnail.url : undefined
                        },
                        fields: [
                            {
                                name: `${lang_json_1.music_message.system_played[lang]} ${music.plays} ${lang_json_1.unit.times[lang]}`,
                                value: `${music.players} ${lang_json_1.music_message.user_played[lang]}`,
                                inline: false
                            },
                            {
                                name: lang_json_1.music_message.likes[lang],
                                value: `${music.likes.length} ${lang_json_1.unit.persons[lang]}`,
                                inline: true
                            },
                            {
                                name: lang_json_1.music_message.unlikes[lang],
                                value: `${music.dislikes.length} ${lang_json_1.unit.persons[lang]}`,
                                inline: true
                            },
                            {
                                name: lang_json_1.music_message.player_status[lang],
                                value: `${this.state === 'PLAYING' ? '▶️' : '⏸️'} ${this.repeatState === 'ALL' ? '🔁' : this.repeatState === 'ONE' ? '🔂' : ''} - ${this.repeatState === 'ALL' ? this.queue.length + this.prevQueue.length : this.queue.length} ${lang_json_1.music_message.in_queue[lang]}`,
                                inline: true
                            }
                        ]
                    };
                }
                else {
                    embed = {
                        author: {
                            name: lang_json_1.music_message.app_name[lang]
                        },
                        color: 'DARK_BUT_NOT_BLACK',
                        title: __classPrivateFieldGet(this, _MusicPlayer_amateras, "f").ready ? lang_json_1.music_message.empty_queue[lang] : lang_json_1.log_init.sleeping[lang],
                        description: lang_json_1.music_message.app_hint[lang]
                    };
                }
                return embed;
            }
            function components() {
                const actionRow1 = new discord_js_1.MessageActionRow;
                actionRow1.addComponents({
                    label: lang_json_1.music_message.player_play[lang],
                    style: `PRIMARY`,
                    customId: `music_play`,
                    disabled: this.state === 'PLAYING' ? true : false,
                    type: 'BUTTON'
                });
                actionRow1.addComponents({
                    label: lang_json_1.music_message.player_pause[lang],
                    style: `SECONDARY`,
                    customId: `music_pause`,
                    disabled: this.state === 'STOPPED' ? true : false,
                    type: 'BUTTON'
                });
                actionRow1.addComponents({
                    label: lang_json_1.music_message.player_stop[lang],
                    style: `SECONDARY`,
                    customId: `music_stop`,
                    disabled: this.state === 'STOPPED' ? true : false,
                    type: 'BUTTON'
                });
                actionRow1.addComponents({
                    label: ``,
                    style: `DANGER`,
                    customId: `music_like`,
                    emoji: `🤍`,
                    disabled: this.queue[0] ? false : true,
                    type: 'BUTTON'
                });
                const actionRow2 = new discord_js_1.MessageActionRow;
                actionRow2.addComponents({
                    label: lang_json_1.music_message.player_prev[lang],
                    style: `SECONDARY`,
                    customId: `music_prev`,
                    disabled: this.repeatState === 'ALL' ? false : this.prevQueue[0] ? false : true,
                    type: 'BUTTON'
                });
                actionRow2.addComponents({
                    label: lang_json_1.music_message.player_next[lang],
                    style: `SECONDARY`,
                    customId: `music_next`,
                    disabled: this.repeatState === 'ALL' ? false : this.queue[1] ? false : true,
                    type: 'BUTTON'
                });
                actionRow2.addComponents({
                    label: lang_json_1.music_message.player_repeat[lang],
                    style: `SECONDARY`,
                    customId: `music_repeat`,
                    disabled: false,
                    type: 'BUTTON'
                });
                actionRow2.addComponents({
                    emoji: `💔`,
                    style: `SECONDARY`,
                    customId: `music_dislike`,
                    disabled: this.queue[0] ? false : true,
                    type: 'BUTTON'
                });
                return [actionRow1, actionRow2];
            }
        });
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
                        this.control.play();
                        return;
                    }
                    if (oldState.status === voice_1.AudioPlayerStatus.Playing) {
                        if (newState.status === voice_1.AudioPlayerStatus.Idle || newState.status === 'autopaused') {
                            if (this.repeatState === 'ONE') {
                                this.control.play();
                                return;
                            }
                            if (this.state !== 'STOPPED')
                                this.control.next();
                        }
                    }
                });
                this.audioPlayer.on('error', (err) => {
                    console.error(err);
                    this.control.next();
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
            const data = (0, terminal_1.cloneObj)(this, ['queue', 'prevQueue', 'audioPlayer', 'connection', 'updateQueue', 'timer', 'messageUpdating']);
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
    addSong(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const track = new Track_1.Track(data, __classPrivateFieldGet(this, _MusicPlayer_amateras, "f"));
            this.queue.push(track);
            // Record to music profile
            yield data.music.record();
            // Record to user profile
            const playerMusic = yield data.player.musics.add(data.music);
            if (playerMusic instanceof PlayerMusic_1.PlayerMusic)
                playerMusic.record();
            yield this.update();
            return track;
        });
    }
    random(player, channel) {
        return __awaiter(this, void 0, void 0, function* () {
            yield player.musics.fetchAll();
            let _m = [];
            console.time('music');
            for (const playerMusic of player.musics.getTop()) {
                console.time('push');
                const data = {
                    music: playerMusic.music,
                    channel: channel,
                    player: player
                };
                if (!playerMusic.music.updated)
                    playerMusic.music.update();
                const track = new Track_1.Track(data, __classPrivateFieldGet(this, _MusicPlayer_amateras, "f"));
                this.queue.push(track);
                _m.push({
                    like: playerMusic.like,
                    dislike: playerMusic.dislike,
                    counts: playerMusic.counts
                });
                console.timeEnd('push');
            }
            console.timeEnd('music');
        });
    }
    setRepeat(state) {
        return __awaiter(this, void 0, void 0, function* () {
            this.repeatState = state;
            this.update();
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
            if (!music.updated)
                yield music.update();
            if (!message.member.voice.channel)
                return 103;
            const channel = message.member.voice.channel;
            add.call(this, music, channel, player); // Not waiting, return music
            return music;
            function add(music, channel, player) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield this.addSong({
                        channel: channel,
                        music: music,
                        player: player
                    });
                    this.control.play();
                });
            }
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
            if (this.message)
                this.message.delete().catch();
            yield this.init();
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
            if (this.message)
                this.message.delete().catch();
            yield this.save();
            return 100;
        });
    }
    update(time) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.updateQueue[0] && this.messageUpdating === false) {
                yield this.initMessage();
                return;
            }
            const timestamp = +new Date();
            if (!time)
                time = 0;
            const outdate = timestamp + time;
            this.updateQueue.push(outdate);
        });
    }
    interval() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.updateQueue[0])
                return;
            // Get now timestamp
            const timestamp = +new Date;
            // Init message when init function is not running
            if (this.messageUpdating === false) {
                yield this.initMessage();
                // Delete the old update
                const newUpdate = [];
                for (const update of this.updateQueue) {
                    if (update > timestamp) {
                        newUpdate.push(update);
                    }
                }
                this.updateQueue = newUpdate;
            }
        });
    }
}
exports.MusicPlayer = MusicPlayer;
_MusicPlayer_amateras = new WeakMap(), _MusicPlayer_collection = new WeakMap(), _MusicPlayer__guild = new WeakMap(), _MusicPlayer_data = new WeakMap();
//# sourceMappingURL=MusicPlayer.js.map