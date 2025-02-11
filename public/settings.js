// manages the user-determined settings
export class Settings {
    constructor() {
        this.operationBounds = {
            addition: { leftMin: 1, leftMax: 99, rightMin: 1, rightMax: 99 },
            subtraction: { leftMin: 1, leftMax: 99, rightMin: 1, rightMax: 99 },
            multiplication: { leftMin: 2, leftMax: 99, rightMin: 2, rightMax: 99 },
            division: { leftMin: 1, leftMax: 100, rightMin: 1, rightMax: 100 }
        };
        this.miscSettings = {
            timeLimit: 120,
            allowRearrangements: false,
            divisionReversedMultiplication: true,
            subtractionReversedAddition: true,
            additionFractionDenominatorBound: 9,
        };
        this.validQuestionTypes = [];
    }
    getOperationBounds() {
        return this.operationBounds;
    }
    /**
     * Returns the bound for the given operation, but if the requested operation is subtraction (division), and the setting is selected to treat subtraction (division) problems as reversed addition (multiplication) problems, we instead return the bounds for addition (multiplication).
     * @param name - the operation whose bounds we wish to return
     * @returns a Record<string, number> containing the name of the operation and the 4 bounds for that operation
     */
    getOperationBoundsByName(name) {
        if (name === "subtraction" && this.miscSettings.subtractionReversedAddition)
            return this.operationBounds.addition;
        if (name === "division" && this.miscSettings.divisionReversedMultiplication)
            return this.operationBounds.multiplication;
        return this.operationBounds[name];
    }
    updateSetting(setting, value) {
        console.log(`updating ${setting} to ${value}`);
        this.miscSettings[setting] = value;
    }
    updateBound(operationName, boundName, value) {
        if (!value) {
            throw new Error(`Bad value passed.`);
        }
        if (!operationName || !boundName) {
            throw new Error(`No such bound exists.`);
        }
        this.operationBounds[operationName][boundName] = value;
    }
    getSetting(name) {
        return this.miscSettings[name];
    }
    updateQuestionType(numberType, operatorType, include) {
        console.log(`updating question type ${numberType} ${operatorType} to ${include}`);
        if (include)
            this.validQuestionTypes.push({ numberType, operatorType });
        else
            this.validQuestionTypes = this.validQuestionTypes.filter(type => (type.numberType !== numberType || type.operatorType !== operatorType));
    }
}
