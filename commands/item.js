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
const Item_1 = require("../lib/Item");
function item(interact, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const subcmd0 of interact.options.data) {
            switch (subcmd0.name) {
                case 'create':
                    if (!subcmd0.options) {
                        interact.reply({ content: '请输入必要参数。', ephemeral: true });
                        return;
                    }
                    const itemObj = {
                        creator: interact.user.id,
                        name: '',
                        description: '',
                        url: '',
                        image: undefined
                    };
                    for (const subcmd1 of subcmd0.options) {
                        if (!subcmd1.value)
                            return;
                        switch (subcmd1.name) {
                            case 'name':
                                itemObj.name = subcmd1.value;
                                break;
                            case 'info':
                                itemObj.description = subcmd1.value;
                                break;
                            case 'url':
                                itemObj.url = subcmd1.value;
                                break;
                            case 'image':
                                itemObj.image = subcmd1.value;
                                break;
                        }
                    }
                    const check = Item_1.Item.checkPublish(itemObj);
                    if (!check.pass) {
                        interact.reply({ content: check.note, ephemeral: true });
                        return;
                    }
                    const item = yield amateras.items.create(itemObj);
                    item.sendItem(interact);
                    break;
            }
        }
    });
}
exports.default = item;
//# sourceMappingURL=item.js.map