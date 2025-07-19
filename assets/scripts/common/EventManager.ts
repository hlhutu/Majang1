export type Callback = (...args: any[]) => void;

export interface EventCallback {
    fun: Callback; // 回调函数
    order: number; // 顺序
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
     * 监听一个事件，可以指定回调的执行顺序
     * @param eventName 事件名称
     * @param func 回调函数
     * @param order 执行顺序，默认为0。数字越小，越先执行。
     */
    on(eventName: string, func: Callback, order: number = 0) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        const callbacks = this.events.get(eventName);

        // 添加新的回调
        callbacks.push({ fun: func, order: order });

        // **核心修改：添加后立即排序**
        // 这样可以保证emit时总是按正确的顺序执行
        callbacks.sort((a, b) => a.order - b.order);
    }

    /**
     * 移除一个事件监听
     * @param eventName 事件名称
     * @param func 要移除的回调函数
     */
    off(eventName: string, func: Callback) {
        const callbacks = this.events.get(eventName);
        if (callbacks) {
            // 找到对应的回调并从数组中移除
            const index = callbacks.findIndex(cb => cb.fun === func);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }


    /**
     * 触发一个事件
     * @param eventName 事件名称
     * @param args 传递给回调函数的参数
     */
    emit(eventName: string, ...args: any[]) {
        const callbacks = this.events.get(eventName);
        if (callbacks && callbacks.length > 0) {
            // 直接遍历已排序的数组并执行
            callbacks.forEach(cb => cb.fun(...args));
        }
    }
}

// 全局访问点
export const eventBus = EventManager.getInstance();
// 事件列表
export const EVENT_GAME_START: string = 'GAME_START';// 游戏开始事件，选择了难度和牌山
export const EVENT_GAME_END: string = 'GAME_END';// 游戏结束事件，返回到开始画面
export const EVENT_APP_EXIT: string = 'APP_EXIT';// 整个程序退出
export const EVENT_STAGE_UP: string = 'STAGE_UP';// 等级提升
export const EVENT_ROUND_START: string = 'ROUND_START'; // 一局开始