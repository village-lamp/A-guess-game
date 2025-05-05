const TilesType = Object.freeze({
    NORMAL: "normal",
    KOKUSHI: "kokushi",
    CHIITOI: "chiitoi"
})

export class MyDataProcessor extends DataProcessor {
    constructor(data, columns) {
        super(data, columns);

        this.bafuu = "";
        this.jifuu = "";
        const restaurants = Object.keys(this.yakus_normal);
        restaurants.push(...Object.keys(this.yakus_man));
        this.restaurants = restaurants.map((r) => {
            return {'value': r}
        });
    }

    //region data
    types = 'smpz';

    yakus_normal = {
        "断幺九": [this.isTanyao, this.generateTanyao],
        "自风牌": [this.isJiFuu, this.generateJiFuu],
        "场风牌": [this.isBaFuu, this.generateBaFuu],
        "平和": [this.isHeiwa, this.generateHeiwa],
        "一杯口": [this.isIipekou, this.generateIipekou],
        "三色同刻": [this.isSanshokuDoukou, this.generateSanshokuDoukou],
        "三暗刻": [this.isSanankou, this.generateSanankou],
        "混老头": [this.isHonroutou, this.generateHonroutou],
        "混全带幺九": [this.isHonchantaiyaochuu, this.generateHonchantaiyaochuu],
        "一气通贯": [this.isIkkitsuukan, this.generateIkkitsuukan],
        "三色同顺": [this.isSanshokuDoujun, this.generateSanshokuDoujun],
        "两杯口": [this.isRyanpeikou, this.generateRyanpeikou],
        "纯全带幺九": [this.isJunchantaiyaochuu, this.generateJunchantaiyaochuu],
        "混一色": [this.isHonitsu, this.generateHonitsu],
        "清一色": [this.isChinitsu, this.generateChinitsu],
        "一色三同顺": [this.isIsshoukuSanDoujun, this.generateIsshoukuSanDoujun],
        "小三元": [this.isShousangen, this.generateShousangen],
        "七对子": [this.isChiitoi, this.generateChiitoi],
        "对对和": [this.isToitoi, this.generateToitoi],
        "役牌：白": [this.isSangen5z, this.generateSangen5z],
        "役牌：发": [this.isSangen6z, this.generateSangen6z],
        "役牌：中": [this.isSangen7z, this.generateSangen7z],
    };

    yakus_man = {
        "九莲宝灯": [this.isChuurenpoutou, this.generateChuurenpoutou],
        "绿一色": [this.isRyuuiisou, this.generateRyuuiisou],
        "大四喜": [this.isDaisuushii, this.generateDaisuushii],
        "小四喜": [this.isShousuushii, this.generateShousuushii],
        "字一色": [this.isTsuiisou, this.generateTsuiisou],
        "大三元": [this.isDaisangen, this.generateDaisangen],
        "国士无双": [this.isKokushi, this.generateKokushi],
    }
    //endregion

    isSuccess(input) {
        const regex = /[1-9]+[spmz]/g;
        const item_groups = input.match(regex);
        const goal_groups = this.goal.value.match(regex);
        let ret = true;
        item_groups.forEach((item_group) => {
            if (!goal_groups.includes(item_group)) {
                ret = false;
            }
        });
        goal_groups.forEach((goal_group) => {
            if (!item_groups.includes(goal_group)) {
                ret = false;
            }
        });
        return ret;
    }

    restructureData(item) {
        const result = super.restructureData(item);
        for (const column of this.columns) {
            const key = column.prop;
            const column_result = result[key];
            if (column.type === "mahjong") {
                const input = item[key];
                const regex = /[1-9]+[spmz]/g;
                const item_groups = input.match(regex);
                const result_value = [];
                item_groups.forEach((i) => {
                    result_value.push(i.slice(0, -1), i.slice(-1));
                })
                column_result.value = result_value;

                const correct = Array(item_groups.length * 2).fill('false');
                const goal_groups = this.goal[key].match(regex);
                const judge_correct = (judge) => {
                    for (let i = 0; i < item_groups.length; ++i) {
                        if (correct[i * 2] !== 'false' || correct[i * 2 + 1] !== 'false') {
                            continue ;
                        }
                        const item_group = item_groups[i];
                        let match = null;
                        for (const goal_group of goal_groups) {
                            if (judge(i, item_group, goal_group)) {
                                match = goal_group;
                                break;
                            }
                        }
                        if (match) {
                            goal_groups[goal_groups.indexOf(match)] = "nnnn";
                        }
                    }
                }

                judge_correct((i, item_group, goal_group) => {
                    if (item_group === goal_group) {
                        correct[i * 2] = correct[i * 2 + 1] = 'correct';
                        return true;
                    }
                    return false;
                })
                judge_correct((i, item_group, goal_group) => {
                    if (item_group.slice(0, -1) === goal_group.slice(0, -1)) {
                        correct[i * 2] = 'correct';
                        return true;
                    }
                    return false;
                })
                judge_correct((i, item_group, goal_group) => {
                    if (item_group.slice(-1) === goal_group.slice(-1)) {
                        if (item_group.length === goal_group.length) {
                            if (item_group.length === 3) {
                                correct[i * 2] = 'near';
                            }
                            if (item_group.length === 4) {
                                const isItemShuntsu = item_group[0] !== item_group[1];
                                const isGoalShuntsu = goal_group[0] !== goal_group[1];
                                correct[i * 2] = isItemShuntsu ^ isGoalShuntsu ? 'false' : 'near';
                            }
                        }
                        correct[i * 2 + 1] = 'correct';
                        return true;
                    }
                    return false;
                })
                column_result.correct = correct;
            }
            result[key] = column_result;
        }
        return result;
    }

