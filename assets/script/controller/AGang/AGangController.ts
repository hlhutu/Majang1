import {_decorator, Component, Sprite, Vec2, Rect, Node, EventTouch} from 'cc';
import {MajangData} from "db://assets/script/model/MajangData";
import {GameViewController} from "db://assets/script/controller/GameViewController";
import {YakuCalculator} from "db://assets/script/controller/YakuCalculator";
import {StatusBarViewController} from "db://assets/script/controller/StatusBarManager";
import {GameLogicController} from "db://assets/script/controller/GameLogicController";
import {MajangTile} from "db://assets/script/controller/MajangTile";

const { ccclass, property, requireComponent } = _decorator;

@ccclass('AGangController')
@requireComponent(Sprite)
export class AGangController extends Component {

    @property({ type: Vec2, tooltip: '素材的起点坐标' })
    imgStart: Vec2 = new Vec2(0, 0); // 可以设置一个默认值
    @property({ type: Vec2, tooltip: '素材的宽和高' })
    imgSize: Vec2 = new Vec2(64, 32); // 可以设置一个默认值

    private gameLogic: GameLogicController;// 游戏逻辑

    onLoad() {
        // 修改资源的方位
        const sprite = this.getComponent(Sprite);
        // 安全检查，确保Sprite和SpriteFrame都存在
        if (!sprite || !sprite.spriteFrame) {
            console.error("无法找到Sprite组件或其SpriteFrame。");
            return;
        }
        sprite.spriteFrame.rect = new Rect(this.imgStart.x, this.imgStart.y, this.imgSize.x, this.imgSize.y);
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
        // 获取到当前的组件
        const componentInChildren = this.getComponentInChildren(MajangTile);
        if (componentInChildren) {// 找到其中的麻将组件
            this.gameLogic.moveToGangs(componentInChildren.majangData.key)
            // 之后再抽一张牌
            this.gameLogic.claimCard()
        }else {
            console.error('MajangTile not found')
        }
    }
}