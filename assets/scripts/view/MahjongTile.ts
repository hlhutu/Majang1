import {_decorator, Component, Node, Sprite, SpriteFrame, Vec3, tween, EventMouse, Label, find} from 'cc';
import {
    EVENT_CARD_HOVER,
    EVENT_CARD_HOVER_LEAVE,
    EVENT_PLAY_CARD,
    eventBus
} from "db://assets/scripts/common/EventManager";
import {AssetManager} from "db://assets/scripts/common/AssetManager";
import {MahjongData} from "db://assets/scripts/model/MahjongData";
const { property, ccclass, requireComponent } = _decorator;

@ccclass('MahjongTile')
@requireComponent(Sprite)
export class MahjongTile extends Component {

    @property({ type: Label, tooltip: '用于显示麻将Key的Label节点' })
    public keyLabel: Label = null;

    public isInteractive: boolean = false;// 是否可响应变化，默认不可
    public mahjongData: MahjongData;
    private originalPosition: Vec3 = null;
    private isHovering: boolean = false;

    onLoad() {
        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    onDestroy() {
        this.node.off(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.off(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.off(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    private onMouseDown(event: EventMouse) {
        if (!this.isInteractive) return;
        eventBus.emit(EVENT_PLAY_CARD, this.mahjongData); // 发布打出牌事件
    }

    init(mahjongData: MahjongData) {
        this.mahjongData = mahjongData;
        const sprite = this.getComponent(Sprite);

        if (!sprite) {
            console.error("在 MajangTile 节点上找不到 Sprite 组件！");
            return;
        }

        const spriteFrame = AssetManager.instance.getSpriteFrame(mahjongData.color, mahjongData.point);
        if (spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        } else {
            console.error("资源加载失败 for ", mahjongData.color, mahjongData.point);
        }

        if (this.keyLabel) {
            this.keyLabel.string = mahjongData.key;
        } else {
            console.warn("MajangTile: 未在Prefab中关联 keyLabel 节点。");
        }
    }

    private onMouseEnter(event: EventMouse) {
        // 悬浮效果
        if (!this.isInteractive || this.isHovering) return;
        // 发布悬浮事件
        eventBus.emit(EVENT_CARD_HOVER, this.mahjongData);
        this.isHovering = true;
        if (this.originalPosition === null) {
            this.originalPosition = this.node.position.clone();
        }
        // const targetPos = new Vec3(this.originalPosition.x, this.originalPosition.y + 20, this.originalPosition.z);
        // tween(this.node)
        //     .to(0.1, { position: targetPos })
        //     .start();
    }

    private onMouseLeave(event: EventMouse) {
        // 悬浮效果
        if (!this.isInteractive || !this.isHovering) return;
        // 发布离开事件
        eventBus.emit(EVENT_CARD_HOVER_LEAVE, this.mahjongData);
        this.isHovering = false;
        // if (this.originalPosition) {
        //     tween(this.node)
        //         .to(0.1, { position: this.originalPosition })
        //         .start();
        // }
    }
}