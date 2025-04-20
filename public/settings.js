// manages the user-determined settings
export class Settings {
    constructor() {
        const defaultSettings = {
            //            bounds: {leftMin: 1, leftMax: 99, rightMin: 1, rightMax: 99},
            decimalPlaces: 2,
            onlyReducedFractions: true,
            improperFractions: true,
        };
        const operationBounds = {
            addition: { leftMin: 1, leftMax: 99, rightMin: 1, rightMax: 99 },
            subtraction: { leftMin: 1, leftMax: 99, rightMin: 1, rightMax: 99 },
            multiplication: { leftMin: 2, leftMax: 99, rightMin: 2, rightMax: 99 },
            division: { leftMin: 1, leftMax: 100, rightMin: 1, rightMax: 100 }
        };
        // create settings for each of the different operations
        // copy most of the settings from the default, and set the bounds from the operationBounds object
        this.operationSettings = {};
        for (const op of Object.keys(operationBounds)) {
            this.operationSettings[op] = Object.assign({ bounds: operationBounds[op] }, defaultSettings);
        }
        this.miscSettings = {
            timeLimit: 120,
            allowRearrangements: false,
            divisionReversedMultiplication: true,
            subtractionReversedAddition: true,
            additionFractionDenominatorBound: 9,
            additionFractionNumeratorBound: 9,
        };
        this.validQuestionTypes = [];
    }
    printValidQuestionTypes() {
        console.log("Valid question types:");
        for (const type of this.validQuestionTypes) {
            console.log(`Number type: ${type.numberType}, Operator type: ${type.operatorType}`);
        }
    }
    getOperationBounds() {
        const boundsMap = {};
        for (const op of Object.keys(this.operationSettings)) {
            boundsMap[op] = this.operationSettings[op].bounds;
        }
        return boundsMap;
    }
    getOperationSettings(opName) {
        return this.operationSettings[opName];
    }
    /**
     * Returns the bound for the given operation, but if the requested operation is subtraction (division),
     * and the setting is selected to treat subtraction (division) problems as reversed addition (multiplication) problems,
     * we instead return the bounds for addition (multiplication).
     * @param name - the operation whose bounds we wish to return
     * @returns a Record<string, number> containing the name of the operation and the 4 bounds for that operation
     */
    getOperationBoundsByName(name) {
        if (name === "subtraction" && this.miscSettings.subtractionReversedAddition)
            return this.operationSettings['addition'].bounds;
        if (name === "division" && this.miscSettings.divisionReversedMultiplication)
            return this.operationSettings['multiplication'].bounds;
        return this.operationSettings[name].bounds;
    }
    updateSetting(setting, value) {
        console.log(`${setting} -> ${value}`);
        this.miscSettings[setting] = value;
    }
    /**
     * @param operationName - The name of the operation whose bounds we want to update
     * @param boundName - The name of the bound we want to update
     * @param value - The new value for the bound
     * @throws Error if the value is not a number or if the operation name or bound name is not valid
     */
    updateBound(operationName, boundName, value) {
        if (!value) {
            throw new Error(`Bad value passed.`);
        }
        if (!operationName || !boundName) {
            throw new Error(`No such bound exists.`);
        }
        //        this.operationBounds[operationName][boundName] = value;
        this.operationSettings[operationName].bounds = Object.assign(Object.assign({}, this.operationSettings[operationName].bounds), { [boundName]: value });
    }
    getSetting(name) {
        return this.miscSettings[name];
    }
    updateQuestionType(numberType, operatorType, include) {
        if (include && !this.validQuestionTypes.some(type => (type.numberType === numberType && type.operatorType === operatorType))) {
            this.validQuestionTypes.push({ numberType, operatorType });
            console.log(`Added ${numberType} ${operatorType} to valid question types.`);
        }
        else if (include && this.validQuestionTypes.some(type => (type.numberType === numberType && type.operatorType === operatorType))) {
            console.log("Doing nothing");
        }
        else {
            this.validQuestionTypes = this.validQuestionTypes.filter(type => (type.numberType !== numberType || type.operatorType !== operatorType));
            console.log(`Removed ${numberType} ${operatorType} from valid question types.`);
        }
    }
}
