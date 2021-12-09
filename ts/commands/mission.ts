import { CommandInteraction } from "discord.js";
import Amateras from "../lib/Amateras";
import { Mission } from "../lib/Mission";

export default execute
async function execute(interaction: CommandInteraction, amateras: Amateras) {
    const player = await amateras.players!.fetch(interaction.user.id)
    if (player === 404) return
    for (const subcmd0 of interaction.options.data) {
        switch (subcmd0.name) {
            case 'list':
                amateras.missions!.sendMissionList(interaction)
            break;

            case 'push':
                if (!subcmd0.options) {
                    interaction.reply({content: '请输入必要参数。', ephemeral: true})
                    return
                }
                const missionObj: MissionObj = { 
                    title: '', description: '', pay: 0, expire: 1,
                    owner: player.id, persons: 1, status: 'EXECUTE'
                }
                for (const subcmd1 of subcmd0.options) {
                    switch (subcmd1.name) {
                        case 'title':
                            if (subcmd1.value && typeof subcmd1.value === 'string') {
                                missionObj.title = subcmd1.value
                            }
                        break;
                        case 'info':
                            if (subcmd1.value && typeof subcmd1.value === 'string') {
                                missionObj.description = subcmd1.value
                            }
                        break;
                        case 'pay':
                            if (subcmd1.value && typeof subcmd1.value === 'number') {
                                missionObj.pay = subcmd1.value
                            }
                        break;
                        case 'expire':
                            if (subcmd1.value && typeof subcmd1.value === 'number') {
                                missionObj.expire = subcmd1.value
                            }
                        break;
                        case 'persons':
                            if (subcmd1.value && typeof subcmd1.value === 'number') {
                                missionObj.persons = subcmd1.value
                            }
                        break;
                    }
                }
                const check = Mission.checkPublish(player, missionObj)
                if (!check.pass) {
                    interaction.reply({content: check.note, ephemeral: true})
                    return
                }
                // Create Mission class using MissionManager
                const mission = await amateras.missions!.create(missionObj)
                if (!mission) {
                    console.error(`"mission" is ${mission}. (mission.js)`)
                    return
                }
                // Send mission info using MsgManager
                await mission.sendMission(interaction)
            break;
            
            case 'close':
                amateras.missions!.sendMissionChoices(interaction, 'MISSION_CLOSE')
            break
            case 'cancel':
                amateras.missions!.sendMissionChoices(interaction, 'MISSION_CANCEL')
            break
            case 'quit':
                amateras.missions!.sendMissionChoices(interaction, 'MISSION_QUIT')
            break;
        }
    }
}