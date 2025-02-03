var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Register_instances, _a, _Register_check, _Register_form_edit, _Register_form_register, _Register_getBtnWithIdx, _Register_buildButton, _Register_setPages, _Register_getPages, _Register_split, _Register_parse;
import { world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { Page, Size } from "./Page";
import { Button } from "./Button";
import { ChestUI } from "./ChestUI";
import { sendMessage } from "../functions";
export class Register {
    constructor(player, container) {
        _Register_instances.add(this);
        this.player = player;
        this.container = container;
    }
    form_menu() {
        if (!__classPrivateFieldGet(this, _Register_instances, "m", _Register_check).call(this))
            return;
        const form = new ActionFormData().title('§l§1修改頁面');
        const indices = [];
        for (let i = 0; i < this.container.size; i++) {
            const item = this.container.getItem(i);
            if (!item)
                continue;
            form.button(`${i} ${item.nameTag ? item.nameTag.split('\n')[0] : item.typeId.replace(/^.*?:/, '')}`);
            indices.push(i);
        }
        form.button('§l註冊頁面');
        form.show(this.player).then(({ canceled, selection }) => {
            if (canceled || !__classPrivateFieldGet(this, _Register_instances, "m", _Register_check).call(this))
                return;
            if (selection < indices.length) {
                __classPrivateFieldGet(this, _Register_instances, "m", _Register_form_edit).call(this, indices[selection]);
            }
            else {
                __classPrivateFieldGet(this, _Register_instances, "m", _Register_form_register).call(this);
            }
        });
    }
    form_delete() {
        const jsonPages = __classPrivateFieldGet(_a, _a, "m", _Register_getPages).call(_a);
        const names = Object.keys(jsonPages);
        if (names.length === 0) {
            return sendMessage(this.player, '§c目前沒有頁面, 點擊箱子註冊');
        }
        const form = new ActionFormData().title('§l§1刪除頁面');
        for (const name of names)
            form.button(name);
        form.show(this.player).then(({ canceled, selection }) => {
            if (canceled)
                return;
            const jsonPages = __classPrivateFieldGet(_a, _a, "m", _Register_getPages).call(_a);
            const name = names[selection];
            delete jsonPages[name];
            __classPrivateFieldGet(_a, _a, "m", _Register_setPages).call(_a, jsonPages);
            ChestUI.setUIPage(name, undefined);
            sendMessage(this.player, `§b已刪除 ${name}`);
        });
    }
    static load() {
        const pages = __classPrivateFieldGet(this, _a, "m", _Register_getPages).call(this);
        for (const pageName in pages) {
            const jsonPage = pages[pageName];
            const btnWithIdx = {};
            for (const idx in jsonPage.btnWithIdx) {
                btnWithIdx[idx] = __classPrivateFieldGet(this, _a, "m", _Register_buildButton).call(this, jsonPage.btnWithIdx[idx]);
            }
            ChestUI.setUIPage(pageName, new Page(btnWithIdx, { size: jsonPage.size }));
        }
    }
}
_a = Register, _Register_instances = new WeakSet(), _Register_check = function _Register_check() {
    if (!this.player.isOp()) {
        sendMessage(this.player, '§c沒有權限使用');
        return false;
    }
    const cond = this.container?.isValid();
    if (!cond)
        sendMessage(this.player, '§c目標箱子已消失');
    return cond;
}, _Register_form_edit = function _Register_form_edit(idx) {
    const item = this.container.getItem(idx);
    const [lore, _, clickSound, toPage, commands] = item.getLore();
    const name = item.nameTag ? __classPrivateFieldGet(_a, _a, "m", _Register_parse).call(_a, item.nameTag.replace(/^§r/, '')) : '';
    const processedCommands = commands ? __classPrivateFieldGet(_a, _a, "m", _Register_parse).call(_a, commands) : '';
    const form = new ModalFormData().title('§l§1修改按鈕')
        .textField('§l名稱("/"換行)', '', name)
        .textField('§l說明("/"換行)', '', lore ?? '')
        .textField(`§l點擊音效(預設為 ${ChestUI.config.defaultClickSound})`, '', clickSound ?? '')
        .textField('§l切換至頁面(將不執行指令)', '', toPage ?? '')
        .textField('§l指令("/"換行, toPage:頁面名稱 可切換頁面, closeUI 關閉UI)', '', processedCommands);
    form.show(this.player).then(({ canceled, formValues }) => {
        if (canceled || !__classPrivateFieldGet(this, _Register_instances, "m", _Register_check).call(this))
            return;
        const [name, lore, clickSound, toPage, commands] = formValues;
        const processedCommands = __classPrivateFieldGet(_a, _a, "m", _Register_split).call(_a, commands).join('\n');
        item.nameTag = '§r' + __classPrivateFieldGet(_a, _a, "m", _Register_split).call(_a, name).join('\n');
        item.setLore([lore, '§r§7-----', clickSound, toPage, processedCommands]);
        this.container.setItem(idx, item);
        sendMessage(this.player, '§e已更新按鈕');
    });
}, _Register_form_register = function _Register_form_register() {
    const options = ['small', 'large'];
    const form = new ModalFormData().title('§l§1註冊頁面')
        .textField('§l頁面名稱', ChestUI.config.defaultPageName)
        .dropdown('§l頁面大小', options);
    form.show(this.player).then(({ canceled, formValues }) => {
        if (canceled || !__classPrivateFieldGet(this, _Register_instances, "m", _Register_check).call(this))
            return;
        const [name, sizeIdx] = formValues;
        if (name.length === 0)
            return sendMessage(this.player, '§c頁面名稱不可為空');
        const jsonPages = __classPrivateFieldGet(_a, _a, "m", _Register_getPages).call(_a);
        jsonPages[name] = {
            size: Size[options[sizeIdx]],
            btnWithIdx: __classPrivateFieldGet(this, _Register_instances, "m", _Register_getBtnWithIdx).call(this)
        };
        __classPrivateFieldGet(_a, _a, "m", _Register_setPages).call(_a, jsonPages);
        _a.load();
        sendMessage(this.player, '§a已註冊頁面');
    });
}, _Register_getBtnWithIdx = function _Register_getBtnWithIdx() {
    const btnWithIdx = {};
    for (let i = 0; i < this.container.size; i++) {
        const item = this.container.getItem(i);
        if (!item)
            continue;
        const [lore, _, clickSound, toPage, commands] = item.getLore();
        btnWithIdx[i] = { name: item.nameTag ?? '', typeId: item.typeId, amount: item.amount };
        if (clickSound)
            btnWithIdx[i].clickSound = clickSound;
        if (toPage)
            btnWithIdx[i].toPage = toPage;
        if (commands)
            btnWithIdx[i].commands = __classPrivateFieldGet(_a, _a, "m", _Register_parse).call(_a, commands);
        if (lore)
            btnWithIdx[i].lore = __classPrivateFieldGet(_a, _a, "m", _Register_split).call(_a, lore);
    }
    return btnWithIdx;
}, _Register_buildButton = function _Register_buildButton(jsonButton) {
    const { name, typeId, amount, lore, commands, clickSound, toPage } = jsonButton;
    const processedCommands = commands ? __classPrivateFieldGet(this, _a, "m", _Register_split).call(this, commands).map(command => command.trim()) : [];
    return new Button(name, typeId, {
        amount, clickSound, toPage, lore, onClick: ({ player }) => {
            processedCommands.forEach(command => {
                if (command.startsWith('toPage:')) {
                    const pageName = command.slice(7).trim();
                    ChestUI.setPage(player, pageName);
                }
                else if (command.startsWith('closeUI')) {
                    ChestUI.close(player);
                }
                else {
                    player.runCommand(command);
                }
            });
        }
    });
}, _Register_setPages = function _Register_setPages(pages) {
    world.setDynamicProperty('yb:eui_pages', JSON.stringify(pages) || undefined);
}, _Register_getPages = function _Register_getPages() {
    const data = world.getDynamicProperty('yb:eui_pages');
    return data ? JSON.parse(data) : {};
}, _Register_split = function _Register_split(string) {
    return string.replace(/\/\//g, '#yb:sep#').split('/').map(s => s.replace(/#yb:sep#/g, '/'));
}, _Register_parse = function _Register_parse(string) {
    return string.replace(/\//g, '//').replace(/\n/g, '/');
};
