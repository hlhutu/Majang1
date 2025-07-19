// YakuCalculator.ts (Ultimate Compatibility Version)

import { MajangData } from "db://assets/script/model/MajangData";
import { Global } from "db://assets/script/constants/Global";

// =================================================================================
// 辅助接口和函数
// =================================================================================

export interface YakuResult {
    name: string; // 役种名
    han: number;  // 翻数
}

export interface GameResult {
    ifWin: boolean;      // 是否和了
    sumHan: number;      // 总翻数
    yakus: YakuResult[]; // 所有役种
}

// 和牌分析后的手牌结构
interface HandDecomposition {
    melds: number[][]; // 4个面子
    pair: number[];    // 1个雀头
}

/**
 * 将麻将牌对象转换为一个可排序、可比较的数值。
 * 万子: 1-9, 筒子: 11-19, 索子: 21-29, 风牌: 31-34, 三元牌: 41-43
 */
function tileToNumber(tile: MajangData): number {
    switch (tile.color) {
        case Global.COLOR_Wan: return tile.point;
        case Global.COLOR_Tong: return 10 + tile.point;
        case Global.COLOR_Suo: return 20 + tile.point;
        case Global.COLOR_Feng: return 30 + tile.point;
        case Global.COLOR_SanYuan: return 40 + tile.point;
        default: return 0;
    }
}

// =================================================================================
// 主计算器类
// =================================================================================

export class YakuCalculator {

    public static calculate(
        gangs: MajangData[][],
        hand: MajangData[],
        winningTile: MajangData,
        seatWind: number,// 自风，即自己所在位置的风牌
        prevalentWind: number,// 当前场风 1234=东南西北
        isRinshan: boolean,// 是否岭上开花，即是否刚才杠过

        isTsumo: boolean = true,// 默认自摸
        isMenzen: boolean = true,// 默认门清，没有 吃碰杠
        isRiichi: boolean = false,// 是否立直
        isIppatsu: boolean = false,// 是否一发
        isChankan: boolean = false,// 是否枪杠
        isHaitei: boolean = false,// 是否海底摸鱼
        isHoutei: boolean = false// 是否河底捞月
    ): GameResult {

        const flattenedGangs = gangs.reduce((acc, val) => acc.concat(val), []);
        const allTiles = [...hand, ...flattenedGangs];
        const handNums = hand.map(tileToNumber).sort((a, b) => a - b);

        const decomposition = this.findWinningDecomposition(handNums);

        if (!decomposition) {
            return { ifWin: false, sumHan: 0, yakus: [] };
        }

        const yakus: YakuResult[] = [];

        // --- 1翻役种 ---
        if(isRiichi) yakus.push({ name: "立直", han: 1 });
        if(isIppatsu) yakus.push({ name: "一发", han: 1 });
        if(isRinshan) yakus.push({ name: "岭上开花", han: 1 });
        if(isChankan) yakus.push({ name: "枪杠", han: 1 });
        if(isHaitei) yakus.push({ name: "海底摸月", han: 1 });
        if(isHoutei) yakus.push({ name: "河底捞鱼", han: 1 });

        const menzenTsumo = this.checkMenzenTsumo(isMenzen, isTsumo);
        if(menzenTsumo) yakus.push(menzenTsumo);

        const tanyao = this.checkTanyao(allTiles);
        if(tanyao) yakus.push(tanyao);

        const yakuhai = this.checkYakuhai(allTiles, prevalentWind, seatWind);
        yakus.push(...yakuhai);

        if (isMenzen) {
            const pinfu = this.checkPinfu(decomposition, winningTile, prevalentWind, seatWind);
            if(pinfu) yakus.push(pinfu);

            const iipeikou = this.checkIipeikou(decomposition);
            if (iipeikou) yakus.push(iipeikou);
        }

        const sumHan = yakus.reduce((sum, yaku) => sum + yaku.han, 0);

        return {
            ifWin: true,
            sumHan: sumHan,
            yakus: yakus,
        };
    }

    // =================================================================================
    // 和牌判断 (重构)
    // =================================================================================

    private static findWinningDecomposition(handNums: number[]): HandDecomposition | null {
        // ... (此部分代码无变化，保持原样)
        if (handNums.length === 14) {
            let isSevenPairs = true;
            const melds = [];
            for (let i = 0; i < 14; i += 2) {
                if (handNums[i] !== handNums[i + 1]) {
                    isSevenPairs = false;
                    break;
                }
                melds.push([handNums[i], handNums[i+1]])
            }
            if (isSevenPairs) return { melds: melds.slice(0, 6), pair: melds[6] };
        }

        if ((handNums.length - 2) % 3 !== 0) return null;

        for (let i = 0; i < handNums.length; i++) {
            if (i > 0 && handNums[i] === handNums[i - 1]) continue;

            if (i + 1 < handNums.length && handNums[i] === handNums[i + 1]) {
                const pair = [handNums[i], handNums[i + 1]];
                const remaining = [...handNums.slice(0, i), ...handNums.slice(i + 2)];
                const melds = this.findMelds(remaining);
                if (melds) {
                    return { melds, pair };
                }
            }
        }
        return null;
    }

