# YB_ChestUI

## 介紹
- For Minecraft Bedrock Editition.
- 使用物品開啟箱子介面，與使用者交互，可用於製作商店、設定、小遊戲等等。
- 電腦玩家可以直接點擊按鈕，手機玩家請將物品放置到背包中。
- 支援在遊戲內製作靜態頁面，想要更複雜的操作就到 `main.ts` 自己寫吧！ tsc 轉換自己研究下。

[![介紹影片](https://img.youtube.com/vi/3HCimKeEIN8/maxresdefault.jpg)](https://www.youtube.com/watch?v=3HCimKeEIN8)

## 版本

### 懶得維護就不用beta了，少了 `player.isOp()` 能用而已。
- `@minecraft/server`：`1.16.0`
- `@minecraft/server-ui`：`1.3.0`

## 物品
- `yb:eui_open` 開啟箱子UI
- `yb:eui_register` 註冊箱子UI頁面

## 指令
- `/gamerule showtags false` 關閉標籤顯示，不然會很醜。
- `/tag @s add yb:eui_op` 給予使用 `註冊箱子UI頁面` 物品的權限。

## 下載

### YB_ChestUI
- [YB_ChestUI_bp.mcpack](https://drive.google.com/file/d/1mJqsiihfAd2w7Ks2fSigCgk4fO5bAoUq/view?usp=sharing)
- [YB_ChestUI_rp.mcpack](https://drive.google.com/file/d/1Jcxw4wSeKuQIIOPivXvKCtBjbooeu-__/view?usp=sharing)
- [YB_ChestUI.mcaddon](https://drive.google.com/file/d/1A11UyD0mg-YuNSTtIXQc6HwunoeGhdzn/view?usp=drive_link)

### YB_ChestUI_sample
裡面包含了鋼琴、貪吃蛇、踩地雷、2048、數獨可以遊玩。檔案為加密的zip，裡面有行為包跟材質包。
- [YB_ChestUI_sample.zip](https://drive.google.com/file/d/1H3qIe-x_pXWLg7K4HA9JwoXhjldu-l_b/view?usp=sharing)

## 在遊戲中建立靜態頁面

### 超詳細解說
首先給予自己 `yb:eui_op` 標籤，然後放一個箱子，擺一些物品當作按鈕，使用 `註冊箱子UI頁面` 物品開啟箱子，就會出現一個表單。

你可以修改每一個按鈕的屬性，例如 `name` 名稱、`clickSound` 點擊音效、 `toPage` 跳轉頁面和 `commands` 執行指令，使用 `/` 換行， `//` 顯示斜槓。

完成修改後，點擊最後一個按鈕註冊頁面，就完成啦！註冊完後箱子就用不到了，不過留著可以方便修改。

### 頁面先後順序
API 頁面 > 遊戲中建立的頁面 > 預設 home 頁面

## 範例代碼

### 製作靜態頁面
點擊獲取牛排、傳送回大廳、播放龍的叫聲。
```ts
ChestUI.setUIPage('home', new Page({
    11: new Button('click for food', 'cooked_beef', {
        onClick: ({ player }) => givePlayerItem(player, new ItemStack('cooked_beef'))
    }),
    13: new Button('back to hub', 'ender_pearl', {
        onClick: ({ player }) => player.tryTeleport({ x: 0.5, y: 0, z: 0.5 })
    }),
    15: new Button('dragon growl', 'noteblock', {
        clickSound: 'mob.enderdragon.growl'
    })
}))
```

### 頁面的切換與尺寸調整
home 頁面有鐵門可以到 test 頁面，test 頁面有木門可以回到 home 頁面。
```ts
ChestUI.setUIPage('home', new Page({
    58: new Button('to test page', 'iron_door', {
        toPage: 'test'
    })
}, {
    size: Size.extra
}))
ChestUI.setUIPage('test', new Page({
    13: new Button('back to home page', 'wooden_door', {
        toPage: 'home'
    })
}, {
    size: Size.small
}))
```

### 頁面更新與頁面暫存資料
頁面開啟時，新增 idx 變數，左右兩個箭矢可以控制 idx 的值，並於正中央顯示 Hello World、時間、當前人數。
```ts
ChestUI.setUIPage('home', new Page({
    11: new Button('<', 'arrow', {
        onClick: ({ player }) => {
            let idx = ChestUI.getData(player).idx as number
            if (idx > 0) idx--
            ChestUI.setData(player, { idx })
        }
    }),
    15: new Button('>', 'arrow', {
        onClick: ({ player }) => {
            let idx = ChestUI.getData(player).idx as number
            if (idx < 2) idx++
            ChestUI.setData(player, { idx })
        }
    })
}, {
    start: (({ player }) => {
        ChestUI.setData(player, { idx: 0 })
    }),
    update: ({ player, container_e }) => {
        const idx = ChestUI.getData(player).idx as number
        let item: ItemStack
        switch (idx) {
            case 0:
                item = ChestUI.newUIItem(`Hello world`, 'command_block')
                break
            case 1:
                const time = new Date();
                time.setHours(time.getHours() + 8);
                const formattedTime = time.toISOString().slice(11, 19);
                item = ChestUI.newUIItem(formattedTime, 'clock')
                break
            case 2:
                const count = world.getAllPlayers().length
                item = ChestUI.newUIItem(`${count}/30`, 'oak_sign')
                break
        }
        container_e.setItem(13, item) // setPageItem would be better
    },
    tickInterval: 1
}))
```

## 小知識

### 頁面更新函式
`Page` 的 `update` 預設不會執行，將 `tickInterval` 設成 1 以上即可。
```ts
new Page({}, {
    update: ({ player }) => {
        player.playSound('note.harp')
    }, tickInterval: 20
})
```

### 頁面資料暫存
切換頁面時會被清空，請自行於 `Page` 的 `start` 建立，於 `update`、`Button` 的 `onClick` 修改。
```ts
new Page({
    13: new Button('click me!', 'diamond', {
        onClick: ({ player }) => {
            const count = ChestUI.getData(player).count as number + 1
            ChestUI.setData(player, { count })
            player.sendMessage(`click diamond count: ${count}`)
        }
    })
}, {
    start: ({ player }) => {
        ChestUI.setData(player, { count: 0 })
    }
})
```

### 預設值
可以到 `ChestUI` 的 `config` 修改。
```ts
export class ChestUI {
    config = {
        defaultPageName: 'home' as const,
        defaultClickSound: 'random.click',
        defaultButtonUpdateType: UpdateType.typeId,
        defaultPage: new Page({ 13: new Button('homePage\n[default]', 'bedrock') }),
        defaultPageSize: Size.small
    }
    // ...
}
```

### 頁面不存在
頁面不存在將使用 console.log 告知，並導回預設頁面 `ChestUI.config.defaultPageName` 。

### UI 物品識別
使用 `ItemLockMode.slot` 來識別是否為 UI 中的物品，
玩家物品欄中本來就有的會被吃掉，請小心。
可以手動修改 `ChestUI` 的下面兩個 function 增加更多條件。
```ts
static isUIItem(item: ItemStack) {
    return item?.lockMode === ItemLockMode.slot
}
static ToUIItem(item: ItemStack) {
    item.lockMode = ItemLockMode.slot
}
```
使用 `setPageItem` 可以在頁面上放入 UI 物品。如果位置上不是 UI 物品，該方法會將原始物品歸還，配合 `Page` 的 `update` 或 `start` ，就可以為每個玩家顯示不同的資訊。
```ts
new Page({}, {
    start: ({ player }) => {
        const item = new ItemStack('oak_sign')
        item.nameTag = `name: ${player.name}`
        ChestUI.setPageItem(player, { 13: item })
    }
})
```

### 索引值參考圖片
小箱子 `Size.small`  
<img src="https://github.com/user-attachments/assets/69a7b864-98ea-4c4a-9748-aed752ca74e1" width="300">

大箱子 `Size.large`  
<img src="https://github.com/user-attachments/assets/426ce194-10ec-4707-9c14-86b503cccbfa" width="300">

超大箱子 `Size.extra`  
<img src="https://github.com/user-attachments/assets/a150d852-5090-4999-977d-060a5655007f" width="300">

## LAZY TO DO
- hitbox pvp test

## Optimize
- dynamic inventory size component
- Make page changes of different sizes smoother

## Bug:
- Teleportation will cause the UI to fail to open. Change your hotbar to respawn it.
