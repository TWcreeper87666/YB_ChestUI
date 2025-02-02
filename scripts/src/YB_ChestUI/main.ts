import { Button, ChestUI, Page } from "./classes/ChestUI"

ChestUI // make your page here!


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
