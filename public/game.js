"use strict";
// handles miscellaneous game logic
exports.__esModule = true;
exports.Game = void 0;
// import { QuestionGenerator, QuestionType, OperatorType, NumberType } from "./question.js";
var question_js_1 = require("./question.js");
var Game = /** @class */ (function () {
    function Game(settings) {
        this.settings = settings;
        // this.QG = new QuestionGenerator(this.settings.getOperationBounds());
        this.question = { question: "", type: "", answer: 0 };
        console.log("Game object created.");
    }
    Game.prototype.loadNextQuestion = function () {
        this.question = this.QG.generateQuestion([{ numberType: "integers", operatorType: "addition" }], false);
        console.log("Loaded question: ".concat(this.question.question));
        return this.question.question;
    };
    Game.prototype.checkAnswer = function (userAnswer) {
        console.log("the user answer is ".concat(userAnswer, " and the correct answer is ").concat(this.question["answer"]));
        if (parseInt(userAnswer) === this.question["answer"]) {
            console.log("you are right");
            return true;
        }
        return false;
    };
    Game.prototype.startGame = function () {
        this.QG = new question_js_1.QuestionGenerator(this.settings.getOperationBounds());
    };
    Game.prototype.endGame = function () {
    };
    return Game;
}());
exports.Game = Game;
