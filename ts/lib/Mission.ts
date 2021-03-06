import { ButtonInteraction, CommandInteraction, Message, MessageActionRow, MessageButton, MessageEmbedOptions, TextChannel, ThreadChannel } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Player } from "./Player";
import { cloneObj, idGenerator, removeArrayItem } from "./terminal";

export class Mission {
    #amateras: Amateras;
    #collection?: Collection;
    id: string;
    title: string;
    description: string;
    reward: [] | undefined;
    pay: number;
    persons: number;
    expire: Date;
    enable: boolean;
    #owner: string;
    owner: Player;
    #agents: string[];
    agents: Player[];
    #message: string;
    message: Message;
    #thread: string | undefined;
    thread: ThreadChannel | undefined;
    #infoMessage: string;
    infoMessage: Message | undefined;
    status: 'COMPLETED' | 'CANCELED' | 'EXECUTE' | 'EXPIRED';
    constructor(mission: MissionData, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db?.collection('missions')
        this.id = mission.id
        this.title = mission.title
        this.description = mission.description
        this.reward = mission.reward
        this.persons = mission.persons
        this.expire = new Date(mission.expire)
        this.enable = mission.enable
        this.#owner = mission.owner
        this.owner = <Player>{}
        this.pay = mission.pay
        this.#agents = mission.agents
        this.agents = []
        this.#message = mission.message
        this.message = <Message>{}
        this.#thread = mission.thread
        this.thread = undefined
        this.#infoMessage = mission.infoMessage
        this.infoMessage = undefined
        this.status = mission.status
    }

    async init() {
        const owner = await this.#amateras.players?.fetch(this.#owner)
        if (owner === 404) return
        this.owner = owner
        let agents = []
        for (const agent of this.#agents) {
            if (agent) {
                const player = await this.#amateras.players!.fetch(agent)
                if (player === 404) continue
                if (!player) {
                    console.error(`Player "${agent}" fetch failed.`)
                    return
                }
                agents.push(player)
            } else { console.error(`Mission agents "${agent}" fetch failed.`) }
        }
        this.agents = agents
        
        const fetch = await this.#amateras.messages.fetch(this.#message)
        const message = fetch ? fetch.get : undefined
        if (!message) return
        this.message = message
    }

    setMessage(message: Message) {
        this.message = message
        this.#message = message.id
    }

    static async createId(amateras: Amateras) {
        if (!amateras.db) {
            console.error(`Database undefined.`)
            return undefined
        }
        let found = false
        let newId = ''
        const collection = amateras.db.collection('missions')
        while (!found) {
            newId = '0x' + idGenerator(20)
            const result = await collection.findOne({ id: newId })
            result? found = false : found = true
        }
        return newId
    }

    static checkPublish(player: Player, mission: MissionObj) {
        const balance = player.wallets[0].balance
        if (balance < (mission.pay * mission.persons)) {
            return {pass: false, note: `????????????????????????????????????${balance}G??????????????????${mission.pay * mission.persons}G`}
        } else if (!mission.pay || mission.pay <= 0) {
            return {pass: false, note: '?????????????????????????????????????????????'}
        } else if (!mission.expire || mission.expire <= 0) {
            return {pass: false, note: '???????????????????????????????????????????????????0'}
        } else if (!mission.persons || mission.persons <= 0) {
            return {pass: false, note: '?????????????????????????????????????????????????????????0'}
        } else if (!mission.expire || mission.expire <= 0) {
            return {pass: false, note: '?????????????????????????????????1???'}
        } else if (player.missions.requested.active.cache.size >= 5) {
            return {pass: false, note: '?????????????????????????????????????????????????????????????????????????????????????????????'}
        } else {
            return {pass: true, note: ''}
        }
    }

