"use strict";
exports.__esModule = true;
exports.UI = void 0;
var UI = /** @class */ (function () {
    function UI(game, timer) {
        this.game = game;
        this.startButtons = document.querySelectorAll(".start-game");
        this.gameDiv = document.getElementById("game");
        this.endDiv = document.getElementById("ending");
        this.settingsForm = document.getElementById("settings");
        this.questionEl = document.getElementById("question");
        this.answerInput = document.getElementById("answer");
        this.timerEl = document.getElementById("timer");
        this.scoreEl = document.getElementById("score");
        this.endScoreEl = document.getElementById("endScore");
    }
    return UI;
}());
exports.UI = UI;
