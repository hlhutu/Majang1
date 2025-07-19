// in hlhutu/majang1/Majang1-88bd5fd17289239cf56fb2501ccd5445313091f1/assets/script/controller/GameLogicController.ts
import {_decorator, Component} from 'cc';
import {MajangData} from "db://assets/script/model/MajangData";
import {GameViewController} from "db://assets/script/controller/GameViewController";
import {GameResult, YakuCalculator, YakuResult} from "db://assets/script/controller/YakuCalculator";
import {StatusBarViewController} from "db://assets/script/controller/StatusBarManager";

const { ccclass, property, requireComponent } = _decorator;

@ccclass('GameLogicController')
@requireComponent(GameViewController)
export class GameLogicController extends Component {

    private mainView: GameViewController; // 手牌区/桌子区
    private statucBarView: StatusBarViewController;// 状态区

    _deck: MajangData[] = []; // 牌山
    _deckCount: number = 0; // 手牌总数
    _hand: MajangData[] = []; // 手牌（不含杠）
    _gangs: MajangData[][] = [];// 有杠的牌，加入到这里面，每一组四张牌
    _waitForGang: MajangData[] = [];// 等待杠，由玩家决定是否杠
    _newCard: MajangData | null = null;// 新牌，右手第一张
    _table: MajangData[] = []; // 桌面牌

    _plays: number = 10+1;// 出牌（抽牌）次数为10，杠牌之后抽牌不会减少次数
    _justGang: boolean = false; // 上一手是否杠牌
    _canPlay: boolean = false; // 此时是否可以打出手牌
    _baseScore: number = 1; // 底分，默认1
    _sumHan: number = 0;// 当前总翻数，总翻数大于0才可以和
    _score: number = 0;// 总分，底分x翻数
    _yks: GameResult = null;// 役种结果

    onLoad() {
        this.mainView = this.getComponent(GameViewController);
        this.statucBarView = this.getComponent(StatusBarViewController);
    }

    onEnable() {
        console.log('Game Start')
        this.startGame();
    }

    public startGame() {
        this.mainView.clear();// 清空手牌/桌子
        this.shuffleDeck();
        this.dealHand(13);// 抽13张牌
        this.claimCard();// 首次抽牌
        this._canPlay = true;
    }

    /**
     * 新增：处理打牌逻辑
     * @param playedPai 要打出的牌
     */
    public playCard(playedPai: MajangData) {
        if (this._plays<=0) {
            console.log("出牌次数已用尽！");
            return;
        }
        if (!this._canPlay) {
            console.log("现在不是出牌阶段！");
            return;
        }
        console.log(`打出牌: ${playedPai.key}`);
        this._canPlay = false; // 防止快速连续点击

        let cardFound = false;
        // 检查打出的是否是新抽的牌
        if (this._newCard && this._newCard.id === playedPai.id) {
            this._table.push(this._newCard);
            this._newCard = null;
            cardFound = true;
        } else {
            // 否则，从手牌中找到并移除这张牌
            const index = this._hand.findIndex(p => p.id === playedPai.id);
            if (index > -1) {
                this._table.push(...this._hand.splice(index, 1));
                cardFound = true;
            }
        }

        if (!cardFound) {
            console.error("错误：试图打出一张不存在的牌！");
            this._canPlay = true;
            return;
        }

        // 如果有新牌，则并入手牌
        if (this._newCard) {
            this._hand.push(this._newCard);
            this._newCard = null;
        }

        // 重绘桌面和手牌
        this.mainView.drawTableArea();
        // 立即重绘一次手牌区
        this.handSort();
        this.mainView.drawHandArea();
        // 延迟一小段时间再摸牌，让玩家看清出牌过程
        this.scheduleOnce(() => {
            try {
                this.claimCard();
                this._canPlay = true; // 允许下一次出牌
            } catch (e) {
                console.log("游戏结束，牌库已摸完！");
                // 在这里可以处理游戏结束的逻辑
            }
        }, 0.5); // 延迟0.5秒
    }

