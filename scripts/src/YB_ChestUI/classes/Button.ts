import { Player, Entity, Container, ItemStack, ItemLockMode, ItemType } from "@minecraft/server"
import { UpdateType, ChestUI } from "./ChestUI"

export type OnClickFunc = (arg: {
    /** The player interacting with the UI */
    player: Player
    /** The container entity holding the inventory */
    container_e: Container
    /** The item being interacted with */
    item: ItemStack
    /** The index of the item in the container */
    idx: number
}) => void;

type buttonOptions = {
    /** Function to execute when clicked */
    onClick?: OnClickFunc
    /** Update type, defaults to typeId */
    updateType?: UpdateType
    /** Sound effect to play when clicked, defaults to 'random.click' */
    clickSound?: string
    /** If set, the onClick function will not execute, and it will navigate to the specified page */
    toPage?: string
    /** Sets the lore value - a secondary display string - for an ItemStack. The lore list is cleared if set to an empty string or undefined. */
    lore?: string[]
    /** Number of the items in the stack. Valid values range between 1-255. The provided value will be clamped to the item's maximum stack size. */
    amount?: number
}

export class Button {
    item: ItemStack
    updateType?: UpdateType
    onClick?: OnClickFunc
    clickSound?: string
    toPage?: string

    constructor(
        nameTag: string,
        itemType: string,
        options: buttonOptions = {}
    ) {
        this.item = new ItemStack(itemType)
        this.item.nameTag = '§r' + nameTag
        ChestUI.ToUIItem(this.item)

        var { lore, amount, ...data } = options
        if (lore) this.item.setLore(lore)
        if (amount) this.item.amount = amount

        Object.assign(this, data)
    }

    onClickCheck(item: ItemStack) {
        switch (this.updateType ?? ChestUI.config.defaultButtonUpdateType) {
            case UpdateType.empty: return !item
            case UpdateType.amount: return item?.amount !== this.item.amount
            case UpdateType.typeId: return item?.typeId !== this.item.typeId
            case UpdateType.stackable: return !item?.isStackableWith(this.item)
            default: return false
        }
    }
}