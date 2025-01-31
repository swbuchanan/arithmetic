"use strict";
exports.__esModule = true;
exports.UI = void 0;
var game_js_1 = require("./game.js");
var timer_js_1 = require("./timer.js");
var settings_js_1 = require("./settings.js");
var UI = /** @class */ (function () {
    function UI() {
        var _this = this;
        this.startGame = function () {
            console.log("Starting the game");
            _this.game.startGame();
            _this.timer.start(_this.settings.getBound("timeLimit"));
            _this.updateTimerDisplay(_this.settings.getBound("timeLimit"));
            _this.settingsForm.style.display = "none";
            _this.endDiv.style.display = "none";
            _this.gameDiv.style.display = "block";
            _this.description.style.display = "none";
            _this.updateQuestionDisplay();
        };
        this.settings = new settings_js_1.Settings();
        this.game = new game_js_1.Game(this.settings);
        this.gameDiv = document.getElementById("game");
        this.startButtons = document.querySelectorAll(".start-game");
        this.endDiv = document.getElementById("ending");
        this.settingsForm = document.getElementById("settings");
        this.description = document.getElementById("description");
        this.timerEl = document.getElementById("timer");
        this.questionEl = document.getElementById("question");
        this.answerInput = document.getElementById("answerInput");
        console.log(this.settingsForm);
        this.assignDefaults();
        this.attachListeners();
        // create the timer
        this.timerEl = document.getElementById("timer");
        this.timer = new timer_js_1.Timer(
        //    this.settings.getBound('timeLimit'), // Initial duration
        function (timeLeft) { return _this.updateTimerDisplay(timeLeft); }, // Update UI
        function () { return _this.endGame(); } // Handle game end
        );
        console.log("UI activated");
    }
    UI.prototype.assignDefaults = function () {
        var _this = this;
        var form = document.getElementById("settings");
        form.querySelectorAll("input").forEach(function (input) {
            if (input.type === "number")
                _this.settings.updateBound(input.id, parseInt(input.placeholder));
            if (input.type === "checkbox")
                _this.settings.updateToggle(input.id, input.checked);
        });
    };
    UI.prototype.attachListeners = function () {
        var _this = this;
        // attach listeners to all input elements in the settings form
        console.log("attaching listeners to input elements...");
        var form = document.getElementById("settings");
        if (!form)
            return;
        form.querySelectorAll("input").forEach(function (input) {
            var settingKey = input.dataset.setting;
            input.addEventListener("input", function () {
                if (input.type === "number")
                    _this.settings.updateBound(input.id, input.valueAsNumber);
                if (input.type === "checkbox") {
                    _this.settings.updateToggle(input.id, input.checked);
                    console.log("checkbox");
                    console.log(input.dataset);
                }
                // this.settings.updateSetting(input.id, input.value | input.valueAsNumber);
            });
        });
        // start game buttons
        this.startButtons.forEach(function (button) {
            button.addEventListener("click", _this.startGame);
        });
        // listen for user answer
        this.answerInput.addEventListener("input", function () {
            console.log(_this.answerInput.value);
            if (_this.game.checkAnswer(_this.answerInput.value))
                _this.processCorrectAnswer();
        });
    };
    UI.prototype.updateQuestionDisplay = function () {
        this.questionEl.innerHTML = this.game.loadNextQuestion();
        this.answerInput.focus();
    };
    UI.prototype.endGame = function () {
        console.log("Ending the game");
        this.gameDiv.style.display = "none";
        this.endDiv.style.display = "block";
    };
    UI.prototype.updateTimerDisplay = function (timeLeft) {
        console.log(timeLeft);
        this.timerEl.textContent = timeLeft.toString();
    };
    UI.prototype.processCorrectAnswer = function () {
        this.updateQuestionDisplay(); // load the next question
        this.answerInput.value = ""; // clear the input box
        this.answerInput.focus();
    };
    return UI;
}());
exports.UI = UI;
