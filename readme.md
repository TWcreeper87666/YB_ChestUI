
關閉標籤顯示，不然會很醜
/gamerule showtags false

page的update function預設為關閉，將tickInterval設成1以上即可使用

ChestUI裡面提供暫時儲存玩家數據
getPlayerData/setPlayerData
切換頁面時會被清空，請自行於page.start建立、page.update更改...


使用ItemLockMode.slot來識別是否為UI中的物品
如果物品欄中有鎖在slot的物品會有衝突
可以手動修改ChestUI class中的下面兩個function


頁面不存在使用console.log告知

```ts
static isUIItem(item: ItemStack) {
    return item?.lockMode === ItemLockMode.slot
}
static ToUIItem(item: ItemStack) {
    item.lockMode = ItemLockMode.slot
}
```

usages:
- static page
- switch page
- page update & individual temp data
- in game

todo:
images of various size with index
test leave game dup 
hitbox pvp test
put on github: res pack using url
debug mode: show how many pages assigned

JsonButton add updateType、amount

optimize:
- dynamic inventory size component
- difference size change method
- rename data to cookie

tutorial on how to:
- button default sound
- open item typeId




pageInfo -> page
