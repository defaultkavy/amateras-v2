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
const _Character_1 = require("../lib/_Character");
function waifu(interact, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const subcmd0 of interact.options.data) {
            switch (subcmd0.name) {
                case 'create':
                    if (!subcmd0.options) {
                        interact.reply({ content: '请输入必要参数。', ephemeral: true });
                        return;
                    }
                    const characterObj = {
                        name: '',
                        description: '',
                        url: '',
                        avatar: undefined,
                        gender: 'Male',
                        age: 0
                    };
                    for (const subcmd1 of subcmd0.options) {
                        if (!subcmd1.value)
                            return;
                        switch (subcmd1.name) {
                            case 'name':
                                characterObj.name = subcmd1.value;
                                break;
                            case 'info':
                                characterObj.description = subcmd1.value;
                                break;
                            case 'url':
                                characterObj.url = subcmd1.value;
                                break;
                            case 'avatar':
                                characterObj.avatar = subcmd1.value;
                                break;
                            case 'gender':
                                characterObj.gender = subcmd1.value;
                                break;
                            case 'age':
                                characterObj.age = subcmd1.value;
                                break;
                        }
                    }
                    const check = _Character_1._Character.checkPublish(characterObj);
                    if (!check.pass) {
                        interact.reply({ content: check.note, ephemeral: true });
                        return;
                    }
                    const character = yield amateras.characters.create(characterObj);
                    character.sendItem(interact);
                    break;
            }
        }
    });
}
exports.default = waifu;
//# sourceMappingURL=waifu.js.map