import { CommandInteraction } from "discord.js";
import Amateras from "../lib/Amateras";
import { Item } from "../lib/Item";

export default async function item(interact: CommandInteraction, amateras: Amateras) {
    for (const subcmd0 of interact.options.data) {
        switch (subcmd0.name) {
            case 'create':
                if (!subcmd0.options) {
                    interact.reply({content: '请输入必要参数。', ephemeral: true})
                    return
                }
                const itemObj: ItemObj = {
                    creator: interact.user.id,
                    name: '',
                    description: '',
                    url: '',
                    image: undefined
                }
                for (const subcmd1 of subcmd0.options) {
                    if (!subcmd1.value) return
                    switch (subcmd1.name) {
                        case 'name':
                            itemObj.name = <string>subcmd1.value
                        break;
                        case 'info':
                            itemObj.description = <string>subcmd1.value
                        break;
                        case 'url':
                            itemObj.url = <string>subcmd1.value
                        break;
                        case 'image':
                            itemObj.image = <string>subcmd1.value
                        break;
                    }
                }
                const check = Item.checkPublish(itemObj)
                if (!check.pass) {
                    interact.reply({content: check.note, ephemeral: true})
                    return
                }
                const item = await amateras.items.create(itemObj)
                item.sendItem(interact)
            break;
        }
    }
}