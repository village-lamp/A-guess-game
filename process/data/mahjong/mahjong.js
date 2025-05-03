export const columns = [
    {
        "label": "手牌",
        "prop": "value",
        "type": "key",
        "near": ""
    },
    {
        "label": "役种",
        "prop": "yaku",
        "type": "groups_list",
        "near": []
    }
];
export const mainData = [{"pic_url": "https://i.postimg.cc/hv00p1nf/1mjp.png", "value": "1m", "yaku": []}, {"pic_url": "https://i.postimg.cc/bY0Lypnp/1p.png", "value": "1p", "yaku": []}, {"pic_url": "https://i.postimg.cc/2Syx7WKS/1sjp.png", "value": "1s", "yaku": []}, {"pic_url": "https://i.postimg.cc/rF8jz3GW/1zjp.png", "value": "1z", "yaku": []}, {"pic_url": "https://i.postimg.cc/MKdDB5tL/2mjp.png", "value": "2m", "yaku": []}, {"pic_url": "https://i.postimg.cc/s2Z9tryF/2p.png", "value": "2p", "yaku": []}, {"pic_url": "https://i.postimg.cc/W1ywW4B6/2s.png", "value": "2s", "yaku": []}, {"pic_url": "https://i.postimg.cc/DZkdhMyS/2zjp.png", "value": "2z", "yaku": []}, {"pic_url": "https://i.postimg.cc/zBCwGFV0/3mjp.png", "value": "3m", "yaku": []}, {"pic_url": "https://i.postimg.cc/rsq10R4c/3p.png", "value": "3p", "yaku": []}, {"pic_url": "https://i.postimg.cc/hvM9948m/3s.png", "value": "3s", "yaku": []}, {"pic_url": "https://i.postimg.cc/VsFBy4yN/3zjp.png", "value": "3z", "yaku": []}, {"pic_url": "https://i.postimg.cc/TYYjTmGJ/4mjp.png", "value": "4m", "yaku": []}, {"pic_url": "https://i.postimg.cc/hPyLvjtW/4p.png", "value": "4p", "yaku": []}, {"pic_url": "https://i.postimg.cc/K81nM21K/4s.png", "value": "4s", "yaku": []}, {"pic_url": "https://i.postimg.cc/g213yThg/4zjp.png", "value": "4z", "yaku": []}, {"pic_url": "https://i.postimg.cc/XvFdskc4/5mjp.png", "value": "5m", "yaku": []}, {"pic_url": "https://i.postimg.cc/xC2HhNtH/5p.png", "value": "5p", "yaku": []}, {"pic_url": "https://i.postimg.cc/KzDL2cHW/5s.png", "value": "5s", "yaku": []}, {"pic_url": "https://i.postimg.cc/fyWdTn4R/5zjp.png", "value": "5z", "yaku": []}, {"pic_url": "https://i.postimg.cc/rshrDncC/6mjp.png", "value": "6m", "yaku": []}, {"pic_url": "https://i.postimg.cc/66zRb3R2/6p.png", "value": "6p", "yaku": []}, {"pic_url": "https://i.postimg.cc/rFm4BkCh/6s.png", "value": "6s", "yaku": []}, {"pic_url": "https://i.postimg.cc/zXch5cxq/6zjp.png", "value": "6z", "yaku": []}, {"pic_url": "https://i.postimg.cc/YCLWSzPY/7mjp.png", "value": "7m", "yaku": []}, {"pic_url": "https://i.postimg.cc/Gp0sTs0N/7p.png", "value": "7p", "yaku": []}, {"pic_url": "https://i.postimg.cc/BvxPTQ4v/7s.png", "value": "7s", "yaku": []}, {"pic_url": "https://i.postimg.cc/3RY4n5xF/7zjp.png", "value": "7z", "yaku": []}, {"pic_url": "https://i.postimg.cc/gJsw7SwF/8mjp.png", "value": "8m", "yaku": []}, {"pic_url": "https://i.postimg.cc/WzfdNd65/8p.png", "value": "8p", "yaku": []}, {"pic_url": "https://i.postimg.cc/dQWkmfPG/8s.png", "value": "8s", "yaku": []}, {"pic_url": "https://i.postimg.cc/sDvBnJsq/9mjp.png", "value": "9m", "yaku": []}, {"pic_url": "https://i.postimg.cc/Kvw1CgYz/9p.png", "value": "9p", "yaku": []}, {"pic_url": "https://i.postimg.cc/GmD4RhBj/9s.png", "value": "9s", "yaku": []}];
export const prop2label = {"value": "手牌", "yaku": "役种", "pic_url": ""};
export const maxStep = 10;
export const hasPic = true;
export const placeholder = "请输入手牌";
export const rule = '';
import DataProcessor from "../script/dataProcessor.js";
export class MyDataProcessor extends DataProcessor {}
