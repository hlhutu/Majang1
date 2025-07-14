import { _decorator, Component, Node, Sprite, SpriteFrame, EventTouch, Vec3, Camera, game } from 'cc';
import {MajangData} from "db://assets/script/model/MajangData";
import {ResourceUtil} from "db://assets/script/utils/ResourceUtil";
const { ccclass, property, requireComponent } = _decorator;

// 控制牌，添加到麻将的prefeb上
@ccclass('MajangTile')
@requireComponent(Sprite)
export class MajangTile extends Component {

    majangData: MajangData; // 当前组件所对应的麻将
    private currentSprite: Sprite;

    start() {
        this.currentSprite = this.getComponent(Sprite);
    }

    init(majangData: MajangData) {
        this.majangData = majangData;
        ResourceUtil.instance.loadAsset<SpriteFrame>(this.majangData.dir+"/"+this.majangData.img, SpriteFrame).then(r => {
            this.currentSprite.spriteFrame = r// 赋予图片
        }).catch(e => {
            console.error(e);
        })

    }

    update(deltaTime: number) {

    }
}