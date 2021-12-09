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
const terminal_1 = require("../lib/terminal");
function item(interact, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        const player = yield amateras.players.fetch(interact.user.id);
        if (player === 404)
            return;
        if (!player.v) {
            interact.reply({ content: 'VTuber 限定功能。', ephemeral: true });
            return;
        }
        for (const subcmd0 of interact.options.data) {
            if (subcmd0.name === 'image') {
                if (!subcmd0.options) {
                    interact.reply({ content: '请输入必要参数。', ephemeral: true });
                    return;
                }
                const imageObj = {
                    url: ''
                };
                for (const subcmd1 of subcmd0.options) {
                    if (subcmd1.name === 'add') {
                        if (!subcmd1.options) {
                            interact.reply({ content: '请输入必要参数。', ephemeral: true });
                            return;
                        }
                        let folderId = 'default';
                        for (const subcmd2 of subcmd1.options) {
                            switch (subcmd2.name) {
                                case 'url':
                                    imageObj.url = subcmd2.value;
                                    break;
                                case 'folder':
                                    folderId = subcmd2.value;
                                    break;
                            }
                        }
                        if (!(0, terminal_1.checkImage)(imageObj.url))
                            return interact.reply({ content: '请输入有效的图片链接', ephemeral: true });
                        const folder = yield player.v.imageFolders.fetch(folderId);
                        folder.add(imageObj);
                        interact.reply({ content: '图片已保存。', ephemeral: true });
                    }
                    if (subcmd1.name === 'set') {
                        if (!subcmd1.options) {
                            interact.reply({ content: '请输入必要参数。', ephemeral: true });
                            return;
                        }
                        let targetFolder = '';
                        const folderData = {
                            id: '',
                            name: undefined
                        };
                        for (const subcmd2 of subcmd1.options) {
                            switch (subcmd2.name) {
                                case 'id':
                                    targetFolder = subcmd2.value;
                                    break;
                                case 'name':
                                    folderData.name = subcmd2.value;
                                    break;
                                case 'newid':
                                    folderData.id = subcmd2.value;
                                    break;
                            }
                        }
                        const folder = yield player.v.imageFolders.fetch(targetFolder);
                        // Check if id already used
                        if (folderData.id !== '' && player.v.imageFolders.folders.get(folderData.id)) {
                            interact.reply({ content: '文件夹ID已存在', ephemeral: true });
                            return;
                        }
                        if (!folder) {
                            interact.reply({ content: '文件夹不存在', ephemeral: true });
                            return;
                        }
                        folder.set(folderData);
                        interact.reply({ content: '文件夹已修改', ephemeral: true });
                    }
                }
            }
            if (subcmd0.name === 'info') {
                if (!subcmd0.options) {
                    player.v.sendInfo(interact, false);
                    return;
                }
                let share = false;
                for (const subcmd1 of subcmd0.options) {
                    if (subcmd1.name === 'share') {
                        share = subcmd1.value;
                    }
                }
                player.v.sendInfo(interact, share);
            }
            if (subcmd0.name === 'edit') {
                if (!subcmd0.options) {
                    interact.reply({ content: '请输入必要参数。', ephemeral: true });
                    return;
                }
                const vObj = {
                    name: undefined,
                    description: undefined,
                    avatar: undefined
                };
                for (const subcmd1 of subcmd0.options) {
                    switch (subcmd1.name) {
                        case 'name':
                            vObj.name = subcmd1.value;
                            break;
                        case 'intro':
                            vObj.description = subcmd1.value;
                            break;
                        case 'avatar':
                            vObj.avatar = subcmd1.value;
                            break;
                    }
                }
                if (vObj.avatar && !(0, terminal_1.checkImage)(vObj.avatar))
                    return interact.reply({ content: '请输入有效的图片链接', ephemeral: true });
                yield player.v.setInfo(vObj);
                interact.reply({ content: 'VTuber 个人资料更改完成', ephemeral: true });
            }
        }
    });
}
exports.default = item;
//# sourceMappingURL=vtuber.js.map