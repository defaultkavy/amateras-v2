import { AudioPlayer, AudioPlayerState, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { Message, MessageActionRow, MessageEmbedOptions, StageChannel, TextChannel, VoiceChannel } from "discord.js";
import { Collection } from "mongodb";
import ytdl from "ytdl-core";
import Amateras from "./Amateras";
import { _Guild } from "./_Guild";
import { Track, TrackData } from "./Track";
import { Music } from "./Music";
import { Player } from "./Player";
import { PlayerMusic } from "./PlayerMusic";
import { cloneObj } from "./terminal";

export class MusicPlayer {
    #amateras: Amateras;
    #collection: Collection;
    #_guild: _Guild;
    #data?: MusicPlayerData;
    id: string;
    channel?: TextChannel;
    message?: Message;
    enabled: boolean;
    connection?: VoiceConnection
    audioPlayer?: AudioPlayer
    queue: Track[];
    prevQueue: Track[];
    state: 'PLAYING' | 'PAUSE' | 'STOPPED' | 'CHANGING';
    constructor(_guild: _Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('music_player')
        this.#_guild = _guild
        this.id = _guild.id
        this.enabled = false
        this.queue = []
        this.prevQueue = []
        this.state = 'STOPPED'
    }

    async init() {
        const data = await this.#collection.findOne({id: this.id})
        if (data) {
            this.#data = data
        }
        await this.initMusicChannel()
        await this.initMessage()
    }

    async initMusicChannel() {
        if (this.#data && this.#data.channel) {
            try {
                const musicChannel = await this.#_guild.get.channels.fetch(this.#data.channel)
                if (musicChannel && musicChannel.type === 'GUILD_TEXT') {
                    this.channel = musicChannel
                    this.enabled = true
                } else {
                    this.channel = undefined
                    this.enabled = false
                    await this.save()
                }
            } catch {
                this.channel = undefined
                this.enabled = false
                await this.save()
            }
        }
    }

    async initMessage() {
        if (this.channel) {
            if (this.#data && this.#data.message) {
                try {
                    const message = await this.channel.messages.fetch(this.#data.message)
                    if (message) {
                        this.message = message
                        await this.message.edit({embeds: [this.embed()], components: this.components()})
                    } else {
                        this.message = await this.channel.send({embeds: [this.embed()], components: this.components()})
                        await this.save()
                    }
                } catch(err) {
                    this.message = await this.channel.send({embeds: [this.embed()], components: this.components()})
                    await this.save()
                }
            } else {
                this.message = await this.channel.send({embeds: [this.embed()], components: this.components()})
                await this.save()
            }
        }
    }

    embed() {
        let embed: MessageEmbedOptions = {}
        if (this.queue[0] && this.audioPlayer) {
            const music = this.queue[0].music
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

            }
        } else {
            embed = {
                author: {
                    name: `天照音乐`
                },
                color: 'DARK_BUT_NOT_BLACK',
                title: `没有播放的曲目`,
                description: `在此频道发送 YouTube Music 链接即可播放音乐`
            }
        }
        return embed
    }

    components() {
        const actionRow1 = new MessageActionRow
        actionRow1.addComponents({
            label: `播放`,
            style: `PRIMARY`,
            customId: `music_play`,
            disabled: this.state === 'PLAYING' ? true : false,
            type: 'BUTTON'
        })
        actionRow1.addComponents({
            label: `暂停`,
            style: `SECONDARY`,
            customId: `music_pause`,
            disabled: this.state === 'STOPPED' ? true : false,
            type: 'BUTTON'
        })
        actionRow1.addComponents({
            label: `停止`,
            style: `SECONDARY`,
            customId: `music_stop`,
            disabled: this.state === 'STOPPED' ? true : false,
            type: 'BUTTON'
        })
        const actionRow2 = new MessageActionRow
        actionRow2.addComponents({
            label: `上首`,
            style: `SECONDARY`,
            customId: `music_prev`,
            disabled: this.prevQueue[0] ? false : true,
            type: 'BUTTON'
        })
        actionRow2.addComponents({
            label: `下首`,
            style: `SECONDARY`,
            customId: `music_next`,
            disabled: this.queue[1] ? false : true,
            type: 'BUTTON'
        })
        actionRow2.addComponents({
            label: ``,
            style: `DANGER`,
            customId: `music_like`,
            emoji: `🤍`,
            disabled: this.queue[0] ? false : true,
            type: 'BUTTON'
        })
        return [actionRow1, actionRow2]
    }

    async initAudioPlayer() {
        if (!this.audioPlayer) {
            this.audioPlayer = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause
                }
            })
            // Set listener when song is end
            this.audioPlayer.on('stateChange', (oldState, newState) => {
                if (this.state === 'CHANGING') {
                    this.play()
                    return 
                } 
                if (oldState.status === AudioPlayerStatus.Playing) {
                    if (newState.status === AudioPlayerStatus.Idle || newState.status === 'autopaused') {
                        this.next()
                    }
                }
            })

            this.audioPlayer.on('error', (err) => {
                console.error(err)
                this.next()
            })
        }
    }

    /**
     * @returns 100 - Success
     * @returns 101 - Already joined
     */
    async join(channel: VoiceChannel | StageChannel) {
        return new Promise<100 | 101>(resolve => {
            if (this.connection && this.connection.state.status === 'ready') return resolve(101)
            this.connection = joinVoiceChannel(
                {
                    channelId: channel.id,
                    guildId: this.#_guild.id,
                    adapterCreator: <DiscordGatewayAdapterCreator>channel.guild.voiceAdapterCreator
                }
            )
            this.connection.once(VoiceConnectionStatus.Ready, () => {
                return resolve(100)
            })
        })
    }

    async save() {
        const data = cloneObj(this, ['queue', 'prevQueue', 'audioPlayer', 'connection'])
        data.channel = this.channel ? this.channel.id : undefined
        data.message = this.message ? this.message.id : undefined

        const find = await this.#collection.findOne({ id: this.#_guild.id })
        if (find) {
            await this.#collection.replaceOne({ id: this.#_guild.id }, data)
        } else {
            await this.#collection.insertOne(data)
        }
    }

    async play() {
        if (!this.queue[0]) return this.stop()
        // Init audio player
        await this.initAudioPlayer()
        // If audio player is playing, return
        if (this.audioPlayer && this.audioPlayer.state.status === 'playing') return
        // Join voice channel
        await this.join(this.queue[0].channel)
        // Check connection and audio player is valid
        if (!this.connection || !this.audioPlayer) return
        // Subscribe audio player to voice connection
        this.connection.subscribe(this.audioPlayer)
        //const info = await ytdl.getInfo(this.queue[0].music.url)
        if (!this.queue[0]) return
        this.queue[0].resource = ytdl(this.queue[0].music.url) //, {format: ytdl.chooseFormat(info.formats, { quality: '140' })}) //
        const resource = createAudioResource(this.queue[0].resource)
        // Play
        this.audioPlayer.play(resource)
        this.state = 'PLAYING'
        this.initMessage()
    }

    next() {
        if (!this.queue[1]) return this.stop()
        const endTrack = this.queue.shift()
        if (!endTrack) return
        this.prevQueue.unshift(endTrack)
        this.state = 'CHANGING'
        if (this.audioPlayer) {
            if (this.audioPlayer.state.status === 'idle') {
                this.play()
            } else {
                this.audioPlayer.stop()
            }
        }
        // Listener
    }

    prev() {
        if (!this.prevQueue[0]) return
        const prevTrack = this.prevQueue.shift()
        if (!prevTrack) return
        this.queue.unshift(prevTrack)
        this.state = 'CHANGING'
        if (this.audioPlayer) {
            this.audioPlayer.stop()
        } else {
            this.play()
        }
        // Listener
    }

    async stop() {
        const endTrack = this.queue.shift()
        if (!endTrack) return
        this.prevQueue.unshift(endTrack)
        if (!this.audioPlayer) return
        this.audioPlayer.stop()
        this.audioPlayer = undefined
        if (!this.connection) return
        this.connection.destroy()
        this.state = 'STOPPED'
        this.queue = []
        await this.initMessage()
    }

    async pause() {
        if (!this.audioPlayer) return
        this.audioPlayer.pause()
        this.state = 'PAUSE'
        await this.initMessage()
    }

    async resume() {
        if (!this.audioPlayer) return
        if (this.audioPlayer.state.status === AudioPlayerStatus.Paused) {
            this.audioPlayer.unpause()
            this.state = 'PLAYING'
            await this.initMessage()
        }
    }

    async addSong(data: TrackData) {
        const track = new Track(data, this.#amateras)
        this.queue.push(track)
        // Record to music profile
        await data.music.record()
        // Record to user profile
        const playerMusic = await data.player.musics.add(data.music)
        if (playerMusic instanceof PlayerMusic) await playerMusic.record()
        this.initMessage()
        return track
    }

    async random(player: Player, channel: VoiceChannel | StageChannel) {
        await player.musics.fetchAll()
        for (const playerMusic of player.musics.getTop()) {
            await this.addSong({
                music: playerMusic.music,
                channel: channel,
                player: player
            })
        }
    }

    /**
     * @returns 100 - Success
     * @returns 101 - Not a valid url
     * @returns 103 - User not in voice channel
     */
    async link(message: Message, player: Player) {
        if (!ytdl.validateURL(message.content)) return 101
        if (!message.member) return 102
        const music = await this.#amateras.musics.add(message.content)
        if (!(music instanceof Music)) return 101
        if (!message.member.voice.channel) return 103
        await this.addSong({
            channel: message.member.voice.channel,
            music: music,
            player: player
        })
        this.play()
    }

    /**
     * @returns 101 - Already set
     */
     async setup(channel: TextChannel) {
        if (this.channel && this.channel.id === channel.id) return 101
        this.enabled = true
        this.channel = channel
        if (this.message && !this.message.deleted) this.message.delete()
        await this.initMessage()
        await this.save()
        return this.channel
    }

    /**
     * @returns 100 - Success
     * @returns 101 - Music channel never set
     * @returns 102 - Not a music channel
     */
    async unset(channel: TextChannel) {
        if (!this.channel) return 101
        if (this.channel.id !== channel.id) return 102
        this.enabled = false
        this.channel = undefined
        if (this.message && !this.message.deleted) this.message.delete()
        await this.save()
        return 100
    }
}

export interface MusicPlayerData {
    channel?: string,
    message?: string
}