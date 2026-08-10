import { Game } from "./game.js";
import { Timer } from "./timer.js";
import { Settings } from "./settings.js";
function getRequiredElement(id) {
    const element = document.getElementById(id);
    if (element === null) {
        throw new Error(`Required element #${id} was not found. Check that the deployed HTML and JavaScript versions match.`);
    }
    return element;
}
export class UI {
    constructor() {
        this.startGame = () => {
            // check to see which question types are enabled and update the settings
            try {
                this.readSettings();
                if (this.settings.validQuestionTypes.length === 0) {
                    alert("Please select at least one question type.");
                    return;
                }
                const duration = this.settings.getSetting("timeLimit");
                if (typeof duration !== "number" || !Number.isFinite(duration) || duration <= 0) {
                    throw new RangeError("The time limit must be greater than zero.");
                }
                this.score = 0;
                this.game.startGame();
                this.answerInput.value = "";
                this.updateQuestionDisplay();
                this.updateScoreDisplay();
                this.showGameScreen();
                this.timer.start(duration);
                this.answerInput.focus();
            }
            catch (error) {
                this.handleGameError(error);
            }
        };
        this.settings = new Settings();
        this.game = new Game(this.settings);
        this.gameDiv = getRequiredElement("game");
        this.startButtons = document.querySelectorAll(".start-game");
        this.endScreenHomeButton = getRequiredElement("end-screen-home-button");
        this.endDiv = getRequiredElement("ending");
        this.settingsForm = getRequiredElement("settings");
        this.description = getRequiredElement("description");
        this.timerEl = getRequiredElement("timer");
        this.leftQuestionEl = getRequiredElement("left-question");
        this.rightQuestionEl = getRequiredElement("right-question");
        this.answerInput = getRequiredElement("answerInput");
        this.scoreEl = getRequiredElement("score");
        this.endScoreEl = getRequiredElement("endScore");
        this.score = 0;
        // create the timer
        this.timer = new Timer((timeLeft) => this.updateTimerDisplay(timeLeft), // Update UI
        () => this.endGame() // Handle game end
        );
        // assign data operator types to the input elements
        for (const operatorType of ["addition", "subtraction", "multiplication", "division"]) {
            const parentDiv = getRequiredElement(`${operatorType}-settings`);
            parentDiv.querySelectorAll("input").forEach(input => {
                input.dataset.operatorType = operatorType;
            });
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
            this.timer.stop();
            this.showSettingsScreen();
        });
        // user's answer box
        this.answerInput.addEventListener("input", () => {
            if (this.timer.hasExpired()) {
                this.timer.stop();
                this.updateTimerDisplay(0);
                this.endGame();
                return;
            }
            if (this.game.checkAnswer(this.answerInput.value))
                this.processCorrectAnswer();
        });
        // Find all elements with a "data-dependent-on" attribute
        const dependentElements = this.settingsForm.querySelectorAll("[data-dependent-on]");
        dependentElements.forEach((element) => {
            const parentId = element.dataset.dependentOn;
            const parentInput = getRequiredElement(parentId);
            const isReversed = element.dataset.reverse === "true";
            // Add an event listener to the parent input
            parentInput.addEventListener("change", () => {
                const shouldHide = isReversed ? parentInput.checked : !parentInput.checked;
                element.classList.toggle("hidden", shouldHide);
            });
            // Set the initial visibility based on the parent's state
            const initialHide = isReversed ? parentInput.checked : !parentInput.checked;
            element.classList.toggle("hidden", initialHide);
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
     * @param input - the HTMLInputElement to process
     */
    updateSetting(input) {
        let readInput = input; // this is the input that we want to read from to update the setting
        // usually this is the same as the one that we want to change, but in some cases we want to read from a different one
        // first check if we should be getting the settings from another input element
        if ((input.dataset.operatorType === "subtraction" || input.dataset.operatorType === "division") &&
            input.dataset.alternate &&
            getRequiredElement(`${input.dataset.operatorType}ReverseToggle`).checked) {
            readInput = getRequiredElement(input.dataset.alternate);
        }
        if (input.type === "number") {
            const value = Number.isFinite(readInput.valueAsNumber)
                ? readInput.valueAsNumber
                : Number(readInput.placeholder);
            if (!Number.isFinite(value)) {
                throw new Error(`The setting #${readInput.id} needs a valid number or placeholder.`);
            }
            if (input.dataset.operatorType && input.dataset.operationSetting) {
                this.settings.updateOperationSetting(input.dataset.operatorType, input.dataset.operationSetting, value);
            }
            else if (input.dataset.operatorType && input.dataset.boundType) {
                this.settings.updateBound(input.dataset.operatorType, input.dataset.boundType, value);
            }
            else {
                this.settings.updateSetting(input.id, value);
            }
        }
        if (input.type === "checkbox") {
            if (input.dataset.numberType && input.dataset.operatorType) { // if this has a dataset.operatorType and dataset.numberType, is a checkbox for a question type, otherwise it is something else
                // make sure that the given operator type is enabled at the highest level
                const masterOperatorTypeEnabled = getRequiredElement(`${input.dataset.operatorType}Toggle`).checked;
                this.settings.updateQuestionType(input.dataset.numberType, input.dataset.operatorType, readInput.checked && masterOperatorTypeEnabled);
            }
            const reverseSettings = {
                subtractionReverseToggle: "subtractionReversedAddition",
                divisionReverseToggle: "divisionReversedMultiplication"
            };
            const reverseSetting = reverseSettings[input.id];
            if (reverseSetting)
                this.settings.updateSetting(reverseSetting, input.checked);
        }
    }
    updateQuestionDisplay() {
        const question = this.game.loadNextQuestion();
        this.leftQuestionEl.textContent = question.questionLeft;
        this.rightQuestionEl.textContent = question.questionRight;
    }
    endGame() {
        this.gameDiv.hidden = true;
        this.endDiv.hidden = false;
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
        this.answerInput.value = "";
        try {
            this.updateQuestionDisplay();
            this.answerInput.focus();
        }
        catch (error) {
            this.handleGameError(error);
        }
    }
    showGameScreen() {
        this.settingsForm.hidden = true;
        this.description.hidden = true;
        this.endDiv.hidden = true;
        this.gameDiv.hidden = false;
    }
    showSettingsScreen() {
        this.gameDiv.hidden = true;
        this.endDiv.hidden = true;
        this.settingsForm.hidden = false;
        this.description.hidden = false;
    }
    handleGameError(error) {
        console.error(error);
        this.timer.stop();
        this.showSettingsScreen();
        alert(error instanceof Error ? error.message : "Unable to generate a question.");
    }
}