    private static findMelds(handNums: number[]): number[][] | null {
        // ... (此部分代码无变化，保持原样)
        if (handNums.length === 0) return [];

        let current = [...handNums];
        const first = current[0];

        if (current.length >= 3 && first === current[1] && first === current[2]) {
            const subMelds = this.findMelds(current.slice(3));
            if (subMelds !== null) {
                return [[first, first, first], ...subMelds];
            }
        }

        if (first < 30) {
            const secondIndex = current.indexOf(first + 1);
            const thirdIndex = current.indexOf(first + 2);

            if (secondIndex > -1 && thirdIndex > -1) {
                const remaining = [...current];
                remaining.splice(thirdIndex, 1);
                remaining.splice(secondIndex, 1);
                remaining.splice(0, 1);

                const subMelds = this.findMelds(remaining);
                if (subMelds !== null) {
                    return [[first, first + 1, first + 2], ...subMelds];
                }
            }
        }
        return null;
    }

    // =================================================================================
    // 1翻役种检查
    // =================================================================================

    private static checkMenzenTsumo(isMenzen: boolean, isTsumo: boolean): YakuResult | null {
        return isMenzen && isTsumo ? { name: "门前清自摸和", han: 1 } : null;
    }

    private static checkTanyao(allTiles: MajangData[]): YakuResult | null {
        const isTanyao = allTiles.every(tile => {
            const point = tile.point;
            const isTerminal = (point === 1 || point === 9);
            const isHonor = tile.color === Global.COLOR_Feng || tile.color === Global.COLOR_SanYuan;
            return !isTerminal && !isHonor;
        });
        return isTanyao ? { name: "断幺九", han: 1 } : null;
    }

    private static checkYakuhai(allTiles: MajangData[], prevalentWind: number, seatWind: number): YakuResult[] {
        const results: YakuResult[] = [];
        const allTileNums = allTiles.map(tileToNumber);

        const counts = allTileNums.reduce((acc, num) => {
            acc[num] = (acc[num] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        const checkTriple = (num: number, name: string) => {
            if (counts[num] >= 3) {
                results.push({ name: `役牌 ${name}`, han: 1 });
            }
        };

        const prevalentWindNum = 30 + prevalentWind;
        checkTriple(prevalentWindNum, "场风");

        const seatWindNum = 30 + seatWind;
        if (prevalentWindNum !== seatWindNum) {
            checkTriple(seatWindNum, "自风");
        }

        checkTriple(41, "白");
        checkTriple(42, "发");
        checkTriple(43, "中");

        return results;
    }

    private static checkPinfu(decomposition: HandDecomposition, winningTile: MajangData, prevalentWind: number, seatWind: number): YakuResult | null {
        const allMeldsAreShuntsu = decomposition.melds.every(meld => meld[0] + 1 === meld[1] && meld[1] + 1 === meld[2]);
        if (!allMeldsAreShuntsu) return null;

        const pairNum = decomposition.pair[0];
        const prevalentWindNum = 30 + prevalentWind;
        const seatWindNum = 30 + seatWind;
        const isYakuhaiPair = (pairNum === 41 || pairNum === 42 || pairNum === 43 || pairNum === prevalentWindNum || pairNum === seatWindNum);
        if (isYakuhaiPair) return null;

        const winningNum = tileToNumber(winningTile);
        let isRyanmenWait = false;
        for (const meld of decomposition.melds) {
            if (meld.indexOf(winningNum) > -1) {
                if ((winningNum === meld[0] && meld[0] % 10 !== 7) || (winningNum === meld[2] && meld[2] % 10 !== 3)) {
                    isRyanmenWait = true;
                    break;
                }
            }
        }
        return isRyanmenWait ? { name: "平和", han: 1 } : null;
    }

    private static checkIipeikou(decomposition: HandDecomposition): YakuResult | null {
        const shuntsuMelds = decomposition.melds.filter(meld => meld.length === 3 && meld[0] + 1 === meld[1] && meld[1] + 1 === meld[2]);
        if (shuntsuMelds.length < 2) return null;

        const meldStrings = shuntsuMelds.map(meld => JSON.stringify(meld.sort()));
        const counts = meldStrings.reduce((acc, str) => {
            acc[str] = (acc[str] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // 【修正点】使用 for...in 循环代替 Object.values().some()
        let hasPairOfShuntsu = false;
        for (const key in counts) {
            // hasOwnProperty 确保我们只检查对象自身的属性，而不是原型链上的
            if (Object.prototype.hasOwnProperty.call(counts, key)) {
                if (counts[key] >= 2) {
                    hasPairOfShuntsu = true;
                    break; // 找到一对即可，无需继续循环
                }
            }
        }

        return hasPairOfShuntsu ? { name: "一盃口", han: 1 } : null;
    }
}