    private shuffleDeck() {
        this._deck = [...MajangData.MajangLib];
        this._deckCount = this._deck.length;
        // let i = this._deck.length;
        // while (i > 0) {
        //     const j = Math.floor(Math.random() * i);
        //     i--;
        //     [this._deck[i], this._deck[j]] = [this._deck[j], this._deck[i]];
        // }
    }

    private dealHand(count: number) {
        for (let i = 0; i < count; i++) {
            if (this._deck.length === 0) break;
            const pai = this._deck.pop()!;
            this._hand.push(pai);
        }
        // this.handSort();
        // this.mainView.drawHandArea();
    }

    private handSort() {
        this._hand.sort((a, b) => {
            // 首先按花色排序，然后按点数排序
            if (a.color !== b.color) {
                const colorOrder = ['W', 'T', 'S', 'F', 'D'];
                return colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color);
            }
            return a.point - b.point;
        });
    }

    // isFirst 是否首次抽牌
    // fromGang 是否因为杠才摸牌
    public claimCard(fromGang:boolean=false) {
        this._justGang = fromGang;// 上一手是否是杠
        if(!this._justGang){// 上一手不是杠，抽牌会减少抽牌次数
            this._plays--
        }
        if (this._deck.length === 0) {
            throw new Error("deck is empty");
        }
        this._newCard = this._deck.pop()!;
        this.handSort();// 先排序
        this.mainView.drawHandArea();
        this.statucBarView.updateDeckDisplay();// 抽牌后刷新剩余牌数
        this.checkGangs([...this._hand, this._newCard]);// 抽牌后判断是否可以开杠
        this.checkYaku(); // 摸牌后检查役种
    }

    // 验证是否有杠，会把所有可以杠的牌显示出来
    private checkGangs(arr: MajangData[]) {
        const counts = new Map<string, MajangData[]>
        // 1. 遍历手牌，统计每种牌的数量
        for (const card of arr) {
            const key = card.key;
            if (counts.has(key)) {
                counts.get(key).push(card);
            }else {
                counts.set(key, [card]);
            }
        }
        this._waitForGang = []// 先清空
        // 2. 遍历统计结果，检查是否有数量为4的牌
        for (const c of counts.values()) {
            if (c.length >= 4) {// 找到了，追加到gangs中
                this._waitForGang.push(c[0]);
            }
        }
        // 刷新待杠区+和牌显示
        this.mainView.drawNewGangArea(this._waitForGang);
    }

    // 从待杠区转移到杠区
    public moveToGangs(key:string) {
        for (let i=0; i < this._waitForGang.length; i++) {
            if(this._waitForGang[i].key === key) {// 如果找到目标
                const t = this._waitForGang.splice(i, 1);// 移出这个元素
                // 手牌中的牌放入老杠区
                const oldHands:MajangData[] = [...this._hand, this._newCard];// 目前的手牌
                const tmpGangs:MajangData[] = [];// 杠的牌
                let count = 0;
                this._hand = []// 清空手牌
                for (let j = 0; j < oldHands.length; j++) {
                    if(count<4 && t[0].key === oldHands[j].key) {// 先从前往后选择四个，之后做成手动的
                        tmpGangs.push(oldHands[j]);// 移入老杠区
                        count++;
                    }else {
                        this._hand.push(oldHands[j]);// 保存到手牌中
                    }
                }
                this._gangs.push(tmpGangs);// 加入杠区
                // 如果有新牌，则并入手牌
                debugger
                if (this._newCard) {
                    this._hand.push(this._newCard);
                    this._newCard = null;
                }
                break;
            }
        }
    }

    // 新增：检查当前手牌的役种并更新显示
    private checkYaku() {
        this._yks = YakuCalculator.calculate(
            this._gangs,
            [...this._hand, this._newCard],
            this._newCard,
            1,// 自己坐东风
            1,// 场风也默认东
            this._justGang,// 是否刚才杠过
        );
        this._baseScore = 1;// 底分
        this._sumHan = this._yks.sumHan// 翻数
        this._score = this._baseScore*this._sumHan;// 总分
        // 刷新状态栏显示
        this.statucBarView.updateYakuDisplay();
        // 如果和牌并且有役，添加一个和牌按钮
        this.mainView.drawHuButton(this._yks.ifWin && this._yks.sumHan>0);
    }
}