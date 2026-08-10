// handles miscellaneous game logic

import * as Utils from "./utils.js";
import { Settings } from "./settings.js";
import { QuestionGenerator } from "./question.js";
import type { Question } from "./question.js";

export class Game {

    private QG!: QuestionGenerator; // this is created when the game is started
    private question: Question | null;
    private settings: Settings;

    constructor(settings: Settings) {
        this.settings = settings;
        this.question = null;
        console.log("Game object created.");
    }

    loadNextQuestion(): Question {
        this.question = this.QG.generateQuestion(this.settings);
        console.log(`Loaded question: ${this.question.questionLeft}`);
        return this.question;
    }

    checkAnswer(userAnswer: string): boolean {
        if (this.question === null) return false;

        const parsedUserAnswer = Utils.parseNumber(userAnswer);
        const parsedCorrectAnswer = Utils.parseNumber(this.question.answer);
        console.log(`the user answer is ${parsedUserAnswer} and the correct answer is ${this.question.answer}`);

        if (!Number.isFinite(parsedUserAnswer) || !Number.isFinite(parsedCorrectAnswer)) return false;
        
        // TODO: because of rounding errors, answers input as fractions can be misread in some cases
        // I don't think using toFixed is an ideal solution - I'd prefer to use the fractions directly
        // low priority for now
        if (parsedUserAnswer.toFixed(10) === parsedCorrectAnswer.toFixed(10)) {
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
