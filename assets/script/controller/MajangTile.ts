// in hlhutu/majang1/Majang1-904d639e403cacaa16a660ae5874fdf1d6a53850/assets/script/controller/MajangTile.ts
import { _decorator, Component, Node, Sprite, SpriteFrame, Vec3, tween, EventMouse, Label, find } from 'cc';
import { MajangData } from "db://assets/script/model/MajangData";
import { AssetManager } from "./AssetManager";
import { GameLogicController } from './GameLogicController';
import { GameViewController } from './GameViewController'; // 引入GameViewController

const { property, ccclass, requireComponent } = _decorator;

@ccclass('MajangTile')
@requireComponent(Sprite)
export class MajangTile extends Component {

    @property({ type: Label, tooltip: '用于显示麻将Key的Label节点' })
    public keyLabel: Label = null;

    public isInteractive: boolean = false;// 是否可响应变化，默认不可
    majangData: MajangData;
    private originalPosition: Vec3 = null;
    private isHovering: boolean = false;
    private gameLogic: GameLogicController = null;
    private gameView: GameViewController = null; // 新增：GameViewController的引用

    onLoad() {
        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);

        const gameManagerNode = find('GameManager');
        if (gameManagerNode) {
            this.gameLogic = gameManagerNode.getComponent(GameLogicController);
            this.gameView = gameManagerNode.getComponent(GameViewController); // 获取GameViewController实例
        }
        if (!this.gameLogic) {
            console.error("在 MajangTile 中找不到 GameLogicController 节点!");
        }
        if (!this.gameView) {
            console.error("在 MajangTile 中找不到 GameViewController 节点!");
        }
    }

    onDestroy() {
        this.node.off(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.off(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.off(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    private onMouseDown(event: EventMouse) {
        if (!this.isInteractive) return;
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
        // 高亮同种牌
        if (this.gameView) {
            this.gameView.highlightSameTiles(this.majangData);
        }

        // 悬浮效果
        if (!this.isInteractive || this.isHovering) return;
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
        // 取消高亮
        if (this.gameView) {
            this.gameView.resetAllTilesColor();
        }

        // 悬浮效果
        if (!this.isInteractive || !this.isHovering) return;
        this.isHovering = false;
        if (this.originalPosition) {
            tween(this.node)
                .to(0.1, { position: this.originalPosition })
                .start();
        }
    }
}