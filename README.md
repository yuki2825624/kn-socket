# kn-websocket - 1.0.0
- Minecraft を WebSocket サーバーに簡易的に接続するためのモジュールです。
- @minecraft/server モジュールをもとに作成したため、ScriptAPIのような使用感でコーディングが出来ます。
- 日本語のみ対応しています。 (Only Japanese is supported)

# 機能一覧
## イベント
### connection
> WebSocket への接続時

### close
> WebSocket の切断時

### tick
> 毎tick (50ms)
#### Properties
**currentTick**
`read-only currentTick: number;`
開始時からの現在のtick数

**deltaTime**
`read-only deltaTime: number;`
1tick前の時間(ms)と現在の時間(ms)の差

### playerChat
> プレイヤーがチャットを送信した時
#### Properties
**sender**
`read-only sender: Player;`
チャットを送信したプレイヤー

**message**
`read-only message: string;`
送信したメッセージ内容

### tellChat
> プレイヤーへtellのチャットを送信した時
EX) /tell, /tellraw
#### Properties
**sender**
`read-only sender: string;`
tellの送信者のネームタグ (プレイヤーの場合、頭上に表示に表示されている名前であり、ゲーマータグではないので注意)

**receiver**
`read-only receiver: string;`
tellの受信者のネームタグ (senderと同様に注意)

**message**
`read-only message: string;`
送信したメッセージ内容

### playerJoin
> プレイヤーの参加時
#### Properties
**player**
`read-only player: Player;`
参加したプレイヤー

### playerLeave
> プレイヤーの退出時
#### Properties
**player**
`read-only player: Player;`
退出したプレイヤー

### error
> エラーが発生した時
`read-only event: Error`
発生したエラー

# 接続
- 同じデバイス内で使用する場合、ループバック接続を許可してください。
`CheckNetIsolation.exe LoopbackExempt -a -n="Microsoft.MinecraftUWP_8wekyb3d8bbwe"`

- Minecraft の設定で「暗号化された WebSocket 要求」をオフにします。

- `/wsserver`または`/connect`コマンドを使い、接続します。
使用: `/wsserver <IP address>:<PORT>`

- 接続できない場合はファイアウォールの設定を確認してください 

# 使用例
- マインクラフト内の`参加/退出`をコンソールに出力する
```js
const { World } = require("kn-socket");

const world = new World({ port: 30000 });

world.events.on("playerJoin", (event) => {
    console.log(`${event.player.name}が参加しました。`);
})

world.events.on("playerLeave", (event) => {
    console.log(`${event.player.name}が退出しました。`);
})
```

# License
MIT License