    split_tiles(groups, type) {
        const tiles = [];
        if (type === TilesType.KOKUSHI) {
            const str = groups[0];
            for (let i = 0; i < str.length; i += 2) {
                const tile = str.slice(i, i + 2);
                tiles.push([tile]);
            }
        } else {
            for (const group of groups.slice(1)) {
                const type = group.slice(-1);
                const numbers = group.slice(0, -1).split('').map((n) => n + type);
                if (type === 'z' && numbers.filter((n) => n === '8' || n === '9').length > 0) {
                    return null;
                }
                tiles.push(numbers)
            }
        }
        return tiles;
    }

    group_tiles(groups) {
        let input = '';
        for (const group of groups) {
            let input_ = '';
            for (const tile of group) {
                input_ += tile[0];
            }
            input += input_ + group[0][1];
        }
        return input;
    }

    fuu2words(fuu) {
        let words = "";
        switch (fuu) {
            case '1z': words = '东'; break
            case '2z': words = '南'; break;
            case '3z': words = '西'; break;
            case '4z': words = '北'; break;
        }
        return words;
    }

    async groups2item(input, groups, type) {
        const images = [];
        for (const group of groups) {
            images.push(...group.map((t) => this.getTileImage(t)));
        }

        if (!this.checkTiles(groups, type)) {
            return null;
        }

        const yaku = this.calcYakus(groups, type);

        return this.combineImages(images).then((url) => {
            return {'value': input, 'yaku': yaku, 'pic_url': url,
                'jifuu': this.fuu2words(this.jifuu), 'bafuu': this.fuu2words(this.bafuu)};
        });
    }

    async selectGoal() {
        this.bafuu = this.getRandomNum(2).toString() + 'z';
        this.jifuu = this.getRandomNum(4).toString() + 'z';
        const groups = this.generate();
        const input = this.group_tiles(groups);
        return this.groups2item(input, groups, (groups[0].length === 1) ?
            TilesType.KOKUSHI : (groups[0].length === 2) ? TilesType.CHIITOI :
                TilesType.NORMAL);
    }

    async input2Labels(input) {
        if (input[0] < '1' || input[0] > '9') {
            let yaku = this.yakus_normal[input];
            if (!yaku) {
                yaku = this.yakus_man[input];
                if (!yaku) {
                    return null;
                }
            }
            const generator = yaku[1].bind(this);
            const pool = this.createPool();
            const groups = generator(pool);

            const input_ = this.group_tiles(groups);
            return this.groups2item(input_, groups, (groups[0].length === 1) ?
                TilesType.KOKUSHI : (groups[0].length === 2) ? TilesType.CHIITOI :
                    TilesType.NORMAL);
        }

        const regex = /([1-9]{3}[spmz])([1-9]{3}[spmz])([1-9]{3}[spmz])([1-9]{3}[spmz])([1-9]{2}[spmz])/;
        const regex_chitui = /([1-9]{2}[spmz])([1-9]{2}[spmz])([1-9]{2}[spmz])([1-9]{2}[spmz])([1-9]{2}[spmz])([1-9]{2}[spmz])([1-9]{2}[spmz])/;
        const regex_goshi = /(?:1s|9s|1p|9p|1m|9m|[1-7]z){14}/;
        let type = TilesType.NORMAL;
        let groups = input.match(regex);
        if (!groups) {
            type = TilesType.CHIITOI;
            groups = input.match(regex_chitui);
            if (!groups) {
                type = TilesType.KOKUSHI;
                groups = input.match(regex_goshi);
                if (!groups) {
                    return null;
                }
            }
        }
        const tiles = this.split_tiles(groups, type)

        return this.groups2item(input, tiles, type);
    }

