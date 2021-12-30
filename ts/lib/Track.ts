import { StageChannel, VoiceChannel } from "discord.js";
import Amateras from "./Amateras";
import { Readable } from 'stream';
import { Music, MusicData } from "./Music";
import { Player } from "./Player";

export class Track {
    resource?: Readable;
    channel: VoiceChannel | StageChannel;
    music: Music;
    player: Player;
    constructor(data: TrackData, amateras: Amateras) {
        this.music = data.music
        this.channel = data.channel
        this.player = data.player
    }

}

export interface TrackData {
    music: Music,
    channel: VoiceChannel | StageChannel,
    player: Player
}