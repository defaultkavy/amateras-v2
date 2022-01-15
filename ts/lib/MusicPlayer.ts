import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, DiscordGatewayAdapterCreator, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { Message, MessageActionRow, MessageEmbedOptions, MessageOptions, StageChannel, TextChannel, VoiceChannel } from "discord.js";
import { Collection } from "mongodb";
import ytdl from "ytdl-core";
import Amateras from "./Amateras";
import { _Guild } from "./_Guild";
import { Track, TrackData } from "./Track";
import { Music } from "./Music";
import { Player } from "./Player";
import { cloneObj } from "./terminal";
import { PlayerMusic } from "./PlayerMusic";
import { MusicPlayerControl } from "./MusicPlayerControl";
import { MusicPlayerNotify } from "./MusicPlayerNotify";
import { _unit_, _music_message_, _log_init_, _system_ } from '../lang.json'

export class MusicPlayer {
    #amateras: Amateras;
    #collection: Collection;
    #_guild: _Guild;
    #data?: MusicPlayerData;
    id: string;
    control: MusicPlayerControl;
    channel?: TextChannel;
    message?: Message;
    notify: MusicPlayerNotify;
    enabled: boolean;
    connection?: VoiceConnection
    audioPlayer?: AudioPlayer
    queue: Track[];
    prevQueue: Track[];
    state: 'PLAYING' | 'PAUSE' | 'STOPPED' | 'CHANGING';
    repeatState: 'OFF' | 'ONE' | 'ALL'
    updateQueue: number[]
    timer: NodeJS.Timer;
    messageUpdating: boolean;
    constructor(_guild: _Guild, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('music_player')
        this.#_guild = _guild
        this.id = _guild.id
        this.control = new MusicPlayerControl(this, amateras)
        this.notify = new MusicPlayerNotify(this, amateras)
        this.enabled = false
        this.queue = []
        this.prevQueue = []
        this.state = 'STOPPED'
        this.repeatState = 'OFF'
        this.updateQueue = []
        this.timer = setInterval(this.interval.bind(this), 500) // InitMessage interval
        this.messageUpdating = false
    }

