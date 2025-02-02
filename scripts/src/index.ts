import { Direction, EntityComponentTypes, EntityScaleComponent, MolangVariableMap, Player, RGBA, system, Vector3, world } from '@minecraft/server'
import './YB_ChestUI/main'



world.afterEvents.entityHurt.subscribe(({ damageSource, hurtEntity, damage }) => {
    if (damageSource?.damagingEntity instanceof Player) {
        showParticleText(damageSource.damagingEntity, JSON.stringify(damage), hurtEntity.getHeadLocation())
    }
})

loop()
async function loop() {
    while (true) {
        world.getAllPlayers().forEach(player => {
            const blockRaycastHit = player.getBlockFromViewDirection()
            if (blockRaycastHit) {
                const block = blockRaycastHit.block
                const location = player.getHeadLocation()
                const direction = player.getViewDirection()
                location.x += direction.x
                location.y += direction.y
                location.z += direction.z
                showParticleText(player, `${block.typeId.replace(/^.*?:/, '')}`, location, {
                    maxAge: 0.05
                })
            }
        })
        await system.waitTicks(1)
    }
}


function showParticleText(
    player: Player | null,
    text: string,
    location: Vector3,
    {
        color = { red: 1, green: 0, blue: 0, alpha: 1 },
        fontSize = 0.2,
        maxAge = 2,
        direction
    }: {
        color?: RGBA,
        fontSize?: number,
        maxAge?: number,
        direction?: Vector3
    } = {}
) {
    const variables = new MolangVariableMap();
    variables.setColorRGBA('color', color);
    variables.setFloat('size', fontSize);
    variables.setFloat('max_age', maxAge);

    // 計算文字的偏移方向
    let forward: Vector3;
    if (direction) {
        forward = normalize(direction); // 使用自定義方向
    } else if (player) {
        forward = player.getViewDirection(); // 使用玩家視角方向
    } else {
        forward = { x: 0, y: 0, z: 1 }; // 預設向前（北方）
    }

    const up = { x: 0, y: 1, z: 0 }; // 固定的上方向
    const right = normalize(cross(forward, up));
    const down = normalize(cross(right, forward)); // 計算向下的方向 (換行用)

    // 解析換行
    const lines = text.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        let offset = (line.length * fontSize) / 3;

        // 讓第一行在最上面，最後一行在最下面
        const lineOffset = scale(down, (lines.length - 1 - lineIndex) * fontSize * 1.2);

        for (let i = 0; i < line.length; i++) {
            const char = line[i]; // **確保從左到右顯示**
            if (char === ' ') continue;
            setCharacter(variables, char);

            // 計算字元的水平偏移
            const charOffset = scale(right, (i * fontSize) - offset);

            // 最終粒子位置
            const charLocation = add(add(location, charOffset), lineOffset);

            // 產生粒子
            if (player) {
                player.spawnParticle('yb:char', charLocation, variables);
            } else {
                world.getDimension("overworld").spawnParticle('yb:char', charLocation, variables);
            }
        }
    }
}




// 計算叉積，取得與 `up` 和 `direction` 垂直的向量
function cross(v1: Vector3, v2: Vector3): Vector3 {
    return {
        x: v1.y * v2.z - v1.z * v2.y,
        y: v1.z * v2.x - v1.x * v2.z,
        z: v1.x * v2.y - v1.y * v2.x
    };
}

// 向量加法
function add(v1: Vector3, v2: Vector3): Vector3 {
    return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
}

function subtract(v1: Vector3, v2: Vector3): Vector3 {
    return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z };
}

// 向量縮放
function scale(v: Vector3, factor: number): Vector3 {
    return { x: v.x * factor, y: v.y * factor, z: v.z * factor };
}

// 單位化向量
function normalize(v: Vector3): Vector3 {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return length > 0 ? { x: v.x / length, y: v.y / length, z: v.z / length } : { x: 0, y: 0, z: 0 };
}

// 設定字元 UV 座標
function setCharacter(variables: MolangVariableMap, char: string) {
    const ascii = char.charCodeAt(0);
    if (ascii < 33 || ascii > 126) {
        return null; // 超出範圍
    }

    const index = ascii - 33; // 調整索引，使其從 0 開始
    const x = index % 10;
    const y = Math.floor(index / 10);

    variables.setFloat('uv_x', x);
    variables.setFloat('uv_y', y);
}
