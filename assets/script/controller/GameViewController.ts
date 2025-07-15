// in hlhutu/majang1/Majang1-904d639e403cacaa16a660ae5874fdf1d6a53850/assets/script/controller/GameViewController.ts
import { _decorator, Component, Node, Prefab, instantiate, Vec3, Color, Sprite, Label, Button } from 'cc'; // 引入 Color 和 Sprite
import {MajangData} from "db://assets/script/model/MajangData";
import {MajangTile} from "db://assets/script/controller/MajangTile";
import { GameLogicController} from "db://assets/script/controller/GameLogicController";
const { ccclass, property, requireComponent } = _decorator;

@ccclass('GameViewController')
@requireComponent(GameLogicController)
export class GameViewController extends Component {

    private gameLogic: GameLogicController = null;
    private allTileNodes: Node[] = []; // 新增：用于存储所有麻将节点的列表

    @property({ type: Prefab, tooltip: '麻将牌的预制体' })
    majangPrefab: Prefab = null!;

    @property({ type: Node, tooltip: '手牌区域' })
    handArea: Node = null!;

    @property({ type: Node, tooltip: '牌桌区域' })
    tableArea: Node = null!;

    @property({ type: Node, tooltip: '抽牌区域' })
    newCardArea: Node = null!;

    @property({ type: Label, tooltip: '用于显示役种的Label' })
    yakuLabel: Label = null!;

    @property({ type: Button, tooltip: '和牌按钮' })
    winButton: Button = null!;

    @property({ type: Label, tooltip: '显示剩余牌堆的Label' })
    deckLabel: Label = null!;

    onLoad() {
        this.gameLogic = this.getComponent(GameLogicController);
        // 游戏开始时先隐藏
        this.yakuLabel.string = "";
        this.winButton.node.active = false;
    }

    clear() {
        this.clearHandArea();
        this.clearTableArea();
        this.allTileNodes = []; // 清空列表
    }

    private addPaiTo(pai: MajangData, target: Node, scale: number = 1.0) {
        const newTileNode = instantiate(this.majangPrefab);
        newTileNode.setScale(new Vec3(scale, scale, scale));

        const tileComponent = newTileNode.getComponent(MajangTile);
        if (tileComponent) {
            tileComponent.init(pai);
            if (target === this.tableArea) {
                tileComponent.isInteractive = false;
            }
        } else {
            console.log(`错误：麻将Prefab上没有找到 MajangTile 脚本！`);
        }
        target.addChild(newTileNode);
        this.allTileNodes.push(newTileNode); // 新增：将新创建的节点添加到列表中
    }

    drawHandArea() {
        this.clearHandArea();
        const handAndNewCard = [...this.gameLogic._hand];
        if (this.gameLogic._newCard) {
            handAndNewCard.push(this.gameLogic._newCard);
        }

        // 为了方便管理，我们先移除旧的牌再添加新的
        this.allTileNodes = this.allTileNodes.filter(node => node.parent !== this.handArea && node.parent !== this.newCardArea);

        this.gameLogic._hand.forEach((p) => {
            this.addPaiTo(p, this.handArea);
        });
        if (this.gameLogic._newCard != null) {
            this.addPaiTo(this.gameLogic._newCard, this.newCardArea);
        }
        // 刷新显示
        this.updateDeckDisplay()
    }

    clearHandArea() {
        this.handArea.removeAllChildren();
        this.newCardArea.removeAllChildren();
        this.deckLabel.string = "牌山：0/0";
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

    /**
     * 新增：更新役种显示和和牌按钮状态
     * @param yakuResults 役种计算结果数组
     */
    public updateYakuDisplay(yakuResults: { name: string, han: number }[]) {
        if (yakuResults.length > 0) {
            const totalHan = yakuResults.reduce((sum, yaku) => sum + yaku.han, 0);
            const yakuNames = yakuResults.map(yaku => yaku.name).join(' ');

            this.yakuLabel.string = `${yakuNames} ${totalHan}翻`;
            this.winButton.node.active = true;
            this.yakuLabel.color = Color.GREEN; // 设置颜色为绿色
        } else {
            this.yakuLabel.string = "无役";
            this.winButton.node.active = false;
            this.yakuLabel.color = new Color('#C0C0C0'); // 设置颜色为灰色
        }
    }

    /**
     * 刷新剩余牌堆显示
     */
    public updateDeckDisplay() {
        console.log(this.gameLogic._deck.length+"/"+this.gameLogic._deckCount);
        this.deckLabel.string = "牌山："+this.gameLogic._deck.length+"/"+this.gameLogic._deckCount;
    }
}