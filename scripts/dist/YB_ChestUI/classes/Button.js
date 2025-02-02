import { ItemStack } from "@minecraft/server";
import { UpdateType, ChestUI } from "./ChestUI";
export class Button {
    constructor(nameTag, itemType, options = {}) {
        this.item = new ItemStack(itemType);
        this.item.nameTag = '§r' + nameTag;
        ChestUI.ToUIItem(this.item);
        var { lore, amount, ...data } = options;
        if (lore)
            this.item.setLore(lore);
        if (amount)
            this.item.amount = amount;
        Object.assign(this, data);
    }
    onClickCheck(item) {
        switch (this.updateType ?? ChestUI.config.defaultButtonUpdateType) {
            case UpdateType.empty: return !item;
            case UpdateType.amount: return item?.amount !== this.item.amount;
            case UpdateType.typeId: return item?.typeId !== this.item.typeId;
            case UpdateType.stackable: return !item?.isStackableWith(this.item);
            default: return false;
        }
    }
}
