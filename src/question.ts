import * as Utils from "./utils.js"

type QuestionType = "integers" | "decimals" | "fractions";

export class QuestionGenerator {
    /*
    questionString is what's put into the html
    questionType is addition,

    */
    private operationBounds: Record<string, number>; 

    constructor(operationBounds: Record<string, number>) {
        this.operationBounds = operationBounds;
        console.log("Question generator created.");
    }
    
    /**
     * Generates a math question of any type
     * @param allowedTypes - What sort of numbers are allowed in the question; should be a set containing some combination of the allowed types listed above
     * @param allowRearrangements - If this is true, the question can look like 'a + ? = b' or '? + a = b', otherwise it will look like 'a + b = ?'.
     * @returns A string that can be inserted into html to display a math question
     */
    generateQuestion(allowedTypes: Set<QuestionType>, allowRearrangements: boolean): { question: string; type: string; answer: number } {
        if (allowedTypes.size === 0) {
            throw new Error("Must have at least one allowed question type");
        }
        let chosenType = false;
        let num1 = Utils.generateInt(this.operationBounds.additionLeftMin, this.operationBounds.additionLeftMax);
        let num2 = Utils.generateInt(this.operationBounds.additionRightMin, this.operationBounds.additionRightMax);
        return {question: `${num1} + ${num2} = `, type: 'integer', answer: num1 + num2};
//        return {question: "2 + 2 = ?", type: "integer", answer: 4};
    }

}
