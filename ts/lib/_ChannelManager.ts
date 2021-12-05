import { Channel, ChannelManager, Guild, Permissions } from "discord.js";
import Amateras from "./Amateras";
import { NotifyChannel } from "./NotifyChannel";
import { SettingsChannel } from "./SettingsChannel";
import { _Guild } from "./_Guild";

export class _ChannelManager {
    #amateras: Amateras;
    #channels: _ChannelManagerData | undefined;
    #guild: Guild;
    #_guild: _Guild;
    settings?: SettingsChannel;
    notify?: NotifyChannel;

    constructor(data: _ChannelManagerData | undefined, guild: Guild, _guild: _Guild, amateras: Amateras) {
        this.#amateras = amateras;
        this.#channels = data
        this.#guild = guild
        this.#_guild = _guild
    }

    async init() {
        if (!this.#channels) {
            // If channels data not exist, create one
            this.#channels = {
                lobby: undefined
            }
        }
        // if (this.#channels.settings) {
        //     this.settings = new SettingsChannel(this.#channels.settings, this.#_guild, this.#guild, this.#amateras)
        //     if (!await this.settings.init()) {
        //         await this.createSettingsChannel()
        //     }
        // } else {
        //     await this.createSettingsChannel()
        // }
        
        // if (this.#channels.notify) {
        //     this.notify = new NotifyChannel(this.#channels.notify, this.#_guild, this.#guild, this.#amateras)
        //     if (!await this.notify.init()) {
        //         this.notify = undefined
        //     }
        // }
    }
    /**
     * Set channel become a specify type.
     * @param channelId Provide a channel ID.
     * @param type Set channel type.
     */
    // async set(channelId: string, type: 'NOTIFY') {
    //     if (type === 'NOTIFY') {
    //         this.#channels!.notify = { id: channelId }
    //         this.notify = new NotifyChannel(this.#channels!.notify, this.#_guild, this.#guild, this.#amateras)
    //         if (!await this.notify.init()) {
    //             this.notify = undefined
    //             return
    //         }
    //     }
    // }

    // private async createSettingsChannel() {
    //     if (!this.#channels) return
    //     const channel = await this.#guild.channels.create('bot-settings', {
    //         permissionOverwrites: [
    //             {
    //                 id: this.#guild.roles.everyone.id,
    //                 deny: [Permissions.FLAGS.VIEW_CHANNEL]
    //             }
    //         ]
    //     })
    //     this.#channels.settings = { id: channel.id }
    //     this.settings = new SettingsChannel(this.#channels.settings, this.#_guild, this.#guild, this.#amateras)
    //     await this.settings.init()
    //     await this.settings.update()
    // }
}