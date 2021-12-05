import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Mission } from "./Mission";
import { Player } from "./Player";
import { removeArrayItem } from "./terminal";

export class PlayerMissionManager {
    #amateras: Amateras
    #collection: Collection | undefined
    #missions: string[];
    player: Player;
    cache: Map<string, Mission>;
    constructor(missions: string[], player: Player, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = this.#amateras.db?.collection('missions')
        this.#missions = missions
        this.player = player
        this.cache = new Map
    }

    /**
     * Fetch mission data from database.
     * @param missionId The target mission ID.
     */
    async fetch(): Promise<Map<string, Mission> | undefined> {
        for (const missionId of this.#missions) {
            if (this.cache.get(missionId)) {
                const mission = this.cache.get(missionId)!
                await mission.init()
            } else {
                const mission = await this.#amateras.missions?.fetch(missionId)
                if (!mission) {
                    console.error(`Mission "${missionId}" fetch failed.`)
                    return
                }
                this.cache.set(missionId, mission)
            }
        }
        return this.cache 
    }

    async add(mission: Mission) {
        this.#missions.push(mission.id)
        this.cache.set(mission.id, mission)
        await this.player.save()
    }

    async remove(mission: Mission) {
        if (this.#missions.includes(mission.id)) {
            this.#missions = removeArrayItem(this.#missions, mission.id)
        }
        if (this.cache.has(mission.id)) {
            this.cache.delete(mission.id)
        }
        await this.player.save()
    }

    async complete(mission: Mission) {
        if (this.player === mission.owner) {
            this.player.missions.requested.achieve.add(mission)
            this.remove(mission)
            await this.player.save()

        } else if (mission.agents.includes(this.player)) {
            this.player.missions.accepted.achieve.add(mission)
            this.remove(mission)
            await this.player.save()
        } else {
            // Error
            console.error(`Something wrong.[\n${this.player}\n${mission}\n] (PlayerMissionManager.js)`)
        }
    }
}