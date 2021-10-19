import { Channel, Guild } from "discord.js";
import Amateras from "./Amateras";
import { _Channel } from "./_Channel";
import { _Guild } from "./_Guild";

export class NotifyChannel extends _Channel {
    
    constructor(data: _ChannelData, _guild: _Guild, guild: Guild, amateras: Amateras) {
        super(data, 'notify', _guild, guild, amateras)
    }
}