// manages the user-determined settings

import { NumberType } from "./question.js" 
import { OperatorType, QuestionType } from "./question.js" 

type Bounds = {
    leftMin: number;
    leftMax: number;
    rightMin: number;
    rightMax: number;
}

export type OperationSettings = {
    bounds: Bounds;
    decimalPlaces: number;
    onlyReducedFractions: boolean;
    improperFractions: boolean;
};

export class Settings {

    operationSettings: Record<OperatorType, OperationSettings>;
//    private operationBounds: Record<string, Record<string, number>>;
    validQuestionTypes: QuestionType[];
    private miscSettings: Record<string, number | boolean>;

    constructor() {
        const defaultSettings = {
//            bounds: {leftMin: 1, leftMax: 99, rightMin: 1, rightMax: 99},
            decimalPlaces: 2,
            onlyReducedFractions: true,
            improperFractions: true,
        }
        const operationBounds = {
            addition: {leftMin: 1, leftMax: 99, rightMin: 1, rightMax: 99},
            subtraction: {leftMin: 1, leftMax: 99, rightMin: 1, rightMax: 99},
            multiplication: {leftMin: 2, leftMax: 99, rightMin: 2, rightMax: 99},
            division: {leftMin: 1, leftMax: 100, rightMin: 1, rightMax: 100}
        }
        
        // create settings for each of the different operations
        // copy most of the settings from the default, and set the bounds from the operationBounds object
        this.operationSettings = {} as Record<OperatorType, OperationSettings>;
        for (const op of Object.keys(operationBounds) as OperatorType[]) {
            this.operationSettings[op] = {
                bounds: operationBounds[op],
                ...defaultSettings,
            };
        }
        this.miscSettings = {
            timeLimit: 120,
            allowRearrangements: false,
            divisionReversedMultiplication: true,
            subtractionReversedAddition: true,
            additionFractionDenominatorBound: 9,
            additionFractionNumeratorBound: 9,
        }
        this.validQuestionTypes = [];
    }

    public printValidQuestionTypes() {
        console.log("Valid question types:");
        for (const type of this.validQuestionTypes) {
            console.log(`Number type: ${type.numberType}, Operator type: ${type.operatorType}`);
        }
    }

    public getOperationBounds(): Record<OperatorType, Bounds> {
        const boundsMap: Partial<Record<OperatorType, Bounds>> = {};

        for (const op of Object.keys(this.operationSettings) as OperatorType[]) {
            boundsMap[op] = this.operationSettings[op].bounds;
        }
        return boundsMap as Record<OperatorType, Bounds>;
    }

    public getOperationSettings(opName: OperatorType): OperationSettings {
        return this.operationSettings[opName];
    }

    /**
     * Returns the bound for the given operation, but if the requested operation is subtraction (division),
     * and the setting is selected to treat subtraction (division) problems as reversed addition (multiplication) problems,
     * we instead return the bounds for addition (multiplication).
     * @param name - the operation whose bounds we wish to return
     * @returns a Record<string, number> containing the name of the operation and the 4 bounds for that operation
     */
    public getOperationBoundsByName(name: OperatorType): Record<string, number> {
        if (name === "subtraction" && this.miscSettings.subtractionReversedAddition) return this.operationSettings['addition'].bounds;
        if (name === "division" && this.miscSettings.divisionReversedMultiplication) return this.operationSettings['multiplication'].bounds;
        return this.operationSettings[name].bounds;
    }

    public updateSetting(setting: string, value: number | boolean) {
        console.log(`${setting} -> ${value}`);
        this.miscSettings[setting] = value;
    }

    /**
     * @param operationName - The name of the operation whose bounds we want to update
     * @param boundName - The name of the bound we want to update
     * @param value - The new value for the bound
     * @throws Error if the value is not a number or if the operation name or bound name is not valid
     */
    public updateBound(operationName: OperatorType, boundName: string, value: number) {
        if (!value) {
            throw new Error(`Bad value passed.`);
        }
        if (!operationName || !boundName) {
            throw new Error(`No such bound exists.`);
        }
//        this.operationBounds[operationName][boundName] = value;
        this.operationSettings[operationName].bounds = {
            ...this.operationSettings[operationName].bounds,
            [boundName]: value
        };
    }

    public getSetting(name: string): number | boolean {
        return this.miscSettings[name];
    }

    public updateQuestionType(numberType: NumberType, operatorType: OperatorType, include: boolean) {
        if (include && !this.validQuestionTypes.some(type => (type.numberType === numberType && type.operatorType === operatorType))) {
            this.validQuestionTypes.push({numberType, operatorType});
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
