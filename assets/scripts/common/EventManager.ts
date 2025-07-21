export type Callback = (...args: any[]) => void;

// 1. 修改接口，增加 target 属性来保存 this 上下文
export interface EventCallback {
    fun: Callback;      // 回调函数
    target: any;        // 回调函数执行时的 this 指向
    order: number;      // 顺序
}

class EventManager {
    // 内部事件池
    private events: Map<string, EventCallback[]> = new Map();
    // 单例
    private static instance: EventManager;

    private constructor() {}

    public static getInstance(): EventManager {
        if (!EventManager.instance) {
            EventManager.instance = new EventManager();
        }
        return EventManager.instance;
    }

    /**
     * 2. 修改 on 方法，增加 target 参数
     * @param eventName 事件名称
     * @param func 回调函数
     * @param target 回调函数执行时的 this 对象
     * @param order 执行顺序，默认为0。数字越小，越先执行。
     */
    on(eventName: string, func: Callback, target: any, order: number = 0) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        const callbacks = this.events.get(eventName)!;

        // 添加新的回调，包含 target
        callbacks.push({ fun: func, target: target, order: order });

        // 排序
        callbacks.sort((a, b) => a.order - b.order);
    }

    /**
     * 3. 修改 off 方法，增加 target 参数以精确定位并移除监听
     * @param eventName 事件名称
     * @param func 要移除的回调函数
     * @param target 对应的 this 对象
     */
    off(eventName: string, func: Callback, target: any) {
        const callbacks = this.events.get(eventName);
        if (callbacks) {
            // 通过函数和 target 同时匹配，找到精确的回调并移除
            const index = callbacks.findIndex(cb => cb.fun === func && cb.target === target);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * 4. 修改 emit 方法，使用 apply 来指定 this 上下文执行回调
     * @param eventName 事件名称
     * @param args 传递给回调函数的参数
     */
    emit(eventName: string, ...args: any[]) {
        const callbacks = this.events.get(eventName);
        if (callbacks && callbacks.length > 0) {
            // 克隆数组以防止在回调中修改原数组导致的问题
            const tempCallbacks = [...callbacks];
            tempCallbacks.forEach(cb => {
                // 使用 apply 将保存的 target 作为 this 来执行回调函数
                cb.fun.apply(cb.target, args);
            });
        }
    }
}

// 全局访问点
export const eventBus = EventManager.getInstance();
// 事件列表
export const EVENT_GAME_START: string = 'GAME_START';// 游戏开始事件，选择了难度和牌山
export const EVENT_GAME_END: string = 'GAME_END';// 游戏结束事件，返回到开始画面
export const EVENT_APP_EXIT: string = 'APP_EXIT';// 整个程序退出
export const EVENT_STAGE_UP: string = 'STAGE_UP';// 进入关卡
export const EVENT_WIND_UP: string = 'WIND_UP';// 风提升
export const EVENT_ROUND_START: string = 'ROUND_START'; // 一局开始

export const EVENT_CLAIM_END: string = 'EVENT_CLAIM_END'; // 抽牌结束
export const EVENT_PLAY_CARD: string = 'EVENT_PLAY_CARD'; // 打出一张牌
export const EVENT_CARD_HOVER: string = 'EVENT_CARD_HOVER';// 悬浮在牌上
export const EVENT_CARD_HOVER_LEAVE: string = 'EVENT_CARD_HOVER_LEAVE';// 离开悬浮
export const EVENT_GANG:string = 'EVENT_GANG';// 杠事件
export const EVENT_HU:string = 'EVENT_HU';// 和事件
export const EVENT_ROUND_CAL: string = `EVENT_ROUND_CAL`;// 局结算
export const EVENT_FAIL:string = 'EVENT_FAIL';// 出牌次数用完失败
export const EVENT_LIUJU:string = 'EVENT_LIUJU';// 流局，抽牌牌山失败