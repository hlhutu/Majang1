import {_decorator, Component, director, game, Label, Node, Button } from 'cc';
import { runtime } from "db://assets/scripts/data/Runtime";
import {
    EVENT_GAME_END,
    EVENT_GAME_START,
    EVENT_ROUND_START,
    EVENT_STAGE_UP,
    eventBus
} from "db://assets/scripts/common/EventManager";
import {Global} from "db://assets/scripts/data/Global";
const { ccclass, property, requireComponent } = _decorator;

/**
 * 选择场风
 */
@ccclass('WindSelectView')
export class WindSelectView extends Component {

    @property({ type: Node, tooltip: '文本节点' })
    textArea: Node;

    @property({ type: [Node], tooltip: '东西南北的开始按钮' })
    buttons: Node[] = [];

    onLoad() {
    }

    update() {
        // 刷新顶部文字显示
        this.textArea.getChildByName("Label1").getComponent(Label).string
            = `${runtime.difficulty}-${runtime.deckName} ${runtime.currentStage}-${Global.windStrs[runtime.prevalentWind]}
${runtime.currentPoint}/${runtime.targetPoint}`;
        // 刷新按钮
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].active = runtime.prevalentWind==i+1
        }
    }

    clickRoundStart() {
        // 跳转到对局场景
        director.loadScene("scenes/RoundScene", () => {
            eventBus.emit(EVENT_ROUND_START);// 发布对局开始事件
        })
    }

    clickBack() {
        director.loadScene("scenes/StartScene", () => {
            eventBus.emit(EVENT_GAME_END);// 发布游戏结束事件
        });
    }
}