import {_decorator, Component, director, game, Label, Node, Prefab, instantiate, Vec3, Sprite, Color, Button, UIOpacity, tween } from 'cc';
import { runtime } from "db://assets/scripts/data/Runtime";
import {
    EVENT_CARD_HOVER, EVENT_CARD_HOVER_LEAVE,
    EVENT_CLAIM_END, EVENT_FAIL, EVENT_GANG, EVENT_HU, EVENT_LIUJU, EVENT_PLAY_CARD, EVENT_ROUND_CAL,
    EVENT_ROUND_START,
    eventBus
} from "db://assets/scripts/common/EventManager";
import {MahjongData} from "db://assets/scripts/model/MahjongData";
import {MahjongTile} from "db://assets/scripts/view/MahjongTile";
import {NumberFormatter} from "db://assets/scripts/common/NumberFormatter";
import {Global} from "db://assets/scripts/data/Global";
const { ccclass, property, requireComponent } = _decorator;

/**
 * 对局场景
 */
@ccclass('RoundView')
export class RoundView extends Component {

    @property({ type: Node, tooltip: "手牌区Node" })
    handArea:Node = null!;

    @property({ type: Node, tooltip: "桌面区Node" })
    tableArea:Node = null!

    @property({ type: Node, tooltip: "操作区Node" })
    operationArea:Node = null!;

    @property({ type: Prefab, tooltip: "杠牌按钮预制体" })
    gangButtonPrefab:Prefab

    @property({ type: Prefab, tooltip: "和牌按钮预制体" })
    huButtonPrefab:Prefab

    @property({ type: Node, tooltip: "文本区Node" })
    textArea:Node = null!;

    @property({ type: Node, tooltip: "役种区Content" })
    yakuContent:Node = null!;

    @property({ type: Prefab, tooltip: "役种预制体" })
    yakuPrefab:Prefab = null;

    @property({ type: Node, tooltip: "新牌区" })
    newCardArea:Node = null!;

    @property({ type: Prefab, tooltip: "麻将预制体" })
    mahjongPrefab:Prefab

    @property({ type: Prefab, tooltip: "一组杠的预制体" })
    gangGroupPrefab:Prefab

    @property({ type: Node, tooltip: "展示局结果" })
    resultPanel:Node = null!;

    @property({ type: Node, tooltip: "失败结果" })
    failPanel:Node = null!;

    @property({ type: Node, tooltip: "帮助界面" })
    helpPanel:Node = null!;

    private handsNode: Node = null;
    private finalScoreLabel: Node = null;
    private playsLabel: Node = null;
    private deckLabel: Node = null;
    private stageLabel: Node = null;
    private allTileNodes: Node[] = [];// 记录所有牌

    onLoad() {
        this.handsNode = this.handArea.getChildByName("Hands");
        this.finalScoreLabel = this.textArea.getChildByName("FinalScoreLabel");
        this.playsLabel = this.textArea.getChildByName("PlaysLabel");
        this.deckLabel = this.textArea.getChildByName("DeckLabel");
        this.stageLabel = this.textArea.getChildByName("StageLabel");

        // 使用类方法作为回调，并绑定 this
        eventBus.on(EVENT_ROUND_START, this.onRoundStart, this);
        eventBus.on(EVENT_CLAIM_END, this.redrawAllViews, this);
        eventBus.on(EVENT_PLAY_CARD, this.redrawAllViews, this);
        eventBus.on(EVENT_CARD_HOVER, this.highlightSameTiles, this);
        eventBus.on(EVENT_CARD_HOVER_LEAVE, this.resetAllTilesColor, this);
        eventBus.on(EVENT_HU, this.onHu, this);
        eventBus.on(EVENT_FAIL, this.onFail, this);
        eventBus.on(EVENT_LIUJU, this.onFail, this);
    }

    // onDestroy() {
    //     console.log("RoundView is being destroyed, removing listeners.");
    //     // 确保移除的函数和绑定的 this 与注册时完全一致
    //     eventBus.off(EVENT_ROUND_START, this.onRoundStart, this);
    //     eventBus.off(EVENT_CLAIM_END, this.redrawAllViews, this);
    //     eventBus.off(EVENT_PLAY_CARD, this.redrawAllViews, this);
    //     eventBus.off(EVENT_CARD_HOVER, this.highlightSameTiles, this);
    //     eventBus.off(EVENT_CARD_HOVER_LEAVE, this.resetAllTilesColor, this);
    //     eventBus.off(EVENT_HU, this.onHu, this);
    //     eventBus.off(EVENT_FAIL, this.onFail, this);
    //     eventBus.off(EVENT_LIUJU, this.onFail, this);
    // }

