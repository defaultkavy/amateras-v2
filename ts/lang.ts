import fs from 'fs'

const folders = fs.readdirSync('./languages');
const result: any = {}
for (const folderName of folders) {
    const files = fs.readdirSync(`./languages/${folderName}`)
    for (const file of files) {
        const json = require(`./languages/${folderName}/${file}`)
        for (const prop in json) {
            if (!result[prop]) result[prop] = {}
            for (const script in json[prop]) {
                if (!result[prop][script]) result[prop][script] = {}
                result[prop][script][folderName] = json[prop][script]
            }
        }
    }
}
fs.writeFileSync(`./ts/lang.json`, JSON.stringify(result))