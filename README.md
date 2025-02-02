# YB_ChestUI
For Minecraft Bedrock Editition.

## Gamerule
`/gamerule showtags false`
關閉標籤顯示，不然會很醜

## Resource pack download
[YB_ChestUI_rp](https://drive.google.com/file/d/1Jcxw4wSeKuQIIOPivXvKCtBjbooeu-__/view?usp=sharing)

## Notice

### page的update function預設為關閉，將tickInterval設成1以上即可使用
```ts
new Page({}, {
    start: ({ player }) => {
        player.playSound('note.harp')
    }, tickInterval: 20
})
```

### temporary data storage like cookie
切換頁面時會被清空，請自行於page的start建立，update、按鈕onClick修改
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

### ChestUI.config
可以直接修改預設值
```ts
config = {
    defaultPageName: 'home' as const,
    defaultClickSound: 'random.click',
    defaultButtonUpdateType: UpdateType.typeId,
    defaultPage: new Page({ 13: new Button('homePage\n[default]', 'bedrock') }),
    defaultPageSize: Size.small
}
```

### Page does not exist
頁面不存在將使用console.log告知，並導回預設頁面 `ChestUI.config.defaultPageName`

### UIItem 識別
使用ItemLockMode.slot來識別是否為UI中的物品
玩家物品欄中本來就有的會被吃掉，請小心
可以手動修改ChestUI的下面兩個function增加更多識別方式
```ts
static isUIItem(item: ItemStack) {
    return item?.lockMode === ItemLockMode.slot
}
static ToUIItem(item: ItemStack) {
    item.lockMode = ItemLockMode.slot
}
```
使用 `setPageItem` 可以在頁面上放入 UIItem。如果位置上不是 UIItem，該方法會將原始物品歸還  
配合page的update或start，就可以為每個玩家顯示不同的資訊
```ts
new Page({}, {
    start: ({ player }) => {
        const item = ChestUI.newUIItem(`name: ${player.name}`, 'oak_sign')
        ChestUI.setPageItem(player, { 13: item })
    }
})
```

## Script usages

### Make a static page
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
### Switch page and page size
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
### Page update and temporary data
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
## In game usages
Put a chest, add some items to serve as buttons, and hold `yb:eui_register` while opening it. You will see a form that allows you to modify each button, with the last button being used to register this chest as a static page.  

You can modify a button's properties, such as `name`, `clickSound`, `toPage`, and `commands`. Use `/` to create a new line and `//` to escape a line break.  

After making your changes, simply register your page and enjoy the result!

## TODO
- images of various size with index
- hitbox pvp test
- debug mode?: show how many pages assigned
- JsonButton add updateType?

## Optimize:
- dynamic inventory size component
- difference size change method optimize
- rename data to cookie?
