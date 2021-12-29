import { ColorResolvable, CommandInteraction, GuildMember, Interaction, Message, MessageActionRow, MessageButton, MessageEmbedOptions, User } from "discord.js";
import Amateras from "./Amateras";
import { Err } from "./Err";
import { Gender } from "./layout";
import { Lobby } from "./Lobby";
import { PlayerMissionManager } from "./PlayerMissionManager";
import { Reward } from "./Reward";
import { cloneObj, removeArrayItem } from "./terminal";
import { V } from "./V";
import Wallet from "./Wallet";

export class Player {
    #amateras: Amateras
    id: string;
    exp?: number | null;
    description?: string | null;
    color?: ColorResolvable | null;
    youtube?: string | null;
    twitter?: string | null;
    level?: number | null;
    aka?: string | null;
    gender: Gender;
    wallets: Wallet[];
    #walletsId: string[];
    missions: PlayerMissionManagerSelector;
    #missions : PlayerMissionData;
    v?: V
    class?: ('PLAYER' | 'VTUBER')[]
    joinedLobbies: Map<string, Lobby>;
    #rewards?: string[];
    rewards: Map<string, Reward>;
    get?: User
    /**
     * @namespace
     * @param player The player data object.
     * @param amateras The amateras object.
     */
    constructor(player: PlayerData, amateras: Amateras) {
        this.#amateras = amateras
        this.id = player.id
        this.exp = player.exp ? player.exp : 0
        this.description = player.description
        this.color = player.color,
        this.youtube = player.youtube
        this.twitter = player.twitter
        this.level = this.levelCheck()
        this.aka = player.aka
        this.gender = player.gender ? player.gender : 1
        this.#walletsId = player.wallets ? player.wallets : []
        this.wallets = [];
        this.#missions = this.init_missions(player)
        this.missions = <PlayerMissionManagerSelector>{};
        this.class = player.class
        this.v = undefined
        this.joinedLobbies = new Map
        this.#rewards = player.rewards
        this.rewards = new Map
    }

