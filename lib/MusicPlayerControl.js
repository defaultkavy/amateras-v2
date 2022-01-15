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
var _MusicPlayerControl_amateras, _MusicPlayerControl_player;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicPlayerControl = void 0;
const voice_1 = require("@discordjs/voice");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
class MusicPlayerControl {
    constructor(musicPlayer, amateras) {
        _MusicPlayerControl_amateras.set(this, void 0);
        _MusicPlayerControl_player.set(this, void 0);
        __classPrivateFieldSet(this, _MusicPlayerControl_amateras, amateras, "f");
        __classPrivateFieldSet(this, _MusicPlayerControl_player, musicPlayer, "f");
    }
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").queue[0])
                return this.stop();
            // Init audio player
            yield __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").initAudioPlayer();
            // If audio player is playing, return
            if (__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer && __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer.state.status === 'playing')
                return;
            // Join voice channel
            yield __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").join(__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").queue[0].channel);
            // Check connection and audio player is valid
            if (!__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").connection || !__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer)
                return;
            // Subscribe audio player to voice connection
            __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").connection.subscribe(__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer);
            //const info = await ytdl.getInfo(this.#player.queue[0].music.url)
            if (!__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").queue[0])
                return;
            const music = __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").queue[0].music;
            if (!music.updated)
                yield music.update();
            __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").queue[0].resource = (0, ytdl_core_1.default)(music.url, { filter: 'audioonly', highWaterMark: 1 << 25 }); //, {format: ytdl.chooseFormat(info.formats, { quality: '140' })}) //
            const resource = (0, voice_1.createAudioResource)(__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").queue[0].resource);
            // Play
            __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer.play(resource);
            __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").state = 'PLAYING';
            yield music.record();
            __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").update();
        });
    }
    next() {
        if (__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").repeatState === 'ALL') {
            if (!__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").queue[1]) {
                __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").queue = __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").queue.concat(__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").prevQueue.reverse());
                __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").prevQueue = [];
            }
        }
        if (!__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").queue[1])
            return this.stop();
        const endTrack = __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").queue.shift();
        if (!endTrack)
            return;
        __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").prevQueue.unshift(endTrack);
        __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").state = 'CHANGING';
        if (__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer) {
            if (__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer.state.status === 'idle' || __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer.state.status === voice_1.AudioPlayerStatus.Paused) {
                this.play();
            }
            else {
                __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer.stop();
            }
        }
        // Listener
    }
    prev() {
        if (__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").repeatState === 'ALL') {
            if (!__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").prevQueue[0]) {
                __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").prevQueue = __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").queue.reverse();
                __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").queue = [];
            }
        }
        if (!__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").prevQueue[0])
            return;
        const prevTrack = __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").prevQueue.shift();
        if (!prevTrack)
            return;
        __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").queue.unshift(prevTrack);
        __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").state = 'CHANGING';
        if (__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer) {
            if (__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer.state.status === 'idle' || __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer.state.status === voice_1.AudioPlayerStatus.Paused) {
                this.play();
            }
            else {
                __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer.stop();
            }
        }
        // Listener
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            const endTrack = __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").queue.shift();
            if (!endTrack)
                return;
            __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").prevQueue = [];
            __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").queue = [];
            if (!__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer)
                return;
            __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer.stop();
            __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer = undefined;
            if (!__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").connection)
                return;
            __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").connection.destroy();
            __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").state = 'STOPPED';
            __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").queue = [];
            yield __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").update();
        });
    }
    pause() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer)
                return;
            __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer.pause();
            __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").state = 'PAUSE';
            yield __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").update();
        });
    }
    resume() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer)
                return;
            if (__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer.state.status === voice_1.AudioPlayerStatus.Paused) {
                __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").audioPlayer.unpause();
                __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").state = 'PLAYING';
                yield __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").update();
            }
        });
    }
    repeat() {
        if (__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").repeatState === 'OFF') {
            __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").setRepeat('ALL');
            return 'ALL';
        }
        else if (__classPrivateFieldGet(this, _MusicPlayerControl_player, "f").repeatState === 'ALL') {
            __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").setRepeat('ONE');
            return 'ONE';
        }
        else {
            __classPrivateFieldGet(this, _MusicPlayerControl_player, "f").setRepeat('OFF');
            return 'OFF';
        }
    }
}
exports.MusicPlayerControl = MusicPlayerControl;
_MusicPlayerControl_amateras = new WeakMap(), _MusicPlayerControl_player = new WeakMap();
//# sourceMappingURL=MusicPlayerControl.js.map