import { Channel, NewsChannel, TextChannel, ThreadChannel } from "discord.js";
import Amateras from "./Amateras";
import { _Channel } from "./_Channel";

export class _ThreadChannel extends _Channel {
    get: ThreadChannel;
    constructor(channel: ThreadChannel, amateras: Amateras) {
        super(channel, amateras)
        this.get = channel
    }
}