    checkTiles(groups, type) {
        const count = {};
        if (type === TilesType.NORMAL) {
            for (const group of groups.slice(0, -1)) {
                for (const tile of group) {
                    count[tile] = (count[tile] || 0) + 1;
                }
                if (!this.isKoutsu(group) && !this.isShuntsu(group)) {
                    return false;
                }
            }
            return this.isJantou(groups.slice(-1)[0]) &&
                Object.values(count).filter((n) => { return n >= 5 }).length === 0;
        } else if (type === TilesType.CHIITOI) {
            for (const group of groups) {
                for (const tile of group) {
                    count[tile] = (count[tile] || 0) + 1;
                }
                if (!this.isJantou(group)) {
                    return false;
                }
            }
            return Object.values(count).filter((n) => { return n >= 5 }).length === 0;
        } else if (type === TilesType.KOKUSHI) {
            for (const group of groups) {
                count[group[0]] = (count[group[0]] || 0) + 1;
            }
            return Object.values(count).filter((n) => { return n >= 2 }).length === 1;
        }
        return false;
    }

    //region generate
    createPool() {
        const pool = {
            's': Array(9).fill(4),
            'm': Array(9).fill(4),
            'p': Array(9).fill(4),
            'z': Array(9).fill(4)
        };
        pool['z'][7] = pool['z'][8] = 0;
        return pool;
    }

    generate() {
        const pool = this.createPool();

        if (this.getRandomNum(10) === 1) {
            //yakuman
            const keys = Object.keys(this.yakus_man);
            const index = Math.floor(Math.random() * keys.length);
            const generator = this.yakus_man[keys[index]][1].bind(this);
            console.log(keys[index]);
            return generator(pool);
        } else {
            const keys = Object.keys(this.yakus_normal);
            const index = Math.floor(Math.random() * keys.length);
            const generator = this.yakus_normal[keys[index]][1].bind(this);
            console.log(keys[index]);
            return generator(pool);
        }
    }

    getRandomType(hasZ=true) {
        const offset = hasZ ? 0 : 1;
        return this.types[Math.floor(Math.random() * (this.types.length - offset))];
    }

    getRandomNum(max=9) {
        return Math.floor(Math.random() * max) + 1;
    }

    getNextType(type, hasZ=true) {
        let res;
        switch (type) {
            case 's': res = 'm'; break;
            case 'm': res = 'p'; break;
            case 'p': res = hasZ ? 'z' : 's'; break;
            case 'z': res = 's'; break;
        }
        return res;
    }

    decreasePool(pool, ...groups) {
        for (const group of groups) {
            for (const tile of group) {
                const type = tile[1];
                const num = parseInt(tile[0]);
                pool[type][num - 1]--;
            }
        }
    }

    generateRandomKoutsu(pool, type=null, num=null) {
        if (type !== null && num !== null) {
            if (pool[type][num - 1] < 3) {
                return null;
            }
        } else if (type === null && num !== null) {
            type = this.getRandomType();
            let times = 0;
            while (pool[type][num - 1] < 3 && times <= 3) {
                type = this.getNextType(type);
                times += 1;
            }
            if (times === 4) {
                return null;
            }
        } else {
            if (type === null) {
                type = this.getRandomType();
            }
            num = this.getRandomNum();
            while (pool[type][num - 1] < 3) {
                num = (num % 9) + 1;
            }
        }
        const koutsu = Array(3).fill(num.toString() + type);
        this.decreasePool(pool, koutsu);
        return koutsu;
    }

    canGetShuntsu(pool, type, num) {
        return pool[type][num - 1] >= 1 &&
            pool[type][num] >= 1 &&
            pool[type][num + 1] >= 1;
    }

    generateRandomShuntsu(pool, type=null, num=null) {
        if (num > 7 || type === 'z') {
            return null;
        }
        if (type !== null && num !== null) {
            if (!this.canGetShuntsu(pool, type, num)) {
                return null;
            }
        } else if (type === null && num !== null) {
            type = this.getRandomType(false);
            while (!this.canGetShuntsu(pool, type, num)) {
                type = this.getNextType(type, false);
            }
        } else {
            if (type === null) {
                type = this.getRandomType(false);
            }
            num = this.getRandomNum(7);
            while (!this.canGetShuntsu(pool, type, num)) {
                num = (num % 7) + 1;
            }
        }
        const shuntsu = [num.toString() + type, (num + 1).toString() + type,
            (num + 2).toString() + type];
        this.decreasePool(pool, shuntsu);
        return shuntsu;
    }

    generateRandomJantou(pool, type=null, num=null, chiitoi=false) {
        const max = chiitoi ? 3 : 2;
        if (type !== null && num !== null) {
            if (pool[type][num - 1] < max) {
                return null;
            }
        } else if (type === null && num !== null) {
            type = this.getRandomType();
            let times = 0;
            while (pool[type][num - 1] < max && times <= 3) {
                type = this.getNextType(type);
                times += 1;
            }
            if (times === 4) {
                return null;
            }
        } else {
            if (type === null) {
                type = this.getRandomType();
            }
            num = this.getRandomNum();
            while (pool[type][num - 1] < max) {
                num = (num % 9) + 1;
            }
        }
        const jantou = Array(2).fill(num.toString() + type);
        this.decreasePool(pool, jantou);
        return jantou;
    }

