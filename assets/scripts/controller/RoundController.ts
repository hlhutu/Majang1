import {_decorator, Component, director, game, Label, Node, randomRangeInt } from 'cc';
import { runtime } from "db://assets/scripts/data/Runtime";
import {
    EVENT_CLAIM_END,
    EVENT_GAME_START, EVENT_GANG, EVENT_HU, EVENT_PLAY_CARD, EVENT_ROUND_CAL,
    EVENT_ROUND_START,
    EVENT_STAGE_UP,
    eventBus
} from "db://assets/scripts/common/EventManager";
import {Global} from "db://assets/scripts/data/Global";
import {MahjongData} from "db://assets/scripts/model/MahjongData";
import {YakuCalculator} from "db://assets/scripts/controller/YakuCalculator";
const { ccclass, property, requireComponent } = _decorator;

/**
 * 对局
 */
export class RoundController {
    // 单例
    private static instance: RoundController;
    public static getInstance(): RoundController {
        if (!RoundController.instance) {
            RoundController.instance = new RoundController();
        }
        return RoundController.instance;
    }
    private constructor() {
        eventBus.on(EVENT_ROUND_START, this.roundStart, this, -1)
        eventBus.on(EVENT_PLAY_CARD, this.playCard, this, -1)
        eventBus.on(EVENT_GANG, (m) => {// 杠牌
            this.moveToGangs(m.key);// 移动到已杠区
            this.claimCard(true);// 立即抽一张牌
        }, this, -1)
    }

    private roundStart() {
        runtime.table = [];// 清空桌面
        runtime.plays = 100+1;// 多给点出牌次数
        this.shuffleDeck();// 洗牌
        this.dealHand(13);// 抽13张牌
        this.claimCard();// 首次抽牌
        runtime.canPlay = true;// 变为可以出牌的状态
    }

    /**
     * 新增：处理打牌逻辑
     * @param playedPai 要打出的牌
     */
    public playCard(playedPai: MahjongData) {
        if (runtime.plays<=0) {
            console.log("出牌次数已用尽！");
            return;
        }
        if (!runtime.canPlay) {
            console.log("现在不是出牌阶段！");
            return;
        }
        console.log(`打出牌: ${playedPai.key}`);
        runtime.canPlay = false; // 防止快速连续点击

        let cardFound = false;
        // 检查打出的是否是新抽的牌
        if (runtime.newCard && runtime.newCard.id === playedPai.id) {
            runtime.table.push(runtime.newCard);
            runtime.newCard = null;
            cardFound = true;
        } else {
            // 否则，从手牌中找到并移除这张牌
            const index = runtime.hand.findIndex(p => p.id === playedPai.id);
            if (index > -1) {
                runtime.table.push(...runtime.hand.splice(index, 1));
                cardFound = true;
            }
        }
        if (!cardFound) {
            console.error("错误：试图打出一张不存在的牌！");
            runtime.canPlay = true;
            return;
        }
        // 如果有新牌，则并入手牌
        if (runtime.newCard) {
            runtime.hand.push(runtime.newCard);
            runtime.newCard = null;
        }
        this.handSort();// 进行一次排序
        // 0.5秒后再次抽牌
        setTimeout(() => {
            this.claimCard();
            runtime.canPlay = true; // 允许下一次出牌
        }, 500); // 单位是毫秒 (ms)
    }

    private shuffleDeck() {
        runtime.deckCount = runtime.deck.length;// 洗牌前，记录牌的总数
        let i = runtime.deck.length;
        // while (i > 0) {// 洗牌
        //     const j = Math.floor(Math.random() * i);
        //     i--;
        //     [runtime.deck[i], runtime.deck[j]] = [runtime.deck[j], runtime.deck[i]];
        // }
    }

    private dealHand(count: number) {
        for (let i = 0; i < count; i++) {
            if (runtime.deck.length === 0) break;
            const pai = runtime.deck.pop()!;
            runtime.hand.push(pai);
        }
    }

    private handSort() {
        runtime.hand.sort((a, b) => {
            // 首先按花色排序，然后按点数排序
            if (a.color !== b.color) {
                const colorOrder = ['W', 'T', 'S', 'F', 'D'];
                return colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color);
            }
            return a.point - b.point;
        });
    }

    // fromGang 是否因为杠才摸牌
    public claimCard(fromGang:boolean=false) {
        runtime.justGang = fromGang;// 上一手是否是杠
        if(!runtime.justGang){// 上一手不是杠，抽牌会减少抽牌次数
            runtime.plays--
        }
        if (runtime.deck.length === 0) {
            throw new Error("deck is empty");
        }
        runtime.newCard = runtime.deck.pop()!;
        this.handSort();// 先排序
        this.checkGangs([...runtime.hand, runtime.newCard]);// 抽牌后判断是否可以开杠
        this.checkYaku(); // 摸牌后检查役种
        // 发出手牌结束事件
        eventBus.emit(EVENT_CLAIM_END, runtime.newCard);
    }

    // 验证是否有杠，会把所有可以杠的牌显示出来
    private checkGangs(arr: MahjongData[]) {
        const counts = new Map<string, MahjongData[]>
        // 1. 遍历手牌，统计每种牌的数量
        for (const card of arr) {
            const key = card.key;
            if (counts.has(key)) {
                counts.get(key).push(card);
            }else {
                counts.set(key, [card]);
            }
        }
        runtime.waitForGang = []// 先清空
        // 2. 遍历统计结果，检查是否有数量为4的牌
        for (const c of counts.values()) {
            if (c.length >= 4) {// 找到了，追加到gangs中
                runtime.waitForGang.push(c[0]);
            }
        }
    }

    // 从待杠区转移到杠区
    public moveToGangs(key:string) {
        for (let i=0; i < runtime.waitForGang.length; i++) {
            if(runtime.waitForGang[i].key === key) {// 如果找到目标
                const t = runtime.waitForGang.splice(i, 1);// 移出这个元素
                // 手牌中的牌放入老杠区
                const oldHands:MahjongData[] = [...runtime.hand, runtime.newCard];// 目前的手牌
                const tmpGangs:MahjongData[] = [];// 杠的牌
                let count = 0;
                runtime.hand = []// 清空手牌
                runtime.newCard = null;// 清空新牌
                for (let j = 0; j < oldHands.length; j++) {
                    if(count<4 && t[0].key === oldHands[j].key) {// 先从前往后选择四个，之后做成手动的
                        tmpGangs.push(oldHands[j]);// 移入老杠区
                        count++;
                    }else {
                        runtime.hand.push(oldHands[j]);// 保存到手牌中
                    }
                }
                runtime.gangs.push(tmpGangs);// 加入杠区
                break;
            }
        }
    }

    // 新增：检查当前手牌的役种并更新显示
    private checkYaku() {
        runtime.yks = YakuCalculator.calculate(
            runtime.gangs,
            [...runtime.hand, runtime.newCard],
            runtime.newCard,
            runtime.selfWind,// 自风
            runtime.prevalentWind,// 场风
            runtime.justGang,// 是否刚才杠过
        );
        runtime.baseScore = 1;// 底分
        runtime.sumHan = runtime.yks.sumHan// 翻数
        runtime.score = runtime.baseScore*runtime.sumHan;// 总分
    }
}
// 全局访问点
export const roundController = RoundController.getInstance();