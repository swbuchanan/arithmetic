// generates questions to display
import * as Utils from "./utils.js";
export class QuestionGenerator {
    constructor(operationBounds) {
        this.operationStrings = { addition: "+", subtraction: "−", multiplication: "×", division: "÷" };
        this.operationBounds = operationBounds;
        console.log("Question generator created.");
    }
    /**
     * Generates a math question of any type
     * @param settings - The settings object containing the operation bounds and other settings
     * @returns A dictionary containing the part of the question to display to the left of the input box,
     * the part of the question to display to the right of the input box, the type of number (integer, decimal, fraction), and the answer
     */
    //    generateQuestion(allowedTypes: QuestionType[], allowRearrangements: boolean): { question: string; type: string; answer: number } {
    generateQuestion(settings) {
        // this is a list of all the valid question types
        // a question type comprises a number type (integer, decimal, fraction) and an operator type (addition, subtraction, multiplication, division)
        const allowedTypes = settings.validQuestionTypes;
        // if allowRearrangements is true, we may need to rearrange the numbers so that the unknown may be on the left hand side
        // TODO: implement rearrangements
        const allowRearrangements = settings.getSetting("allowRearrangements");
        // debug: this state should never be reached
        if (allowedTypes.length === 0) {
            throw new Error("ERROR: Must have at least one allowed question type.");
        }
        // pick a random question type from the allowed types
        const chosenType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
        const generatedLeft = Utils.generateNum(chosenType.numberType, settings.getOperationBoundsByName(chosenType.operatorType).leftMin, settings.getOperationBoundsByName(chosenType.operatorType).leftMax, settings.getOperationSettings(chosenType.operatorType));
        let rightNum = Utils.generateNum(chosenType.numberType, settings.getOperationBoundsByName(chosenType.operatorType).rightMin, settings.getOperationBoundsByName(chosenType.operatorType).rightMax, settings.getOperationSettings(chosenType.operatorType));
        // A zero divisor would create an invalid question in both normal and
        // reversed-division modes. Retry a bounded number of times so a range
        // containing other values remains usable without risking a hang.
        if (chosenType.operatorType === "division") {
            for (let attempt = 0; Utils.parseExactNumber(rightNum)?.numerator === 0n && attempt < 20; attempt++) {
                rightNum = Utils.generateNum(chosenType.numberType, settings.getOperationBoundsByName(chosenType.operatorType).rightMin, settings.getOperationBoundsByName(chosenType.operatorType).rightMax, settings.getOperationSettings(chosenType.operatorType));
            }
            if (Utils.parseExactNumber(rightNum)?.numerator === 0n) {
                throw new RangeError("The division right-hand range must contain a non-zero value.");
            }
        }
        let leftNum = generatedLeft;
        let answer;
        if (chosenType.operatorType === "subtraction" && settings.getSetting("subtractionReversedAddition")) {
            leftNum = Utils.formatOperationResult(generatedLeft, rightNum, "addition", chosenType.numberType);
            answer = generatedLeft;
        }
        else if (chosenType.operatorType === "division" && settings.getSetting("divisionReversedMultiplication")) {
            leftNum = Utils.formatOperationResult(generatedLeft, rightNum, "multiplication", chosenType.numberType);
            answer = generatedLeft;
        }
        else {
            answer = Utils.formatOperationResult(generatedLeft, rightNum, chosenType.operatorType, chosenType.numberType);
        }
        const operationString = this.operationStrings[chosenType.operatorType];
        console.log(`${leftNum} ${operationString} ${rightNum} = ${answer}`);
        let questionLeft = `${leftNum} ${operationString} ${rightNum} = `;
        let questionRight = ``;
        // decide whether to rearrange the question; most of the time we don't
        if (allowRearrangements && Utils.generateInt(0, 2) === '1') {
            // decide whether the missing number is to the left or right of the operator
            if (Utils.generateInt(0, 1) === '1') {
                questionLeft = `${leftNum} ${operationString} `;
                questionRight = ` = ${answer}`;
                answer = rightNum; // the answer is now the right number
            }
            else {
                questionLeft = ``;
                questionRight = `${operationString} ${rightNum} = ${answer}`;
                answer = leftNum; // the answer is now the left number
            }
        }
        return {
            questionLeft: questionLeft,
            questionRight: questionRight,
            type: chosenType.numberType,
            answer: answer
        };
    }
}
