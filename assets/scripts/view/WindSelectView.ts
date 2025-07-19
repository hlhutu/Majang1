import {_decorator, Component, director, game, Label, Node } from 'cc';
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

    private label1:Label;

    onLoad() {
        eventBus.emit(EVENT_STAGE_UP); // 进入场景，表示关卡提升了
        this.textArea.getChildByName("Label1").getComponent(Label).string
            = `${runtime.difficulty}-${runtime.deckName} ${runtime.currentStage}-${Global.windStrs[runtime.prevalentWind]}
${runtime.currentPoint}/${runtime.targetPoint}`;
    }

    clickRoundStart() {
        eventBus.emit(EVENT_ROUND_START);// 发布对局开始事件
        director.loadScene("scenes/RoundScene")// 跳转到对局场景
    }

    clickBack() {
        eventBus.emit(EVENT_GAME_END);// 发布游戏结束事件
        director.loadScene("scenes/StartScene");
    }
}