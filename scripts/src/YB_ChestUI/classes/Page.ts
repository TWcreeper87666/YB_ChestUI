import { Container, Entity, ItemStack, Player, system } from "@minecraft/server"
import { Button } from "./Button"
import { Size } from "./ChestUI"

export type ButtonsWithIndex = { [key: number]: Button }

export type PageUpdateFunc = (arg: {
    player: Player, container_e: Container
}) => void

export type PageStartFunc = (arg: {
    player: Player, container_e: Container
}) => void

export type PageOptions = {
    /** The size of the UI, defaults to Size.small */
    size?: Size
    /** Function to execute when the page starts */
    start?: PageStartFunc
    /** 
     * Function to update the page. 
     * Note: The update function will only run if `tickInterval` is set to a number.
     */
    update?: PageUpdateFunc
    /** 
     * The tick interval at which the update function runs, defaults to undefined.
     * If a number is set, the update function will be executed.
     */
    tickInterval?: number
};

export class Page {
    btnWithIdx?: ButtonsWithIndex
    size?: Size
    start?: PageStartFunc
    update?: PageUpdateFunc
    tickInterval?: number

    constructor(btnWithIdx?: ButtonsWithIndex, options: PageOptions = {}) {
        this.btnWithIdx = btnWithIdx
        Object.assign(this, options)
    }
}