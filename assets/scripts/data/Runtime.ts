import {MahjongData} from "db://assets/scripts/model/MahjongData";
import {GameResult} from "db://assets/scripts/model/GameResult";
import {RelicData} from "db://assets/scripts/model/RelicData";
import {Global} from "db://assets/scripts/data/Global";
import {randomRangeInt} from 'cc';

export class Runtime {
    difficulty: number;// 难度
    deckName: string;// 牌山名
    currentStage: number;// 当前关卡，每关都有不同的目标分数，达到目标点数才可以过关
    targetPoint: number;// 目标点数
    prevalentWind: number;// 当前场风，1234=东南西北，每关都有四个场风，需要打四场赚取点数。总点数达标也可以提前跳过剩余场次（直接领取奖励，但没点数）

    currentPoint: number;// 当前点数，每关卡开始时为0。此点数大于等于 targetPoint 才可以过关
    selfWind: number;// 自风，每局开始时摇骰子决定自风

    gold: number;// 金币，初始为5，每局胜利后可获得金币5。每5枚金币可获得利息1。

    deck: MahjongData[]; // 牌山
    hand: MahjongData[]; // 手牌（不含杠）
    gangs: MahjongData[][];// 有杠的牌，加入到这里面，每一组四张牌
    newCard: MahjongData | null;// 新牌，右手第一张 (注意：这里推荐使用 | null)
    deckCount: number; // 手牌总数，杠牌+手牌+新牌

    waitForGang: MahjongData[];// 等待杠，由玩家决定是否杠
    table: MahjongData[]; // 桌面牌，牌桌上已经打出去的牌

    plays: number;// 出牌（抽牌）次数为10，杠牌之后抽牌不会减少次数
    justGang: boolean; // 上一手是否杠牌
    canPlay: boolean; // 此时是否可以打出手牌
    baseScore: number; // 底分，默认1
    sumHan: number;// 当前总翻数，总翻数大于0才可以和
    score: number;// 总分，底分x翻数
    yks: GameResult | null;// 役种结果 (注意：这里推荐使用 | null)
    relics: RelicData[];// 遗物列表

    // 初始化数据，根据选择的 难度和牌组
    public init(): void {
        if (this.difficulty <= 0) {
            this.initFor0();// 难度0初始化
        } else {
            console.error(`不支持难度${this.difficulty}`)
        }
    }

    // 难度0的初始化
    public initFor0(): void {
        console.log(`开始游戏 ${this.difficulty}-${this.deckName}`)
        this.difficulty = 0;// 难度

        // --- 关卡与进程数据 ---
        this.currentStage = 0;         // 游戏从第0关开始，未进入游戏
        this.targetPoint = 0;          // 难度0的第一关，设定一个较低的目标分数
        this.prevalentWind = 0;        // 0=未开始
        this.currentPoint = 0;         // 关卡开始时，当前积攒的点数为0
        this.selfWind = 1;             // 游戏开始，玩家默认是东家，自风为东 (1=东)

        // --- 资源数据 ---
        this.gold = 5;                 // 根据描述，初始金币为5

        // --- 牌局核心数据 (一局开始前的状态) ---
        this.hand = [];                // 手牌在发牌前是空的
        this.gangs = [];               // 杠牌在发牌前是空的
        this.newCard = null;           // 还没有摸新牌
        this.deckCount = 0;            // 总手牌数为0
        this.waitForGang = [];         // 没有等待杠的牌
        this.table = [];               // 牌桌上已经打出去的牌

        // --- 状态与计分数据 ---
        this.plays = 10;               // 根据描述，初始出牌次数为10
        this.justGang = false;         // 游戏刚开始，上一手没有杠牌
        this.canPlay = false;          // 游戏还未正式开始（未发牌），所以玩家不能出牌
        this.baseScore = 1;            // 根据描述，底分为1
        this.sumHan = 0;               // 和牌前，总翻数为0
        this.score = 0;                // 和牌前，总分为0
        this.yks = null;               // 还没有和牌，因此没有役种结果
        this.relics = null;            // 遗物为空

        // --- 动态牌山 ---
        if(this.deckName=='default'){
            this.deck = structuredClone(Global.libs.defaultLib); // 以默认牌组开始
        } else {
            console.error(`无法识别牌山${this.deckName}`)
        }
    }
    // 关卡提升
    public stageUp(level:number) {
        this.currentStage = level; // 当前关卡+1
        console.log('关卡提升到'+this.currentStage)
        this.prevalentWind = 1;// 从东风开始
        this.targetPoint = Global.stages[this.difficulty][this.currentStage-1]// 目标分数
        this.currentPoint = 0;         // 关卡开始时，当前积攒的点数为0
    }
}

export const runtime: Runtime = new Runtime();// 运行时数据
