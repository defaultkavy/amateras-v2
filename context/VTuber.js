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
const layout_1 = require("../lib/layout");
exports.default = execute;
function execute(interaction, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        const player = yield amateras.players.fetch(interaction.targetId);
        if (!player)
            return console.error('Player not exist');
        if (!player.v)
            yield player.setVTuber();
        else
            yield player.unsetVTuber();
        yield player.save();
        yield interaction.reply({ content: `Change to ${layout_1.Gender[player.gender]}`, ephemeral: true });
    });
}
//# sourceMappingURL=VTuber.js.map