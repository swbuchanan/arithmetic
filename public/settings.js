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
            divisionRightMin: 1, divisionRightMax: 100,
            timeLimit: 120
        };
        this.includeTypes = {
            integerAdditionToggle: true,
            decimalAdditionToggle: false,
            fractionAdditionToggle: false,
            integerSubtractionToggle: true,
            decimalSubtractionToggle: false,
            fractionSubtractionToggle: false,
            integerMultiplicationToggle: true,
            decimalMultplicationToggle: false,
            fractionMultplicationToggle: false,
            integerDivisionToggle: true,
            decimalDivisionToggle: false,
            fractionDivisionToggle: false,
        };
        console.log("Settings handler created.");
    }
    getOperationBounds() {
        return this.operationBounds;
    }
    updateBound(name, value) {
        if (!value) {
            throw new Error(`Bad value passed.`);
        }
        if (!name) {
            throw new Error(`No such bound exists.`);
        }
        console.log(`updating ${name} with value ${value}`);
        this.operationBounds[name] = value;
    }
    getBound(name) {
        return this.operationBounds[name];
    }
    updateToggle(name, value) {
        if (!name) {
            throw new Error(`No such toggle exists.`);
        }
        console.log(`updating ${name} with value ${value}`);
        this.includeTypes[name] = value;
    }
}
