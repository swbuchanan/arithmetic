export class Settings {
    constructor() {
        this.operationBounds = {
            additionLeftMin: 1, additionLeftMax: 99,
            additionRightMin: 1, additionRightMax: 99,
            subtractionLeftMin: 1, subtractionLeftMax: 99,
            subtractionRightMin: 1, subtractionRightMax: 99,
            multiplicationLeftMin: 2, multiplicationLeftMax: 12,
            multiplicationRightMin: 2, multiplicationRightMax: 99,
            divisionLeftMin: 1, divisionLeftMax: 100,
            divisionRightMin: 1, divisionRightMax: 100
        };
        console.log("Settings handler created.");
    }
    updateSetting(input) {
        if (input.type === "number") {
            if (!input.valueAsNumber)
                throw new Error("Not a number");
            console.log(`updating ${input.id} with value ${input.valueAsNumber}`);
            console.log(this.operationBounds);
        }
    }
}
