import {Callback} from "db://assets/scripts/common/EventManager";

/**
 * 遗物
 */
export class RelicData {
    public id: number;// id值
    public name: string; // 遗物名
    public desc: string; // 描述
    public handler: Callback; // 回调函数
    public order: number = 0; // 优先级，默认0
    public img: string; // 图片资源路径
}