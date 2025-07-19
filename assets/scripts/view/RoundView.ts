import {_decorator, Component, director, game, Label, Node } from 'cc';
import { runtime } from "db://assets/scripts/data/Runtime";
import {
    EVENT_GAME_END,
    EVENT_GAME_START,
    EVENT_ROUND_START,
    EVENT_STAGE_UP,
    eventBus
} from "db://assets/scripts/common/EventManager";
const { ccclass, property, requireComponent } = _decorator;

/**
 * 对局场景
 */
@ccclass('RoundView')
export class RoundView extends Component {

    onLoad() {
        eventBus.emit(EVENT_ROUND_START); // 进入场景，表示对局开始了
    }
}