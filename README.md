# Amateras-beta
天照是一个开源 Discord Bot，负责管理[异世界公会](https://isekai.live)的自动化系统。

> 使用源代码提示：
> 作者本人撰写代码的知识以及习惯非常不专业，如果想使用这个开源代码，请做好读代码读到吐血的准备。
>
> 开发环境为 Node.js v16, Discord.js v13, MongoDB

## Player 系统
天照会为每一个公会内的成员创建一个玩家身份资料，玩家系统将作为整个天照系统运行的基础子系统之一。

### 个人资料
你可以透过请求天照更改你的 Player 资料卡中的以下内容:
- 个人介绍
- 社群链接
- 资料卡颜色

### 等级
随着玩家在公会内活跃，其等级也会不断提高。玩家的行为会被系统判定是否对公会具有「贡献」，并发放金币奖励玩家。具有贡献的金币来源将会被转化成经验值。
能够提升等级的方法：
- 发送讯息
- 你的讯息被回应
- 回应表情
- 你的讯息被回应表情

## VTuber 系统
经过管理员审核后，VTuber 能够获得 VTuber 身份资料。

### 独立身份资料
VTuber 资料和 Player 资料将分别独立存在，你可以对自己的 VTuber 身份资料进行编辑。当其他玩家查看你的资料时，将能够在两者之间进行切换。
你可以透过请求天照更改你的 VTuber 资料卡中的以下内容:
- 名字
- 个人介绍
- 头像

### 立绘图片文件夹
VTuber 能够将自己的立绘保存到形象文件夹当中。每次加入某个直播房间时，你的立绘将会自动在该房间被分享，方便联动对象获取你的立绘档案。

## 房间系统
VTuber 能够在房间大厅中创建属于你的房间，这个房间只能被创建者、房间成员以及公会管理员看到。

### 邀请成员
你可以透过右键邀请对象的头像或名字打开菜单，从选项「应用程式（Apps）」中点击「Invite」子选项，能够将邀请对象从房间成员名单加入或移除。

### 自动化频道
创建房间后，你能够在频道列表中找到包含你的名字的频道分类，例如：某某的房间。
在这房间中会生成3个频道：
- 素材频道
  - 这里是 VTuber 放置素材的地方。
  - 每当新的成员加入房间，素材频道会自动弹出该成员的 VTuber 立绘文件夹，供联动对象使用。
- 文字频道
- 语音频道

> 由于房间系统仍在测试其便利性，目前你创建的房间是不会自动关闭的，如果使用完房间后，请到房间大厅点击「关闭房间」。

## 钱包系统
天照 Bot 设立了一种虚拟货币，货币价值只在公会 Discord 内有效。

### 概念
金币不会和任何实质物品挂钩而产生实际价值。
金币延申自「贡献」，让公会内的玩家持有金币总量增加的方法，只有透过做出具有贡献的行为进而被天照系统发放金币奖励这个方法。
金币是有限的，但「贡献」并不会有上限，玩家之间的特定金币流动也会制造「贡献」。

### 获取金币
目前金币的唯一来源只有玩家从奖励系统中获得。

### 金币总量
系统初次运行时，天照的钱包将会被输入 10000G 作为整个系统的金币总量上限。
一旦天照的钱包余额为0时，奖励系统将不再发放金币。

### 交易
玩家之间可进行汇款交易，预计在未来会加入交易手续费。从交易中获得的金币不具有「贡献」，无法提升等级。

## 委托系统
Player 能够自行发布委托，这是能够让公会玩家互相帮助的系统。

### 奖励
完成委托的金币奖励将会从委托人的钱包中扣除。
从委托中获取的金币将会被转化为「贡献」。

### 限制
每一个 Player 同时只能发布或接受5个委托。