    // 将原来的匿名函数逻辑，放到对应的类方法中
    onRoundStart() {
        this.closeResultPanel();
        this.drawTableArea();
    }

    // RoundView.ts

    private redrawAllViews() {
        // 关键第一步：在销毁任何节点之前，先清空对它们的引用列表
        this.allTileNodes = [];

        // 然后再调用各个部分的绘制函数
        this.drawHands();
        this.drawOperationArea();
        this.drawTextArea();
        this.drawTableArea();
    }

    onHu() {
        this.openResultPanel();
    }

    onFail() {
        runtime.canPlay = false; // 输了，不能继续打牌了
        const label = this.failPanel.getChildByPath("Button/Label");
        label.getComponent(Label).string = `继续（+${runtime.score}）`;
        this.failPanel.active = true;
        // 播放动画
        let uiOpacity = this.failPanel.getComponent(UIOpacity);
        if (!uiOpacity) {
            uiOpacity = this.failPanel.addComponent(UIOpacity);
        }
        // 1. 设置初始状态：完全透明，缩放为0
        this.failPanel.setScale(Vec3.ZERO); // Vec3.ZERO 就是 (0, 0, 0)
        uiOpacity.opacity = 0;
        // 2. 创建并执行动画
        // 让 scale 和 opacity 动画并行执行
        tween(this.failPanel)
            .to(0.5, { scale: Vec3.ONE }, { easing: 'cubicOut' }) // 在0.5秒内，缩放到 (1, 1, 1)，使用 cubicOut 缓动效果
            .start();

        tween(uiOpacity)
            .to(0.5, { opacity: 255 }, { easing: 'cubicOut' }) // 在0.5秒内，渐变到完全不透明
            .start();
    }

    private drawOperationArea() {
        this.operationArea.removeAllChildren();// 移除所有按钮
        runtime.waitForGang.forEach((gang) => {// 可以杠的
            const buttonNode = instantiate(this.gangButtonPrefab);
            const mahjongNode = buttonNode.getChildByName("MahjongNode");
            mahjongNode.removeAllChildren();
            this.addPaiTo(gang, mahjongNode, 1, true);// 添加一个克隆

            // 添加点击事件
            buttonNode.on(Button.EventType.CLICK, () => {
                eventBus.emit(EVENT_GANG, gang)// 告知杠牌事件
            }, this);

            this.operationArea.addChild(buttonNode)
        })
        if(runtime.yks.ifWin && runtime.yks.sumHan>0) {// 可以和的
            const buttonNode = instantiate(this.huButtonPrefab);
            // 添加点击事件
            buttonNode.on(Button.EventType.CLICK, () => {
                eventBus.emit(EVENT_HU)// 告知和牌事件
            }, this);
            this.operationArea.addChild(buttonNode)
        }
    }

    private drawTextArea() {// 刷新文字
        runtime.score = runtime.baseScore*runtime.sumHan;
        this.finalScoreLabel.getComponent(Label).string = `${runtime.baseScore} x${runtime.sumHan} = ${NumberFormatter.format(runtime.score)}`
        this.playsLabel.getComponent(Label).string = `Plays: ${runtime.plays}`
        this.deckLabel.getComponent(Label).string = `Deck: ${runtime.deck.length}/${runtime.deckCount}`
        this.stageLabel.getComponent(Label).string = `${runtime.currentStage}-${Global.windStrs[runtime.prevalentWind]}(${Global.windStrs[runtime.selfWind]})
${runtime.currentPoint}/${runtime.targetPoint}`
        // 重绘役种区
        this.yakuContent.removeAllChildren();
        runtime.yks.yakus.forEach((yaku) => {
            const yakuPrefab = instantiate(this.yakuPrefab);
            yakuPrefab.getChildByName("item").getComponent(Label).string
                = `${yaku.name} x${yaku.han}`;
            this.yakuContent.addChild(yakuPrefab);
        })
    }

