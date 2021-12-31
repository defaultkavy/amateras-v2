import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Music } from "./Music";
import { Player } from "./Player";
import { PlayerMusic, PlayerMusicData } from "./PlayerMusic";

export class PlayerMusicManager {
    #amateras: Amateras;
    #collection: Collection;
    #data?: PlayerMusicData[]
    player: Player;
    history: Map<string, PlayerMusic>
    constructor(player: Player, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('player_music')
        this.player = player
        this.history = new Map
    }

    async init() {
        const cursor = this.#collection.find({player: this.player.id})
        const data = await cursor.toArray()
        if (data) {
            this.#data = <PlayerMusicData[]>data
        }
    }

    async fetch(id: string) {
        const get = this.history.get(id)
        if (get) return get
        const music = await this.#amateras.musics.fetch(id)
        if (music === 404) return 404 
        const data = <PlayerMusicData>await this.#collection.findOne({id: id, player: this.player.id})
        if (data) {
            const playerMusic = new PlayerMusic(data, music, this.#amateras)
            this.history.set(id, playerMusic)
            await playerMusic.init()
            return playerMusic
        } else {
            return 404
        }
        
    }

    /**
     * @returns 101 - Already exist
     */
    async create(music: Music) {
        if (this.history.has(music.id)) return 101
        const data: PlayerMusicData = {
            id: music.id,
            counts: 0,
            player: this.player,
            like: false
        }
        const playerMusic = new PlayerMusic(data, music, this.#amateras)
        this.history.set(music.id, playerMusic)
        await playerMusic.init()
        await playerMusic.save()
        return playerMusic
    }

    /**
     * @returns 101 - Already exist
     */
    async add(music: Music) {
        const fetch = await this.fetch(music.id)
        if (fetch instanceof PlayerMusic) return fetch
        const create = <PlayerMusic>await this.create(music)
        return create
    }

    async fetchAll() {
        if (this.#data) {
            for (const data of this.#data) {
                await this.fetch(data.id)
            }
        }
    }

    getTop() {
        const list = [...this.history.values()]
        return list.sort((a, b) => {
            return a.counts - b.counts
        })
        
    }
}