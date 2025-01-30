import { Settings } from "./settings.js";
import { QuestionGenerator } from "./question.js";
// import { Timer } from "./timer";

export class Game {

    private QG: QuestionGenerator;

    constructor() {
        this.QG = new QuestionGenerator();

        console.log("Game object created.");
    }

    loadNextQuestion() {
        const { question, type, answer } = this.QG.generateQuestion(new Set(["integers"]), false);

    }

    endGame () {

    }
}

