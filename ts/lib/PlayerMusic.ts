import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Music } from "./Music";
import { Player } from "./Player";
import { cloneObj } from "./terminal";

export class PlayerMusic {
    #amateras: Amateras;
    #collection: Collection
    id: string;
    music: Music;
    counts: number;
    player: Player;
    constructor(data: PlayerMusicData, music: Music, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('player_music')
        this.id = data.id
        this.player = data.player
        this.music = music
        this.counts = data.counts
    }

    async init() {
        
    }

    async save() {
        const data = cloneObj(this, ['music'])
        data.player = this.player.id
        const find = await this.#collection.findOne({ id: this.id, player: this.player.id })
        if (find) {
            await this.#collection.replaceOne({ id: this.id, player: this.player.id }, data)
        } else {
            await this.#collection.insertOne(data)
        }
    }

    async record() {
        this.counts += 1
        await this.save()
    }
}

export interface PlayerMusicData {
    id: string,
    counts: number,
    player: Player
}