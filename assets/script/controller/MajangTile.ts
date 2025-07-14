// in hlhutu/majang1/Majang1-88bd5fd17289239cf56fb2501ccd5445313091f1/assets/script/controller/MajangTile.ts
import { _decorator, Component, Node, Sprite, SpriteFrame, Vec3, tween, EventMouse, Label, find } from 'cc';
import { MajangData } from "db://assets/script/model/MajangData";
import { AssetManager } from "./AssetManager";
import { GameLogicController } from './GameLogicController';

const { property, ccclass, requireComponent } = _decorator;

@ccclass('MajangTile')
@requireComponent(Sprite)
export class MajangTile extends Component {

    @property({
        type: Label,
        tooltip: '用于显示麻将Key的Label节点'
    })
    public keyLabel: Label = null;

    majangData: MajangData;
    private originalPosition: Vec3 = null;
    private isHovering: boolean = false;
    private gameLogic: GameLogicController = null; // 新增

    onLoad() {
        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        // 新增：监听鼠标点击事件
        this.node.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);

        // 新增：获取 GameLogicController 的实例
        this.gameLogic = find('GameManager').getComponent(GameLogicController);
        if (!this.gameLogic) {
            console.error("在 MajangTile 中找不到 GameLogicController 节点!");
        }
    }

    onDestroy() {
        this.node.off(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.off(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        // 新增：移除鼠标点击事件监听
        this.node.off(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    // 新增：鼠标点击事件处理
    private onMouseDown(event: EventMouse) {
        if (this.gameLogic && this.majangData) {
            this.gameLogic.playCard(this.majangData);
        }
    }

    init(majangData: MajangData) {
        this.majangData = majangData;
        const sprite = this.getComponent(Sprite);

        if (!sprite) {
            console.error("在 MajangTile 节点上找不到 Sprite 组件！");
            return;
        }

        const spriteFrame = AssetManager.instance.getSpriteFrame(majangData.color, majangData.point);
        if (spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        } else {
            console.error("资源加载失败 for ", majangData.color, majangData.point);
        }

        if (this.keyLabel) {
            this.keyLabel.string = majangData.key;
        } else {
            console.warn("MajangTile: 未在Prefab中关联 keyLabel 节点。");
        }
    }

    private onMouseEnter(event: EventMouse) {
        if (this.isHovering) return;
        this.isHovering = true;
        if (this.originalPosition === null) {
            this.originalPosition = this.node.position.clone();
        }
        const targetPos = new Vec3(this.originalPosition.x, this.originalPosition.y + 20, this.originalPosition.z); // 浮起高度改为20
        tween(this.node)
            .to(0.1, { position: targetPos }) // 动画时间改为0.1秒
            .start();
    }

    private onMouseLeave(event: EventMouse) {
        if (!this.isHovering) return;
        this.isHovering = false;
        if (this.originalPosition) {
            tween(this.node)
                .to(0.1, { position: this.originalPosition })
                .start();
        }
    }
}