    async init() {
        try {
            this.get = await this.#amateras.client.users.fetch(this.id)
        } catch(err) {
            new Err(`Player fetch failed: (User)${ this.id }`)
            return 404
        }
        // Init wallet
        this.wallets = await this.walletInit()
        this.missions = {
            accepted: {
                active: <PlayerMissionManager>{},
                achieve: <PlayerMissionManager>{}
            },
            requested: {
                active: <PlayerMissionManager>{},
                achieve: <PlayerMissionManager>{}
            }
        }
        if (!this.class) this.class = ['PLAYER']
        if (this.class.includes('VTUBER')) {
            const vData = <VData>await this.#amateras.db.collection('v').findOne({id: this.id})
            if (vData) {
                const v = await this.#amateras.players.v.fetch(this.id)
                if (v instanceof V) {
                    this.v = v
                    await this.v.init()
                } else {
                    new Err(`V Object create failed. (User)${this.id}`)
                }
            } else {
                new Err(`V Data is not found. (User)${ this.id }`)
            }
        }
        for (const type in this.#missions) {
            for (const status in this.#missions[type]) {
                const manager = new PlayerMissionManager(this.#missions[type][status], this, this.#amateras)
                this.missions[type][status] = manager
                if (status === 'active') {
                    await manager.fetch()
                }
            }
        }
        if (!this.#rewards) {
            const rewardObjs = await this.init_rewards()
            for (const rewardObj of rewardObjs) {
                const reward = await this.#amateras.rewards.create(rewardObj)
                this.rewards.set(reward.name, reward)
            }
            await this.save()
        } else {
            for (const rewardId of this.#rewards) {
                const reward = await this.#amateras.rewards.fetch(rewardId)
                if (reward) this.rewards.set(reward.name, reward)
            }
        }
        return 100
    }

    /**
     * Save player cache to Database
     * @param callback Callback when save is done.
     */
     async save(callback?: () => void): Promise<void> {
        const collection = this.#amateras.db!.collection('player')
        const player = await collection.findOne({ id: this.id })
        const data = cloneObj(this, ['wallets', 'v', 'joinedLobbies'])
        data.wallets = this.#walletsId
        data.missions = this.#missions
        data.rewards = []
        for (const reward of this.rewards.values()) {
            data.rewards.push(reward.id)
        }
        if (!player) {
            await collection.insertOne(data)
        } else {
            await collection.replaceOne({ id: this.id }, data)
        }
        if (callback) callback()
    }

    expUp(amount: number): void {
        this.exp! += amount;
        this.level = this.levelCheck()
        this.save()
    }

    private levelCheck() {
        return Math.round(this.exp! / 10)
    }

    private async walletInit() {
        let wallets: Wallet[] = []
        if (!this.#walletsId || Object.entries(this.#walletsId).length === 0) {
            const create = (await this.#amateras.wallets!.create(this.id)).wallet
            
            if (!create) {
                const user = await this.#amateras.client.users.fetch(this.id)
                console.error(`User: ${user ? user.username : this.id} wallet init failed.`)
                return []
            }
            wallets.push(create)
            this.#walletsId = [create.id]
            await this.save()
        } else {
            if (!Array.isArray(this.#walletsId)) {
                console.log(`this.#walletsId: ${this.#walletsId}`)
                return []
            }
            for (const walletId of this.#walletsId) {
                const fetch = await this.#amateras.wallets!.fetch(walletId)
                if (!fetch) {
                    const user = await this.#amateras.client.users.fetch(this.id)
                    console.error(`User: ${user ? user.username : this.id} wallet "${walletId}" fetch failed.`)
                    return []
                }
                wallets.push(fetch)
            }
        }
        return wallets
    }

    private init_missions(player: PlayerData): PlayerMissionData {
        if (!player.missions) {
            player.missions = {
                accepted: {
                    active: [],
                    achieve: []
                },
                requested: {
                    active: [],
                    achieve: []
                }
            }
        }
        return {
            accepted: {
                active: player.missions.accepted.active ? player.missions.accepted.active : [],
                achieve: player.missions.accepted.achieve ? player.missions.accepted.achieve : []
            },
            requested: {
                active: player.missions.requested.active ? player.missions.requested.active : [],
                achieve: player.missions.requested.achieve ? player.missions.requested.achieve : []
            }
        }
    }

    private async init_rewards(): Promise<RewardObj[]> {
        return [
            {
                name: 'message',
                title: '发送消息',
                description: '在公会内发送消息',
                owner: this.id,
                pay: 1,
                reach: 10
            },
            {
                name: 'replied',
                title: '被回复消息',
                description: '在公会内被他人回复消息',
                owner: this.id,
                pay: 1,
                reach: 5
            },
            {
                name: 'react',
                title: '回应表情',
                description: '在公会内对他人回应表情',
                owner: this.id,
                pay: 1,
                reach: 20
            },
            {
                name: 'reacted',
                title: '被回应表情',
                description: '在公会内被他人回应表情',
                owner: this.id,
                pay: 1,
                reach: 10
            }
        ]
    }

    async sendInfo(interaction: CommandInteraction, share: boolean) {
        const embed = await this.infoEmbed(interaction)
        // Create Button
        const comp: MessageActionRow[] = []
        if (this.v && share) {
            const action = new MessageActionRow
            const button = new MessageButton
            button.label = '切换到 VTuber'
            button.style = 'PRIMARY'
            button.customId = '#profile_change_button'
            action.addComponents(button)
            comp.push(action)
        }
        interaction.reply({ embeds: [embed], components: comp, ephemeral: !share })
        
        if (comp.length !== 0) {
            const message = <Message>await interaction.fetchReply()
            this.#amateras.messages.create(message, {
                profile_change_button: 'profile_change_button'
            })
        }
    }

    async infoEmbed(interaction: Interaction) {
        const member = await interaction.guild!.members.fetch(this.id)
        const embed: MessageEmbedOptions = {
            author: {
                name: 'Player'
            },
            title: member ? member.displayName : undefined,
            description: this.description ? this.description : undefined,
            thumbnail: {
                url: (await interaction.client.users.fetch(this.id)).displayAvatarURL({ size: 512 })
            },
            color: this.color ? this.color : undefined,
            footer: {
                text: this.id
            },
            fields: [
                {
                    name: `LV.${this.level}`,
                    value: `Exp.${this.exp}`,
                    inline: true
                },
                {
                    name: this.aka ? `${this.aka}` : 'none',
                    value: `${(this.wallets)[0].balance}G`,
                    inline: true
                },
                {
                    name: 'Links',
                    value: (this.youtube ? `[YouTube](https://youtube.com/channel/${this.youtube}) ` : '')
                        + (this.twitter ? `[Twitter](https://twitter.com/${this.twitter}) ` : '-')
                }
            ]
        }
        return embed
    }

    /**
     * Add V class to this player
     * @returns 101 - Already set
     * @returns 102 - Player fetch failed
     */
    async setVTuber() {
        // Check class
        if (this.class?.includes('VTUBER')) {
            return 101 // Already set
        }
        const v = await this.#amateras.players.v.fetch(this.id)
        if (v instanceof V) {
            if (this.class) this.class.push('VTUBER')
            this.v = v
            await this.save()
            return this.v // Fetch old data from database and set this player to V
        } else if (v === 404) {
            const newV = await this.#amateras.players.v.create(this.id)
            if (newV instanceof V) {
                this.v = newV
                if (this.class) this.class.push('VTUBER')
                await this.v.init()
                await this.v.save()
                await this.save()
                return this.v
            } else {
                return 102 // Player fetch failed
            }
        } else {
            return 102 // Player fetch failed
        }
    }

    /**
     * Remove V class from this player
     * @returns 100 - Success
     * @returns 101 - Already removed
     */
    async unsetVTuber() {
        if (!this.class?.includes('VTUBER')) {
            this.v = undefined
            return 101 // Already removed
        }
        this.v = undefined
        if (this.class) this.class = removeArrayItem(this.class, 'VTUBER')
        await this.save()
        return 100
    }

    joinLobby(lobby: Lobby) {
        this.joinedLobbies.set(lobby.categoryChannel.id, lobby)
        this.save()
    }

    leaveLobby(lobby: Lobby) {
        this.joinedLobbies.delete(lobby.categoryChannel.id)
        this.save()
    }

    mention() {
        if (!this.get) return this.id
        let result: User | string = this.get
        if (!result) {
            result = this.get.username
        }
        return result
    }
}