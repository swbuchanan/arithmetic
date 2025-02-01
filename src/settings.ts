// manages the user-determined settings

import { NumberType } from "./question.js" 
import { OperatorType, QuestionType } from "./question.js" 

export class Settings {

    private operationBounds: Record<string, Record<string, number>>;
    public validQuestionTypes: QuestionType[];
    private miscSettings: Record<string, number>;

    constructor() {
        this.operationBounds = {
            addition: {leftMin: 1, leftMax: 99, rightMin: 1, rightMax: 99},
            subtraction: {leftMin: 1, leftMax: 99, rightMin: 1, rightMax: 99},
            multiplication: {leftMin: 2, leftMax: 99, rightMin: 2, rightMax: 99},
            division: {leftMin: 1, leftMax: 100, rightMin: 1, rightMax: 100}
        }
        this.miscSettings = {
            timeLimit: 120,
            allowRearrangements: false,
            divisionReversedMultiplication: true,
            subtractionReversedAddition: true
        }
        this.validQuestionTypes = [];
    }

    public getOperationBounds(): Record<string, Record<string, number>> {
        return this.operationBounds;
    }

    public getOperationBoundsByName(name: string): Record<string, number> {
        if (name === "subtraction" && this.miscSettings.subtractionReversedAddition) return this.operationBounds.addition;
        if (name === "division" && this.miscSettings.divisionReversedMultiplication) return this.operationBounds.multiplication;
        return this.operationBounds[name];
    }

    public updateSetting(setting: string, value: number | boolean) {
        this.miscSettings[setting] = value;
    }

    public updateBound(operationName: string, boundName: string, value: number) {
        if (!value) {
            throw new Error(`Bad value passed.`);
        }
        if (!operationName || !boundName) {
            throw new Error(`No such bound exists.`);
        }
        console.log(`updating ${operationName} ${boundName} with value ${value}`); 
        this.operationBounds[operationName][boundName] = value;
        console.log(this.operationBounds);
    }

    public getSetting(name: string): number {
        return this.miscSettings[name];
    }


    public updateQuestionType(numberType: NumberType, operatorType: OperatorType, include: boolean) {
        console.log(`updating question type ${numberType} ${operatorType} to ${include}`);
        if (include) this.validQuestionTypes.push({numberType, operatorType});
        else this.validQuestionTypes = this.validQuestionTypes.filter(type => (type.numberType !== numberType || type.operatorType !== operatorType));
        console.log(this.validQuestionTypes);
    }
}
