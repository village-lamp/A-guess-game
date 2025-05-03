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
export const rule = '开发中';
import DataProcessor from "../script/dataProcessor.js";

export class MyDataProcessor extends DataProcessor {
    constructor(data, columns) {
        super(data, columns);
    }

    split_tiles(groups, type) {
        const tiles = [];
        const images = [];
        if (type === "goshi") {
            const str = groups[0];
            for (let i = 0; i < str.length; i += 2) {
                const tile = str.slice(i, i + 2);
                tiles.push([tile]);
                images.push(this.getTileImage(tile));
            }
        } else {
            for (const group of groups.slice(1)) {
                const type = group.slice(-1);
                const numbers = group.slice(0, -1).split('').map(n => n + type);
                if (numbers.filter((n) => n === '8z' || n === '9z').length > 0) {
                    return null;
                }
                tiles.push(numbers)
                images.push(...numbers.map(n => this.getTileImage(n)))
            }
        }
        return [tiles, images];
    }

    async input2Labels(input) {
        const regex = /([1-9]{3}[spmz])([1-9]{3}[spmz])([1-9]{3}[spmz])([1-9]{3}[spmz])([1-9]{2}[spmz])/;
        const regex_chitui = /([1-9]{2}[spmz])([1-9]{2}[spmz])([1-9]{2}[spmz])([1-9]{2}[spmz])([1-9]{2}[spmz])([1-9]{2}[spmz])([1-9]{2}[spmz])/;
        const regex_goshi = /(?:1s|9s|1p|9p|1m|9m|[1-7]z){14}/;
        let type = "normal";
        let groups = input.match(regex);
        if (!groups) {
            type = "chitui";
            groups = input.match(regex_chitui);
            if (!groups) {
                type = "goshi";
                groups = input.match(regex_goshi);
                if (!groups) {
                    return null;
                }
            }
        }
        const split_res = this.split_tiles(groups, type)
        const tiles = split_res[0];
        const images = split_res[1];

        if (!this.checkTiles(tiles, type)) {
            return null;
        }

        const yaku = this.calcYakus(tiles);

        return this.combineImages(images).then((url) => {
            return {'value': input, 'yaku': yaku, 'pic_url': url};
        });
    }

    checkTiles(tiles, type) {
        if (type === "normal") {
            for (const group of tiles.slice(0, -1)) {
                const num1 = parseInt(group[0].slice(0, 1));
                const num2 = parseInt(group[1].slice(0, 1));
                const num3 = parseInt(group[2].slice(0, 1));
                if (!((num1 === num2 && num2 === num3) || (num1 + 1 === num2 && num2 + 1 === num3))) {
                    return false;
                }
            }
            const group = tiles.slice(-1)[0];
            const num1 = parseInt(group[0].slice(0, 1));
            const num2 = parseInt(group[1].slice(0, 1));
            return num1 === num2;
        } else if (type === "chitui") {
            for (const group of tiles) {
                const num1 = parseInt(group[0].slice(0, 1));
                const num2 = parseInt(group[1].slice(0, 1));
                console.log(num1, num2);
                if (num1 !== num2) {
                    return false;
                }
            }
            return true;
        } else if (type === "goshi") {
            const count = {};
            for (const tile of tiles) {
                count[tile] = (count[tile] || 0) + 1;
            }
            return Object.values(count).filter((n) => { return n >= 2 }).length === 1;
        }
        return false;
    }

    // todo
    calcYakus(tiles) {
        return [];
    }

    getTileImage(name) {
        return this.data.find(d => d.value === name).pic_url;
    }

    combineImages(images) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        return Promise.all(images.map((src) => this.loadImage(src))).then((images) => {
            canvas.width = 420; // 70 * 6
            canvas.height = 420; // 20 + 100 + 40 + 100 + 40 + 100 + 20
            images.forEach((image, index) => {
                const row = Math.floor(index / 6);
                const col = index % 6;
                const xPos = col * 70;
                const yPos = 20 + 140 * row;
                ctx.drawImage(image, xPos, yPos, 70, 100);
            });
            return canvas.toDataURL('image/png');
        });
    }

    autoComplete(input) {
        return [{'value': '111z222s333m444p55z'}, {'value': '11s22s33s44s55s66s77s'},
            {'value': '1s9s1p9p1m9m1z2z3z4z5z6z7z7z'}];
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
        });
    }
}
