import { ChestUI } from "./classes/ChestUI";
// ChestUI.setUIPage('home', new Page({
//     11: new Button('<', 'arrow', {
//         onClick: ({ player }) => {
//             let idx = ChestUI.getData(player).idx as number
//             if (idx > 0) idx--
//             ChestUI.setData(player, { idx })
//         }
//     }),
//     15: new Button('>', 'arrow', {
//         onClick: ({ player }) => {
//             let idx = ChestUI.getData(player).idx as number
//             if (idx < 2) idx++
//             ChestUI.setData(player, { idx })
//         }
//     })
// }, {
//     start: (({ player }) => {
//         ChestUI.setData(player, { idx: 0 })
//     }),
//     update: ({ player, container_e }) => {
//         const idx = ChestUI.getData(player).idx as number
//         let item: ItemStack
//         switch (idx) {
//             case 0:
//                 item = ChestUI.newUIItem(`Hello world`, 'command_block')
//                 break
//             case 1:
//                 const time = new Date();
//                 time.setHours(time.getHours() + 8);
//                 const formattedTime = time.toISOString().slice(11, 19);
//                 item = ChestUI.newUIItem(formattedTime, 'clock')
//                 break
//             case 2:
//                 const count = world.getPlayers().length
//                 item = ChestUI.newUIItem(`${count}/30`, 'oak_sign')
//                 break
//         }
//         container_e.setItem(13, item)
//     },
//     tickInterval: 1
// }))
ChestUI;
// ChestUI.setUIPage('home', new Page({
//     11: new Button('click for food', 'cooked_beef', {
//         onClick: ({ player }) => givePlayerItem(player, new ItemStack('cooked_beef'))
//     }),
//     13: new Button('back to hub', 'ender_pearl', {
//         onClick: ({ player }) => player.tryTeleport({ x: 0.5, y: 0, z: 0.5 })
//     }),
//     15: new Button('dragon growl', 'noteblock', {
//         clickSound: 'mob.enderdragon.growl'
//     }),
// }, {
// }))
// ChestUI.setUIPage('home', new Page({
//     58: new Button('to test page', 'iron_door', {
//         toPage: 'test'
//     }),
// }, {
//     size: Size.extra,
// }))
// ChestUI.setUIPage('test', new Page({
//     13: new Button('back to home page', 'wooden_door', {
//         toPage: 'home'
//     }),
// }, {
//     size: Size.small,
// }))
