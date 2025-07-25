import {MahjongData} from "db://assets/scripts/model/MahjongData";

export class Calculator {

    // 定义国士无双需要的13种幺九牌的key
    private static yaojiuKeys = new Set([
        'W1', 'W9', // 万
        'T1', 'T9', // 条
        'S1', 'S9', // 索 (筒)
        'F1', 'F2', 'F3', 'F4', // 风 (东南西北)
        'D1', 'D2', 'D3'  // 三元 (中发白)
    ]);

    /**
     * 计算手牌是否可以和牌 (胡牌)
     * @param gangs 已经公开的杠牌 (副露)。每组杠是4张牌。
     * @param hands 手中的牌 (暗牌)。
     * @param newCard 刚刚摸到或吃碰杠后用来和牌的最后一张牌。
     * @returns 3=国士无双型 2=七对子 1=面子1雀头
     */
    public static ifWin(gangs: MahjongData[][], hands: MahjongData[], newCard: MahjongData): number {
        // 副露（吃、碰、杠）的数量
        const openMeldsCount = gangs.length;

        // 1. 判断是否满足国士无双牌型 (必须门前清)
        if (openMeldsCount === 0 && Calculator.isGuoshiwushuang(hands, newCard)) {
            return 3;
        }

        // 2. 判断是否满足七对子牌型 (必须门前清)
        if (openMeldsCount === 0 && Calculator.is7Duiz(hands, newCard)) {
            return 2;
        }

        // 3. 判断是否满足四面子+一雀头牌型 (可以有副露)
        if (Calculator.isBase(gangs, hands, newCard)) {
            return 1;
        }

        return 0;// 没有就返回0
    }

    /**
     * 判断是否满足国士无双牌型 (十三幺)
     * 条件: 门前清，由13种不同的幺九牌和字牌组成，外加其中任意一张作为雀头。
     */
    private static isGuoshiwushuang(hands: MahjongData[], newCard: MahjongData): boolean {
        const allCards = [...hands, newCard];
        if (allCards.length !== 14) {
            return false;
        }

        const cardCounts = new Map<string, number>();
        let pairFound = false;

        for (const card of allCards) {
            cardCounts.set(card.key, (cardCounts.get(card.key) || 0) + 1);
        }

        if (cardCounts.size !== 13) {
            return false; // 牌的种类数必须是13
        }

        for (const [key, count] of cardCounts.entries()) {
            if (!Calculator.yaojiuKeys.has(key)) {
                return false; // 出现了非幺九或字牌的牌
            }
            if (count === 2) {
                if (pairFound) return false; // 不能有多个对子
                pairFound = true;
            } else if (count !== 1) {
                return false; // 牌数只能是1或2
            }
        }

        return pairFound; // 必须有一个对子作为雀头
    }

    /**
     * 判断是否满足七对子牌型
     * 条件: 门前清，由7个不同的对子组成。
     */
    private static is7Duiz(hands: MahjongData[], newCard: MahjongData): boolean {
        const allCards = [...hands, newCard];
        if (allCards.length !== 14) {
            return false;
        }

        const cardCounts = new Map<string, number>();
        for (const card of allCards) {
            cardCounts.set(card.key, (cardCounts.get(card.key) || 0) + 1);
        }

        // 必须是7种不同的牌
        if (cardCounts.size !== 7) {
            return false;
        }

        // 每种牌的数量都必须是2
        for (const count of cardCounts.values()) {
            if (count !== 2) {
                return false;
            }
        }

        return true;
    }

    /**
     * 判断是否满足四面子+一雀头牌型
     * 这是最常见的和牌形式，可以使用递归进行判断。
     * 公开的杠牌 gangs 已经是确定的面子，我们只需要判断手中的牌是否能组成剩下需要的面子和一个雀头。
     */
    private static isBase(gangs: MahjongData[][], hands: MahjongData[], newCard: MahjongData): boolean {
        const concealedCards = [...hands, newCard];

        // 牌的总数必须为14，每一组副露都算3张
        if(hands.length+1+(gangs.length * 3)!==14) {
            return false;
        }

        // 为了方便处理，先排序
        const sortedCards = concealedCards.sort((a, b) => a.id - b.id);

        // 遍历所有可能的雀头（对子）
        for (let i = 0; i < sortedCards.length - 1; i++) {
            // 如果当前牌和下一张牌相同，则可以作为雀头
            if (sortedCards[i].key === sortedCards[i + 1].key) {
                // 移除这对雀头，得到剩余的牌
                const remainingCards = [...sortedCards.slice(0, i), ...sortedCards.slice(i + 2)];

                // 检查剩余的牌是否能组成面子
                if (this.checkMeldsRecursive(remainingCards)) {
                    return true; // 如果可以，说明找到了一个合法的和牌组合
                }
            }
        }

        return false; // 遍历完所有可能的雀头都无法和牌
    }

    /**
     * 递归检查一个牌数组是否能完全分解为面子（刻子或顺子）
     * @param cards 需要检查的牌，必须是已排序的
     * @returns {boolean}
     */
    private static checkMeldsRecursive(cards: MahjongData[]): boolean {
        // Base Case: 如果没有剩余的牌了，说明全部分解成功
        if (cards.length === 0) {
            return true;
        }

        const firstCard = cards[0];

        // 尝试移除一个刻子 (3张相同的牌)
        if (cards.length >= 3 && cards[1].key === firstCard.key && cards[2].key === firstCard.key) {
            if (this.checkMeldsRecursive(cards.slice(3))) {
                return true;
            }
        }

        // 尝试移除一个顺子 (3张同花色、点数连续的牌)
        // 字牌不能组成顺子
        if (firstCard.color !== 'F' && firstCard.color !== 'D') {
            const secondCardIndex = cards.findIndex(c => c.color === firstCard.color && c.point === firstCard.point + 1);
            if (secondCardIndex > -1) {
                const thirdCardIndex = cards.findIndex(c => c.color === firstCard.color && c.point === firstCard.point + 2);
                if (thirdCardIndex > -1) {
                    // 从剩余牌中移除这三张顺子牌
                    const remainingCards = cards.filter((_, index) => index !== 0 && index !== secondCardIndex && index !== thirdCardIndex);
                    if (this.checkMeldsRecursive(remainingCards)) {
                        return true;
                    }
                }
            }
        }

        // 如果以上两种方式都无法分解当前牌，则此路不通
        return false;
    }
}