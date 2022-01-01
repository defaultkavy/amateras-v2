import { Message, MessageEmbedOptions } from "discord.js";
import Amateras from "./Amateras";
import { MusicPlayer } from "./MusicPlayer";
import { Player } from "./Player";
import { removeArrayItem } from "./terminal";

export class MusicPlayerNotify {
    #amateras: Amateras;
    #player: MusicPlayer;
    message?: Message;
    notifications: MusicPlayerNotification[]
    constructor(musicPlayer: MusicPlayer, amateras: Amateras) {
        this.#amateras = amateras
        this.#player = musicPlayer
        this.notifications = []
    }

    async init() {
        let description = ''
        for (const notification of this.notifications) {
            description += `${notification.player.mention()} - ${notification.content}\n`
        }
        const embed: MessageEmbedOptions = {
            description: description,
            color: this.#player.state === 'PLAYING' ? 'GREEN' : this.#player.state === 'PAUSE' ? 'DARKER_GREY' : this.#player.queue[0] && !this.#player.queue[0].music.updated ? 'NAVY' : 'DARK_BUT_NOT_BLACK',
            footer: {
                text: `Notification`
            }
        }
        return embed
    }

    async push(player: Player, content: string, duration: number) {
        const notification: MusicPlayerNotification = {
            player: player,
            content: content,
            duration: duration
        }
        this.notifications.push(notification)
        this.#player.update(duration)
        setTimeout(() => {
            this.notifications = removeArrayItem(this.notifications, notification)
            this.#player.update()
        }, duration)
        await this.init()
    }
}

export interface MusicPlayerNotification {
    player: Player
    content: string
    duration: number
}