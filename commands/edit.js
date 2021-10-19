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
exports.default = execute;
function execute(interaction, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        interaction.user.send({ content: '填写你的简介吧！' });
        // const favList = amateras.db.collection('favList')
        // const result = await favList.findOne({ users: +interaction.targetId })
        // if (!result) {
        //     await interaction.reply({content: 'Not in list.', ephemeral: true})
        // } else {
        //     favList.deleteOne({ users: +interaction.targetId })
        //     interaction.reply({content: 'Removed.', ephemeral: true})
        // }
    });
}
