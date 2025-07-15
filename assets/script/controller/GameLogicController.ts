// in hlhutu/majang1/Majang1-88bd5fd17289239cf56fb2501ccd5445313091f1/assets/script/controller/GameLogicController.ts
import {_decorator, Component} from 'cc';
import {MajangData} from "db://assets/script/model/MajangData";
import {GameViewController} from "db://assets/script/controller/GameViewController";
import {YakuCalculator} from "db://assets/script/controller/YakuCalculator";

const { ccclass, property, requireComponent } = _decorator;

@ccclass('GameLogicController')
@requireComponent(GameViewController)
export class GameLogicController extends Component {

    private gameView: GameViewController;

    _deck: MajangData[] = [];
    _deckCount: number = 0;
    _hand: MajangData[] = [];
    _newCard: MajangData | null = null;
    _table: MajangData[] = [];

    _canPlay: boolean = false;

    onLoad() {
        this.gameView = this.getComponent(GameViewController);
    }

    onEnable() {
        console.log('Game Start')
        this.startGame();
    }

    public startGame() {
        this.gameView.clear();
        this.shuffleDeck();
        this.dealHand(13);
        this.claimCard();
        this._canPlay = true;
    }

    /**
     * 新增：处理打牌逻辑
     * @param playedPai 要打出的牌
     */
    public playCard(playedPai: MajangData) {
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
        this.gameView.drawTableArea();
        this.handSort();
        this.gameView.drawHandArea();

        // 在延迟摸牌之前，先检查一次听牌状态
        this.checkYaku();

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
        let i = this._deck.length;
        while (i > 0) {
            const j = Math.floor(Math.random() * i);
            i--;
            [this._deck[i], this._deck[j]] = [this._deck[j], this._deck[i]];
        }
    }

    private dealHand(count: number) {
        for (let i = 0; i < count; i++) {
            if (this._deck.length === 0) break;
            const pai = this._deck.pop()!;
            this._hand.push(pai);
        }
        this.handSort();
        this.gameView.drawHandArea();
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

    private claimCard() {
        if (this._deck.length === 0) {
            throw new Error("deck is empty");
        }
        this._newCard = this._deck.pop()!;
        this.gameView.drawHandArea();
        this.checkYaku(); // 摸牌后检查，是否和牌
    }

    /**
     * 新增：检查当前手牌的役种并更新显示
     */
    private checkYaku() {
        if (!this._newCard) {
            this.gameView.updateYakuDisplay([]); // 没有新牌（即手牌非14张）时，清空役种显示
            return;
        }

        const fullHand = [...this._hand, this._newCard];
        const yakuResults = YakuCalculator.calculate(fullHand);
        this.gameView.updateYakuDisplay(yakuResults);
    }
}