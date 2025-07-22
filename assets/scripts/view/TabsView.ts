import {_decorator, Component, director, game, Label, Node, Prefab, instantiate, Vec3, Sprite, Color, Button, UIOpacity, tween, Toggle } from 'cc';
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
 * 标签页
 */
@ccclass('TabsView')
export class TabsView extends Component {

    @property({ type: [Toggle], tooltip: "标签页按钮数组" })
    public tabs: Toggle[] = [];

    @property({ type: [Node], tooltip: "内容页节点数组" })
    public pages: Node[] = [];

    onLoad() {
        // 默认显示第一个标签页
        this.switchTab(0);

        // 为每个标签按钮添加点击事件监听
        this.tabs.forEach((tab, index) => {
            tab.node.on('toggle', () => {
                this.switchTab(index);
            }, this);
        });
        // 初始化文本
        this.initText()
    }

    /**
     * 切换标签页
     * @param index 标签页索引
     */
    switchTab(index: number) {
        // 遍历所有标签页
        this.pages.forEach((page, i) => {
            // 显示选中的页面，隐藏其他页面
            page.active = (i === index);
        });

        // （可选）如果不用 ToggleGroup，可以在此手动更新按钮状态
        // this.tabs.forEach((tab, i) => {
        //     tab.isChecked = (i === index);
        // });
    }

    private initText() {
        // 1番
        this.pages[0].getChildByPath('ScrollView/view/content/item').getComponent(Label).string
            = `斷么九：没有任何幺九牌（一饼、一条、一万、九饼、九条、九万、所有风牌和三元牌）。
平和：由四组顺子+非役牌雀头，且和牌形式为双面听（不得为嵌张、单钓、边张）。
一盃口：两个同样的顺子，例：一万二万三万x2。又称“一色二顺”“一色同顺”。
役牌：场风牌、自风牌、三元牌（中发白）。
岭上开花：开杠后摸的岭上牌自摸。
海底捞月：最后一次抽牌机会抽到的牌自摸和。
役牌：三元牌（中/发/白）、场风牌、自风牌，每个1番。`
        // 2番
        this.pages[1].getChildByPath('ScrollView/view/content/item').getComponent(Label).string
            = `三色同顺：同时有由饼、条、万组成的同一组数字的顺子（例：一二三饼、一二三条、一二三万）。
三色同刻：同时有饼、条、万组成的同一个数字的刻子（杠子）（例：六饼、六条、六万各有3只）。
一气通贯：同一色牌中（饼条万），一至九各有一只，组成三副顺子。
对对和：全部由刻子（杠子）以及将牌组成。
三暗刻：三组暗刻(暗杠)。
三杠子：三组杠子。
七对子：七个对子。
混全帶么九：每一组牌（顺子、刻子、杠子、雀头）都包含幺九牌。
混老头：只有幺九牌，与断。
小三元：三组三元牌，其中两组为刻子（杠子），另外一组为将。`
        // 3番
        this.pages[2].getChildByPath('ScrollView/view/content/item').getComponent(Label).string
            = `混一色：由一种花色的数牌和字牌（风牌、三元牌）组成的和牌。
純全帶么九（混全帶么九的上位）：混全帶么九，且不包含字牌（万/筒/条）。
二盃口（一盃口的上位）：两个同样的顺子x2。与七对子互斥，优先计二盃口。`
        // 6番
        this.pages[3].getChildByPath('ScrollView/view/content/item').getComponent(Label).string
            = `清一色（混一色的上位）：仅有一种花色。`
        // 10番
        this.pages[4].getChildByPath('ScrollView/view/content/item').getComponent(Label).string
            = `国士无双：全部为单只幺九牌，但其中一只可重复。
大三元（小三元的上位）：全部3组三元牌为刻子（杠子）。
四暗刻（三暗刻的上位）：四组刻子（杠子）。
字一色：只有风牌和三元牌。
绿一色：只包含绿色的牌（二、三、四、六、八条及发财）。
小四喜：3组风牌为刻子（杠子），另1组为将。
清老头：都是老头牌（一九万、一九条子、一九筒）。
九莲宝灯：同种花色以111 2345678 999的形式加上同花色的任意一张。
四杠子：有4组杠子。
天和：开局的14张即和牌，杠过后才和则不成立。
地和：打出一张牌后即和牌，杠过后才和则不成立。
`
        // 20番
        this.pages[5].getChildByPath('ScrollView/view/content/item').getComponent(Label).string
            = `国士无双十三面听（国士无双的上位）：国士无双，且重复的一张最后抽到！
四暗刻单骑（四暗刻的上位）：四暗刻，且雀头最后抽到！
大四喜（小四喜的上位）：全部4组风牌为刻子（杠子）。
纯正九莲宝灯（九莲宝灯的上位）：九莲宝灯，且必须是九面听。`
    }
}