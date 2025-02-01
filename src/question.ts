// generates questions to display

import * as Utils from "./utils.js"

export type OperatorType = "addition" | "subtraction" | "multiplication" | "division";
export type NumberType = "integers" | "decimals" | "fractions";
export type QuestionType = { numberType: NumberType, operatorType: OperatorType };

export class QuestionGenerator {

    private operationBounds: Record<string, Record<string, number>>; 
    private readonly operationStrings = {addition: "+", subtraction: "-", multiplication: "x", division: "/"};

    constructor(operationBounds: Record<string, Record<string, number>>) {
        this.operationBounds = operationBounds;
        console.log("Question generator created.");
    }
    
    /**
     * Generates a math question of any type
     * @param allowedTypes - What sort of numbers are allowed in the question; should be a set containing some combination of the allowed types listed above
     * @param allowRearrangements - If this is true, the question can look like 'a + ? = b' or '? + a = b', otherwise it will look like 'a + b = ?'.
     * @returns A string that can be inserted into html to display a math question
     */
//    generateQuestion(allowedTypes: QuestionType[], allowRearrangements: boolean): { question: string; type: string; answer: number } {
    generateQuestion(settings: Settings): { question: string; type: string; answer: number } {
        const allowedType = settings.validQuestionTypes;
        const allowRearrangements = settings.allowRearrangements;
        if (allowedTypes.length === 0) {
            throw new Error("Must have at least one allowed question type.");
        }
        let chosenType = allowedTypes[Utils.generateInt(0, allowedTypes.length)];

        

        let leftNum = Utils.generateInt(settings.getOperationBoundsByName[chosenType.operatorType].leftMin, this.operationBounds[chosenType.operatorType].leftMax);
        let rightNum = Utils.generateInt(settings.getOperationBoundsByName[chosenType.operatorType].rightMin, this.operationBounds[chosenType.operatorType].rightMax);

        if (chosenType.operatorType === "subtraction" and settings.subtractionReversedAddition) {
            leftNum = Utils.generateInt(this.operationBounds["addition"].leftMin, this.operationBounds[chosenType.operator
        }

        return {question: `${leftNum} ${this.operationStrings[chosenType.operatorType]} ${rightNum} = `, type: 'integer', answer: Utils.operations[chosenType.operatorType](leftNum,rightNum)};
    }

}
