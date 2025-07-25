import {MahjongData} from "db://assets/scripts/model/MahjongData";
import {YakuResult} from "db://assets/scripts/model/GameResult";
import {runtime} from "db://assets/scripts/data/Runtime";
import {Global} from "db://assets/scripts/data/Global";

// 1. 同样，先定义值的类型接口
interface YakuInfo {
    key: string;
    yaku: YakuResult;
}

// CalculatorFor1 计算1番的
export class CalculatorFor1 {
    // 检测役牌
    public static checkYakuPai(
        gangs: MahjongData[][],
        hands: MahjongData[],
        winningTile: MahjongData,// 抽到的牌
    ): YakuResult[] {
        const yakuMaps: Map<string, YakuResult> = new Map();
        const yakuLibs: Record<string, YakuInfo> = {
            "D1": {key: "D1", yaku: { name: "役牌：中", han: 1} },
            "D2": {key: "D2", yaku: { name: "役牌：发", han: 1} },
            "D3": {key: "D3", yaku: { name: "役牌：白", han: 1} },
            // 使用计算属性名来动态设置 key
            [`F${runtime.prevalentWind}`]: {key: `F${runtime.prevalentWind}`, yaku: { name: `场风：${Global.windStrs[runtime.prevalentWind]}`, han: 1} },
            [`F${runtime.selfWind}`]: {key: `F${runtime.selfWind}`, yaku: { name: `自风：${Global.windStrs[runtime.selfWind]}`, han: 1} },
        };
        gangs.forEach((gang) => {
            if(yakuLibs[gang[0].key]) {// 命中
                yakuMaps.set(gang[0].key, yakuLibs[gang[0].key].yaku);
            }
        });
        hands.forEach(hand => {
            if(yakuLibs[hand.key]) {// 命中
                yakuMaps.set(hand.key, yakuLibs[hand.key].yaku);
            }
        })
        if(yakuLibs[winningTile.key]) {// 命中
            yakuMaps.set(winningTile.key, yakuLibs[winningTile.key].yaku);
        }
        const yakuResult: YakuResult[] = []
        for (const [key, value] of yakuMaps) {
            yakuResult.push(value)
        }
        return yakuResult;
    }
}