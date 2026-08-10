import { Game } from "./game.js";
import { Timer } from "./timer.js";
import { Settings } from "./settings.js";
import type { NumberType, OperatorType } from "./question.js";

function getRequiredElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (element === null) {
        throw new Error(`Required element #${id} was not found. Check that the deployed HTML and JavaScript versions match.`);
    }
    return element as T;
}

export class UI {

    private settings: Settings;
    private timer: Timer;
    private game: Game;
    private timerEl: HTMLSpanElement;
    private leftQuestionEl: HTMLSpanElement;
    private rightQuestionEl: HTMLSpanElement;
    private gameDiv: HTMLElement;
    private endDiv: HTMLElement;
    private answerInput: HTMLInputElement;
    private startButtons: NodeListOf<HTMLButtonElement>;
    private endScreenHomeButton: HTMLButtonElement;
    private settingsForm: HTMLFormElement;
    private description: HTMLElement;
    private scoreEl: HTMLSpanElement;
    private endScoreEl: HTMLSpanElement;
    private score: number;

    constructor() {
        this.settings = new Settings();
        this.game = new Game(this.settings);
        this.gameDiv = getRequiredElement("game");
        this.startButtons = document.querySelectorAll<HTMLButtonElement>(".start-game");
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
        this.timer = new Timer(
            (timeLeft) => this.updateTimerDisplay(timeLeft), // Update UI
            () => this.endGame() // Handle game end
        );

        // assign data operator types to the input elements
        for (const operatorType of ["addition", "subtraction", "multiplication", "division"] as OperatorType[]) {
            const parentDiv = getRequiredElement(`${operatorType}-settings`);
            parentDiv.querySelectorAll<HTMLInputElement>("input").forEach(input => {
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
    private assignDefaults () {
        this.settingsForm.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
            this.updateSetting(input);
        });
    }

    private attachListeners() {
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
            if (this.game.checkAnswer(this.answerInput.value)) this.processCorrectAnswer();
        });

        // Find all elements with a "data-dependent-on" attribute
        const dependentElements = this.settingsForm.querySelectorAll<HTMLElement>("[data-dependent-on]");

        dependentElements.forEach((element) => {
            const parentId = element.dataset.dependentOn!;
            const parentInput = getRequiredElement<HTMLInputElement>(parentId);
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
    private readSettings() {
        this.settingsForm.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
            this.updateSetting(input);
        });
    }

    /**
     * Given an input element, which should be either a text/number box or a checkbox, processes it in the appropriate way
     * @param input - the HTMLInputElement to process
     */
    updateSetting(input: HTMLInputElement) {
        let readInput = input; // this is the input that we want to read from to update the setting
        // usually this is the same as the one that we want to change, but in some cases we want to read from a different one

        // first check if we should be getting the settings from another input element
        if ((input.dataset.operatorType === "subtraction" || input.dataset.operatorType === "division") &&
            input.dataset.alternate &&
            getRequiredElement<HTMLInputElement>(`${input.dataset.operatorType}ReverseToggle`).checked) {
            readInput = getRequiredElement<HTMLInputElement>(input.dataset.alternate);
        }

        if (input.type === "number") {
            const value = Number.isFinite(readInput.valueAsNumber)
                ? readInput.valueAsNumber
                : Number(readInput.placeholder);

            if (!Number.isFinite(value)) {
                throw new Error(`The setting #${readInput.id} needs a valid number or placeholder.`);
            }

            if (input.dataset.operatorType && input.dataset.operationSetting) {
                this.settings.updateOperationSetting(
                    input.dataset.operatorType as OperatorType,
                    input.dataset.operationSetting as "decimalPlaces" | "fractionDenominatorBound" | "fractionNumeratorBound",
                    value
                );
            } else if (input.dataset.operatorType && input.dataset.boundType) {
                this.settings.updateBound(input.dataset.operatorType as OperatorType,
                                          input.dataset.boundType,
                                          value);
            } else {
                this.settings.updateSetting(input.id, value);
            }
        }

        if (input.type === "checkbox") {
            if (input.dataset.numberType && input.dataset.operatorType) { // if this has a dataset.operatorType and dataset.numberType, is a checkbox for a question type, otherwise it is something else
                // make sure that the given operator type is enabled at the highest level
                const masterOperatorTypeEnabled = getRequiredElement<HTMLInputElement>(`${input.dataset.operatorType}Toggle`).checked;
                this.settings.updateQuestionType(input.dataset.numberType as NumberType, input.dataset.operatorType as OperatorType, readInput.checked && masterOperatorTypeEnabled);
            }

            const reverseSettings: Record<string, string> = {
                subtractionReverseToggle: "subtractionReversedAddition",
                divisionReverseToggle: "divisionReversedMultiplication"
            };
            const reverseSetting = reverseSettings[input.id];
            if (reverseSetting) this.settings.updateSetting(reverseSetting, input.checked);
        }
    }

    startGame = () => { // this has to be an arrow function for context reasons that I don't quite understand
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
        } catch (error) {
            this.handleGameError(error);
        }
    };

    updateQuestionDisplay() {
        const question = this.game.loadNextQuestion();
        this.leftQuestionEl.textContent = question.questionLeft;
        this.rightQuestionEl.textContent = question.questionRight;
    }

    endGame() {
        document.body.classList.remove("game-active");
        this.gameDiv.hidden = true;
        this.endDiv.hidden = false;
    }

    updateTimerDisplay(timeLeft: number): void {
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
        } catch (error) {
            this.handleGameError(error);
        }
    }

    private showGameScreen() {
        document.body.classList.add("game-active");
        this.settingsForm.hidden = true;
        this.description.hidden = true;
        this.endDiv.hidden = true;
        this.gameDiv.hidden = false;
    }

    private showSettingsScreen() {
        document.body.classList.remove("game-active");
        this.gameDiv.hidden = true;
        this.endDiv.hidden = true;
        this.settingsForm.hidden = false;
        this.description.hidden = false;
    }

    private handleGameError(error: unknown) {
        console.error(error);
        this.timer.stop();
        this.showSettingsScreen();
        alert(error instanceof Error ? error.message : "Unable to generate a question.");
    }

}
