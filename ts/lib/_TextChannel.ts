import { Channel, NewsChannel, TextChannel } from "discord.js";
import Amateras from "./Amateras";
import { _Channel } from "./_Channel";

export class _TextChannel extends _Channel {
    get: TextChannel | NewsChannel;
    isWelcomeChannel: boolean;
    constructor(channel: TextChannel | NewsChannel, amateras: Amateras) {
        super(channel, amateras)
        this.get = channel
        this.isWelcomeChannel = false
    }
}