import { Game } from "./game.js";
import { Timer } from "./timer.js";
import { Settings } from "./settings.js";
export class UI {
    constructor() {
        this.startGame = () => {
            console.log("Starting the game");
            this.game.startGame();
            this.timer.start(this.settings.getSetting("timeLimit"));
            this.updateTimerDisplay(this.settings.getSetting("timeLimit"));
            this.settingsForm.style.display = "none";
            this.endDiv.style.display = "none";
            this.gameDiv.style.display = "block";
            this.description.style.display = "none";
            this.updateQuestionDisplay();
        };
        this.settings = new Settings();
        this.game = new Game(this.settings);
        this.gameDiv = document.getElementById("game");
        this.startButtons = document.querySelectorAll(".start-game");
        this.endDiv = document.getElementById("ending");
        this.settingsForm = document.getElementById("settings");
        this.description = document.getElementById("description");
        this.timerEl = document.getElementById("timer");
        this.questionEl = document.getElementById("question");
        this.answerInput = document.getElementById("answerInput");
        // create the timer
        this.timerEl = document.getElementById("timer");
        this.timer = new Timer((timeLeft) => this.updateTimerDisplay(timeLeft), // Update UI
        () => this.endGame() // Handle game end
        );
        // assign data operator types to the input elements
        // this needs to be done before attaching the listeners (is this bad practice?)
        for (const settingType of ["addition-settings", "subtraction-settings", "multiplication-settings", "division-settings"]) {
            const parentDiv = document.getElementById(settingType);
            if (parentDiv) {
                parentDiv.querySelectorAll("input").forEach(button => {
                    button.dataset.operatorType = parentDiv.dataset.operatorType;
                });
            }
        }
        this.attachListeners();
    }
    assignDefaults() {
        const form = document.getElementById("settings");
    }
    attachListeners() {
        // attach listeners to all input elements in the settings form
        const form = document.getElementById("settings");
        if (!form)
            return;
        form.querySelectorAll("input").forEach((input) => {
            const settingKey = input.dataset.setting;
            // this is to get the default values from all the inputs
            this.updateSetting(input);
            input.addEventListener("input", () => {
                this.updateSetting(input);
            });
        });
        // start game buttons
        this.startButtons.forEach((button) => {
            button.addEventListener("click", this.startGame);
        });
        // listen for user answer
        this.answerInput.addEventListener("input", () => {
            console.log(this.answerInput.value);
            if (this.game.checkAnswer(this.answerInput.value))
                this.processCorrectAnswer();
        });
    }
    updateSetting(input) {
        if (input.type === "number") {
            // if there is a valid number in the input, we want to use that, otherwise use the default value
            if (input.valueAsNumber) {
                //                this.settings.updateBound(input.id, input.valueAsNumber);
                if (input.dataset.operatorType && input.dataset.boundType)
                    this.settings.updateBound(input.dataset.operatorType, input.dataset.boundType, input.valueAsNumber);
            }
            else {
                // this.settings.updateBound(input.id, parseInt(input.placeholder));
                if (input.dataset.operatorType && input.dataset.boundType)
                    this.settings.updateBound(input.dataset.operatorType, input.dataset.boundType, parseInt(input.placeholder));
            }
        }
        if (input.type === "checkbox") {
            // if this has a dataset.operatorType and dataset.numberType, is a checkbox for a question type, otherwise it is something else
            if (input.dataset.numberType && input.dataset.operatorType)
                this.settings.updateQuestionType(input.dataset.numberType, input.dataset.operatorType, input.checked);
        }
    }
    updateQuestionDisplay() {
        this.questionEl.innerHTML = this.game.loadNextQuestion();
        this.answerInput.focus();
    }
    endGame() {
        console.log("Ending the game");
        this.gameDiv.style.display = "none";
        this.endDiv.style.display = "block";
    }
    updateTimerDisplay(timeLeft) {
        this.timerEl.textContent = timeLeft.toString();
    }
    processCorrectAnswer() {
        this.updateQuestionDisplay(); // load the next question
        this.answerInput.value = ""; // clear the input box
        this.answerInput.focus();
    }
}
