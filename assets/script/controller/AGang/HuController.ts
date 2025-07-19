import {_decorator, Component, Sprite, Vec2, Rect, Node, EventTouch, SpriteFrame} from 'cc';
import {MajangData} from "db://assets/script/model/MajangData";
import {GameViewController} from "db://assets/script/controller/GameViewController";
import {YakuCalculator} from "db://assets/script/controller/YakuCalculator";
import {StatusBarViewController} from "db://assets/script/controller/StatusBarManager";
import {GameLogicController} from "db://assets/script/controller/GameLogicController";
import {MajangTile} from "db://assets/script/controller/MajangTile";

const { ccclass, property, requireComponent } = _decorator;

@ccclass('HuController')
@requireComponent(Sprite)
export class HuController extends Component {

    @property({ type: Vec2, tooltip: '素材的起点坐标' })
    imgStart: Vec2 = new Vec2(0, 0); // 可以设置一个默认值
    @property({ type: Vec2, tooltip: '素材的宽和高' })
    imgSize: Vec2 = new Vec2(64, 32); // 可以设置一个默认值

    private gameLogic: GameLogicController;// 游戏逻辑

    onLoad() {
        const sprite = this.getComponent(Sprite);
        if (!sprite || !sprite.spriteFrame) {
            console.error("无法找到Sprite组件或其SpriteFrame。");
            return;
        }

        // 1. 创建一个新的 SpriteFrame 实例
        const newSpriteFrame = new SpriteFrame();

        // 2. 将原始的纹理 (texture) 和信息赋给新实例
        const originalSpriteFrame = sprite.spriteFrame;
        newSpriteFrame.texture = originalSpriteFrame.texture;
        newSpriteFrame.rotated = originalSpriteFrame.isRotated(); // 保持旋转信息
        newSpriteFrame.insetTop = originalSpriteFrame.insetTop;   // 保持九宫格信息
        newSpriteFrame.insetBottom = originalSpriteFrame.insetBottom;
        newSpriteFrame.insetLeft = originalSpriteFrame.insetLeft;
        newSpriteFrame.insetRight = originalSpriteFrame.insetRight;
        // 3. 在新实例上设置 rect
        newSpriteFrame.rect = new Rect(this.imgStart.x, this.imgStart.y, this.imgSize.x, this.imgSize.y);
        // 4. 将这个全新的 SpriteFrame 赋给当前 Sprite 组件
        sprite.spriteFrame = newSpriteFrame;
    }

    public init(gameLogic: GameLogicController) {
        this.gameLogic = gameLogic;
    }

    onEnable() {
        // 监听节点上的触摸结束事件
        this.node.on(Node.EventType.TOUCH_END, this.onClick, this);
    }

    // 这是一个好习惯：在组件销毁时移除监听，防止内存泄漏
    onDestroy() {
        this.node.off(Node.EventType.TOUCH_END, this.onClick, this);
    }

    private onClick(event: EventTouch) {
        console.log("和了")
    }
}