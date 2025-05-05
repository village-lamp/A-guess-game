export class MyDataProcessor extends DataProcessor {
    async selectGoal() {
        return {"value": (Math.floor(Math.random() * 1000) + 1).toString()};
    }

    async input2Labels(input) {
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