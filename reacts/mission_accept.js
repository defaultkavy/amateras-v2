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
function mission_accept(interaction, amateras) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        const player = yield amateras.players.fetch(interaction.user.id);
        if (!player) {
            console.error(`Player "${interaction.user.id}(${interaction.user.username})" not found. (mission_accept.js)`);
            return;
        }
        const mission = yield ((_a = amateras.missions) === null || _a === void 0 ? void 0 : _a.fetch((_b = interaction.message.embeds[0].footer) === null || _b === void 0 ? void 0 : _b.text));
        if (!mission) {
            console.error(`Mission "${(_c = interaction.message.embeds[0].footer) === null || _c === void 0 ? void 0 : _c.text}" not found." (mission_accept.js)`);
            return;
        }
        if (mission.owner === player) {
            interaction.reply({ content: `无法接取自己的委托。`, ephemeral: true });
            return;
        }
        else if (mission.agents.includes(player)) {
            interaction.reply({ content: `你已接取该委托。`, ephemeral: true });
            return;
        }
        else if (mission.expire <= new Date()) {
            interaction.reply({ content: `该委托已到达期限。`, ephemeral: true });
            return;
        }
        else if (!mission.enable) {
            interaction.reply({ content: `该委托已结算。`, ephemeral: true });
            return;
        }
        else if (player.missions.accepted.active.cache.size >= 5) {
            interaction.reply({ content: `你不能再接受更多的委托了，请先完成你当下正在进行的委托。`, ephemeral: true });
            return;
        }
        if (mission.agents.length < mission.persons) {
            player.missions.accepted.active.add(mission);
            yield mission.addAgent(player);
            const message = yield ((_d = interaction.channel) === null || _d === void 0 ? void 0 : _d.messages.fetch(interaction.message.id));
            if (!message) {
                console.error(`Mission message "${mission.message}" not found. (mission_accept.js)`);
            }
            else {
                mission.missionMessageUpdate('EXECUTE');
            }
            interaction.reply({ content: `你接受了 ${(_e = interaction.message.interaction) === null || _e === void 0 ? void 0 : _e.user} 的委托。`, ephemeral: true });
        }
        else {
            interaction.reply({ content: `该委托已达接取人数上限。`, ephemeral: true });
        }
    });
}
exports.default = mission_accept;
//# sourceMappingURL=mission_accept.js.map