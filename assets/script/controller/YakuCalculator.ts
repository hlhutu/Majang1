// 这是一个简化的役种计算器，用于演示
// 完整的日本麻将胡牌检测和役种计算非常复杂
// 这里我们仅为演示，实现几个基础役种的判断

import {MajangData} from "db://assets/script/model/MajangData";

export interface YakuResult {
    name: string; // 役种名
    han: number;  // 翻数
}

export interface GameResult {
    ifWin: boolean;// 是否和了
    sumHan: number;// 总翻数
    yakus: YakuResult[];// 所有役种
}

export class YakuCalculator {

    /**
     * 主计算函数
     * @param gangs 所有杠
     * @param hand 手牌数组 (14张)
     * @returns 返回一个包含所有命中役种的数组
     */
    public static calculate(gangs: MajangData[][], hand: MajangData[]): GameResult {
        // 先判断是否和牌
        // 统计所有役种
        return null;
    }

    // 判断是否和牌
    private static isHu(gangs: MajangData[][], hand: MajangData[]): boolean {
        return null;
    }

    /**
     * 判断是否为“断幺九” (Tanyaochu)
     * 条件：手牌中没有任何幺九牌（1, 9筒条万）和字牌。
     */
    private static checkTanyao(gangs: MajangData[][], hand: MajangData[]): YakuResult {
        return null;
    }

    /**
     * 判断是否为“清一色” (Chinitsu)
     * 条件：手牌全部由同一种花色的数牌组成。
     */
    private static checkChinitsu(gangs: MajangData[][], hand: MajangData[]): YakuResult {
        return null;
    }
}