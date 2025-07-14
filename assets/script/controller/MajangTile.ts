import { _decorator, Component, Node, Sprite, SpriteFrame, Vec3, tween, EventMouse, Label } from 'cc';
import { MajangData } from "db://assets/script/model/MajangData";
import { AssetManager } from "./AssetManager"; // 假设AssetManager在同一目录下

const { property, ccclass, requireComponent } = _decorator;

@ccclass('MajangTile')
@requireComponent(Sprite)
export class MajangTile extends Component {

    // 2. 添加一个 Label 类型的属性来关联节点
    @property({
        type: Label,
        tooltip: '用于显示麻将Key的Label节点'
    })
    public keyLabel: Label = null;

    majangData: MajangData;
    private originalPosition: Vec3 = null; // 用来存储麻将的初始位置
    private isHovering: boolean = false;   // 标记当前是否正处于浮起状态

    onLoad() {
        // 注册鼠标事件监听
        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
    }

    onDestroy() {
        // 组件销毁时，最好也移除事件监听，避免内存泄漏
        this.node.off(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.off(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
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

        // 3. 设置 Label 文本
        if (this.keyLabel) {
            this.keyLabel.string = majangData.key;
        } else {
            console.warn("MajangTile: 未在Prefab中关联 keyLabel 节点。");
        }
    }

    /**
     * 当鼠标进入节点区域时调用
     */
    private onMouseEnter(event: EventMouse) {
        if (this.isHovering) return; // 如果已经处于浮起状态，则不做任何事
        this.isHovering = true;

        // 记录节点的初始位置（如果尚未记录）
        // Layout组件处理完布局后，位置才是最终位置，所以在这里获取最准
        if (this.originalPosition === null) {
            this.originalPosition = this.node.position.clone();
        }

        // 定义向上偏移的目标位置，例如在Y轴上增加20个像素
        const targetPos = new Vec3(this.originalPosition.x, this.originalPosition.y + 5, this.originalPosition.z);

        // 使用 tween 创建一个0.1秒的动画，移动到目标位置
        tween(this.node)
            .to(0, { position: targetPos })
            .start();
    }

    /**
     * 当鼠标离开节点区域时调用
     */
    private onMouseLeave(event: EventMouse) {
        // 只有当它处于浮起状态时，才执行返回动画
        if (!this.isHovering) return;
        this.isHovering = false;

        // 如果初始位置已经记录，则播放动画回到初始位置
        if (this.originalPosition) {
            tween(this.node)
                .to(0.1, { position: this.originalPosition })
                .start();
        }
    }
}