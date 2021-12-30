import { Collection } from "mongodb";
import ytdl from "ytdl-core";
import Amateras from "./Amateras";
import { Music, MusicData } from "./Music";

export class MusicManager {
    #amateras: Amateras;
    #collection: Collection
    cache: Map<string, Music>
    constructor(amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('music')
        this.cache = new Map
    }

    async init() {

    }

    /**
     * @returns 404 - Music fetch failed
     */
    async fetch(id: string) {
        const get = this.cache.get(id)
        if (get) return get
        const data = <MusicData>await this.#collection.findOne({id: id})
        if (data) {
            const music = new Music(data, this.#amateras)
            this.cache.set(id, music)
            await music.init()
            return music
        } else {
            return 404
        }
    }

    /**
     * @returns 101 - Already in database
     * @returns 102 - Not a valid url
     */
    async create(url: string) {
        const id = ytdl.getVideoID(url)
        if (!id) return 102
        const musicData: MusicData = {
            url: url,
            id: id,
            plays: 0,
            players: 0
        }
        if (await this.#collection.findOne({id: musicData.id})) return 101
        const music = new Music(musicData, this.#amateras)
        this.cache.set(musicData.id, music)
        await music.init()
        return music
    }

    /**
     * @returns 101 - Already in database
     * @returns 102 - Not a vaild url
     */
    async add(url: string) {
        const id = ytdl.getVideoID(url)
        if (!id) return 102
        const fetch = await this.fetch(id)
        if (fetch instanceof Music) return fetch
        const create = await this.create(url)
        return create
    }
}