    private drawTableArea() {
        this.tableArea.removeAllChildren();// 清空桌面区
        runtime.table.forEach(p => {
            this.addPaiTo(p, this.tableArea, 0.8);
        })
    }

    private drawHands() {
        this.newCardArea.removeAllChildren();// 清空新牌区
        this.handsNode.removeAllChildren();// 清空手牌区
        // 先添加杠组
        runtime.gangs.forEach(gangs => {
            const groupNode = instantiate(this.gangGroupPrefab);
            groupNode.removeAllChildren();
            gangs.forEach(gang => {
                this.addPaiTo(gang, groupNode);
            })
            this.handsNode.addChild(groupNode)
        })
        // 刷新手牌区
        runtime.hand.forEach(p => {
            this.addPaiTo(p, this.handsNode)
        })
        // 刷新新牌区
        if(runtime.newCard) {
            this.addPaiTo(runtime.newCard, this.newCardArea)
        }
    }

    private addPaiTo(pai: MahjongData, target: Node, scale: number = 1.0, isClone = false) {
        const newTileNode = instantiate(this.mahjongPrefab);
        newTileNode.setScale(new Vec3(scale, scale, scale));

        const tileComponent = newTileNode.getComponent(MahjongTile);
        if (tileComponent) {
            tileComponent.init(pai);
            if (target === this.handsNode || target===this.newCardArea) {// 只有手牌区/新牌区的麻将可以交互
                tileComponent.isInteractive = true;
            }
        } else {
            console.log(`错误：麻将Prefab上没有找到 MajangTile 脚本！`);
        }
        target.addChild(newTileNode);
        if(!isClone) {
            this.allTileNodes.push(newTileNode); // 新增：将新创建的节点添加到列表中
        }
    }

    /**
     * 高亮与指定牌同种的所有牌
     * @param mahjongData 目标牌数据
     */
    public highlightSameTiles(mahjongData: MahjongData) {
        this.allTileNodes.forEach(node => {
            const tile = node.getComponent(MahjongTile);
            const sprite = node.getComponent(Sprite);
            if (tile && sprite && tile.mahjongData.color === mahjongData.color && tile.mahjongData.point === mahjongData.point) {
                sprite.color = new Color('#C0C0C0'); // 设置为灰色以示高亮
            }
        });
    }

    /**
     * 重置所有牌的颜色
     */
    public resetAllTilesColor() {
        this.allTileNodes.forEach(node => {
            node.getChildByName("Label").active = false
            const sprite = node.getComponent(Sprite);
            if (sprite) {
                sprite.color = Color.WHITE; // 恢复原色
            }
        });
    }

    private closeResultPanel() {
        this.resultPanel.active = false;
        this.failPanel.active = false;
        this.helpPanel.active = false;
    }

    private openResultPanel() {
        runtime.canPlay = false; // 打开局结果时，不能继续打牌了
        const label = this.resultPanel.getChildByPath("Button/Label");
        label.getComponent(Label).string = `继续（+${runtime.score}）`;
        this.resultPanel.active = true;
        // 播放动画
        let uiOpacity = this.resultPanel.getComponent(UIOpacity);
        if (!uiOpacity) {
            uiOpacity = this.resultPanel.addComponent(UIOpacity);
        }
        // 1. 设置初始状态：完全透明，缩放为0
        this.resultPanel.setScale(Vec3.ZERO); // Vec3.ZERO 就是 (0, 0, 0)
        uiOpacity.opacity = 0;
        // 2. 创建并执行动画
        // 让 scale 和 opacity 动画并行执行
        tween(this.resultPanel)
            .to(0.5, { scale: Vec3.ONE }, { easing: 'cubicOut' }) // 在0.5秒内，缩放到 (1, 1, 1)，使用 cubicOut 缓动效果
            .start();

        tween(uiOpacity)
            .to(0.5, { opacity: 255 }, { easing: 'cubicOut' }) // 在0.5秒内，渐变到完全不透明
            .start();
    }

    clickRoundResult() {// 点击事件，计算局结果
        director.loadScene("scenes/WindSelectScene", () => {// 回到选风页面
            eventBus.emit(EVENT_ROUND_CAL)// 呼叫局结算
        })
    }

    clickOpenHelp() {
        this.helpPanel.active = true;
    }

    clickCloseHelp() {
        this.helpPanel.active = false;
    }
}