    async init() {
        const data = <MusicPlayerData>await this.#collection.findOne({id: this.id})
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
        const lang = this.#_guild.lang
        this.messageUpdating = true
        if (this.channel) {

            const messageOptions: MessageOptions = {
                embeds: [embed.call(this)],
                components: components.call(this)
            }
            if ( this.notify.notifications.length > 0) messageOptions.embeds?.unshift(await this.notify.init())
            if (this.message) {
                await this.message.edit(messageOptions)
                return this.messageUpdating = false
            }

            if (this.#data && this.#data.message) {
                try {
                    const message = await this.channel.messages.fetch(this.#data.message)
                    if (message) {
                        this.message = message
                        await this.message.edit(messageOptions)
                    } else {
                        this.message = await this.channel.send(messageOptions)
                        await this.save()
                    }
                } catch(err) {
                    console.error(err)
                    this.message = await this.channel.send(messageOptions)
                    await this.save()
                }
            } else {
                this.message = await this.channel.send(messageOptions)
                await this.save()
            }
        }
        this.messageUpdating = false
        function embed(this: MusicPlayer) {
            let embed: MessageEmbedOptions = {}
            if (this.queue[0] && !this.queue[0].music.updated) {
                embed = {
                    author: {
                        name: _music_message_.app_name[lang] // 天照音乐
                    },
                    color: 'NAVY',
                    title: _music_message_.loading[lang], // 加载中
                    description: _music_message_.app_hint[lang] // 在此频道发送 YouTube Music 链接即可播放音乐
                }
            } else if (this.queue[0] && this.audioPlayer) {
                const music = this.queue[0].music
                embed = {
                    author: {
                        name: music.author ? music.author.name : undefined,
                        url: music.author ? music.author.url : undefined,
                        iconURL: music.author ? music.author.avatar : undefined
                    },
                    color: this.state === 'PLAYING' ? 'GREEN' : this.state === 'PAUSE' ? 'DARKER_GREY' : 'DARK_BUT_NOT_BLACK',
                    title: music.title,
                    url: music.url,
                    description: `${this.queue[0].player.mention()} ${_music_message_.play_song[lang]}`, // 点了这首歌
                    image: {
                        height: music.thumbnail ? music.thumbnail.height : undefined,
                        width: music.thumbnail ? music.thumbnail.width : undefined,
                        url: music.thumbnail ? music.thumbnail.url : undefined
                    },
                    fields: [
                        {
                            name: `${_music_message_.system_played[lang]} ${music.plays} ${_unit_.times[lang]}`, // 天照已播放过这首歌
                            value: `${music.players} ${_music_message_.user_played[lang]}`,
                            inline: false
                        },
                        {
                            name: _music_message_.likes[lang],
                            value: `${music.likes.length} ${_unit_.persons[lang]}`,
                            inline: true
                        },
                        {
                            name: _music_message_.unlikes[lang],
                            value: `${music.dislikes.length} ${_unit_.persons[lang]}`,
                            inline: true
                        },
                        {
                            name: _music_message_.player_status[lang],
                            value: `${this.state === 'PLAYING' ? '▶️' : '⏸️'} ${this.repeatState === 'ALL' ? '🔁' : this.repeatState === 'ONE' ? '🔂' : ''} - ${this.repeatState === 'ALL' ? this.queue.length + this.prevQueue.length : this.queue.length} ${_music_message_.in_queue[lang]}`,
                            inline: true
                        }
                    ]

                }
            } else {
                embed = {
                    author: {
                        name: _music_message_.app_name[lang]
                    },
                    color: 'DARK_BUT_NOT_BLACK',
                    title: this.#amateras.ready ? _music_message_.empty_queue[lang] : _system_.sleeping[lang], // 没有播放的曲目
                    description: _music_message_.app_hint[lang]
                }
            }
            return embed
        }

        function components(this: MusicPlayer) {
            const actionRow1 = new MessageActionRow
            actionRow1.addComponents({
                label: _music_message_.player_play[lang],
                style: `PRIMARY`,
                customId: `music_play`,
                disabled: this.state === 'PLAYING' ? true : false,
                type: 'BUTTON'
            })
            actionRow1.addComponents({
                label: _music_message_.player_pause[lang],
                style: `SECONDARY`,
                customId: `music_pause`,
                disabled: this.state === 'STOPPED' ? true : false,
                type: 'BUTTON'
            })
            actionRow1.addComponents({
                label: _music_message_.player_stop[lang],
                style: `SECONDARY`,
                customId: `music_stop`,
                disabled: this.state === 'STOPPED' ? true : false,
                type: 'BUTTON'
            })
            actionRow1.addComponents({
                label: ``,
                style: `DANGER`,
                customId: `music_like`,
                emoji: `🤍`,
                disabled: this.queue[0] ? false : true,
                type: 'BUTTON'
            })
            const actionRow2 = new MessageActionRow
            actionRow2.addComponents({
                label: _music_message_.player_prev[lang],
                style: `SECONDARY`,
                customId: `music_prev`,
                disabled: this.repeatState === 'ALL' ? false : this.prevQueue[0] ? false : true,
                type: 'BUTTON'
            })
            actionRow2.addComponents({
                label: _music_message_.player_next[lang],
                style: `SECONDARY`,
                customId: `music_next`,
                disabled: this.repeatState === 'ALL' ? false : this.queue[1] ? false : true,
                type: 'BUTTON'
            })
            actionRow2.addComponents({
                label: _music_message_.player_repeat[lang],
                style: `SECONDARY`,
                customId: `music_repeat`,
                disabled: false,
                type: 'BUTTON'
            })
            actionRow2.addComponents({
                emoji: `💔`,
                style: `SECONDARY`,
                customId: `music_dislike`,
                disabled: this.queue[0] ? false : true,
                type: 'BUTTON'
            })
            return [actionRow1, actionRow2]
        }
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
                    this.control.play()
                    return 
                } 
                if (oldState.status === AudioPlayerStatus.Playing) {
                    if (newState.status === AudioPlayerStatus.Idle || newState.status === 'autopaused') {
                        if (this.repeatState === 'ONE') {
                            this.control.play()
                            return
                        }
                        if (this.state !== 'STOPPED') this.control.next()
                    }
                }
            })

            this.audioPlayer.on('error', (err) => {
                console.error(err)
                this.control.next()
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
        const data = cloneObj(this, ['queue', 'prevQueue', 'audioPlayer', 'connection', 'updateQueue', 'timer', 'messageUpdating'])
        data.channel = this.channel ? this.channel.id : undefined
        data.message = this.message ? this.message.id : undefined

        const find = await this.#collection.findOne({ id: this.#_guild.id })
        if (find) {
            await this.#collection.replaceOne({ id: this.#_guild.id }, data)
        } else {
            await this.#collection.insertOne(data)
        }
    }

    async addSong(data: TrackData) {
        const track = new Track(data, this.#amateras)
        this.queue.push(track)
        // Record to music profile
        await data.music.record()
        // Record to user profile
        const playerMusic = await data.player.musics.add(data.music)
        if (playerMusic instanceof PlayerMusic) playerMusic.record()
        await this.update()
        return track
    }

    async random(player: Player, channel: VoiceChannel | StageChannel) {
        await player.musics.fetchAll()
        let _m = []
        console.time('music')
        for (const playerMusic of player.musics.getTop()) {
            console.time('push')
            const data: TrackData = {
                music: playerMusic.music,
                channel: channel,
                player: player
            }
            if (!playerMusic.music.updated) playerMusic.music.update()
            const track = new Track(data, this.#amateras)
            this.queue.push(track)
            _m.push({
                like: playerMusic.like,
                dislike: playerMusic.dislike,
                counts: playerMusic.counts
            })
            console.timeEnd('push')
        }
        console.timeEnd('music')
    }

    async setRepeat(state: 'OFF' | 'ONE' | 'ALL') {
        this.repeatState = state
        this.update()
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
        if (!music.updated) await music.update()
        if (!message.member.voice.channel) return 103
        const channel = message.member.voice.channel
        add.call(this,music, channel, player) // Not waiting, return music
        return music

        async function add(this: MusicPlayer, music: Music, channel: VoiceChannel | StageChannel, player: Player) {
            await this.addSong({
                channel: channel,
                music: music,
                player: player
            })
            this.control.play()
        }
    }

    /**
     * @returns 101 - Already set
     */
     async setup(channel: TextChannel) {
        if (this.channel && this.channel.id === channel.id) return 101
        this.enabled = true
        this.channel = channel
        if (this.message) this.message.delete().catch()
        await this.init()
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
        if (this.message) this.message.delete().catch()
        await this.save()
        return 100
    }

    async update(time?: number) {
        if (!this.updateQueue[0] && this.messageUpdating === false) {
            await this.initMessage()
            return
        }
        const timestamp = + new Date()
        if (!time) time = 0
        const outdate = timestamp + time
        this.updateQueue.push(outdate)
    }

    async interval(this: MusicPlayer) {
        if (!this.updateQueue[0]) return
        // Get now timestamp
        const timestamp = + new Date
        // Init message when init function is not running
        if (this.messageUpdating === false) {
            await this.initMessage()
            // Delete the old update
            const newUpdate = []
            for (const update of this.updateQueue) {
                if (update > timestamp) {
                    newUpdate.push(update)
                }
            }
            this.updateQueue = newUpdate
        }
    }
}

export interface MusicPlayerData {
    channel?: string,
    message?: string
}