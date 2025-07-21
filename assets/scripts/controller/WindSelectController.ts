import {_decorator, Component, director, game, Label, Node, randomRangeInt } from 'cc';
import { runtime } from "db://assets/scripts/data/Runtime";
import {
    EVENT_GAME_START,
    EVENT_ROUND_CAL,
    EVENT_ROUND_START,
    EVENT_STAGE_UP,
    eventBus
} from "db://assets/scripts/common/EventManager";
import {Global} from "db://assets/scripts/data/Global";
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
        eventBus.on(EVENT_STAGE_UP, (level: number) => {// 进入关卡
            this.stageUp(level);// 关卡提升
        }, -1)
        eventBus.on(EVENT_ROUND_CAL, () => {// 局结算
            runtime.currentPoint += runtime.score;// 分数相加
            runtime.score = 0;
            if(runtime.prevalentWind<4) {// 风向+1
                runtime.prevalentWind++;
            }
        }, this, -1)
    }

    // 关卡提升
    private stageUp(level:number) {
        runtime.currentStage = level; // 当前关卡+1
        console.log('关卡提升到'+runtime.currentStage, )
        runtime.selfWind = randomRangeInt(1, 5);// 随机自风
        runtime.prevalentWind = 1;// 从东风开始
        runtime.targetPoint = Global.stages[runtime.difficulty][runtime.currentStage-1]// 目标分数
        runtime.currentPoint = 0;         // 关卡开始时，当前积攒的点数为0
    }
}
// 全局访问点
export const windSelectController = WindSelectController.getInstance();