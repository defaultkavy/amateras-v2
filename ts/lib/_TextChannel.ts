import { Channel, TextChannel } from "discord.js";
import Amateras from "./Amateras";
import { _Channel } from "./_Channel";

export class _TextChannel extends _Channel {
    get: TextChannel;
    isWelcomeChannel: boolean;
    constructor(channel: TextChannel, amateras: Amateras) {
        super(channel, amateras)
        this.get = channel
        this.isWelcomeChannel = false
    }
}