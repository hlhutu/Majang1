import { _decorator, Component, Node, Sprite, SpriteFrame, Prefab, instantiate } from 'cc';
import {MajangData} from "db://assets/script/model/MajangData";
import {MajangTile} from "db://assets/script/controller/MajangTile";
import { GameLogicController} from "db://assets/script/controller/GameLogicController";
const { ccclass, property, requireComponent } = _decorator;

/**
 * 游戏视图
 */
@ccclass('GameViewController')
@requireComponent(GameLogicController)
export class GameViewController extends Component {

    private gameLogic: GameLogicController = null;

    @property({ type: Prefab, tooltip: '麻将牌的预制体' })
    majangPrefab: Prefab = null!;

    @property({ type: Node, tooltip: '手牌区域' })
    handArea: Node = null!;

    @property({ type: Node, tooltip: '牌桌区域' })
    tableArea: Node = null!;

    @property({ type: Node, tooltip: '抽牌区域' })
    newCardArea: Node = null!;

    onLoad() {
        this.gameLogic = this.getComponent(GameLogicController);
        if (!this.majangPrefab) {
            console.error('错误：GameController 未配置 majangPrefab!');
        }
        if (!this.handArea) {
            console.error('错误：GameController 未配置 handArea!');
        }
        if (!this.tableArea) {
            console.error('错误：GameController 未配置 tableArea!');
        }
    }

    // 清空所有区域
    clear() {
        // 1. 清理手牌/牌桌
        this.clearHandArea()
        this.clearTableArea()
    }

    // 添加一张牌到目标区域
    private addPaiTo(pai: MajangData, target:Node) {
        // 实例化一个麻将Prefab
        const newTileNode = instantiate(this.majangPrefab);

        // 获取Prefab上的MajangTile组件并初始化它
        const tileComponent = newTileNode.getComponent(MajangTile);
        if (tileComponent) {
            tileComponent.init(pai);// 初始化一张新牌
        } else {
            console.log(`错误：麻将Prefab上没有找到 MajangTile 脚本！`);
        }
        // 将生成的麻将牌节点添加到目标区域
        target.addChild(newTileNode);
    }

    // 重绘手牌区域
    drawHandArea() {
        this.clearHandArea()// 清空手牌
        // 按顺序放入手牌
        this.gameLogic._hand.forEach((p) => {
            this.addPaiTo(p, this.handArea);
        })
        if (this.gameLogic._newCard!=null) {
            // 放入新牌
            this.addPaiTo(this.gameLogic._newCard, this.newCardArea);
        }
    }
    // 清理手牌区域
    clearHandArea() {
        this.handArea.removeAllChildren();
        this.newCardArea.removeAllChildren();
    }
    // 重绘桌面区域
    drawTableArea() {

    }
    // 清理桌面区域
    clearTableArea() {
        this.tableArea.removeAllChildren();
    }
}