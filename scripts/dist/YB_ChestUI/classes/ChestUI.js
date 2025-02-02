var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _ChestUI_pages, _ChestUI_pageInit, _ChestUI_setPageName, _ChestUI_killEntity, _ChestUI_spawnEntity, _ChestUI_getSizeName;
import { ItemStack, ItemLockMode, system, world } from "@minecraft/server";
import { givePlayerItem, sendMessage } from "../functions";
import { Page } from "./Page";
import { Button } from "./Button";
import { Register } from "./Register";
export var UpdateType;
(function (UpdateType) {
    UpdateType[UpdateType["empty"] = 0] = "empty";
    UpdateType[UpdateType["amount"] = 1] = "amount";
    UpdateType[UpdateType["typeId"] = 2] = "typeId";
    UpdateType[UpdateType["stackable"] = 3] = "stackable";
})(UpdateType || (UpdateType = {}));
export var Size;
(function (Size) {
    Size[Size["small"] = 27] = "small";
    Size[Size["large"] = 54] = "large";
    Size[Size["extra"] = 117] = "extra";
    Size[Size["piano"] = 28] = "piano";
})(Size || (Size = {}));
export class ChestUI {
    // --- Page management functions ---
    static setUIPage(name, page) {
        if (page) {
            __classPrivateFieldGet(this, _a, "f", _ChestUI_pages)[name] = page;
        }
        else if (name === this.config.defaultPageName) {
            __classPrivateFieldGet(this, _a, "f", _ChestUI_pages)[name] = this.config.defaultPage;
        }
    }
    static getPage(player) {
        let name = this.getPageName(player);
        if (!(name in __classPrivateFieldGet(this, _a, "f", _ChestUI_pages))) {
            console.log(`page "${name}" does not exist`);
            name = this.config.defaultPageName;
            __classPrivateFieldGet(this, _a, "m", _ChestUI_setPageName).call(this, player, name);
        }
        const page = __classPrivateFieldGet(this, _a, "f", _ChestUI_pages)[name];
        if (!page.size)
            page.size = this.config.defaultPageSize;
        return page;
    }
    static setPage(player, name) {
        const preSize = this.getPage(player).size;
        if (!this.isUsingUI(player))
            return;
        if (!(name in __classPrivateFieldGet(this, _a, "f", _ChestUI_pages))) {
            console.log(`page "${name}" does not exist`);
            name = this.config.defaultPageName;
        }
        const page = __classPrivateFieldGet(this, _a, "f", _ChestUI_pages)[name];
        __classPrivateFieldGet(this, _a, "m", _ChestUI_setPageName).call(this, player, name);
        const entity = this.getEntity(player);
        if (preSize !== page.size) {
            sendMessage(player, '請重新開啟介面!');
            return __classPrivateFieldGet(this, _a, "m", _ChestUI_spawnEntity).call(this, player);
        }
        if (!entity)
            return __classPrivateFieldGet(this, _a, "m", _ChestUI_spawnEntity).call(this, player);
        this.setData(player, undefined);
        player.setDynamicProperty('yb:eui_pageUpdateTick', 0);
        __classPrivateFieldGet(this, _a, "m", _ChestUI_pageInit).call(this, player, entity, page);
    }
    static getPageName(player) {
        return player.getDynamicProperty('yb:eui_page') ?? this.config.defaultPageName;
    }
    // --- UI Item handling ---
    static isUIItem(item) {
        return item?.lockMode === ItemLockMode.slot;
    }
    static ToUIItem(item) {
        item.lockMode = ItemLockMode.slot;
    }
    static newUIItem(nameTag, typeId, amount = 1) {
        const item = new ItemStack(typeId);
        item.nameTag = '§r' + nameTag;
        item.amount = amount;
        this.ToUIItem(item);
        return item;
    }
    static setPageItem(player, itemsWithIdx) {
        const entity = this.getEntity(player);
        if (!entity)
            return;
        const container = entity.getComponent('inventory').container;
        if (!container.isValid())
            return;
        for (const [key, item] of Object.entries(itemsWithIdx)) {
            const slot = parseInt(key);
            const preItem = container.getItem(slot);
            if (preItem && !this.isUIItem(preItem))
                givePlayerItem(player, preItem);
            if (item)
                this.ToUIItem(item);
            container.setItem(slot, item);
        }
    }
    // --- Entity management ---
    static getEntity(player) {
        const id = player.getDynamicProperty('yb:eui_entityId');
        if (!id)
            return;
        const entity = world.getEntity(id);
        return entity?.isValid() ? entity : undefined;
    }
    static removeUnownedEntity(entity) {
        if (!entity?.isValid())
            return;
        const owner = entity.getComponent('tameable').tamedToPlayer;
        if (!owner?.isValid())
            __classPrivateFieldGet(this, _a, "m", _ChestUI_killEntity).call(this, entity);
    }
    // --- UI State management ---
    static isUsingUI(player) {
        try {
            const slot = player.getComponent('inventory').container.getSlot(player.selectedSlotIndex);
            return slot?.typeId === 'yb:eui_open';
        }
        catch {
            return false;
        }
    }
    static getData(player) {
        const data = player.getDynamicProperty('yb:eui_data');
        return data ? JSON.parse(data) : {};
    }
    static setData(player, value) {
        player.setDynamicProperty('yb:eui_data', value ? JSON.stringify(value) : undefined);
    }
    // --- UI updates ---
    static update(player) {
        if (!this.isUsingUI(player))
            return this.close(player, this.config.defaultPageName);
        let entity = this.getEntity(player);
        if (!entity)
            entity = __classPrivateFieldGet(this, _a, "m", _ChestUI_spawnEntity).call(this, player);
        if (!entity?.isValid())
            return;
        const container_e = entity.getComponent('inventory').container;
        const page = this.getPage(player);
        if (page.tickInterval) {
            const pageUpdateTick = player.getDynamicProperty('yb:eui_pageUpdateTick') ?? 0;
            if (system.currentTick >= pageUpdateTick) {
                player.setDynamicProperty('yb:eui_pageUpdateTick', system.currentTick + page.tickInterval);
                page.update?.({ player, container_e });
            }
        }
        for (const [key, button] of Object.entries(page.btnWithIdx)) {
            const idx = parseInt(key);
            const item = container_e.getItem(idx);
            const runAction = button.onClickCheck(item);
            if (runAction) {
                player.playSound(button.clickSound ?? this.config.defaultClickSound);
                if (button.toPage) {
                    _a.setPage(player, button.toPage);
                    break;
                }
                if (item && !_a.isUIItem(item))
                    givePlayerItem(player, item);
                container_e.setItem(idx, button.item);
                button.onClick?.({ player, container_e, item: button.item.clone(), idx });
                break;
            }
        }
        entity.tryTeleport(player.getHeadLocation());
        this.removeUIItems(player);
    }
    static removeUIItems(player) {
        const container_p = player.getComponent('inventory').container;
        for (let i = 0; i < container_p.size; i++) {
            if (this.isUIItem(container_p.getItem(i))) {
                container_p.setItem(i, undefined);
            }
        }
        const cursor_p = player.getComponent('cursor_inventory');
        if (this.isUIItem(cursor_p.item))
            cursor_p.clear();
    }
    static close(player, page) {
        const entity = this.getEntity(player);
        if (!entity)
            return;
        __classPrivateFieldGet(this, _a, "m", _ChestUI_killEntity).call(this, entity);
        this.removeUIItems(player);
        if (page)
            this.setPage(player, page);
    }
}
_a = ChestUI, _ChestUI_pageInit = function _ChestUI_pageInit(player, entity, page) {
    const container_e = entity.getComponent('inventory').container;
    if (!container_e.isValid())
        return;
    const { btnWithIdx, size, start } = page;
    for (let i = 0; i < size; i++) {
        const item = container_e.getItem(i);
        if (item && !this.isUIItem(item))
            givePlayerItem(player, item);
        try {
            container_e.setItem(i, btnWithIdx[i]?.item);
        }
        catch (error) {
            console.log(`${JSON.stringify(btnWithIdx)} ${i} ${size} ${error} ${error.stack}`);
        }
    }
    start?.({ player, container_e });
}, _ChestUI_setPageName = function _ChestUI_setPageName(player, name) {
    player.setDynamicProperty('yb:eui_page', name);
}, _ChestUI_killEntity = function _ChestUI_killEntity(entity) {
    if (!entity)
        return false;
    const container = entity.getComponent('inventory').container;
    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (!item || this.isUIItem(item))
            continue;
        entity.dimension.spawnItem(item, entity.location);
    }
    entity.triggerEvent('yb:kill');
    return true;
}, _ChestUI_spawnEntity = function _ChestUI_spawnEntity(player, pageName) {
    const page = this.getPage(player);
    __classPrivateFieldGet(this, _a, "m", _ChestUI_killEntity).call(this, this.getEntity(player));
    let entity;
    try {
        entity = player.dimension.spawnEntity('yb:ui_entity', player.getHeadLocation());
    }
    catch {
        return;
    }
    entity.getComponent('tameable').tame(player);
    entity.nameTag = __classPrivateFieldGet(this, _a, "m", _ChestUI_getSizeName).call(this, page.size);
    player.setDynamicProperty('yb:eui_entityId', entity.id);
    __classPrivateFieldGet(this, _a, "m", _ChestUI_pageInit).call(this, player, entity, page);
    if (pageName)
        __classPrivateFieldGet(this, _a, "m", _ChestUI_setPageName).call(this, player, pageName);
    return entity;
}, _ChestUI_getSizeName = function _ChestUI_getSizeName(size) {
    switch (size) {
        case Size.small: return '§l';
        case Size.large: return '§l§a§r§g§e';
        case Size.extra: return '§e§x§t§r§a';
        case Size.piano: return '§p§i§a§n§o';
    }
};
ChestUI.config = {
    defaultPageName: 'home',
    defaultClickSound: 'random.click',
    defaultButtonUpdateType: UpdateType.typeId,
    defaultPage: new Page({ 13: new Button('homePage\n[default]', 'bedrock') }),
    defaultPageSize: Size.small
};
// Static pages store
_ChestUI_pages = { value: {
        [_a.config.defaultPageName]: _a.config.defaultPage
    } };
export { Button, Page };
world.afterEvents.entityLoad.subscribe(({ entity }) => {
    if (entity.typeId === 'yb:ui_entity')
        ChestUI.removeUnownedEntity(entity);
});
world.beforeEvents.playerInteractWithBlock.subscribe(async (e) => {
    const { player, itemStack, block } = e;
    if (itemStack?.typeId !== 'yb:eui_register')
        return;
    if (block.typeId !== 'minecraft:chest')
        return;
    e.cancel = true;
    await system.waitTicks(1);
    const container = block.getComponent('inventory').container;
    new Register(player, container).form_menu();
});
world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
    if (itemStack.typeId !== 'yb:eui_register')
        return;
    new Register(source).form_delete();
});
system.runInterval(() => {
    world.getAllPlayers().forEach(p => ChestUI.update(p));
});
Register.load();
