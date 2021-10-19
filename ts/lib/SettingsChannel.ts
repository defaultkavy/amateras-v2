import { Guild, MessageActionRow, MessageSelectMenu } from "discord.js";
import Amateras from "./Amateras";
import { _Channel } from "./_Channel";
import { _Guild } from "./_Guild";

export class SettingsChannel extends _Channel{
    #amateras: Amateras
    constructor(data: _ChannelData, _guild: _Guild, guild: Guild, amateras: Amateras) {
        super(data, 'settings', _guild, guild, amateras)
        this.#amateras = amateras
    }

    // async setup() {
    //     const action = new MessageActionRow
    //     const notify_select = new MessageSelectMenu
    //     notify_select.customId = `notify_select`
    //     for (const channel of this.guild.channels.cache.values()) {
    //         if (channel.type === 'GUILD_TEXT') {
    //             notify_select.addOptions({
    //                 label: channel.parent ? `${ channel.parent.name } - ${ channel.name }` : `${ channel.name }`,
    //                 value: channel.id,
    //                 description: channel.id + `${ this._guild.channels.notify ? channel === this._guild.channels.notify.channel ? ' - 消息频道' : '' : ''}`,
    //                 default: this._guild.channels.notify ? channel === this._guild.channels.notify.channel ? true : false : undefined
    //             })
    //         }
    //     }
    //     action.addComponents(notify_select)
    //     const message = await this.channel.send({content: `消息频道`, components: [action]})
    //     this.#amateras.messages.create(message, {
    //         notify_select: 'notify_ch_select'
    //     })
    // }
}