    generateMiantsu(pool) {
        const temp = this.getRandomNum(2);
        if (temp === 1) {
            return this.generateRandomKoutsu(pool);
        }
        return this.generateRandomShuntsu(pool);
    }

    generateRestMiantsus(pool, groups) {
        const times = 4 - groups.length;
        for (let i = 1; i <= times; ++i) {
            groups.push(this.generateMiantsu(pool));
        }
    }

    generateRest(pool, groups) {
        this.generateRestMiantsus(pool, groups);
        groups.push(this.generateRandomJantou(pool));
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    //endregion

    //region calc yakus
    calcYakus(groups, type) {
        if (type === TilesType.KOKUSHI) {
            return ['国士无双'];
        } else {
            const yakus = []

            for (const name of Object.keys(this.yakus_man)) {
                const judge = this.yakus_man[name][0].bind(this);
                if (judge(groups)) {
                    yakus.push(name);
                }
            }

            if (yakus.length !== 0) {
                return yakus;
            }

            for (const name of Object.keys(this.yakus_normal)) {
                const judge = this.yakus_normal[name][0].bind(this);
                if (judge(groups)) {
                    yakus.push(name);
                }
            }
            if (type === TilesType.CHIITOI) {
                yakus.push('七对子');
            }
            return yakus;
        }
    }

    isKoutsu(group) {
        if (group.length !== 3) {
            return false;
        }
        const num1 = parseInt(group[0].slice(0, 1));
        const num2 = parseInt(group[1].slice(0, 1));
        const num3 = parseInt(group[2].slice(0, 1));
        return num1 === num2 && num2 === num3;
    }

    isShuntsu(group) {
        if (group.length !== 3) {
            return false;
        }
        const isZ = group[0].slice(-1) === 'z';
        const num1 = parseInt(group[0].slice(0, 1));
        const num2 = parseInt(group[1].slice(0, 1));
        const num3 = parseInt(group[2].slice(0, 1));
        return num1 + 1 === num2 && num2 + 1 === num3 && !isZ;
    }

    isJantou(group) {
        if (group.length !== 2) {
            return false;
        }
        const num1 = parseInt(group[0].slice(0, 1));
        const num2 = parseInt(group[1].slice(0, 1));
        return num1 === num2;
    }

    isSanGenTile(tile) {
        return tile[1] === 'z' && tile[0] >= '5' && tile[0] <= '7';
    }

    isFuuTile(tile) {
        return tile[1] === 'z' && tile[0] <= '4';
    }

    isRoutouTile(tile) {
        return tile[0] === '1' || tile[0] === '9';
    }

    isJiTile(tile) {
        return tile[1] === 'z';
    }

    is19Tile(tile) {
        return this.isRoutouTile(tile) || this.isJiTile(tile);
    }

    getAllShuntsu(groups) {
        const shuntsu = {};
        for (const group of groups.slice(0, -1)) {
            if (this.isShuntsu(group)) {
                const first = group[0];
                shuntsu[first] = (shuntsu[first] || 0) + 1;
            }
        }
        return shuntsu;
    }

    getAllKoutsu(groups) {
        const koutsu = [];
        for (const group of groups.slice(0, -1)) {
            if (this.isKoutsu(group)) {
                const first = group[0];
                koutsu.push(first);
            }
        }
        return koutsu;
    }
    //endregion

    //region yakus
    isChiitoi(groups) {
        return false;
    }

    generateChiitoi(pool) {
        const groups = [];
        let getType = () => { return this.getRandomType(); };
        // normal 10, chini 1, tsui 1, honi 2
        const temp = this.getRandomNum(14);
        if (temp === 1) {
            const type = this.getRandomType(false);
            getType = () => { return type; };
        } else if (temp === 2) {
            getType = () => { return 'z'; };
        } else if (temp === 3 || temp === 4) {
            const type = this.getRandomType(false);
            getType = () => { return this.getRandomNum(2) === 1 ?
                type : 'z'};
        }
        for (let i = 1; i <= 7; ++i) {
            groups.push(this.generateRandomJantou(pool, getType(), null, true));
        }
        return groups;
    }

    isKokushi(groups) {
        return false;
    }

    generateKokushi(pool) {
        const groups = [['1s'], ['9s'], ['1m'], ['9m'], ['1p'], ['9p'],
            ['1z'], ['2z'], ['3z'], ['4z'], ['5z'], ['6z'], ['7z']];
        groups.push(groups[this.getRandomNum(13) - 1]);
        return groups;
    }

    isTanyao(groups) {
        for (const group of groups) {
            for (const tile of group) {
                console.log()
                if (this.is19Tile(tile)) {
                    return false;
                }
            }
        }
        return true;
    }

    generateTanyao(pool) {
        const groups = [];
        for (let i = 1; i <= 4; ++i) {
            const temp = this.getRandomNum(2);
            if (temp === 1) {
                //koutsu
                const type = this.getRandomType(false);
                let num = this.getRandomNum(7) + 1;
                let group = this.generateRandomKoutsu(pool, type, num);
                while (!group) {
                    num = (num - 1) % 7 + 2;
                    group = this.generateRandomKoutsu(pool, type, num);
                }
                groups.push(group);
            } else {
                //shuntsu
                let num = this.getRandomNum(5) + 1;
                groups.push(this.generateRandomShuntsu(pool, null, num))
            }
        }
        const type = this.getRandomType(false);
        let num = this.getRandomNum(7) + 1;
        let group = this.generateRandomJantou(pool, type, num);
        while (!group) {
            num = (num - 1) % 7 + 2;
            group = this.generateRandomJantou(pool, type, num);
        }
        groups.push(group);

        return groups;
    }

    isJiFuu(groups) {
        for (const group of groups) {
            if (this.isKoutsu(group)) {
                if (group[0] === this.jifuu) {
                    return true;
                }
            }
        }
        return false;
    }

    generateJiFuu(pool) {
        const groups = [];
        const group = Array(3).fill(this.jifuu);
        this.decreasePool(pool, group);
        groups.push(group);
        this.generateRestMiantsus(pool, groups);
        groups.push(this.generateRandomJantou(pool));
        return groups;
    }

    isBaFuu(groups) {
        for (const group of groups) {
            if (this.isKoutsu(group)) {
                if (group[0] === this.bafuu) {
                    return true;
                }
            }
        }
        return false;
    }

    isSangen(groups, tile) {
        const koutsu = this.getAllKoutsu(groups);
        return koutsu.includes(tile) && !this.isShousangen(groups);
    }

    generateSangen(pool, tile) {
        const groups = [Array(3).fill(tile)];
        this.decreasePool(pool, ...groups);
        this.generateRest(pool, groups);
        return groups;
    }

    isSangen5z(groups) {
        return this.isSangen(groups, '5z');
    }

    generateSangen5z(pool) {
        return this.generateSangen(pool, '5z');
    }

    isSangen6z(groups) {
        return this.isSangen(groups, '6z');
    }

    generateSangen6z(pool) {
        return this.generateSangen(pool, '6z');
    }

    isSangen7z(groups) {
        return this.isSangen(groups, '7z');
    }

    generateSangen7z(pool) {
        return this.generateSangen(pool, '7z');
    }

    generateBaFuu(pool) {
        const groups = [];
        const group = Array(3).fill(this.bafuu);
        this.decreasePool(pool, group);
        groups.push(group);
        this.generateRest(pool, groups);
        return groups;
    }

    isHeiwa(groups) {
        for (const group of groups.slice(0, -1)) {
            if (!this.isShuntsu(group)) {
                return false;
            }
        }
        return groups.slice(-1)[0][0].slice(-1) !== 'z';
    }

    generateHeiwa(pool) {
        const groups = [];
        for (let i = 1; i <= 4; ++i) {
            groups.push(this.generateRandomShuntsu(pool));
        }
        groups.push(this.generateRandomJantou(pool, this.getRandomType(false)));
        return groups;
    }

    isIipekou(groups) {
        const shuntsu = this.getAllShuntsu(groups);
        return Object.values(shuntsu).filter((n) => n === 2).length === 1;
    }

    generateIipekou(pool) {
        const groups = [];
        const group = this.generateRandomShuntsu(pool);
        groups.push(group, group);
        this.decreasePool(pool, group, group);
        this.generateRest(pool, groups);
        return groups;
    }

    isSanshokuDoukou(groups) {
        const koutsu = this.getAllKoutsu(groups);
        const number = {};
        for (const koutsu_ of koutsu) {
            const num = koutsu_[0];
            number[num] = (number[num] || 0) + 1;
        }
        return Object.values(number).filter((n) => n === 3).length === 1;
    }

    generateSanshokuDoukou(pool) {
        const groups = [];
        const num = this.getRandomNum().toString();
        const group1 = Array(3).fill(num + 's');
        const group2 = Array(3).fill(num + 'm');
        const group3 = Array(3).fill(num + 'p');
        groups.push(group1, group2, group3);
        this.decreasePool(pool, group1, group2, group3);
        groups.push(this.generateRandomShuntsu(pool));
        groups.push(this.generateRandomJantou(pool));
        return groups;
    }

    isSanankou(groups) {
        const koutsu = this.getAllKoutsu(groups);
        return koutsu.length === 3 && !this.isSanshokuDoukou(groups) && !this.isShousangen(groups);
    }

    generateSanankou(pool) {
        const groups = [];
        for (let i = 1; i <= 3; ++i) {
            groups.push(this.generateRandomKoutsu(pool));
        }
        groups.push(this.generateRandomShuntsu(pool));
        groups.push(this.generateRandomJantou(pool));
        return groups;
    }

    isShousangen(groups) {
        const koutsu = this.getAllKoutsu(groups);
        const tile = groups.slice(-1)[0][0];
        return this.isSanGenTile(tile) &&
            koutsu.filter((n) => this.isSanGenTile(n)).length === 2;
    }

    generateShousangen(pool) {
        const groups = [];
        const sangen_tile = ['5z', '6z', '7z'];
        this.shuffle(sangen_tile);
        const sangen = [Array(3).fill(sangen_tile[0]),
            Array(3).fill(sangen_tile[1]),
            Array(2).fill(sangen_tile[2])];
        groups.push(sangen[0], sangen[1]);
        this.decreasePool(pool, sangen[0], sangen[1]);
        this.decreasePool(pool, sangen[2]);
        this.generateRestMiantsus(pool, groups);
        groups.push(sangen[2]);
        return groups;
    }

    isHonroutou(groups) {
        const koutsu = this.getAllKoutsu(groups);
        const tile = groups.slice(-1)[0][0];
        return this.is19Tile(tile) &&
            koutsu.filter((n) => this.is19Tile(n)).length === 4;
    }

    generateHonroutou(pool) {
        const groups = [];
        const _19tiles = ['1s', '9s', '1p', '9p', '1m', '9m',
            '1z', '2z', '3z', '4z', '5z', '6z', '7z'];
        this.shuffle(_19tiles);
        for (let i = 0; i < 4; ++i) {
            const group = Array(3).fill(_19tiles[i]);
            groups.push(group);
        }
        groups.push(Array(2).fill(_19tiles[4]));
        return groups;
    }

    isHonchantaiyaochuu(groups) {
        const shuntsu = Object.keys(this.getAllShuntsu(groups));
        const koutsu = this.getAllKoutsu(groups);
        const tile = groups.slice(-1)[0][0];
        let hasZ = false;
        for (const group of groups) {
            const type = group[0][1];
            if (type === 'z') {
                hasZ = true;
                break;
            }
        }
        return hasZ && this.is19Tile(tile) &&
            shuntsu.length > 0 &&
            koutsu.filter((n) => !this.is19Tile(n)).length === 0 &&
            shuntsu.filter((n) => !(n[0] === '1' || n[0] === '7')).length === 0;
    }

    generateHonchantaiyaochuu(pool) {
        const _19Tiles = ['1s', '9s', '1p', '9p', '1m', '9m',
            '1z', '2z', '3z', '4z', '5z', '6z', '7z'];
        return this.generateTaiyaochuu(_19Tiles, pool);
    }

    isIkkitsuukan(groups) {
        const shuntsu = Object.keys(this.getAllShuntsu(groups));
        const start1 = ['1s', '4s', '7s'];
        const start2 = ['1m', '4m', '7m'];
        const start3 = ['1p', '4p', '7p'];
        return shuntsu.filter((n) => start1.includes(n)).length === 3 ||
            shuntsu.filter((n) => start2.includes(n)).length === 3 ||
            shuntsu.filter((n) => start3.includes(n)).length === 3;
    }

    generateIkkitsuukan(pool) {
        const groups = [];
        const type = this.getRandomType(false);
        groups.push(this.generateRandomShuntsu(pool, type, 1));
        groups.push(this.generateRandomShuntsu(pool, type, 4));
        groups.push(this.generateRandomShuntsu(pool, type, 7));
        this.generateRest(pool, groups);
        return groups;
    }

    isSanshokuDoujun(groups) {
        const shuntsu = Object.keys(this.getAllShuntsu(groups));
        if (shuntsu.length <= 2) {
            return false;
        }
        for (const standard of shuntsu.slice(0, 2)) {
            const num = standard[0];
            if (shuntsu.filter((t) => t[0] === num).length === 3) {
                return true;
            }
        }
        return false;
    }

    generateSanshokuDoujun(pool) {
        const groups = [];
        const num = this.getRandomNum(7);
        const group1 = [num.toString() + 's', (num + 1).toString() + 's', (num + 2).toString() + 's'];
        const group2 = [num.toString() + 'm', (num + 1).toString() + 'm', (num + 2).toString() + 'm'];
        const group3 = [num.toString() + 'p', (num + 1).toString() + 'p', (num + 2).toString() + 'p'];
        groups.push(group1, group2, group3);
        this.decreasePool(pool, group1, group2, group3);
        this.generateRest(pool, groups);
        return groups;
    }

    isRyanpeikou(groups) {
        const shuntsu = this.getAllShuntsu(groups);
        return Object.values(shuntsu).filter((n) => n === 2).length === 2;
    }

    generateRyanpeikou(pool) {
        const groups = [];
        const group1 = this.generateRandomShuntsu(pool);
        groups.push(group1, group1);
        this.decreasePool(pool, group1, group1);
        const group2 = this.generateRandomShuntsu(pool);
        groups.push(group2, group2);
        this.decreasePool(pool, group2, group2);
        this.generateRest(pool, groups);
        return groups;
    }

    isJunchantaiyaochuu(groups) {
        const shuntsu = Object.keys(this.getAllShuntsu(groups));
        const koutsu = this.getAllKoutsu(groups);
        const tile = groups.slice(-1)[0][0];
        return this.isRoutouTile(tile) &&
            shuntsu.length > 0 &&
            koutsu.filter((n) => !this.isRoutouTile(n)).length === 0 &&
            shuntsu.filter((n) => !(n[0] === '1' || n[0] === '7')).length === 0;
    }

    generateJunchantaiyaochuu(pool) {
        const routouTiles = ['1s', '9s', '1p', '9p', '1m', '9m'];
        return this.generateTaiyaochuu(routouTiles, pool);
    }

    generateTaiyaochuu(routouTiles, pool) {
        const groups = [];
        for (let i = 1; i <= 4; ++i) {
            const temp = this.getRandomNum(2);
            if (temp === 1) {
                //koutsu
                let index = this.getRandomNum(routouTiles.length) - 1;
                let group;
                do {
                    const type = routouTiles[index][1];
                    const num = parseInt(routouTiles[index][0]);
                    group = this.generateRandomKoutsu(pool, type, num);
                    index = (index + 1) % routouTiles.length;
                } while (!group);
                groups.push(group);
            } else {
                //shuntsu
                const num = this.getRandomNum(2) === 1 ? 1 : 7;
                groups.push(this.generateRandomShuntsu(pool, null, num));
            }
        }
        let index = this.getRandomNum(routouTiles.length) - 1;
        let group;
        do {
            const type = routouTiles[index][1];
            const num = parseInt(routouTiles[index][0]);
            group = this.generateRandomJantou(pool, type, num);
            index = (index + 1) % routouTiles.length;
        } while (!group);
        groups.push(group);
        return groups;
    }

    isHonitsu(groups) {
        const types = {};
        for (const group of groups) {
            const tile = group[0];
            const type = tile[1];
            types[type] = 1;
        }
        const type_set = Object.keys(types);
        return type_set.length === 2 && type_set.includes('z');
    }

    generateHonitsu(pool) {
        const groups = [];
        const type = this.getRandomType(false);
        for (let i = 1; i <= 4; ++i) {
            if (this.getRandomNum(2) === 1) {
                //koutsu
                groups.push(this.generateRandomKoutsu(pool,
                    this.getRandomNum(2) === 1 ? type : 'z'));
            } else {
                //shuntsu
                groups.push(this.generateRandomShuntsu(pool, type));
            }
        }
        groups.push(this.generateRandomJantou(pool,
            this.getRandomNum(2) === 1 ? type : 'z'));
        return groups;
    }

    isChinitsu(groups) {
        const types = {};
        for (const group of groups) {
            const tile = group[0];
            const type = tile[1];
            types[type] = 1;
        }
        const type_set = Object.keys(types);
        return type_set.length === 1 && type_set[0] !== 'z';
    }

    generateChinitsu(pool) {
        const groups = [];
        const type = this.getRandomType(false);
        for (let i = 1; i <= 4; ++i) {
            if (this.getRandomNum(2) === 1) {
                //koutsu
                groups.push(this.generateRandomKoutsu(pool, type));
            } else {
                //shuntsu
                groups.push(this.generateRandomShuntsu(pool, type));
            }
        }
        groups.push(this.generateRandomJantou(pool, type));
        return groups;
    }

    isIsshoukuSanDoujun(groups) {
        const shuntsu = this.getAllShuntsu(groups);
        return Object.values(shuntsu).filter((n) => n === 3).length === 1;
    }

    generateIsshoukuSanDoujun(pool) {
        const groups = [];
        const group = this.generateRandomShuntsu(pool);
        groups.push(group, group, group);
        this.decreasePool(pool, group, group, group);
        this.generateRest(pool, groups);
        return groups;
    }

    isToitoi(groups) {
        const koutsu = this.getAllKoutsu(groups);
        return koutsu.length === 4 && !this.isHonroutou(groups);
    }

    generateToitoi(pool) {
        const groups = [];
        for (let i = 1; i <= 4; ++i) {
            groups.push(this.generateRandomKoutsu(pool));
        }
        groups.push(this.generateRandomJantou(pool));
        return groups;
    }

    isChuurenpoutou(groups) {
        const nums = {};
        for (let i = 1; i <= 9; ++i) {
            nums[i] = 1;
        }
        nums[1] = nums[9] = 3;
        const types = {};
        for (const group of groups) {
            for (const tile of group) {
                const num = tile[0];
                const type = tile[1];
                nums[num]--;
                types[type] = 1;
            }
        }
        const type_set = Object.keys(types);
        const num_set = Object.values(nums);
        return type_set.length === 1 &&
            num_set.filter((n) => n === -1).length === 1 &&
            num_set.filter((n) => n === 0).length === 8;
    }

    generateChuurenpoutou(pool) {
        const groups = [];
        const type = this.getRandomType(false);
        const poutou = [
            '11112345678999', '11134567899922', '12334567899911',
            '11123445678999', '11123467899955', '12345667899911',
            '11123456778999', '11123456799988', '12345678999911'
        ]
        const poutou_ = poutou[Math.floor(Math.random() * poutou.length)];
        const group1 = [poutou_[0] + type, poutou_[1] + type, poutou_[2] + type];
        const group2 = [poutou_[3] + type, poutou_[4] + type, poutou_[5] + type];
        const group3 = [poutou_[6] + type, poutou_[7] + type, poutou_[8] + type];
        const group4 = [poutou_[9] + type, poutou_[10] + type, poutou_[11] + type];
        const group5 = [poutou_[12] + type, poutou_[13] + type];
        groups.push(group1, group2, group3, group4, group5);
        return groups;
    }

    isRyuuiisou(groups) {
        const correct = ['2s', '3s', '4s', '6s', '8s', '6z'];
        for (const group of groups) {
            for (const tile of group) {
                if (!correct.includes(tile)) {
                    return false;
                }
            }
        }
        return true;
    }

    generateRyuuiisou(pool) {
        const groups = [];
        const times = this.getRandomNum(5) - 1;
        for (let i = 1; i <= times; ++i) {
            groups.push(['2s', '3s', '4s']);
        }
        const correct = ['6s', '8s', '6z'];
        if (times <= 1) {
            correct.push('2s', '3s', '4s');
        }
        this.shuffle(correct);
        for (let i = 0; i < 4 - times; ++i) {
            groups.push(Array(3).fill(correct[i]));
        }
        groups.push(Array(2).fill(correct[4 - times]));
        return groups;
    }

    isTsuiisou(groups) {
        const types = {};
        for (const group of groups) {
            const tile = group[0];
            const type = tile[1];
            types[type] = 1;
        }
        const type_set = Object.keys(types);
        return type_set.length === 1 && type_set[0] === 'z';
    }

    generateTsuiisou(pool) {
        const groups = [];
        for (let i = 1; i <= 4; ++i) {
            groups.push(this.generateRandomKoutsu(pool, 'z'));
        }
        groups.push(this.generateRandomJantou(pool, 'z'));
        return groups;
    }

    isDaisangen(groups) {
        const koutsu = this.getAllKoutsu(groups);
        return koutsu.filter((n) => this.isSanGenTile(n)).length === 3;
    }

    generateDaisangen(pool) {
        const groups = [Array(3).fill('5z'),
            Array(3).fill('6z'),
            Array(3).fill('7z')];
        this.decreasePool(pool, ...groups);
        this.generateRest(pool, groups);
        return groups;
    }

    isDaisuushii(groups) {
        const koutsu = this.getAllKoutsu(groups);
        return koutsu.filter((n) => this.isFuuTile(n)).length === 4;
    }

    generateDaisuushii(pool) {
        const groups = [Array(3).fill('1z'),
            Array(3).fill('2z'),
            Array(3).fill('3z'),
            Array(3).fill('4z')];
        this.decreasePool(pool, ...groups);
        this.generateRest(pool, groups);
        return groups;
    }

    isShousuushii(groups) {
        const koutsu = this.getAllKoutsu(groups);
        const tile = groups.slice(-1)[0][0];
        return this.isFuuTile(tile) &&
            koutsu.filter((n) => this.isFuuTile(n)).length === 3;
    }

    generateShousuushii(pool) {
        const suushii = ['1z', '2z', '3z', '4z'];
        this.shuffle(suushii);
        const groups = [Array(3).fill(suushii[0]),
            Array(3).fill(suushii[1]),
            Array(3).fill(suushii[2])];
        this.decreasePool(pool, ...groups, Array(2).fill(suushii[3]));
        this.generateRestMiantsus(pool, groups);
        groups.push(Array(2).fill(suushii[3]));
        return groups;
    }
    //endregion

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