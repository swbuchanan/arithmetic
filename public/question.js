// generates questions to display
import * as Utils from "./utils.js";
export class QuestionGenerator {
    constructor(operationBounds) {
        this.operationStrings = { addition: "+", subtraction: "-", multiplication: "x", division: "/" };
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
    generateQuestion(settings) {
        const allowedTypes = settings.validQuestionTypes;
        const allowRearrangements = settings.getSetting("allowRearrangements");
        if (allowedTypes.length === 0) {
            throw new Error("Must have at least one allowed question type.");
        }
        let chosenType = allowedTypes[Utils.generateInt(0, allowedTypes.length)];
        let leftNum = Utils.generateInt(settings.getOperationBoundsByName(chosenType.operatorType).leftMin, settings.getOperationBoundsByName(chosenType.operatorType).leftMax);
        let rightNum = Utils.generateInt(settings.getOperationBoundsByName(chosenType.operatorType).rightMin, settings.getOperationBoundsByName(chosenType.operatorType).rightMax);
        let answer = Utils.operations[chosenType.operatorType](leftNum, rightNum);
        let operationString = this.operationStrings[chosenType.operatorType];
        if (chosenType.operatorType === "subtraction" && settings.getSetting("subtractionReversedAddition")) {
            //            leftNum = Utils.generateInt(this.operationBounds["addition"].leftMin, this.operationBounds[chosenType.operator
            answer = leftNum;
            leftNum = leftNum + rightNum;
        }
        return { question: `${leftNum} ${operationString} ${rightNum} = `, type: 'integer', answer: answer };
    }
}
