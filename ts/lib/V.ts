import { Message, MessageEmbed } from "discord.js";
import { Collection } from "mongodb";
import Amateras from "./Amateras";
import { Lobby } from "./Lobby";
import { Player } from "./Player";
import { cloneObj } from "./terminal";
import { VImageFolderManager } from "./VImageFolderManager";

export class V {
    #amateras: Amateras;
    #collection: Collection;
    id: string;
    #imageFolders?: VImageFolderManagerData;
    imageFolders: VImageFolderManager;
    me: Player;
    name?: string;
    description?: string;
    avatar?: string;
    image?: string;
    constructor(data: VData, player: Player, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('v')
        this.id = data.id
        this.name = data.name
        this.description = data.description
        this.avatar = data.avatar
        this.me = player
        this.image = data.image
        this.#imageFolders = data.imageFolders
        this.imageFolders = <VImageFolderManager>{}
    }

    async init() {
        if (this.#imageFolders) {
            this.imageFolders = new VImageFolderManager(this.#imageFolders, this.me, this.#amateras)
            await this.imageFolders.init()
        } else {
            const foldersData: VImageFolderManagerData = {
                folders: {},
                default: undefined
            }
            this.imageFolders = new VImageFolderManager(foldersData, this.me, this.#amateras)
            await this.imageFolders.init()
        }
    }

    async save() {
        const data = cloneObj(this, ['me'])
        data.imageFolders = this.imageFolders.toData()
        const find = await this.#collection.findOne({id: this.id})
        if (find) {
            await this.#collection.replaceOne({id: this.id}, data)
        } else {
            await this.#collection.insertOne(data)
        }
    }

    async setInfo(vObj: VObj) {
        this.name = vObj.name ? vObj.name : this.name
        this.description = vObj.description ? vObj.description : this.description
        this.avatar = vObj.avatar ? vObj.avatar : this.avatar
        this.image = vObj.image ? vObj.image : this.image
        await this.save()
        await this.refreshInfoInLobby()
    }

    async sendInfoLobby (lobby: Lobby) {
        // Check if message already exist
        const _messageFind = lobby.messages.get(this.id)
        if (_messageFind) {
            await _messageFind.delete()
        }
        const embed = this.infoEmbed()
        if (embed === 101) return 101
        const message = <Message>await lobby.infoChannel.send({embeds: [embed]})

        const _message = await this.#amateras.messages.create(message)

        await lobby.setMessage(this.id, _message)
    }

    infoEmbed() {
        const user = this.me.get
        if (!user) return 101
        const embed = new MessageEmbed({
            author: {
                name: 'VTuber'
            },
            title: this.name ? this.name : '未命名',
            description: this.description ? this.description : this.me.description ? this.me.description : undefined,
            thumbnail: {
                url: this.avatar ? this.avatar : user.displayAvatarURL({ size:512 })
            },
            image: {
                url: this.image
            },
            fields: [
                {
                    name: 'Links',
                    value: `[YouTube](https://www.youtube.com/channel/${this.me.youtube}) [Twitter](https://twitter.com/${this.me.twitter})\n[跳图链接](https://discord-reactive-images.fugi.tech/individual/${this.id})` 
                }
            ],
            footer: {
                text: this.id
            },
            color: <number>this.me.color
        })
        
        return embed
    }

    async initInfoInLobby() {
        for (const lobby of this.me.joinedLobbies) {
            this.sendInfoLobby(lobby[1])
        }
    }

    async refreshInfoInLobby() {
        const embed = this.infoEmbed()
        if (embed === 101) return 101
        for (const lobby of this.me.joinedLobbies) {
            const _message = lobby[1].messages.get(this.id)
            if (_message) {
                _message.get.edit({embeds: [embed]})
            }
        }
    }
}