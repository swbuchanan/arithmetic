import { QuestionGenerator } from "./question.js";
// import { Timer } from "./timer";
export class Game {
    constructor(settings) {
        this.settings = settings;
        // this.QG = new QuestionGenerator(this.settings.getOperationBounds());
        this.question = { question: "", type: "", answer: 0 };
        console.log("Game object created.");
    }
    loadNextQuestion() {
        this.question = this.QG.generateQuestion(new Set(["integers"]), false);
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
