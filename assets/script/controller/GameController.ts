import { _decorator, Component, Node, Sprite, SpriteFrame, Prefab, instantiate } from 'cc';
import {MajangData} from "db://assets/script/model/MajangData";
import {MajangTile} from "db://assets/script/controller/MajangTile";
const { ccclass, property, requireComponent } = _decorator;

@ccclass('GameController')
export class GameController extends Component {

    @property({
        type: Prefab,
        tooltip: '麻将牌的预制体'
    })
    majangPrefab: Prefab = null!;

    @property({
        type: Node,
        tooltip: '手牌区域'
    })
    handArea: Node = null!;

    // 存放当前牌局所有牌的数组
    private _deck: MajangData[] = [];

    onLoad() {
        // 可以在这里做一些初始化检查
        if (!this.majangPrefab) {
            console.error('错误：GameController 未配置 majangPrefab!');
        }
        if (!this.handArea) {
            console.error('错误：GameController 未配置 handArea!');
        }
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
        // 1. 清理上一局的牌（如果需要）
        this.handArea.removeAllChildren();

        // 2. 洗牌
        this.shuffleDeck();

        // 3. 发13张牌到手牌
        this.dealHand(13);
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
            // 实例化一个麻将Prefab
            const newTileNode = instantiate(this.majangPrefab);

            // 获取Prefab上的MajangTile组件并初始化它
            const tileComponent = newTileNode.getComponent(MajangTile);
            if (tileComponent) {
                tileComponent.init(pai);
            } else {
                console.log(`错误：麻将Prefab上没有找到 MajangTile 脚本！`);
            }

            // 将生成的麻将牌节点添加到手牌区域
            this.handArea.addChild(newTileNode);
        }

        console.log('发牌完成！');
        // 在这里可以接着处理排序手牌等逻辑
    }
}