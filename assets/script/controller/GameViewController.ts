// in hlhutu/majang1/Majang1-88bd5fd17289239cf56fb2501ccd5445313091f1/assets/script/controller/GameViewController.ts
import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc'; // 引入 Vec3
import {MajangData} from "db://assets/script/model/MajangData";
import {MajangTile} from "db://assets/script/controller/MajangTile";
import { GameLogicController} from "db://assets/script/controller/GameLogicController";
const { ccclass, property, requireComponent } = _decorator;

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
    }

    clear() {
        this.clearHandArea();
        this.clearTableArea();
    }

    // 修改 addPaiTo, 增加一个可选的缩放参数
    private addPaiTo(pai: MajangData, target: Node, scale: number = 1.0) {
        const newTileNode = instantiate(this.majangPrefab);

        // 设置缩放
        newTileNode.setScale(new Vec3(scale, scale, scale));

        const tileComponent = newTileNode.getComponent(MajangTile);
        if (tileComponent) {
            tileComponent.init(pai);
        } else {
            console.log(`错误：麻将Prefab上没有找到 MajangTile 脚本！`);
        }
        target.addChild(newTileNode);
    }

    drawHandArea() {
        this.clearHandArea();
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

    // 重写 drawTableArea
    drawTableArea() {
        this.clearTableArea(); // 先清空
        // 遍历桌上的牌并以较小的尺寸显示
        this.gameLogic._table.forEach((p) => {
            // 假设打出的牌缩小到70%
            this.addPaiTo(p, this.tableArea, 0.7);
        });
    }

    clearTableArea() {
        this.tableArea.removeAllChildren();
    }
}