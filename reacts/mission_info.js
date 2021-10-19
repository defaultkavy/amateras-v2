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
function mission_info(interaction, amateras) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        if (!amateras.db) {
            return;
        }
        const player = yield ((_a = amateras.players) === null || _a === void 0 ? void 0 : _a.fetch(interaction.user.id));
        if (!player) {
            console.error(`Player "${interaction.user.id}(${interaction.user.username})" not found.`);
            return;
        }
        const mission = yield ((_b = amateras.missions) === null || _b === void 0 ? void 0 : _b.fetch((_c = interaction.message.embeds[0].footer) === null || _c === void 0 ? void 0 : _c.text));
        if (!mission) {
            console.error(`Mission "${(_d = interaction.message.embeds[0].footer) === null || _d === void 0 ? void 0 : _d.text}" not found."`);
            return;
        }
        yield mission.createThread(interaction);
        interaction.deferUpdate();
    });
}
exports.default = mission_info;
//# sourceMappingURL=mission_info.js.map