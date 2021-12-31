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
        if (!this.#player.channel) return

        if (this.message && !this.message.deleted) {
            
            if (!this.notifications[0]) {
                try {
                    await this.message.delete()
                    this.message = undefined
                } catch {
                    
                }
                return
            } else {
                this.message.edit({embeds: [embed.call(this)]})
                setTimeout(this.timeout.bind(this, this.notifications[this.notifications.length - 1]), 3000)
            }

        } else {
            this.message = await this.#player.channel.send({embeds: [embed.call(this)]})
            setTimeout(this.timeout.bind(this, this.notifications[this.notifications.length - 1]), 3000)
        }

        function embed(this: MusicPlayerNotify) {
            let description = ''
            for (const notification of this.notifications) {
                description += `${notification.player.mention()} - ${notification.content}\n`
            }
            const embed: MessageEmbedOptions = {
                description: description,
                footer: {
                    text: `Notification`
                }
            }
            return embed
        }
    }

    async add(player: Player, content: string) {
        this.notifications.push({
            player: player,
            content: content
        })
        await this.init()
    }

    timeout(this: MusicPlayerNotify, notification: MusicPlayerNotification) {
        this.notifications = removeArrayItem(this.notifications, notification)
        console.debug(this.notifications)
        this.init()
    }
}

export interface MusicPlayerNotification {
    player: Player
    content: string
}