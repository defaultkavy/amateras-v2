import { TextChannel } from "discord.js";
import Amateras from "./Amateras";
import { _TextChannel } from "./_TextChannel";

export class _WelcomeChannel extends _TextChannel {
    welcomeText: string;
    constructor(data: _WelcomeChannelData, channel: TextChannel, amateras: Amateras) {
        super(channel, amateras)
        this.welcomeText = data.welcomeText
    }

    toData() {
        return {
            id: this.id,
            welcomeText: this.welcomeText
        }
    }
}

export interface _WelcomeChannelData {
    id: string
    welcomeText: string
}