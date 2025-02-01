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
        const allowedType = settings.validQuestionTypes;
        const allowRearrangements = settings.allowRearrangements;
        if (allowedTypes.length === 0) {
            throw new Error("Must have at least one allowed question type.");
        }
        let chosenType = allowedTypes[Utils.generateInt(0, allowedTypes.length)];
        let leftNum = Utils.generateInt(this.operationBounds[chosenType.operatorType].leftMin, this.operationBounds[chosenType.operatorType].leftMax);
        let rightNum = Utils.generateInt(this.operationBounds[chosenType.operatorType].rightMin, this.operationBounds[chosenType.operatorType].rightMax);
        if (chosenType.operatorType ===
        )
            return { question: `${leftNum} ${this.operationStrings[chosenType.operatorType]} ${rightNum} = `, type: 'integer', answer: Utils.operations[chosenType.operatorType](leftNum, rightNum) };
    }
}