    async save(): Promise<{ status: PromiseStatus, mission: Mission }> {
        const data = cloneObj(this)
        data.owner = this.#owner
        data.agents = this.#agents
        data.message = this.#message
        data.thread = this.#thread
        data.infoMessage = this.#infoMessage
        // Check collection 'missions' exist
        if (!this.#collection) {
            console.error(`Collection "missions" undefined.(Mission.js)`)
            return { status: { success: false, message: 'Save mission failed.' }, mission: this}
        }
        // Find mission from database
        const find = await this.#collection.findOne({ id: this.id })
        // Check if mission found
        if (find) {
            await this.#collection.replaceOne({ id: this.id }, data)
        } else {
            await this.#collection.insertOne(data)
        }
        return { status: { success: true, message: 'Mission saved.' }, mission: this}
    }

    async sendMission(interaction: CommandInteraction) {
        const embed: MessageEmbedOptions = {
            title: this.title,
            description: this.description,
            color: '#5050FF',
            fields: [
                {
                    name: '?????????',
                    value: `${this.pay}G`,
                    inline: true
                },
                {
                    name: '????????????',
                    value: `${this.agents.length}/${this.persons}`,
                    inline: true
                },
                {
                    name: '??????',
                    value: `${String(this.expire.getFullYear())}???${String(this.expire.getMonth() + 1)}???${String(this.expire.getDate()).padStart(2, '0')}???`
                },
                {
                    name: '??????',
                    value: `${this.enable ? '?????????' : '?????????'}`,
                    inline: true
                }
            ],
            author: {
                iconURL: interaction.user.displayAvatarURL({ size: 128 }),
                name: `${(await interaction.guild?.members.fetch(interaction.user.id))!.displayName}?????????`
            },
            footer: {
                text: this.id
            }
        }
        const actionRow = new MessageActionRow()
        const accept_button = new MessageButton()
        accept_button.customId = '#mission_accept'
        accept_button.style = 'PRIMARY'
        accept_button.label = '??????'
        const info_button = new MessageButton()
        info_button.customId = '#mission_info'
        info_button.style = 'SECONDARY'
        info_button.label = '??????'
        actionRow.addComponents(accept_button)
        actionRow.addComponents(info_button)
        await interaction.reply({
            embeds: [embed],
            ephemeral: false,
            components: [actionRow]
        })
        const msg = await this.#amateras.messages!.create(<Message>await interaction.fetchReply(), {
            mission_accept: 'mission_accept',
            mission_info: 'mission_info'
        })
        this.setMessage(msg.get)
        
        await this.save()
    }

    async complete() {
        const ownerMember = await this.message.guild?.members.fetch(this.owner.id)
        if (!ownerMember) {
            console.error("Guild Member fetch failed: Mission owner (Mission.js)")
            return
        }
        this.owner.missions.requested.active.remove(this)
        this.owner.missions.requested.achieve.add(this)
        this.status = 'COMPLETED'
        this.save()
        for (const agent of this.agents) {
            agent.missions.accepted.active.remove(this)
            agent.missions.accepted.achieve.add(this)
            await this.#amateras.me!.wallets[0].transfer(agent.wallets[0].id, this.pay, `Mission payment.`, true)
            const user = await this.#amateras.client.users.fetch(agent.id)
            user.send(`**??????**\n???????????? ${ownerMember?.displayName} ?????????????????????${this.pay}G???????????????`)
            .catch(async () => {
                
            })
        }
        if (this.agents.length < this.persons) {
            await this.#amateras.me!.wallets[0].transfer(this.owner.wallets[0].id, (this.persons - this.agents.length) * this.pay, `Mission payment remains.`, false)
            const owner = await this.#amateras.client.users.fetch(this.owner.id)
            owner.send(`**??????**\n??????????????????${(this.persons - this.agents.length) * this.pay}G???????????????????????????`)
            .catch(async () => {
                
            })
        }
        this.missionMessageUpdate('COMPLETED')
    }

    async cancel() {
        const guild = this.message.guild
        if (!guild) {
            console.error('guild = ' + guild)
            return
        }
        const ownerMember = guild.members.cache.get(this.owner.id)
        if (!ownerMember) {
            console.error("Guild Member fetch failed: Mission owner (Mission.js)")
            return
        }
        this.owner.missions.requested.active.remove(this)
        this.owner.missions.requested.achieve.add(this)
        this.status = 'CANCELED'
        this.save()
        this.#amateras.me?.wallets[0].transfer(this.owner.wallets[0].id, this.pay, 'Mission Cancel Refund.', false)
        const owner = await this.#amateras.client.users.fetch(this.owner.id)
        owner.send(`**??????**\n?????????????????????${this.pay}G???????????????????????????`)
        .catch(async () => {
            
        })
        for (const agent of this.agents) {
            agent.missions.accepted.active.remove(this)
            agent.missions.accepted.achieve.add(this)
            const user = await this.#amateras.client.users.fetch(agent.id)
            user.send(`**??????**\n${ownerMember?.displayName} ??????????????????`)
        }

        this.missionMessageUpdate('CANCELED')

    }

    async quit(player: Player) {
        await this.removeAgent(player)
        this.missionMessageUpdate(this.status)
    }

    missionMessageUpdate(type: 'COMPLETED' | 'CANCELED' | 'EXECUTE' | 'EXPIRED') {
        // Mission message edit
        const embed = <MessageEmbedOptions>this.message.embeds[0]
        embed.color = type === 'COMPLETED' ? '#50FF50' : type === 'CANCELED' ? '#FF5050' : type === 'EXPIRED' ? '#505050' : '#5050FF'
        embed.fields![1].value = `${this.agents.length}/${this.persons}`
        embed.fields![3].value = type === 'COMPLETED' ? '?????????' : type === 'CANCELED' ? '?????????' : type === 'EXPIRED' ? '?????????' : '?????????'
        const comp = this.message.components
        const button = comp[0].components[0]
        button.disabled = type === 'COMPLETED' ? true : type === 'CANCELED' ? true : type === 'EXPIRED' ? true : false
        if (this.#agents.length >= this.persons && type === 'EXECUTE') {
            button.disabled = true
            embed.color = "#50FFFF"
        }
        this.message.edit({embeds: [embed], components: comp})
        if (type === 'EXECUTE') this.updateThread()
    }

    async expired() {
        this.status = 'EXPIRED'
        await this.save()
    }

    async addAgent(player: Player) {
        this.agents.push(player)
        this.#agents.push(player.id)
        await this.save()
    }

    async removeAgent(player: Player) {
        removeArrayItem(this.agents, player)
        removeArrayItem(this.#agents, player.id)
        await this.save()
    }

    setMessageButtonExpire() {
        // Get message data
        const embed = this.message.embeds[0]
        const components = this.message.components
        // Set status field updated data
        embed.fields[3].value = `?????????`
        // Check if agents reached limit
        components[0].components[0].disabled = true
        // Update message
        this.message.edit({
            embeds: [embed],
            components: components
        })
    }

    checkComplete() {
        if (this.agents.length === 0) {
            return {pass: false, note: `????????????????????????????????????0???`}
        }
        return {pass: true, note: ``}
    }

    async createThread(interaction: ButtonInteraction) {
        if (this.thread) {
            return
        }
        if (interaction.channel && interaction.channel.type === 'GUILD_TEXT') {
            try {
                this.thread = await interaction.channel.threads.create({
                    name: `???????????????${this.title}`,
                    autoArchiveDuration: 60,
                    startMessage: this.message
                })
            } catch {
                console.error('Create thread failed.')
                return
            }
        
            const infoMessage = await this.thread.send({content: await this.personInfo()})
            this.infoMessage = infoMessage
            infoMessage.pin()

            // Message button disable
            const comp = this.message.components
            const button = <MessageButton>comp[0].components[1]
            button.disabled = true
            this.message.edit({components: comp})
        }
    }

    async updateThread() {
        if (!this.thread || !this.infoMessage) return
        if (this.thread.archived) await this.thread.setArchived(false)
        await this.infoMessage.edit({content: await this.personInfo()})
    }

    private async personInfo() {
        let list = '```- ???????????????\n'
        for (const agent of this.agents) {
            const member = await this.message.guild!.members.fetch(agent.id)
            list += `${member.displayName}\n`
        }
        list += '```'
        return list
    }
}