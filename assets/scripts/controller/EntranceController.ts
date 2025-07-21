import {_decorator, Component, game } from 'cc';
import { runtime } from "db://assets/scripts/data/Runtime";
import {EVENT_GAME_END, EVENT_GAME_START, eventBus} from "db://assets/scripts/common/EventManager";
const { ccclass } = _decorator;

/**
 * 游戏入口
 * 开始/退出，选择起始套牌，选择难度等
 */
class EntranceController {

    // 单例
    private static instance: EntranceController;
    public static getInstance(): EntranceController {
        if (!EntranceController.instance) {
            EntranceController.instance = new EntranceController();
        }
        return EntranceController.instance;
    }
    private constructor() {// 游戏内容初始化
        eventBus.on(EVENT_GAME_START, this.init, this, -1)
    }

    private init() {
        runtime.init();
    }

    private gameOver(): void {

    }
}
// 全局访问点
export const entranceController = EntranceController.getInstance();