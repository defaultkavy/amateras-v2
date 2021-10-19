import { CommandInteraction } from "discord.js"
import Amateras from "../lib/Amateras"
import { checkImage } from "../lib/terminal"

export default async function item(interact: CommandInteraction, amateras: Amateras) {
    const player = await amateras.players.fetch(interact.user.id)
    if (!player.v) {
        interact.reply({content: 'VTuber 限定功能。', ephemeral: true})
        return
    }
    for (const subcmd0 of interact.options.data) {
        if (subcmd0.name === 'image') {
            if (!subcmd0.options) {
                interact.reply({content: '请输入必要参数。', ephemeral: true})
                return
            }
            const imageObj: VImageObj = {
                url: ''
            }
            for (const subcmd1 of subcmd0.options) {
                if (subcmd1.name === 'add') {
                    if (!subcmd1.options) {
                        interact.reply({content: '请输入必要参数。', ephemeral: true})
                        return
                    }
                    let folderId: string = 'default'
                    for (const subcmd2 of subcmd1.options) {
                        switch (subcmd2.name) {
                            case 'url':
                                imageObj.url = <string>subcmd2.value
                            break;
                            case 'folder':
                                folderId = <string>subcmd2.value
                            break;
                        }
                    }
                    if (!checkImage(imageObj.url)) return interact.reply({content: '请输入有效的图片链接', ephemeral: true})
                    const folder = await player.v.imageFolders.fetch(folderId)
                    folder.add(imageObj)
                    interact.reply({content: '图片已保存。', ephemeral: true})

                }
                if (subcmd1.name === 'set') {
                    if (!subcmd1.options) {
                        interact.reply({content: '请输入必要参数。', ephemeral: true})
                        return
                    }
                    let targetFolder = ''
                    const folderData: VImageFolderObj = {
                        id: '',
                        name: undefined
                    }
                    for (const subcmd2 of subcmd1.options) {
                        switch (subcmd2.name) {
                            case 'id':
                                targetFolder = <string>subcmd2.value
                            break;
                            case 'name':
                                folderData.name = <string>subcmd2.value
                            break;
                            case 'newid':
                                folderData.id = <string>subcmd2.value
                            break;
                        }
                    }
                    const folder = await player.v.imageFolders.fetch(targetFolder)
                    // Check if id already used
                    if (folderData.id !== '' && player.v.imageFolders.folders.get(folderData.id)) {
                        interact.reply({content: '文件夹ID已存在', ephemeral: true})
                        return
                    }
                    if (!folder) {
                        interact.reply({content: '文件夹不存在', ephemeral: true})
                        return
                    }
                    folder.set(folderData)
                    interact.reply({content: '文件夹已修改', ephemeral: true})
                }
            }
        }
        if (subcmd0.name === 'info') {
            if (!subcmd0.options) {
                player.v.sendInfo(interact, false)
                return
            }
            let share = false
            for (const subcmd1 of subcmd0.options) {
                if (subcmd1.name === 'share') {
                    share = <boolean>subcmd1.value!
                }
            }
            player.v.sendInfo(interact, share)
        }
        if (subcmd0.name === 'edit') {
            if (!subcmd0.options) {
                interact.reply({content: '请输入必要参数。', ephemeral: true})
                return
            }
            const vObj: VObj = {
                name: undefined,
                description: undefined,
                avatar: undefined
            }
            for (const subcmd1 of subcmd0.options) {
                switch (subcmd1.name) {
                    case 'name':
                        vObj.name = <string>subcmd1.value
                    break;
                    case 'intro':
                        vObj.description = <string>subcmd1.value
                    break;
                    case 'avatar':
                        vObj.avatar = <string>subcmd1.value
                    break;
                }
            }
            if (vObj.avatar && !checkImage(vObj.avatar)) return interact.reply({content: '请输入有效的图片链接', ephemeral: true})
            await player.v.setInfo(vObj)
            interact.reply({content: 'VTuber 个人资料更改完成', ephemeral: true})
        }
    }
}