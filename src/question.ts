// generates questions to display

import * as Utils from "./utils.js";
import { Settings } from "./settings.js";

export type OperatorType = "addition" | "subtraction" | "multiplication" | "division";
export type NumberType = "integers" | "decimals" | "fractions";
export type QuestionType = { numberType: NumberType, operatorType: OperatorType };

export class Question {

}

export class QuestionGenerator {

    private operationBounds: Record<string, Record<string, number>>; 
    private readonly operationStrings = {addition: "+", subtraction: "-", multiplication: "x", division: "/"};

    constructor(operationBounds: Record<string, Record<string, number>>) {
        this.operationBounds = operationBounds;
        console.log("Question generator created.");
    }
    
    /**
     * Generates a math question of any type
     * @param settings - The settings object containing the operation bounds and other settings
     * @returns A string that can be inserted into html to display a math question
     */
//    generateQuestion(allowedTypes: QuestionType[], allowRearrangements: boolean): { question: string; type: string; answer: number } {
    generateQuestion(settings: Settings): { question: string; type: string; answer: string } {
        // this is a list of all the valid question types
        // a question type comprises a number type (integer, decimal, fraction) and an operator type (addition, subtraction, multiplication, division)
        const allowedTypes = settings.validQuestionTypes;
        // if allowRearrangements is true, we may need to rearrange the numbers so that the unknown may be on the left hand side
        const allowRearrangements = settings.getSetting("allowRearrangements");

        // debug: this state should never be reached
        if (allowedTypes.length === 0) {
            throw new Error("ERROR: Must have at least one allowed question type.");
        }

        // pick a random question type from the allowed types
        let chosenType = allowedTypes[parseInt(Utils.generateInt(0, allowedTypes.length))];

        let leftNum = Utils.generateNum(chosenType.numberType,
                                        settings.getOperationBoundsByName(chosenType.operatorType).leftMin,
                                        settings.getOperationBoundsByName(chosenType.operatorType).leftMax,
                                        settings.getOperationSettings(chosenType.operatorType));
        let rightNum = Utils.generateNum(chosenType.numberType,
                                        settings.getOperationBoundsByName(chosenType.operatorType).rightMin,
                                        settings.getOperationBoundsByName(chosenType.operatorType).rightMax,
                                        settings.getOperationSettings(chosenType.operatorType));
        let answer = String(Utils.operations[chosenType.operatorType](leftNum, rightNum));
        console.log(`The answer can be obtained by adding ${leftNum} and ${rightNum}, which I evaluate as ${Utils.parseNumber(leftNum)} and ${Utils.parseNumber(rightNum)} resp.`);
        let operationString = this.operationStrings[chosenType.operatorType];
        console.log(`${operationString} with ${leftNum} and ${rightNum} gives ${answer}`);

        if (chosenType.operatorType === "subtraction" && settings.getSetting("subtractionReversedAddition")) {
            answer = leftNum;
            leftNum = String(parseInt(leftNum) + parseInt(rightNum));
        }

        if (chosenType.operatorType === "division" && settings.getSetting("divisionReversedMultiplication")) {
            answer = leftNum;
            leftNum = String(parseInt(leftNum) * parseInt(rightNum));
        }

        return {
            question: `${leftNum} ${operationString} ${rightNum} = `,
            type: 'integer',
            answer: answer
        };
    }
}
