import { createAudioResource, AudioPlayerStatus } from "@discordjs/voice";
import ytdl from "ytdl-core";
import Amateras from "./Amateras";
import { MusicPlayer } from "./MusicPlayer";

export class MusicPlayerControl {
    #amateras: Amateras;
    #player: MusicPlayer;
    constructor(musicPlayer: MusicPlayer, amateras: Amateras) {
        this.#amateras = amateras
        this.#player = musicPlayer
    }

    async play() {
        if (!this.#player.queue[0]) return this.stop()
        // Init audio player
        await this.#player.initAudioPlayer()
        // If audio player is playing, return
        if (this.#player.audioPlayer && this.#player.audioPlayer.state.status === 'playing') return
        // Join voice channel
        await this.#player.join(this.#player.queue[0].channel)
        // Check connection and audio player is valid
        if (!this.#player.connection || !this.#player.audioPlayer) return
        // Subscribe audio player to voice connection
        this.#player.connection.subscribe(this.#player.audioPlayer)
        //const info = await ytdl.getInfo(this.#player.queue[0].music.url)
        if (!this.#player.queue[0]) return
        await this.#player.queue[0].music.update()
        this.#player.queue[0].resource = ytdl(this.#player.queue[0].music.url, { filter: 'audioonly', highWaterMark: 1 << 25 }) //, {format: ytdl.chooseFormat(info.formats, { quality: '140' })}) //
        const resource = createAudioResource(this.#player.queue[0].resource)
        // Play
        this.#player.audioPlayer.play(resource)
        this.#player.state = 'PLAYING'
        await this.#player.queue[0].music.record()
        this.#player.initMessage()
    }

    next() {
        if (!this.#player.queue[1]) return this.stop()
        const endTrack = this.#player.queue.shift()
        if (!endTrack) return
        this.#player.prevQueue.unshift(endTrack)
        this.#player.state = 'CHANGING'
        if (this.#player.audioPlayer) {
            if (this.#player.audioPlayer.state.status === 'idle') {
                this.play()
            } else {
                this.#player.audioPlayer.stop()
            }
        }
        // Listener
    }

    prev() {
        if (!this.#player.prevQueue[0]) return
        const prevTrack = this.#player.prevQueue.shift()
        if (!prevTrack) return
        this.#player.queue.unshift(prevTrack)
        this.#player.state = 'CHANGING'
        if (this.#player.audioPlayer) {
            this.#player.audioPlayer.stop()
        } else {
            this.play()
        }
        // Listener
    }

    async stop() {
        const endTrack = this.#player.queue.shift()
        if (!endTrack) return
        this.#player.prevQueue.unshift(endTrack)
        if (!this.#player.audioPlayer) return
        this.#player.audioPlayer.stop()
        this.#player.audioPlayer = undefined
        if (!this.#player.connection) return
        this.#player.connection.destroy()
        this.#player.state = 'STOPPED'
        this.#player.queue = []
        await this.#player.initMessage()
    }

    async pause() {
        if (!this.#player.audioPlayer) return
        this.#player.audioPlayer.pause()
        this.#player.state = 'PAUSE'
        await this.#player.initMessage()
    }

    async resume() {
        if (!this.#player.audioPlayer) return console.debug(1)
        if (this.#player.audioPlayer.state.status === AudioPlayerStatus.Paused) {
            this.#player.audioPlayer.unpause()
            this.#player.state = 'PLAYING'
            await this.#player.initMessage()
        }
    }
}