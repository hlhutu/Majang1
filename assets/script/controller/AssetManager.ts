import { _decorator, Component, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AssetManager')
export class AssetManager extends Component {

    // ----------- 单例 -----------
    private static _instance: AssetManager = null;
    public static get instance(): AssetManager {
        return this._instance;
    }

    onLoad() {
        if (AssetManager._instance === null) {
            AssetManager._instance = this;
            // console.log("AssetManager initialized!");
        } else {
            this.destroy();
        }
    }
    // ---------------------------

    @property({
        type: [SpriteFrame],
        tooltip: '万字牌图片，请按 1-9 的顺序拖入'
    })
    public wan_tiles: SpriteFrame[] = [];

    @property({
        type: [SpriteFrame],
        tooltip: '筒字牌图片，请按 1-9 的顺序拖入'
    })
    public tong_tiles: SpriteFrame[] = [];

    @property({
        type: [SpriteFrame],
        tooltip: '索字牌图片，请按 1-9 的顺序拖入'
    })
    public suo_tiles: SpriteFrame[] = [];

    // 如果你有风牌和三元牌，也用同样的方式添加
    @property({ type: [SpriteFrame], tooltip: '风牌图片，请按 [东南西北] 的顺序拖入' })
    public feng_tiles: SpriteFrame[] = [];

    @property({ type: [SpriteFrame], tooltip: '三元牌图片，请按 [中发白] 的顺序拖入'  })
    public sanyuan_tiles: SpriteFrame[] = [];

    /**
     * 根据花色和点数获取对应的 SpriteFrame
     * @param color 'W', 'T', 'S'
     * @param point 1-9
     */
    public getSpriteFrame(color: string, point: number): SpriteFrame | null {
        // 点数从1开始，数组索引从0开始，所以需要-1
        const index = point - 1;

        switch(color) {
            case 'W':
                return this.wan_tiles[index] || null;
            case 'T':
                return this.tong_tiles[index] || null;
            case 'S':
                return this.suo_tiles[index] || null;
            case 'F':
                return this.feng_tiles[index] || null;
            case 'D':
                return this.sanyuan_tiles[index] || null;
            default:
                return null;
        }
    }
}