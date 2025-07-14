import {_decorator, Component} from 'cc';
import {MajangData} from "db://assets/script/model/MajangData";
import {GameViewController} from "db://assets/script/controller/GameViewController";

const { ccclass, property, requireComponent } = _decorator;

/**
 * 游戏逻辑控制器，入口
 */
@ccclass('GameLogicController')
@requireComponent(GameViewController)
export class GameLogicController extends Component {

    private gameView: GameViewController = new GameViewController();

    _deck: MajangData[] = [];// 牌山
    _hand: MajangData[] = [];// 手牌
    _newCard: MajangData = null;// 新牌，右手第一张
    _table: MajangData[] = [];// 桌上

    _canPlay: boolean = false;// 是否可以打出手牌

    onLoad() {
        this.gameView = this.getComponent(GameViewController);
    }

    onEnable() {
        console.log('Game Start')
        // 开始游戏流程
        this.startGame();
    }

    /**
     * 开始一局新游戏
     */
    public startGame() {
        // 清空视图
        this.gameView.clear();
        // 洗牌
        this.shuffleDeck();
        // 发牌
        this.dealHand(13);
        // 抽出下一张牌
        this.claimCard()
        this._canPlay = true// 此时可以打出一张手牌
    }

    /**
     * 洗牌：使用 Fisher-Yates 算法
     */
    private shuffleDeck() {
        // 从原始牌库复制一份作为本局要用的牌
        this._deck = [...MajangData.MajangLib];
        console.log('开始洗牌...');
        let i = this._deck.length;
        while (i > 0) {
            const j = Math.floor(Math.random() * i);
            i--;
            // 交换元素
            [this._deck[i], this._deck[j]] = [this._deck[j], this._deck[i]];
        }
        console.log('洗牌完成！');
    }

    /**
     * 发指定数量的牌到手牌区
     * @param count 要发的牌的数量
     */
    private dealHand(count: number) {
        console.log(`开始发牌，共 ${count} 张...`);
        for (let i = 0; i < count; i++) {
            // 检查牌堆里是否还有牌，增强健壮性
            if (this._deck.length === 0) {
                console.log('错误：牌堆已空，无法继续发牌！');
                break;
            }
            // 从牌堆顶部抽一张牌
            const pai = this._deck.pop()!;
            // 加入手牌
            this._hand.push(pai);
        }
        console.log('发牌完成！');
        // 在这里可以接着处理排序手牌等逻辑
        this.handSort()// 排序
        this.gameView.drawHandArea();// 重绘手牌区域
    }

    // 手牌排序
    private handSort() {
        this._hand.sort((a, b) => {
            return a.id - b.id;
        });
    }

    // 抽一张牌到新牌区
    private claimCard() {
        if(this._newCard!=null) {// 如果新牌已经有了，就把他放入手牌
            this._hand.push(this._newCard);
            this._newCard = null;
        }
        // 检查牌堆里是否还有牌，增强健壮性
        if (this._deck.length === 0) {// 牌库为空
            throw new Error("deck is empty");
        }
        // 从牌堆顶部抽一张牌，放入新牌区
        this._newCard = this._deck.pop()!
        // 排序并重绘手牌区
        this.handSort()
        this.gameView.drawHandArea();
    }
}