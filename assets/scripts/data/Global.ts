import { MahjongData } from "db://assets/scripts/model/MahjongData";

export class Global {
    public static COLOR_Wan: string = 'W'; // 万
    public static COLOR_Tong: string = 'T'; // 筒
    public static COLOR_Suo: string = 'S'; // 索子/条子
    public static COLOR_Feng: string = 'F'; // 风牌
    public static COLOR_SanYuan: string = 'D'; // 三元牌
    public static libs = {
        defaultLib: [], // 默认牌组
    }
    public static stages = {
        0: [1_000, 5_000, 10_000, 100_000],
        1: [2_000, 10_000, 500_000, 10_000_000]
    }
    public static windStrs = ['无', '東', '南', '西', '北']

    static {// 初始化默认牌组
        let id: number = 0;
        // 初始化万
        for (let i = 1; i <= 9; i++) {
            Global.libs.defaultLib.push(
                Global.buildMahjongData(id++, Global.COLOR_Wan, i),
                Global.buildMahjongData(id++, Global.COLOR_Wan, i),
                Global.buildMahjongData(id++, Global.COLOR_Wan, i),
                Global.buildMahjongData(id++, Global.COLOR_Wan, i),
            );
        }
        // 初始化筒
        for (let i = 1; i <= 9; i++) {
            Global.libs.defaultLib.push(
                Global.buildMahjongData(id++, Global.COLOR_Tong, i),
                Global.buildMahjongData(id++, Global.COLOR_Tong, i),
                Global.buildMahjongData(id++, Global.COLOR_Tong, i),
                Global.buildMahjongData(id++, Global.COLOR_Tong, i),
            );
        }
        // 初始化索
        for (let i = 1; i <= 9; i++) {
            Global.libs.defaultLib.push(
                Global.buildMahjongData(id++, Global.COLOR_Suo, i),
                Global.buildMahjongData(id++, Global.COLOR_Suo, i),
                Global.buildMahjongData(id++, Global.COLOR_Suo, i),
                Global.buildMahjongData(id++, Global.COLOR_Suo, i),
            );
        }
        // 初始化风牌，东南西北
        for (let i = 1; i <= 4; i++) {
            Global.libs.defaultLib.push(
                Global.buildMahjongData(id++, Global.COLOR_Feng, i),
                Global.buildMahjongData(id++, Global.COLOR_Feng, i),
                Global.buildMahjongData(id++, Global.COLOR_Feng, i),
                Global.buildMahjongData(id++, Global.COLOR_Feng, i),
            );
        }
        // 初始化三元，中发白
        for (let i = 1; i <= 3; i++) {
            Global.libs.defaultLib.push(
                Global.buildMahjongData(id++, Global.COLOR_SanYuan, i),
                Global.buildMahjongData(id++, Global.COLOR_SanYuan, i),
                Global.buildMahjongData(id++, Global.COLOR_SanYuan, i),
                Global.buildMahjongData(id++, Global.COLOR_SanYuan, i),
            );
        }
    }

    private static buildMahjongData(id: number, color: string, i: number): MahjongData {
        const d = new MahjongData();
        d.id = id;
        d.key = color + i
        d.color = color;
        d.point = i;
        if (color == Global.COLOR_Wan) {
            d.img = "64px_MJw" + i;
        } else if (color == Global.COLOR_Tong) {
            d.img = "64px_MJt" + i;
        } else if (color == Global.COLOR_Suo) {
            d.img = "64px_MJs" + i;
        } else {// 默认白板
            d.img = "64px_MJd3";
        }
        return d
    }
}

