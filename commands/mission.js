"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Mission_1 = require("../lib/Mission");
exports.default = execute;
function execute(interaction, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        const player = yield amateras.players.fetch(interaction.user.id);
        if (player === 404)
            return;
        for (const subcmd0 of interaction.options.data) {
            switch (subcmd0.name) {
                case 'list':
                    amateras.missions.sendMissionList(interaction);
                    break;
                case 'push':
                    if (!subcmd0.options) {
                        interaction.reply({ content: '请输入必要参数。', ephemeral: true });
                        return;
                    }
                    const missionObj = {
                        title: '', description: '', pay: 0, expire: 1,
                        owner: player.id, persons: 1, status: 'EXECUTE'
                    };
                    for (const subcmd1 of subcmd0.options) {
                        switch (subcmd1.name) {
                            case 'title':
                                if (subcmd1.value && typeof subcmd1.value === 'string') {
                                    missionObj.title = subcmd1.value;
                                }
                                break;
                            case 'info':
                                if (subcmd1.value && typeof subcmd1.value === 'string') {
                                    missionObj.description = subcmd1.value;
                                }
                                break;
                            case 'pay':
                                if (subcmd1.value && typeof subcmd1.value === 'number') {
                                    missionObj.pay = subcmd1.value;
                                }
                                break;
                            case 'expire':
                                if (subcmd1.value && typeof subcmd1.value === 'number') {
                                    missionObj.expire = subcmd1.value;
                                }
                                break;
                            case 'persons':
                                if (subcmd1.value && typeof subcmd1.value === 'number') {
                                    missionObj.persons = subcmd1.value;
                                }
                                break;
                        }
                    }
                    const check = Mission_1.Mission.checkPublish(player, missionObj);
                    if (!check.pass) {
                        interaction.reply({ content: check.note, ephemeral: true });
                        return;
                    }
                    // Create Mission class using MissionManager
                    const mission = yield amateras.missions.create(missionObj);
                    if (!mission) {
                        console.error(`"mission" is ${mission}. (mission.js)`);
                        return;
                    }
                    // Send mission info using MsgManager
                    yield mission.sendMission(interaction);
                    break;
                case 'close':
                    amateras.missions.sendMissionChoices(interaction, 'MISSION_CLOSE');
                    break;
                case 'cancel':
                    amateras.missions.sendMissionChoices(interaction, 'MISSION_CANCEL');
                    break;
                case 'quit':
                    amateras.missions.sendMissionChoices(interaction, 'MISSION_QUIT');
                    break;
            }
        }
    });
}
//# sourceMappingURL=mission.js.map