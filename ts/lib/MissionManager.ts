import { CommandInteraction, EmbedFieldData, Message, MessageActionRow, MessageButton, MessageEmbed, MessageEmbedOptions, MessageSelectMenu } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Mission } from "./Mission";
import { cloneObj } from "./terminal";

export default class MissionManager {
    #amateras: Amateras
    #collection: Collection | undefined
    #missionDate?: Collection;
    cache: Map<string, Mission>
    constructor(amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db?.collection('missions')
        this.#missionDate = amateras.db?.collection('mission_date')
        this.cache = new Map
    }

    /**
     * Get mission data from database.
     * @param missionId The target mission ID.
     */
    async fetch(missionId: string): Promise<Mission | undefined> {
        const missionData = <MissionData>await this.#collection?.findOne({ id: missionId })
        if (!missionData) {
            console.error(`Mission "${missionId}" fetch failed. (MissionManager.js)`)
            return
        }
        if (this.cache.has(missionId)) {
            const mission = this.cache.get(missionId)!
            await mission.init()
            return mission
        }
        const mission = new Mission(missionData, this.#amateras)
        this.cache.set(missionId, mission)
        await mission.init()
        return mission 
    }

    /**
     * Create new mission to cache and database.
     * @param missionObj Required MissionObj type Object.
     * @returns Return a Mission type dynamic object.
     */
    async create(missionObj: MissionObj) {
        // Clone missionObj become MissionData type
        const missionData = <MissionData>cloneObj(missionObj)
        // Create new mission ID for new mission
        const newId = await Mission.createId(this.#amateras)
        // Check if new ID create failed.
        if (!newId) {
            console.error('Mission create failed: Mission ID undefined. (MissionManager.ts)')
            return undefined
        }
        // Set MissionDat type needed properties
        missionData.id = newId
        missionData.enable = true
        const expireDate = new Date()
        expireDate.setDate(expireDate.getDate() + <number>missionData.expire)
        missionData.expire = expireDate.setHours(0,0,0,0)
        missionData.agents = []
        if (!missionData.persons) {
            missionData.persons = 1
        }
        // Create Mission object
        const mission = new Mission(missionData, this.#amateras)
        this.cache.set(mission.id, mission)
        await mission.init()
        // Assign mission to owner
        mission.owner.missions.requested.active.add(mission)
        // Save expire date to database
        this.saveMissionDate(mission)
        // Transfer coins to Amateras
        const wallets = mission.owner.wallets
        if (!wallets) {
            console.error(`Transfer mission payment is failed. Owner "${missionObj.owner}" wallet is undefined. (MissionManager.js)`)
            return
        }
        wallets[0].transfer(this.#amateras.me!.wallets[0].id, mission.pay * mission.persons, 'Mission Payment from Owner.', false)
        return mission
    }

    private async saveMissionDate(mission: Mission) {
        const find = <MissionDateData>await this.#missionDate?.findOne({ expire_date: mission.expire })
        if (!find) {
            this.#missionDate?.insertOne({expire_date: mission.expire, missions: [mission.id]})
        } else {
            const missions = find.missions
            missions.push(mission.id)
            this.#missionDate?.updateOne({expire_date: mission.expire, }, { $set: {missions: missions}})
        }
    }

    async sendMissionChoices(interaction: CommandInteraction, type: 'MISSION_CLOSE' | 'MISSION_CANCEL' | 'MISSION_QUIT') {
        const player = await this.#amateras.players?.fetch(interaction.user.id)
        if (player === 404) return
        //#region Message components create
        const selectmenu = new MessageSelectMenu()
        let fields: EmbedFieldData[] = []
        selectmenu.customId = interaction.id + '_select'
        selectmenu.placeholder = type === 'MISSION_CLOSE' ? '请选择你要结算的委托（可多选）' : type === 'MISSION_CANCEL' ? '请选择你要取消的委托（可多选）' : '请选择你要放弃的委托（可多选）'
        selectmenu.minValues = 1
        const missions = type === 'MISSION_CLOSE' || type === 'MISSION_CANCEL' ? player.missions.requested.active.cache : player.missions.accepted.active.cache
        if (missions.size === 0) {
            interaction.reply({content: type === 'MISSION_CLOSE' || type === 'MISSION_CANCEL' ? '你当前没有发布的委托。' : '你当前没有接受的委托', ephemeral: true})
            return
        }
        missions.forEach((mission) => {
            selectmenu.addOptions({
                label:  `${mission.title}`,
                description: `${mission.id}`,
                value: `${mission.id}`,
                default: false
            })
            fields.push({
                name: mission.title,
                value: `**接取人数：**${mission.agents.length}/${mission.persons}\n**期限：**${String(mission.expire.getFullYear())}年${String(mission.expire.getMonth() + 1)}月${String(mission.expire.getDate()).padStart(2, '0')}日\n**报酬金：**${mission.pay}G\n\`${mission.id}\` - [任务链接](${mission.message.url})`
            })
        })

        const embed: MessageEmbedOptions = {
            title: '委托依赖列表',
            fields: fields,
        }
        
        const summit_button = new MessageButton()
        summit_button.customId = interaction.id + '_mission_close_summit'
        summit_button.label = '提交'
        summit_button.style = 'PRIMARY'
        summit_button.disabled = true
        const cancel_button = new MessageButton()
        cancel_button.customId = interaction.id + '_mission_close_cancel'
        cancel_button.label = '取消'
        cancel_button.style = 'DANGER'
        const actionRow = new MessageActionRow()
        const actionRow2 = new MessageActionRow()
        actionRow.addComponents(selectmenu)
        actionRow2.addComponents(summit_button)
        actionRow2.addComponents(cancel_button)
        //#endregion
        interaction.reply({embeds: [embed], components:[actionRow, actionRow2], ephemeral: true})

        if (!interaction.channel) return
        const collector = interaction.channel.createMessageComponentCollector({
            filter: (compInteraction) => {
                if (compInteraction.user.id === interaction.user.id) {
                    if (compInteraction.customId === summit_button.customId) return true
                    if (compInteraction.customId === cancel_button.customId) return true
                    if (compInteraction.customId === selectmenu.customId) return true
                }
                return false
            },
            time: 1000 * 60
        })

        let status = 0, values: string[] = []
        collector.on('collect', async (interaction2) => {
            if (interaction2.customId === summit_button.customId && interaction2.isButton() === true) {
                // Summit button interact
                if (type === 'MISSION_CLOSE') {
                    for (const missionId of values) {
                        const check = missions.get(missionId)!.checkComplete()
                        if (!check.pass) {
                            interaction.editReply({ content: `\`\`\`diff\n- ${check.note}\`\`\`` })
                            interaction2.deferUpdate()
                            return
                        }
                    }
                    for (const missionId of values) await missions.get(missionId)?.complete()
                } else if (type === 'MISSION_CANCEL') {
                    for (const missionId of values) await missions.get(missionId)?.cancel()
                } else if (type === 'MISSION_QUIT') {
                    for (const missionId of values) await missions.get(missionId)?.quit(player)
                }
                interaction.editReply({content: type === 'MISSION_CLOSE' ? '委托已结算。' : type === 'MISSION_CANCEL' ? '委托已取消' : '委托已放弃' , embeds: [], components: []})
                interaction2.deferUpdate()
                status = 1
            } else if (interaction2.customId === cancel_button.customId) {
                // Close button interact
                interaction.editReply({content:'你取消了请求。', embeds: [], components: []})
                interaction2.deferUpdate()
                status = 2
            } else if (interaction2.customId === selectmenu.customId && interaction2.isSelectMenu()) {
                // Select menu interact
                values = interaction2.values
                const newButton = <MessageButton>interaction2.message.components![1].components[0]
                const newSelect = <MessageSelectMenu>interaction2.message.components![0].components[0]
                const newComps = <MessageActionRow[]>interaction2.message.components
                newComps[1].components[0] = newButton
                newComps[0].components[0] = newSelect
                for (const option of newSelect.options) {
                    for (const value of interaction2.values) {
                        if (value === option.value) option.default = true
                    }
                }
                if (interaction2.values.length > 0) {
                    newButton.disabled = false
                    interaction.editReply({components: newComps})
                } else {
                    newButton.disabled = true
                    interaction.editReply({components: newComps})
                }
                interaction2.deferUpdate()
                status = 0
            }
        })

        collector.on('end', (collection) => {
            if (status === 0) interaction.editReply({content:'请求已过期。', embeds: [], components: []})
        })
    }

    async sendMissionList(interact: CommandInteraction) {
        const player = await this.#amateras.players?.fetch(interact.user.id)
        if (player === 404) return
        if (!player) {
            console.error(`Player "${interact.user.id}(${interact.user.username}) fetch failed. (MsgManager.js)`)
            return
        }
        const acceptedMissions = player.missions.accepted.active.cache
        const fields = <EmbedFieldData[]>[]
        acceptedMissions.forEach((mission) => {
            fields.push({
                name: mission.title,
                value: `**接取人数：**${mission.agents.length}/${mission.persons}\n**期限：**${String(mission.expire.getFullYear())}年${String(mission.expire.getMonth() + 1)}月${String(mission.expire.getDate()).padStart(2, '0')}日\n**报酬金：**${mission.pay}G\n\`${mission.id}\` - [任务链接](${mission.message.url})`
            })
        })

        const requestedMissions = player.missions.requested.active.cache
        const embed: MessageEmbedOptions = {
            title: '委托接受列表',
            fields: fields,
        }
        if (acceptedMissions.size === 0) embed.description = '当前没有接受的委托'

        const fields2 = <EmbedFieldData[]>[]
        requestedMissions.forEach((mission) => {
            fields2.push({
                name: mission.title,
                value: `**接取人数：**${mission.agents.length}/${mission.persons}\n**期限：**${String(mission.expire.getFullYear())}年${String(mission.expire.getMonth() + 1)}月${String(mission.expire.getDate()).padStart(2, '0')}日\n**报酬金：**${mission.pay}G\n\`${mission.id}\` - [任务链接](${mission.message.url})`
            })
        })

        const embed2: MessageEmbedOptions = {
            title: '委托依赖列表',
            fields: fields2,
        }
        if (requestedMissions.size === 0) embed2.description = '当前没有发布的委托'

        interact.reply({embeds: [embed, embed2], ephemeral: true})
        
    }
}