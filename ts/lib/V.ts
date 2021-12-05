import { BaseGuildTextChannel, CommandInteraction, Interaction, Message, MessageActionRow, MessageButton, MessageEmbed, MessageEmbedOptions, TextChannel } from "discord.js";
import { Collection } from "mongodb";
import profile_change_button from "../reacts/profile_change_button";
import v_info_page_button from "../reacts/v_info_page_button";
import v_set_folder_button from "../reacts/v_set_folder_button";
import Amateras from "./Amateras";
import { Lobby } from "./Lobby";
import { Player } from "./Player";
import { cloneObj } from "./terminal";
import { VImage } from "./VImage";
import { VImageFolder } from "./VImageFolder";
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
    constructor(data: VData, player: Player, amateras: Amateras) {
        this.#amateras = amateras
        this.#collection = amateras.db.collection('v')
        this.id = data.id
        this.name = data.name
        this.description = data.description
        this.avatar = data.avatar
        this.me = player
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
        await this.save()
    }

    async sendInfo(interact: CommandInteraction, share: boolean) {
        const channel = <TextChannel> interact.channel
        const messageEle = await this.infoMessage(interact.user.id, channel.parentId!, share)

        interact.reply({embeds: [messageEle.embed], components: messageEle.comp, ephemeral: !share})

        if (share && messageEle.inLobby) {
            this.#amateras.messages.create(<Message>await interact.fetchReply(), {
                v_set_default_folder: 'v_set_folder_button',
                v_info_prev_button: 'v_info_page_button',
                v_info_next_button: 'v_info_page_button',
                v_set_once_folder: 'v_set_folder_button'
            })
        }

        if (!share) {
            const collector = interact.channel!.createMessageComponentCollector({
                filter: (interact2) => {
                    if (!interact2.message.interaction) return false
                    if (interact.user.id === interact2.user.id && interact2.message.interaction!.id === interact.id) return true
                    return false
                },
                time: 1000 * 60
            })

            collector.on('collect', (interact2) => {
                if (interact2.customId === messageEle.next_button.customId || interact2.customId === messageEle.prev_button.customId) {
                    if (interact2.isButton()) v_info_page_button(interact2, this.#amateras, { interactOld: interact, messageEle: <MessageElement>messageEle})
                } else {
                    if (interact2.isButton()) v_set_folder_button(interact2, this.#amateras, { interactOld: interact, messageEle: <MessageElement>messageEle})
                }
            })

            collector.on('end', () => {
                interact.editReply({components: []})
            })
        }
    }

    async sendInfoLobby (lobby: Lobby) {
        const messageEle = await this.infoMessage(this.id, lobby.infoChannel.parentId!)

        const message = <Message>await lobby.infoChannel.send({embeds: [messageEle.embed], components: messageEle.comp})

        const _message = await this.#amateras.messages.create(message, {
            v_set_default_folder: 'v_set_folder_button',
            v_info_prev_button: 'v_info_page_button',
            v_info_next_button: 'v_info_page_button',
            v_set_once_folder: 'v_set_folder_button'
        })

        await lobby.setMessage(this.id, _message)
    }

    private async infoMessage(userId: string, channelId?: string, share?: boolean) {
        let inLobby
        if (!channelId) {
            inLobby = false
        } else {
            inLobby = this.me.joinedLobbies.has(channelId)
        }
        let image: VImage | undefined = undefined
        let folder: VImageFolder | undefined = undefined
        if (!share || inLobby) {
            const lobbyDefaultFolder = this.me.joinedLobbies.get(channelId!)?.vFolder.get(userId)
            folder = inLobby ? lobbyDefaultFolder ? lobbyDefaultFolder : this.imageFolders.default : this.imageFolders.default
            if (folder) {
                image = folder.images.entries().next().value[1]
            }
        }
        const embed = await this.infoEmbed(folder, image)
        const action = new MessageActionRow()
        const action2 = new MessageActionRow()
        let comp: MessageActionRow[] = []
        if (folder && image) {
            if (!share || inLobby) {
                const set_default_button = new MessageButton()
                set_default_button.label = '设定预设直播形象'
                set_default_button.style = 'PRIMARY'
                set_default_button.customId =  '#v_set_default_folder'
                action.addComponents(set_default_button)
                const prev_button = new MessageButton()
                prev_button.label = '上一页'
                prev_button.style = 'SECONDARY'
                prev_button.customId = `${folder.id}$${ folder.toArray().indexOf(image) + 1 }` + '#v_info_prev_button'
                const next_button = new MessageButton()
                next_button.label = '下一页'
                next_button.style = 'SECONDARY'
                next_button.customId = `${folder.id}$${ folder.toArray().indexOf(image) + 1 }` + '#v_info_next_button'
                action2.addComponents(prev_button)
                action2.addComponents(next_button)
    
                if (inLobby) {
                    const set_once_button = new MessageButton
                    set_once_button.label = '设定本次直播形象'
                    set_once_button.style = 'PRIMARY'
                    set_once_button.customId = '#v_set_once_folder'
                    action.addComponents(set_once_button)
                }
                comp.push(action)
                comp.push(action2)
            }
        }
        

        return {
            inLobby: inLobby,
            embed: embed,
            comp: comp,
            set_default_button: action.components[0],
            set_once_button: action.components[1],
            prev_button: action2.components[0],
            next_button: action2.components[1],
        }
    }

    async infoEmbed(folder?: VImageFolder, image?: VImage) {
        
        const user = await this.#amateras.client.users.fetch(this.id)
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
            },
            footer: {
                text: this.id
            },
            color: <number>this.me.color
        })
        if (image) {
            embed.setImage(image.url)
            if (folder) {
                embed.addField(`${folder.name ? folder.name : '未命名'}`, `${ folder.toArray().indexOf(image) + 1 } / ${ folder.toArray().length }`, true)
            }
        }
        
        return embed
    }
}