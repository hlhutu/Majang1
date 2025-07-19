import {_decorator, Component, director, game } from 'cc';
import { runtime } from "db://assets/scripts/data/Runtime";
import {
    EVENT_APP_EXIT,
    EVENT_GAME_START,
    EVENT_STAGE_UP,
    eventBus
} from "db://assets/scripts/common/EventManager";
const { ccclass, property, requireComponent } = _decorator;

/**
 * 游戏入口
 * 开始/退出，选择起始套牌，选择难度等
 */
@ccclass('EntranceView')
export class EntranceView extends Component {

    onLoad() {
    }

    clickStartGame() {
        // 模拟选择难度0，默认牌组
        runtime.difficulty = 0;
        runtime.deckName = 'default';
        // 发布
        eventBus.emit(EVENT_GAME_START); // 发布游戏开始事件
        director.loadScene("scenes/WindSelectScene");
    }

    clickExit() {
        eventBus.emit(EVENT_APP_EXIT);// 发布退出程序
        game.end();
    }
}