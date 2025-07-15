import { _decorator, Component, Node, Prefab, instantiate, Vec3, Color, Sprite, Label, Button } from 'cc';
import {GameLogicController} from "db://assets/script/controller/GameLogicController";
import {YakuResult} from "db://assets/script/controller/YakuCalculator"; // 引入 Color 和 Sprite
const { ccclass, property, requireComponent } = _decorator;
/**
 * 管理状态栏
 */
@ccclass('StatusBarViewController')
@requireComponent(GameLogicController)
export class StatusBarViewController extends Component {

    @property({ type: Node, tooltip: '状态栏' })
    statusBar: Node = null!;

    @property({ type: Prefab, tooltip: '役种的预制体' })
    labelPrefab: Prefab = null!;

    private gameLogic: GameLogicController = null;
    // 存放役种的容器
    private yakuContainer:Node = null
    // 显示牌山的label
    private deckLabel:Label = null;
    // 显示剩余出牌次数的label
    private playsLabel:Label = null;
    // 存放底分的Label
    private basePointLabel:Label = null;
    // 存放总分的Label
    private scoreLabel:Label = null;

    // 初始化
    onLoad() {
        this.gameLogic = this.getComponent(GameLogicController);
        // 自动识别子组件
        this.deckLabel = this.statusBar.getChildByName("DeckLabel").getComponent(Label);
        this.playsLabel = this.statusBar.getChildByName("PlaysLabel").getComponent(Label);
        this.basePointLabel = this.statusBar.getChildByName("BasePointLabel").getComponent(Label);
        this.scoreLabel = this.statusBar.getChildByName("BasePointLabel").getComponent(Label);
        this.yakuContainer = this.statusBar.getChildByName("Yaku").getChildByName("view").getChildByName("YakuContainer");
    }

    // 刷新deck显示
    public updateDeckDisplay() {
        this.deckLabel.string = `Deck\n${this.gameLogic._deck.length}/${this.gameLogic._deckCount}`
    }

    // 刷新役种显示
    public updateYakuDisplay(yks:YakuResult[]) {
        // 清空现在的役种列表
        this.yakuContainer.removeAllChildren()
        // 重新添加
        yks.forEach(yk => {
            const labelNode = instantiate(this.labelPrefab);
            const label = labelNode.getComponent(Label);
            label.string = `${yk.name} x${yk.han}`;
            this.yakuContainer.addChild(labelNode);
        })
    }
}