export const columns = [
    {
        "label": "数字",
        "prop": "value",
        "type": "num",
        "near": ""
    }
];
export const mainData = [];
export const prop2label = {"value": "数字"};
export const maxStep = 10;
export const hasPic = false;
export const placeholder = "请输入1-1000的数字";
export const rule = '这不需要规则吧（\n\n真有人玩这个题库吗？';
import DataProcessor from "../script/dataProcessor.js";
export class MyDataProcessor extends DataProcessor {
    selectGoal() {
        return {"value": (Math.floor(Math.random() * 1000) + 1).toString()};
    }

    input2Labels(input) {
        const regex = /\d+/;
        if (regex.test(input)) {
            const num = parseInt(input);
            if (num >= 1 && num <= 1000) {
                return {"value": num.toString()};
            }
        }
        return null;
    }

    autoComplete(input) {
        return [];
    }
}
