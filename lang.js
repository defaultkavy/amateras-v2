"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const folders = fs_1.default.readdirSync('./languages');
const result = {};
for (const folderName of folders) {
    const files = fs_1.default.readdirSync(`./languages/${folderName}`);
    for (const file of files) {
        const json = require(`./languages/${folderName}/${file}`);
        for (const prop in json) {
            if (!result[prop])
                result[prop] = {};
            for (const script in json[prop]) {
                if (!result[prop][script])
                    result[prop][script] = {};
                result[prop][script][folderName] = json[prop][script];
            }
        }
    }
}
fs_1.default.writeFileSync(`./ts/lang.json`, JSON.stringify(result));
//# sourceMappingURL=lang.js.map