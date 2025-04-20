import { Game } from "./game.js";
import { Timer } from "./timer.js";
import { Settings } from "./settings.js";
export class UI {
    constructor() {
        this.startGame = () => {
            console.log("Starting the game!");
            // check to see which question types are enabled and update the settings
            this.readSettings();
            this.score = 0;
            this.settings.printValidQuestionTypes();
            // start the game logic
            this.game.startGame();
            // start the timer and update its display
            this.timer.start(this.settings.getSetting("timeLimit"));
            this.updateTimerDisplay(this.settings.getSetting("timeLimit"));
            this.updateScoreDisplay();
            // make sure only the game is showing
            this.settingsForm.style.display = "none";
            this.endDiv.style.display = "none";
            this.description.style.display = "none";
            this.gameDiv.style.display = "block";
            // load the next question and make sure the answer box is in focus
            this.updateQuestionDisplay();
        };
        this.settings = new Settings();
        this.game = new Game(this.settings);
        this.gameDiv = document.getElementById("game");
        this.startButtons = document.querySelectorAll(".start-game");
        this.endScreenHomeButton = document.getElementById("end-screen-home-button");
        this.endDiv = document.getElementById("ending");
        this.settingsForm = document.getElementById("settings");
        this.description = document.getElementById("description");
        this.timerEl = document.getElementById("timer");
        this.questionEl = document.getElementById("question");
        this.answerInput = document.getElementById("answerInput");
        this.scoreEl = document.getElementById("score");
        this.endScoreEl = document.getElementById("endScore");
        this.score = 0;
        this.fractionToggles = { fractionAdditionToggle: document.getElementById("fractionAdditionToggle"),
            fractionSubtractionToggle: document.getElementById("fractionSubtractionToggle") };
        this.fractionOptions = { addition: document.getElementById("additionFractionOptions") };
        // create the timer
        this.timer = new Timer((timeLeft) => this.updateTimerDisplay(timeLeft), // Update UI
        () => this.endGame() // Handle game end
        );
        // assign data operator types to the input elements
        for (const settingType of ["addition-settings", "subtraction-settings", "multiplication-settings", "division-settings"]) {
            const parentDiv = document.getElementById(settingType);
            if (parentDiv) {
                parentDiv.querySelectorAll("input").forEach(button => {
                    button.dataset.operatorType = parentDiv.dataset.operatorType;
                });
            }
        }
        // get the default values determined by the html
        this.assignDefaults();
        // attach listeners to the start buttons and the answer input box
        this.attachListeners();
    }
    /**
     * Assigns default values to the settings based on the HTML
     */
    assignDefaults() {
        this.settingsForm.querySelectorAll("input").forEach((input) => {
            this.updateSetting(input);
        });
    }
    attachListeners() {
        // start game buttons
        this.startButtons.forEach((button) => {
            button.addEventListener("click", this.startGame);
        });
        // home button
        this.endScreenHomeButton.addEventListener("click", () => {
            this.gameDiv.style.display = "none";
            this.endDiv.style.display = "none";
            this.settingsForm.style.display = "block";
            this.description.style.display = "block";
            this.timer.stop();
        });
        // user's answer box
        this.answerInput.addEventListener("input", () => {
            if (this.game.checkAnswer(this.answerInput.value))
                this.processCorrectAnswer();
        });
        // Find all elements with a "data-dependent-on" attribute
        const dependentElements = this.settingsForm.querySelectorAll("[data-dependent-on]");
        dependentElements.forEach((element) => {
            const parentId = element.dataset.dependentOn;
            const parentInput = document.getElementById(parentId);
            const isReversed = element.dataset.reverse === "true";
            if (parentInput) {
                // Add an event listener to the parent input
                parentInput.addEventListener("change", () => {
                    const shouldHide = isReversed ? parentInput.checked : !parentInput.checked;
                    element.classList.toggle("hidden", shouldHide);
                });
                // Set the initial visibility based on the parent's state
                const initialHide = isReversed ? parentInput.checked : !parentInput.checked;
                element.classList.toggle("hidden", initialHide);
            }
        });
    }
    // Go through all the user-changeable settings on the page and update the settings accordingly
    readSettings() {
        this.settingsForm.querySelectorAll("input").forEach((input) => {
            this.updateSetting(input);
        });
    }
    /**
     * Given an input element, which should be either a text/number box or a checkbox, processes it in the appropriate way
     * @param input - the input element to process
     */
    updateSetting(input) {
        if (input.type === "number") {
            if (input.valueAsNumber) { // if there is a valid number in the input, we want to use that
                // the settings that involve a number box are all either bounds or miscellaneous settings
                if (input.dataset.operatorType && input.dataset.boundType)
                    this.settings.updateBound(input.dataset.operatorType, input.dataset.boundType, input.valueAsNumber);
                else
                    this.settings.updateSetting(input.id, input.valueAsNumber);
            }
            else { // if there is no valid number in the input, we want to use the default value
                if (input.dataset.operatorType && input.dataset.boundType)
                    this.settings.updateBound(input.dataset.operatorType, input.dataset.boundType, parseInt(input.placeholder));
                else
                    this.settings.updateSetting(input.id, parseInt(input.placeholder));
            }
        }
        if (input.type === "checkbox") {
            if (input.dataset.numberType && input.dataset.operatorType) { // if this has a dataset.operatorType and dataset.numberType, is a checkbox for a question type, otherwise it is something else
                // make sure that the given operator type is enabled at the highest level
                console.log(input);
                let masterOperatorTypeEnabled = document.getElementById(input.dataset.operatorType + "Toggle").checked;
                this.settings.updateQuestionType(input.dataset.numberType, input.dataset.operatorType, input.checked && masterOperatorTypeEnabled);
                //                if (input.checked && masterOperatorTypeEnabled) {
                //                    console.log(`enabled ${input.dataset.numberType} ${input.dataset.operatorType}`);
                //                }
            }
        }
    }
    updateQuestionDisplay() {
        this.questionEl.innerHTML = this.game.loadNextQuestion();
        this.answerInput.focus();
    }
    endGame() {
        this.gameDiv.style.display = "none";
        this.endDiv.style.display = "block";
    }
    updateTimerDisplay(timeLeft) {
        this.timerEl.textContent = timeLeft.toString();
    }
    updateScoreDisplay() {
        this.scoreEl.textContent = this.score.toString();
        let displayedScore = this.score;
        this.endScoreEl.textContent = displayedScore.toString();
    }
    processCorrectAnswer() {
        this.score++;
        this.updateScoreDisplay();
        this.updateQuestionDisplay(); // load the next question
        this.answerInput.value = ""; // clear the input box
        this.answerInput.focus();
    }
}
