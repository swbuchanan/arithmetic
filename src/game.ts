import { Settings } from "./settings.js";
import { QuestionGenerator } from "./question.js";
// import { Timer } from "./timer";

export class Game {

    private QG: QuestionGenerator;
    private question: { question: string, type: string, answer: number };

    constructor() { // I think maybe this class should have a settings object
        this.QG = new QuestionGenerator();
        this.question = { question: "", type: "", answer: 0 };
        console.log("Game object created.");
    }

    loadNextQuestion(): string {
        this.question = this.QG.generateQuestion(new Set(["integers"]), false);
        console.log(`Loaded question: ${this.question.question}`);
        return this.question.question;

    }

    checkAnswer(userAnswer: string): boolean {
        console.log(`the user answer is ${userAnswer} and the correct answer is ${this.question["answer"]}`);

        if (parseInt(userAnswer) === this.question["answer"]) {
            console.log("you are right");
            return true;
        }
        return false;
    }

    endGame () {

    }
}

