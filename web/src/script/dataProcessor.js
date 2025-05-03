export default class DataProcessor {
    constructor(data, columns) {
        this.data = data;
        this.columns = columns;
    }

    /**
     * 选择猜测目标，将目标赋值给this.goal
     * @returns {dictionary} 猜测的目标
     */
    _selectGoal() {
        this.goal = this.selectGoal()
        return this.goal;
    }

    /**
     * 选择猜测目标
     * @returns {Object} 猜测的目标，格式为{"标签"：值}，玩家用于猜测的标签名为"value"
     */
    selectGoal() {
        return this.data[Math.floor(Math.random() * this.data.length)];
    }

    /**
     * 将玩家输入转换为表格的标签数据
     * @param {string} input 玩家输入
     * @returns {Object | null} 填入表格的原始标签数据
     */
    async input2Labels(input) {
        return this.data.find(d => d.value === input);
    }

    /**
     * 将原始标签数据重构为表格接受数据
     * @param {dictionary} item 原始标签数据，默认格式为{"标签": 值}，
     *  值为单个字符串或者字符串列表
     * @return {Object} 表格接受数据，格式为{"标签": {"value": 值, "correct": 标记}}
     *  值的定义同上，标记也为单个字符串或者字符串列表，表示对应的值的状态，"correct"对应正确-绿色
     *  "false"对应错误-灰色，"near"对应接近-黄色
     */
    restructureData(item) {
        const result = {};
        if (item.value === this.goal.value) {
            result["correct"] = "correct";
        }
        result["pic_url"] = {"value": item.pic_url};
        for (const column of this.columns) {
            const key = column.prop;
            const column_result = {};
            if (column.type === "normal_list") {
                column_result.value = item[key];
                const correct = [];
                for (const i of item[key]) {
                    correct.push(this.goal[key].includes(i) ? 'correct' : 'false');
                }
                column_result.correct = correct;
            } else if (column.type === "key" || column.type === "pic") {
                column_result.value = item[key];
            } else if (column.type === "num_order") {
                const regex = new RegExp(column.pattern);
                const target = parseInt(this.goal[key].match(regex)[1]);
                const current = parseInt(item[key].match(regex)[1]);
                const appendix = target > current ? '↑' :
                    target < current ? '↓' : '';
                column_result.value = item[key] + appendix;
                column_result.correct = target === current ? 'correct'
                    : Math.abs(target - current) <= parseInt(column.near) ? 'near'
                        : 'false';
            } else if (column.type === "num") {
                const target = parseInt(this.goal[key]);
                const current = parseInt(item[key]);
                const appendix = target > current ? '↑' :
                    target < current ? '↓' : '';
                column_result.value = item[key] + appendix;
                column_result.correct = target === current ? 'correct'
                    : Math.abs(target - current) <= parseInt(column.near) ? 'near'
                        : 'false';
            } else if (column.type === "normal") {
                column_result.value = item[key];
                column_result.correct = item[key] === this.goal[key] ? 'correct' : 'false';
            } else if (column.type === "groups") {
                column_result.value = item[key];
                column_result.correct = this.analyseGroup(item[key], this.goal[key], column.near);
            } else if (column.type === "groups_list") {
                column_result.value = item[key];
                const correct = [];
                for (const itemA of item[key]) {
                    let cur_correct = 'false';
                    for (const itemB of this.goal[key]) {
                        const res = this.analyseGroup(itemA, itemB, column.near)
                        if (res === 'correct') {
                            cur_correct = res;
                            break;
                        } else if (res === 'near') {
                            cur_correct = res;
                        }
                    }
                    correct.push(cur_correct);
                }
                column_result.correct = correct;
            }

            if (column.type.includes('list')) {
                column_result.value = column_result.value.slice();
                if (item[key].length > this.goal[key].length) {
                    column_result.value.push('↓')
                } else if (item[key].length < this.goal[key].length) {
                    column_result.value.push('↑')
                }
            }
            result[key] = column_result;
        }
        return result;
    }

    /**
     * 判断两个标签是否匹配
     * @param {string} itemA 标签1
     * @param {string} itemB 标签2
     * @param {Array} near 标签分组信息
     * @returns {string} correct值
     */
    analyseGroup(itemA, itemB, near) {
        if (itemA === itemB) {
            return 'correct';
        } else {
            for (const group of near) {
                if (Array.isArray(group)) {
                    if (group.includes(itemA) && group.includes(itemB)) {
                        return 'near';
                    }
                } else {
                    const regex = new RegExp(group);
                    if (regex.test(itemA) && regex.test(itemB)) {
                        return 'near';
                    }
                }
            }
        }
        return 'false';
    }

    /**
     * 创建用于自动补全输入的过滤器
     * @param {string} input 玩家输入
     * @returns {function} 字符串过滤器
     */
    createAutoCompleteFilter(input) {
        return (item) => {
            return item.value.toLowerCase().includes(input.toLowerCase());
        }
    }

    /**
     * 自动补全，通过玩家输入返回自动补全列表
     * @param input 玩家输入
     * @returns {Array} 自动补全列表
     */
    autoComplete(input) {
        return this.data.filter(this.createAutoCompleteFilter(input))
                .sort((a, b) => {
                    const indexA = a.value.toLowerCase().indexOf(input.toLowerCase());
                    const indexB = b.value.toLowerCase().indexOf(input.toLowerCase());
                    return indexA - indexB;
                });
    }
}