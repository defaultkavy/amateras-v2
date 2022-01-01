import { Collection } from "mongodb";
import ytdl from "ytdl-core";
import Amateras from "./Amateras";
import { Player } from "./Player";
import { cloneObj, removeArrayItem } from "./terminal";

export class Music {
    #amateras: Amateras;
    #collection: Collection;
    #data: MusicData;
    id: string;
    url: string;
    plays: number;
    players: number;
    likes: string[]
    dislikes: string[]
    title?: string;
    thumbnail?: ytdl.thumbnail;
    author?: MusicAuthor;
    updated: boolean
    constructor(data: MusicData, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('music')
        this.#data = data
        this.id = data.id
        this.url = data.url
        this.plays = data.plays ? data.plays : 0
        this.players = data.players ? data.players : 0
        this.likes = data.likes ? data.likes : []
        this.dislikes = data.dislikes ? data.dislikes : []
        this.updated = false
    }

    async init() {
        
    }

    async save() {
        const data = cloneObj(this)
        const find = await this.#collection.findOne({ id: this.id })
        if (find) {
            await this.#collection.replaceOne({ id: this.id }, data)
        } else {
            await this.#collection.insertOne(data)
        }
    }

    async update() {
        const info = await ytdl.getBasicInfo(this.id)
        if (!info) return
        const details = info.videoDetails
        this.title = details.title
        this.url = details.video_url
        this.thumbnail = details.thumbnails[details.thumbnails.length - 1]
        this.author = {
            name: details.author.name,
            avatar: details.author.thumbnails ? details.author.thumbnails[0].url : details.author.avatar,
            url: details.author.channel_url
        }
        const collection = this.#amateras.db.collection('player_music')
        const cursor = collection.find({id: this.id})
        const arr = await cursor.toArray()
        this.players = arr.length
        await this.save()
        this.updated = true
    }

    async record() {
        this.plays += 1
        await this.save()
    }

    /**
     * @returns 100 - Success
     * @returns 101 - Already exist
     * @returns 102 - Id is undefined
     */
    async addLike(id: string) {
        if (!id) return 102
        if (this.likes.includes(id)) return 101
        this.likes.push(id)
        await this.save()
        return 100
    }

    /**
     * @returns 100 - Success
     * @returns 101 - Already removed
     */
    async removeLike(id: string) {
        if (!this.likes.includes(id)) 101
        removeArrayItem(this.likes, id)
        await this.save()
        return 100
    }
    
    /**
     * @returns 100 - Success
     * @returns 101 - Already exist
     * @returns 102 - Id is undefined
     */
     async addDislike(id: string) {
        if (!id) return 102
        if (this.dislikes.includes(id)) return 101
        this.dislikes.push(id)
        await this.save()
        return 100
    }

    /**
     * @returns 100 - Success
     * @returns 101 - Already removed
     */
    async removeDislike(id: string) {
        if (!this.dislikes.includes(id)) 101
        removeArrayItem(this.dislikes, id)
        await this.save()
        return 100
    }
}

export interface MusicData {
    id: string,
    url: string,
    plays?: number,
    players?: number
    likes?: string[]
    dislikes?: string[]
}

export interface MusicAuthor {
    name: string;
    avatar: string;
    url: string; 
}