import {Global} from "db://assets/script/constants/Global";

export class MajangData {

    public id: number;// id值
    public key: string; // 麻将key
    public color: string; // 花色
    public point: number; // 点数，风/三元牌为0点
    public dir: string = "images"; // 图片所在的目录
    public img: string; // 图片资源路径

    public static MajangLib: MajangData[] = [];
    static {// 静态代码块执行初始化，初始化所有麻将
        console.log('init MajangData');
        let id: number = 0;
        // 初始化万
        for (let i = 1; i <= 9; i++) {
            MajangData.MajangLib.push(
                MajangData.buildMajangData(id++, Global.COLOR_Wan, i),
                MajangData.buildMajangData(id++, Global.COLOR_Wan, i),
                MajangData.buildMajangData(id++, Global.COLOR_Wan, i),
                MajangData.buildMajangData(id++, Global.COLOR_Wan, i),
            );
        }
        // 初始化筒
        for (let i = 1; i <= 9; i++) {
            MajangData.MajangLib.push(
                MajangData.buildMajangData(id++, Global.COLOR_Tong, i),
                MajangData.buildMajangData(id++, Global.COLOR_Tong, i),
                MajangData.buildMajangData(id++, Global.COLOR_Tong, i),
                MajangData.buildMajangData(id++, Global.COLOR_Tong, i),
            );
        }
        // 初始化索
        for (let i = 1; i <= 9; i++) {
            MajangData.MajangLib.push(
                MajangData.buildMajangData(id++, Global.COLOR_Suo, i),
                MajangData.buildMajangData(id++, Global.COLOR_Suo, i),
                MajangData.buildMajangData(id++, Global.COLOR_Suo, i),
                MajangData.buildMajangData(id++, Global.COLOR_Suo, i),
            );
        }
        console.log('init MajangData successfully', MajangData.MajangLib.values());
    }
    private static buildMajangData(id:number, color:string, i:number): MajangData {
        const d = new MajangData();
        d.id = id;
        d.key = color+i
        d.color = color;
        d.point = i;
        if(color==Global.COLOR_Wan){
            d.img = "64px_MJw"+i;
        }else if(color==Global.COLOR_Tong){
            d.img = "64px_MJt"+i;
        }else if(color==Global.COLOR_Suo){
            d.img = "64px_MJs"+i;
        }else {// 默认白板
            d.img = "64px_MJd3";
        }
        return d
    }
}


