export class MahjongData {
    public id: number;// id值
    public key: string; // 麻将key，即 color+point
    public kanji: string; // 汉字，暂时无用
    public color: string; // 花色，W=万, T=条, S=索, F=风, D=三元
    public point: number; // 点数，东南西北=1234，中发白=123
    public img: string; // 图片资源路径
}


