interface Command {
    name: string;
    description: string;
    type: number;
    options: Command[];
}

interface PlayerData {
    id: string;
    exp?: number;
    description?: string;
    color?: import('discord.js').ColorResolvable;
    youtube?: string;
    twitter?: string;
    level?: number;
    aka?: string;
    gender?: import('./layout').Gender
    wallets?: string[];
    missions?: PlayerMissionData;
    class?: ('PLAYER' | 'VTUBER')[];
    rewards?: string[]
}
interface VObj {
    name?: string;
    description?: string;
    avatar?: string;
    image?: string;
}

interface VData extends VObj {
    id: string;
    imageFolders?: VImageFolderManagerData;
}

interface VImageFolderManagerData {
    default?: string;
    folders: {[keys: string]: VImageFolderData}
}

interface VImageFolderObj {
    id: string;
    name?: string;
}

interface VImageFolderData extends VImageFolderObj {
    images: string[]
}

interface VImageObj {
    url: string;
}

interface VImageData extends VImageObj {
    id: string;
}

interface TransactionData {
    id: string;
    sender: string;
    receiver: string;
    amount: number;
    date: Date;
}

interface WalletData {
    id: string;
    owner: string;
    balance: number;
}

interface PromiseStatus {
    success: boolean;
    message: string;
}

interface MissionObj {
    title: string;
    description: string;
    reward?: [];
    pay: number;
    persons: number;
    expire: Date | number;
    owner: string;
    status: 'COMPLETED' | 'CANCELED' | 'EXECUTE' | 'EXPIRED'
}

interface MissionData extends MissionObj {
    id: string;
    enable: boolean;
    agents: string[];
    message: string;
    thread: string;
    infoMessage: string;
}

interface PlayerMission {
    active: import('./Mission').Mission[]
    achieve: import('./Mission').Mission[]
}

interface PlayerMissionManagerSelector {
    [keys: string];
    accepted: {
        [keys: string];
        active: import('./PlayerMissionManager').PlayerMissionManager,
        achieve: import('./PlayerMissionManager').PlayerMissionManager
    };
    requested: {
        [keys: string];
        active: import('./PlayerMissionManager').PlayerMissionManager,
        achieve: import('./PlayerMissionManager').PlayerMissionManager
    }
}

interface PlayerMissionData {
    [keys: string];
    accepted: {
        [keys: string];
        active: string[],
        achieve: string[]
    };
    requested: {
        [keys: string];
        active: string[],
        achieve: string[]
    }
}

interface MsgData {
    id: string;
    guild: string;
    channel: string;
    actions?: (ButtonData | SelectMenuData)[][]
}

interface SelectMenuData {
    customId: string;
    options: {
        [keys: string]: string | undefined;
    };
    type: 'SELECT_MENU'
}

interface ButtonData {
    customId: string;
    fn?: string;
    type: 'BUTTON'
}

interface MissionDateData {
    expire_date: Date;
    missions: string[]
}

interface CommandManagerData {
    commands: {[key: string]: string}
}

interface CommandData {
    id: string;
    name: string;
    permissions: import('discord.js').ApplicationCommandPermissionData[]
}

interface _GuildData {
    id: string;
    log?: LogData;
    lobby?: LobbyManagerData;
    forums?: ForumManagerData;
    commands?: GuildCommandManagerData;
    moderators: string[];
}

interface GuildCommandManagerData {
    commands: {[key: string]: string}
}

interface GuildCommandData {
    id: string;
    name: string;
    permissions: import('discord.js').ApplicationCommandPermissionData[]
}

interface ForumManagerData {
    list: string[];
}

interface ForumData {
    id: string;
    state: "OPEN" | "CLOSED"
}

interface _ChannelManagerData {
    lobby?: string[]
}

interface _ChannelData {
    id: string;
}

interface LobbyManagerData {
    channel: string;
    lobbies: string[];
    message?: string;
    permissions: string[]
}

interface LobbyData {
    owner: string;
    member: string[];
    vFolder: {[keys: string]: string};
    categoryChannel: string;
    voiceChannel: string;
    textChannel: string;
    infoChannel: string;
    state: 'OPEN' | 'CLOSED';
    guild: string;
    messages: {[keys: string]: string};
    lobbyMessage?: string;
}

interface LogData {
    channel?: string;
    message?: string;
    messageCount?: number;
}

interface ItemObj {
    creator: string;
    name: string;
    description: string;
    url: string;
    image?: string;
}

interface ItemData extends ItemObj {
    id: string;
}

interface MessageElement {
    inLobby: boolean,
    embed: import('discord.js').MessageEmbed,
    comp: import('discord.js').MessageActionRow[],
    set_default_button: import('discord.js').MessageButton,
    set_once_button: import('discord.js').MessageButton,
    prev_button: import('discord.js').MessageButton,
    next_button: import('discord.js').MessageButton,
}

interface RewardObj {
    owner: string;
    name: string;
    title: string;
    description: string;
    pay: number;
    reach: number;
}

interface RewardData extends RewardObj {
    id: string;
    count: number;
    times: number;
}

interface TransactionObj {
    sender: string;
    receiver: string;
    amount: number;
    note: string;
    devote: boolean;
}

interface TransactionData extends TransactionObj {
    id: string;
    date: Date;
}

interface _CharacterObj {
    name: string;
    description: string;
    url: string;
    avatar?: string;
    gender: 'Male' | 'Female';
    age: number;
}

interface _CharacterData extends _CharacterObj {
    id: string;
    
}