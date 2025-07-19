// in hlhutu/majang1/Majang1-904d639e403cacaa16a660ae5874fdf1d6a53850/assets/script/controller/GameViewController.ts
import { _decorator, Component, Node, Prefab, instantiate, Vec3, Color, Sprite, Label, Button } from 'cc'; // 引入 Color 和 Sprite
import {MajangData} from "db://assets/script/model/MajangData";
import {MajangTile} from "db://assets/script/controller/MajangTile";
import { GameLogicController} from "db://assets/script/controller/GameLogicController";
import {YakuResult} from "db://assets/script/controller/YakuCalculator";
import {AGangController} from "db://assets/script/controller/AGang/AGangController";
import {HuController} from "db://assets/script/controller/AGang/HuController";
const { ccclass, property, requireComponent } = _decorator;

@ccclass('GameViewController')
@requireComponent(GameLogicController)
export class GameViewController extends Component {

    private gameLogic: GameLogicController = null;
    private allTileNodes: Node[] = []; // 新增：用于存储所有麻将节点的列表

    @property({ type: Prefab, tooltip: '麻将牌的预制体' })
    majangPrefab: Prefab = null!;

    @property({ type: Prefab, tooltip: '一组杠的预制体' })
    oldGangPrefab: Prefab = null!;

    @property({ type: Node, tooltip: '手牌区域' })
    handArea: Node = null!;

    @property({ type: Node, tooltip: '牌桌区域' })
    tableArea: Node = null!;

    @property({ type: Node, tooltip: '抽牌区域' })
    newCardArea: Node = null!;

    @property({ type: Node, tooltip: '交互区域' })
    operationArea: Node = null!;

    @property({ type: Prefab, tooltip: '杠的预制体' })
    agangPrefab: Prefab = null!;

    @property({ type: Prefab, tooltip: '和牌按钮的预制体' })
    huPrefab: Prefab = null!;

    onLoad() {
        this.gameLogic = this.getComponent(GameLogicController);
    }

    clear() {
        this.clearHandArea();
        this.clearTableArea();
        this.allTileNodes = []; // 清空列表
    }

    private addPaiTo(pai: MajangData, target: Node, scale: number = 1.0, isClone = false) {
        const newTileNode = instantiate(this.majangPrefab);
        newTileNode.setScale(new Vec3(scale, scale, scale));

        const tileComponent = newTileNode.getComponent(MajangTile);
        if (tileComponent) {
            tileComponent.init(pai);
            if (target === this.handArea || target===this.newCardArea) {// 只有手牌区/新牌区的麻将可以交互
                tileComponent.isInteractive = true;
            }
        } else {
            console.log(`错误：麻将Prefab上没有找到 MajangTile 脚本！`);
        }
        target.addChild(newTileNode);
        this.allTileNodes.push(newTileNode); // 新增：将新创建的节点添加到列表中
    }

    drawHandArea() {
        console.log('重绘手牌区\n', this.gameLogic._gangs, this.gameLogic._hand)
        this.clearHandArea();
        const handAndNewCard = [...this.gameLogic._hand];
        if (this.gameLogic._newCard) {
            handAndNewCard.push(this.gameLogic._newCard);
        }

        // 为了方便管理，我们先移除旧的牌再添加新的
        this.allTileNodes = this.allTileNodes.filter(node => node.parent !== this.handArea && node.parent !== this.newCardArea);

        // 添加杠
        this.gameLogic._gangs.forEach(gs => {
            const n = this.buildOldGangPrefab(gs)// 创建一个Node
            this.handArea.addChild(n)// 添加到手牌区
        })
        // 添加手牌
        this.gameLogic._hand.forEach((p) => {
            this.addPaiTo(p, this.handArea);
        });
        if (this.gameLogic._newCard != null) {
            this.addPaiTo(this.gameLogic._newCard, this.newCardArea);
        }
    }

    clearHandArea() {
        this.handArea.removeAllChildren();
        this.newCardArea.removeAllChildren();
    }

    drawTableArea() {
        this.clearTableArea();
        // 同样，先从allTileNodes中移除桌牌
        this.allTileNodes = this.allTileNodes.filter(node => node.parent !== this.tableArea);
        this.gameLogic._table.forEach((p) => {
            this.addPaiTo(p, this.tableArea, 0.7);
        });
    }

    clearTableArea() {
        this.tableArea.removeAllChildren();
    }

    // --- 新增高亮相关方法 ---

    /**
     * 高亮与指定牌同种的所有牌
     * @param majangData 目标牌数据
     */
    public highlightSameTiles(majangData: MajangData) {
        this.allTileNodes.forEach(node => {
            const tile = node.getComponent(MajangTile);
            const sprite = node.getComponent(Sprite);
            if (tile && sprite && tile.majangData.color === majangData.color && tile.majangData.point === majangData.point) {
                sprite.color = new Color('#C0C0C0'); // 设置为灰色以示高亮
            }
        });
    }

    /**
     * 重置所有牌的颜色
     */
    public resetAllTilesColor() {
        this.allTileNodes.forEach(node => {
            const sprite = node.getComponent(Sprite);
            if (sprite) {
                sprite.color = Color.WHITE; // 恢复原色
            }
        });
    }

    // 刷新新产生的杠区
    public drawNewGangArea(mjs: MajangData[]) {
        // 移除所有的 杠牌按钮
        for (const child of [...this.operationArea.children]) {
            if (child.getComponent(AGangController)) {
                child.destroy(); // 或者 child.removeFromParent();
            }
        }
        mjs.forEach(m => {
            const p = instantiate(this.agangPrefab);
            const ag = p.getComponent(AGangController);
            if(ag) {// 传递游戏控制器
                ag.init(this.gameLogic)
            }
            const majangNode = p.getChildByName("Majang");
            this.addPaiTo(m, majangNode, 0.5, true);
            this.operationArea.addChild(p);
        })
    }

    // 刷新和牌按钮
    public drawHuButton(show: boolean) {
        // 移除所有的 和牌按钮
        for (const child of [...this.operationArea.children]) {
            if (child.getComponent(HuController)) {
                child.destroy(); // 或者 child.removeFromParent();
            }
        }
        // 再决定是否显示
        if (show) {
            const p = instantiate(this.huPrefab);
            p.setScale(new Vec3(1.2, 1.2, 1.2))
            const ag = p.getComponent(HuController);
            if(ag) {// 传递游戏控制器
                ag.init(this.gameLogic)
            }
            this.operationArea.addChild(p);
        }
    }

    // 创建一组杠
    public buildOldGangPrefab(arr: MajangData[]): Node {
        const p = instantiate(this.oldGangPrefab);
        for (let i = 0; i < arr.length && i<4; i++) {
            this.addPaiTo(arr[i], p, 1);
        }
        return p
    }
}