export interface GameResult {
    ifWin: boolean;      // 是否和了
    sumHan: number;      // 总翻数
    yakus: YakuResult[]; // 所有役种
}

export interface YakuResult {
    name: string; // 役种名
    han: number;  // 翻数
}

// 和牌分析后的手牌结构
export interface HandDecomposition {
    melds: number[][]; // 4个面子
    pair: number[];    // 1个雀头
}