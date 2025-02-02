import { ItemStack, Player, Entity, ItemLockMode, Container, system, world } from "@minecraft/server"
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'
import { givePlayerItem, sendMessage } from "../functions"
import { ButtonsWithIndex, Page } from "./Page"
import { Button } from "./Button"
import { Register } from "./Register"


export enum UpdateType {
    empty,
    amount,
    typeId,
    stackable
}

export enum Size {
    small = 27,
    large = 54,
    extra = 117,
    piano = 28,
}


export class ChestUI {
    static config = {
        defaultPageName: 'home' as const,
        defaultClickSound: 'random.click',
        defaultButtonUpdateType: UpdateType.typeId,
        defaultPage: new Page({ 13: new Button('homePage\n[default]', 'bedrock') }),
        defaultPageSize: Size.small
    }

    // Static pages store
    static #pages: { [key: string]: Page } = {
        [ChestUI.config.defaultPageName]: ChestUI.config.defaultPage
    }

    // --- Page management functions ---
    static setUIPage(name: string, page: Page) {
        if (page) {
            this.#pages[name] = page
        } else if (name === this.config.defaultPageName) {
            this.#pages[name] = this.config.defaultPage
        }
    }

    static getPage(player: Player) {
        let name = this.getPageName(player)
        if (!(name in this.#pages)) {
            console.log(`page "${name}" does not exist`)
            name = this.config.defaultPageName
            this.#setPageName(player, name)
        }
        const page = this.#pages[name]
        if (!page.size) page.size = this.config.defaultPageSize
        return page
    }

    static setPage(player: Player, name: string) {
        const prePageName = this.getPageName(player)
        if (prePageName in this.#pages) this.#pages[prePageName].quit?.({ player })

        const preSize = this.getPage(player).size
        if (!this.isUsingUI(player)) return
        if (!(name in this.#pages)) {
            console.log(`page "${name}" does not exist`)
            name = this.config.defaultPageName
        }
        const page = this.#pages[name]
        this.#setPageName(player, name)

        const entity = this.getEntity(player)
        if (preSize !== page.size) {
            sendMessage(player, '請重新開啟介面!')
            return this.#spawnEntity(player)
        }
        if (!entity) return this.#spawnEntity(player)
        this.setData(player, undefined)
        player.setDynamicProperty('yb:eui_pageUpdateTick', 0)
        this.#pageInit(player, entity, page)
    }

    static #pageInit(player: Player, entity: Entity, page: Page) {
        const container_e = entity.getComponent('inventory').container
        if (!container_e.isValid()) return

        const { btnWithIdx, size, start } = page

        for (let i = 0; i < size; i++) {
            const item = container_e.getItem(i)
            if (item && !this.isUIItem(item)) givePlayerItem(player, item)
            try {
                container_e.setItem(i, btnWithIdx[i]?.item)
            } catch (error) {
                console.log(`${JSON.stringify(btnWithIdx)} ${i} ${size} ${error} ${error.stack}`)
            }
        }

        start?.({ player, container_e })
    }

    static getPageName(player: Player) {
        return player.getDynamicProperty('yb:eui_page') as string ?? this.config.defaultPageName
    }

    static #setPageName(player: Player, name: string) {
        player.setDynamicProperty('yb:eui_page', name)
    }

    // --- UI Item handling ---
    static isUIItem(item: ItemStack) {
        return item?.lockMode === ItemLockMode.slot
    }

    static ToUIItem(item: ItemStack) {
        item.lockMode = ItemLockMode.slot
    }

    static newUIItem(nameTag: string, typeId: string, amount = 1) {
        const item = new ItemStack(typeId)
        item.nameTag = '§r' + nameTag
        item.amount = amount
        this.ToUIItem(item)
        return item
    }

    static setPageItem(player: Player, itemsWithIdx: { [key: number]: ItemStack }) {
        const entity = this.getEntity(player)
        if (!entity) return
        const container = entity.getComponent('inventory').container
        if (!container.isValid()) return
        for (const [key, item] of Object.entries(itemsWithIdx)) {
            const slot = parseInt(key)
            const preItem = container.getItem(slot)
            if (preItem && !this.isUIItem(preItem)) givePlayerItem(player, preItem)
            if (item) this.ToUIItem(item)
            container.setItem(slot, item)
        }
    }

    // --- Entity management ---
    static getEntity(player: Player) {
        const id = player.getDynamicProperty('yb:eui_entityId') as string
        if (!id) return
        const entity = world.getEntity(id)
        return entity?.isValid() ? entity : undefined
    }

    static #killEntity(entity: Entity) {
        if (!entity) return false
        const container = entity.getComponent('inventory').container
        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i)
            if (!item || this.isUIItem(item)) continue
            entity.dimension.spawnItem(item, entity.location)
        }
        entity.triggerEvent('yb:kill')
        return true
    }

    static removeUnownedEntity(entity: Entity) {
        if (!entity?.isValid()) return
        const owner = entity.getComponent('tameable').tamedToPlayer
        if (!owner?.isValid()) this.#killEntity(entity)
    }

    static #spawnEntity(player: Player, pageName?: string) {
        const page = this.getPage(player)

        this.#killEntity(this.getEntity(player))
        let entity: Entity
        try {
            entity = player.dimension.spawnEntity('yb:ui_entity', player.getHeadLocation())
        } catch {
            return
        }
        entity.getComponent('tameable').tame(player)
        entity.nameTag = this.#getSizeName(page.size)
        player.setDynamicProperty('yb:eui_entityId', entity.id)

        this.#pageInit(player, entity, page)
        if (pageName) this.#setPageName(player, pageName)
        return entity
    }

    static #getSizeName(size: Size) {
        switch (size) {
            case Size.small: return '§l'
            case Size.large: return '§l§a§r§g§e'
            case Size.extra: return '§e§x§t§r§a'
            case Size.piano: return '§p§i§a§n§o'
        }
    }

    // --- UI State management ---
    static isUsingUI(player: Player) {
        try {
            const slot = player.getComponent('inventory').container.getSlot(player.selectedSlotIndex)
            return slot?.typeId === 'yb:eui_open'
        } catch {
            return false
        }
    }

    static getData(player: Player) {
        const data = player.getDynamicProperty('yb:eui_data') as string
        return data ? JSON.parse(data) as { [key: string]: boolean | number | string | object } : {}
    }

    static setData(player: Player, value: { [key: string]: boolean | number | string | object }) {
        player.setDynamicProperty('yb:eui_data', value ? JSON.stringify(value) : undefined)
    }

    // --- UI updates ---
    static update(player: Player) {
        if (!this.isUsingUI(player)) return this.close(player, this.config.defaultPageName)
        let entity = this.getEntity(player)
        if (!entity) entity = this.#spawnEntity(player)
        if (!entity?.isValid()) return
        const container_e = entity.getComponent('inventory').container
        const page = this.getPage(player)

        if (page.tickInterval) {
            const pageUpdateTick = player.getDynamicProperty('yb:eui_pageUpdateTick') as number ?? 0
            if (system.currentTick >= pageUpdateTick) {
                player.setDynamicProperty('yb:eui_pageUpdateTick', system.currentTick + page.tickInterval)
                page.update?.({ player, container_e })
            }
        }

        for (const [key, button] of Object.entries(page.btnWithIdx)) {
            const idx = parseInt(key)
            const item = container_e.getItem(idx)
            const runAction = button.onClickCheck(item)
            if (runAction) {
                player.playSound(button.clickSound ?? this.config.defaultClickSound)
                if (button.toPage) {
                    ChestUI.setPage(player, button.toPage)
                    break
                }
                if (item && !ChestUI.isUIItem(item)) givePlayerItem(player, item)
                container_e.setItem(idx, button.item)
                button.onClick?.({ player, container_e, item: button.item.clone(), idx })
                break
            }
        }

        entity.tryTeleport(player.getHeadLocation())

        this.removeUIItems(player)
    }

    static removeUIItems(player: Player) {
        const container_p = player.getComponent('inventory').container
        for (let i = 0; i < container_p.size; i++) {
            if (this.isUIItem(container_p.getItem(i))) {
                container_p.setItem(i, undefined)
            }
        }

        const cursor_p = player.getComponent('cursor_inventory')
        if (this.isUIItem(cursor_p.item)) cursor_p.clear()
    }

    static close(player: Player, pageName?: string) {
        if (pageName) {
            const prePageName = this.getPageName(player)
            if (prePageName !== pageName && prePageName in this.#pages) {
                this.#pages[prePageName].quit?.({ player })
            }
        }
        const entity = this.getEntity(player)
        if (!entity) return
        this.#killEntity(entity)
        this.removeUIItems(player)
        if (pageName) this.#setPageName(player, pageName)
    }
}

export { Button, Page }

world.afterEvents.entityLoad.subscribe(({ entity }) => {
    if (entity.typeId === 'yb:ui_entity') ChestUI.removeUnownedEntity(entity)
})

world.beforeEvents.playerInteractWithBlock.subscribe(async (e) => {
    const { player, itemStack, block } = e
    if (itemStack?.typeId !== 'yb:eui_register') return
    if (block.typeId !== 'minecraft:chest') return
    e.cancel = true
    await system.waitTicks(1)

    const container = block.getComponent('inventory').container
    new Register(player, container).form_menu()
})

world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
    if (itemStack.typeId !== 'yb:eui_register') return
    new Register(source).form_delete()
})

system.runInterval(() => {
    world.getAllPlayers().forEach(p => ChestUI.update(p))
})

Register.load()