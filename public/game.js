// handles miscellaneous game logic
// import { QuestionGenerator, QuestionType, OperatorType, NumberType } from "./question.js";
import { QuestionGenerator } from "./question.js";
//type OperatorType = "addition" | "subtraction" | "multiplication" | "division";
//type NumberType = "integers" | "decimals" | "fractions";
//type QuestionType = { numberType: NumberType, operatorType: OperatorType };
export class Game {
    constructor(settings) {
        this.settings = settings;
        this.question = { question: "", type: "", answer: 0 };
        console.log("Game object created.");
    }
    loadNextQuestion() {
        // this.question = this.QG.generateQuestion([{numberType: "integers", operatorType: "addition"}], false);
        this.question = this.QG.generateQuestion(this.settings);
        console.log(`Loaded question: ${this.question.question}`);
        return this.question.question;
    }
    checkAnswer(userAnswer) {
        console.log(`the user answer is ${userAnswer} and the correct answer is ${this.question["answer"]}`);
        if (parseInt(userAnswer) === this.question["answer"]) {
            console.log("you are right");
            return true;
        }
        return false;
    }
    startGame() {
        this.QG = new QuestionGenerator(this.settings.getOperationBounds());
    }
    endGame() {
    }
}
