// handles miscellaneous game logic

import { Settings } from "./settings.js";
// import { QuestionGenerator, QuestionType, OperatorType, NumberType } from "./question.js";
import { QuestionGenerator } from "./question.js";

export class Game {

    private QG!: QuestionGenerator;
    private question: { question: string, type: string, answer: number };
    private settings: Settings;

    constructor(settings: Settings) { // I think maybe this class should have a settings object
        this.settings = settings;
        // this.QG = new QuestionGenerator(this.settings.getOperationBounds());
        this.question = { question: "", type: "", answer: 0 };
        console.log("Game object created.");
    }

    loadNextQuestion(): string {
        this.question = this.QG.generateQuestion([{numberType: "integers", operatorType: "addition"}], false);
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

    startGame(){
        this.QG = new QuestionGenerator(this.settings.getOperationBounds());
    }

    endGame () {

    }
}

