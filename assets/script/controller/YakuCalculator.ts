// 这是一个简化的役种计算器，用于演示
// 完整的日本麻将胡牌检测和役种计算非常复杂
// 这里我们仅为演示，实现几个基础役种的判断

import {MajangData} from "db://assets/script/model/MajangData";

export interface YakuResult {
    name: string; // 役种名
    han: number;  // 翻数
}

export class YakuCalculator {

    /**
     * 主计算函数
     * @param hand 手牌数组 (14张)
     * @returns 返回一个包含所有命中役种的数组
     */
    public static calculate(hand: MajangData[]): YakuResult[] {
        const results: YakuResult[] = [];

        // 简单的役种判断示例
        if (this.isTanyao(hand)) {
            results.push({ name: "断幺九", han: 1 });
        }
        if (this.isChinitsu(hand)) {
            results.push({ name: "清一色", han: 6 });
        }

        // 在这里可以添加更多役种判断...
        // 例如: isPinfu, isToitoi, isChiitoitsu, isHonitsu...

        return results;
    }

    /**
     * 判断是否为“断幺九” (Tanyaochu)
     * 条件：手牌中没有任何幺九牌（1, 9筒条万）和字牌。
     */
    private static isTanyao(hand: MajangData[]): boolean {
        // 使用 every 方法检查是否所有牌都满足条件
        return hand.every(tile => {
            const isYaochu = tile.point === 1 || tile.point === 9 || tile.color === 'F' || tile.color === 'D';
            return !isYaochu;
        });
    }

    /**
     * 判断是否为“清一色” (Chinitsu)
     * 条件：手牌全部由同一种花色的数牌组成。
     */
    private static isChinitsu(hand: MajangData[]): boolean {
        if (hand.length === 0) return false;

        // 检查是否有字牌，有则直接返回false
        if (hand.some(tile => tile.color === 'F' || tile.color === 'D')) {
            return false;
        }

        const firstSuit = hand[0].color;
        return hand.every(tile => tile.color === firstSuit);
    }

    // 注意：一个完整的胡牌检测需要先验证手牌是否满足4面子1雀头的和牌基本型，
    // 或是七对子、国士无双等特殊牌型。此处的示例为了简化，省略了胡牌验证，直接进行役种判断。
}