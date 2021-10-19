import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Reward } from "./Reward";

export class RewardManager {
    #amateras: Amateras;
    #collection: Collection;
    cache: Map<string, Reward>;

    constructor(amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('rewards')
        this.cache = new Map
    }

    async fetch(id: string) {
        let reward = this.cache.get(id)
        if (reward) {
            return reward
        }
        const rewardData = <RewardData>await this.#collection.findOne({id: id})
        if (rewardData) {
            reward = new Reward(rewardData, this.#amateras)
            this.cache.set(id, reward)
            reward.init()
            return reward
        }
        return
    }

    async create(obj: RewardObj) {
        const data = <RewardData>{...obj}
        data.id = await Reward.createId(this.#collection),
        data.count = 0
        data.times = 0
        const reward = new Reward(data, this.#amateras)
        this.cache.set(reward.id, reward)
        await reward.init()
        await reward.save()
        return reward
    }
}