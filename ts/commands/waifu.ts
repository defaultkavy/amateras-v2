import { CommandInteraction } from "discord.js";
import Amateras from "../lib/Amateras";
import { _Character } from "../lib/_Character";

export default async function waifu(interact: CommandInteraction, amateras: Amateras) {
    for (const subcmd0 of interact.options.data) {
        switch (subcmd0.name) {
            case 'create':
                if (!subcmd0.options) {
                    interact.reply({content: '请输入必要参数。', ephemeral: true})
                    return
                }
                const characterObj: _CharacterObj = {
                    name: '',
                    description: '',
                    url: '',
                    avatar: undefined,
                    gender: 'Male',
                    age: 0
                }
                for (const subcmd1 of subcmd0.options) {
                    if (!subcmd1.value) return
                    switch (subcmd1.name) {
                        case 'name':
                            characterObj.name = <string>subcmd1.value
                        break;
                        case 'info':
                            characterObj.description = <string>subcmd1.value
                        break;
                        case 'url':
                            characterObj.url = <string>subcmd1.value
                        break;
                        case 'avatar':
                            characterObj.avatar = <string>subcmd1.value
                        break;
                        case 'gender':
                            characterObj.gender = <'Male' | 'Female'>subcmd1.value
                        break;
                        case 'age':
                            characterObj.age = <number>subcmd1.value
                        break;
                    }
                }
                const check = _Character.checkPublish(characterObj)
                if (!check.pass) {
                    interact.reply({content: check.note, ephemeral: true})
                    return
                }
                const character = await amateras.characters.create(characterObj)
                character.sendItem(interact)
            break;
        }
    }
}