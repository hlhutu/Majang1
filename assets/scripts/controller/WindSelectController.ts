import {_decorator, Component, director, game, Label, Node } from 'cc';
import { runtime } from "db://assets/scripts/data/Runtime";
import {EVENT_GAME_START, EVENT_ROUND_START, EVENT_STAGE_UP, eventBus} from "db://assets/scripts/common/EventManager";
const { ccclass, property, requireComponent } = _decorator;

/**
 * 选择场风
 */
export class WindSelectController {
    // 单例
    private static instance: WindSelectController;
    public static getInstance(): WindSelectController {
        if (!WindSelectController.instance) {
            WindSelectController.instance = new WindSelectController();
        }
        return WindSelectController.instance;
    }
    private constructor() {
        eventBus.on(EVENT_STAGE_UP, function (level: number) {// 进入关卡
            runtime.stageUp(level);// 关卡提升
        }, -1)
    }
}
// 全局访问点
export const windSelectController = WindSelectController.getInstance();