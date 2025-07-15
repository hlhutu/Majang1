import {_decorator, Component, Sprite, Vec2, Rect} from 'cc';
import {MajangData} from "db://assets/script/model/MajangData";
import {GameViewController} from "db://assets/script/controller/GameViewController";
import {YakuCalculator} from "db://assets/script/controller/YakuCalculator";
import {StatusBarViewController} from "db://assets/script/controller/StatusBarManager";

const { ccclass, property, requireComponent } = _decorator;

@ccclass('AGangController')
@requireComponent(Sprite)
export class AGangController extends Component {

    @property({ type: Vec2, tooltip: '素材的起点坐标' })
    imgStart: Vec2 = new Vec2(0, 0); // 可以设置一个默认值
    @property({ type: Vec2, tooltip: '素材的宽和高' })
    imgSize: Vec2 = new Vec2(64, 32); // 可以设置一个默认值

    onLoad() {
        console.log("修改资源方位")
        // 修改资源的方位
        const sprite = this.getComponent(Sprite);
        // 安全检查，确保Sprite和SpriteFrame都存在
        if (!sprite || !sprite.spriteFrame) {
            console.error("无法找到Sprite组件或其SpriteFrame。");
            return;
        }
        // 1. 克隆当前的 SpriteFrame 以免影响原始资源。这是关键步骤！
        // const newFrame = sprite.spriteFrame;
        // 3. 将这个新的矩形区域应用到克隆出来的 Frame 上。
        sprite.spriteFrame.rect = new Rect(this.imgStart.x, this.imgStart.y, this.imgSize.x, this.imgSize.y);
        // 4. 最后，将这个修改过的、全新的 Frame 设置回 Sprite 组件。
        // sprite.spriteFrame = newFrame;
    }
}