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
    like: boolean;
    dislike: boolean;
    constructor(data: PlayerMusicObj, music: Music, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('player_music')
        this.id = data.id
        this.player = data.player
        this.music = music
        this.counts = data.counts
        this.like = data.like ? data.like : false
        this.dislike = data.dislike ? data.dislike : false
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

    /**
     * @returns 100 - Success
     * @returns 101 - Already exist in music likes
     */
    async setLike() {
        this.dislike = false
        this.like = true
        await this.music.removeDislike(this.player.id)
        if (await this.music.addLike(this.player.id) === 101) return 101
        await this.save()
        return 100
    }

    /**
     * @returns 100 - Success
     * @returns 101 - No exist in music likes
     */
    async unsetLike() {
        this.like = false
        if (await this.music.removeLike(this.player.id) === 101) return 101
        await this.save()
        return 100
    }

    /**
     * @returns 100 - Success
     * @returns 101 - Already exist in music likes
     */
    async setDislike() {
        this.like = false
        this.dislike = true
        await this.music.removeLike(this.player.id)
        if (await this.music.addDislike(this.player.id) === 101) return 101
        await this.save()
        return 100
    }

    /**
     * @returns 100 - Success
     * @returns 101 - No exist in music likes
     */
    async unsetDislike() {
        this.dislike = false
        if (await this.music.removeDislike(this.player.id) === 101) return 101
        await this.save()
        return 100
    }
}

export interface PlayerMusicObj {
    id: string,
    counts: number,
    player: Player,
    like: boolean
    dislike: boolean
}

export interface PlayerMusicData {
    id: string,
    counts: number,
    player: string,
    like: boolean
    dislike: boolean
}