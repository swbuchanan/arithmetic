import { Game } from "./game.js";
import { Timer } from "./timer.js";
import { Settings } from "./settings.js";
export class UI {
    constructor() {
        this.startGame = () => {
            console.log("Starting the game");
            this.game.startGame();
            this.timer.start(this.settings.getBound("timeLimit"));
            this.updateTimerDisplay(this.settings.getBound("timeLimit"));
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
        console.log(this.settingsForm);
        this.assignDefaults();
        this.attachListeners();
        // create the timer
        this.timerEl = document.getElementById("timer");
        this.timer = new Timer(
        //    this.settings.getBound('timeLimit'), // Initial duration
        (timeLeft) => this.updateTimerDisplay(timeLeft), // Update UI
        () => this.endGame() // Handle game end
        );
        console.log("UI activated");
    }
    assignDefaults() {
        const form = document.getElementById("settings");
        form.querySelectorAll("input").forEach((input) => {
            if (input.type === "number")
                this.settings.updateBound(input.id, parseInt(input.placeholder));
            if (input.type === "checkbox")
                this.settings.updateToggle(input.id, input.checked);
        });
    }
    attachListeners() {
        // attach listeners to all input elements in the settings form
        console.log("attaching listeners to input elements...");
        const form = document.getElementById("settings");
        if (!form)
            return;
        form.querySelectorAll("input").forEach((input) => {
            const settingKey = input.dataset.setting;
            input.addEventListener("input", () => {
                if (input.type === "number")
                    this.settings.updateBound(input.id, input.valueAsNumber);
                if (input.type === "checkbox")
                    this.settings.updateToggle(input.id, input.checked);
                // this.settings.updateSetting(input.id, input.value | input.valueAsNumber);
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
    updateQuestionDisplay() {
        this.questionEl.innerHTML = this.game.loadNextQuestion();
        console.log(this.answerInput);
        this.answerInput.focus();
    }
    endGame() {
        console.log("Ending the game");
        this.gameDiv.style.display = "none";
        this.endDiv.style.display = "block";
    }
    updateTimerDisplay(timeLeft) {
        console.log(timeLeft);
        this.timerEl.textContent = timeLeft.toString();
    }
    processCorrectAnswer() {
        this.updateQuestionDisplay(); // load the next question
        this.answerInput.value = ""; // clear the input box
        this.answerInput.focus();
    }
}
