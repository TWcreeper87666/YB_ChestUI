import { ItemStack, Player } from "@minecraft/server"
import { Button, ChestUI, Page, Size } from "./classes/ChestUI"
import { sendMessage } from "./functions"

ChestUI // make your page here!


ChestUI.setUIPage('home', new Page({
    13: new Button('玩貪吃蛇', 'lead', { toPage: 'snake' })
}))

const gameStorage = {} as { [key: string]: SnakeGame }

const homePageBtn = new Button('回首頁', 'iron_door', { toPage: 'home' })

ChestUI.setUIPage('snake', new Page({
    102: homePageBtn
}, {
    size: Size.extra,
    start: ({ player }) => {
        const game = new SnakeGame();
        gameStorage[player.name] = game
    },
    update: ({ player }) => {
        const game = gameStorage[player.name]
        game.update()

        if (game.gameOver) {
            const length = game.getLength()
            player.sendMessage(`你死啦! 長度: ${length}`)
            ChestUI.close(player, 'home')
        } else {
            game.render(player)
        }
    }, tickInterval: 10,
    quit: ({ player }) => {
        delete gameStorage[player.name]
    }
}))

export class SnakeGame {
    private gridSize: number;
    private snake: Array<{ x: number; y: number }>;
    private direction: { x: number; y: number };
    private lastDir: { x: number; y: number };
    private food: { x: number; y: number };
    gameOver = false

    constructor() {
        this.gridSize = 9; // 9x9 grid
        this.snake = [{ x: 4, y: 4 }]; // 蛇的初始位置在正中間
        this.direction = { x: 1, y: 0 }; // 初始方向：向右移動
        this.lastDir = { x: 1, y: 0 }; // 保存上次的方向，避免反向移動
        this.food = this.generateFood(); // 隨機產生食物
    }

    // 隨機產生食物位置
    private generateFood(): { x: number; y: number } {
        let foodPosition: { x: number; y: number };
        do {
            foodPosition = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        } while (this.isSnake(foodPosition)); // 確保食物不會生成在蛇的位置上
        return foodPosition;
    }

    // 判斷位置是否在蛇身上
    private isSnake(position: { x: number; y: number }): boolean {
        return this.snake.some(part => part.x === position.x && part.y === position.y);
    }

    // 更新遊戲狀態
    update(): void {
        const newHead = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // 邊界檢查與自撞檢查
        if (newHead.x < 0 || newHead.x >= this.gridSize || newHead.y < 0 || newHead.y >= this.gridSize || this.isSnake(newHead)) {
            this.gameOver = true
            return
        }

        this.snake.unshift(newHead); // 將新頭部加到蛇的開頭

        // 如果吃到食物，生成新的食物；否則移除蛇的尾巴
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.food = this.generateFood();
        } else {
            this.snake.pop(); // 移除尾巴
        }

        // 更新最後一次的方向
        this.lastDir = { ...this.direction };
    }

    // 渲染遊戲狀態
    render(player: Player): void {
        // const grid = this.
        const obj = {} as { [key: number]: ItemStack };

        const empty = new ItemStack('yb:ms_0')
        const snake = new ItemStack('yb:ms_tile')
        const food = new ItemStack('yb:ms_bomb')

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const idx = x + y * 13
                if (this.isSnake({ x, y })) {
                    obj[idx] = snake
                } else if (this.food.x === x && this.food.y === y) {
                    obj[idx] = food
                } else {
                    obj[idx] = empty
                }
            }
        }

        ChestUI.setPageItem(player, obj);  // 更新 UI
    }

    public getLength() {
        return this.snake.length
    }

    // 控制方向，避免反向移動
    public moveUp(): void {
        if (this.lastDir.y === 0) this.direction = { x: 0, y: -1 }; // 只允許垂直方向移動
    }
    public moveDown(): void {
        if (this.lastDir.y === 0) this.direction = { x: 0, y: 1 };
    }
    public moveLeft(): void {
        if (this.lastDir.x === 0) this.direction = { x: -1, y: 0 }; // 只允許水平方向移動
    }
    public moveRight(): void {
        if (this.lastDir.x === 0) this.direction = { x: 1, y: 0 };
    }
}