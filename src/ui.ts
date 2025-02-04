import { Game } from "./game.js";
import { Timer } from "./timer.js";
import { Settings } from "./settings.js";
import { NumberType, OperatorType } from "./question.js";

export class UI {

    private settings: Settings;
    private timer: Timer;
    private game: Game;
    private timerEl:HTMLSpanElement;
    private questionEl:HTMLParagraphElement;
    private gameDiv:HTMLDivElement;
    private endDiv:HTMLDivElement;
    private answerInput:HTMLInputElement;
    private startButtons:NodeListOf<HTMLButtonElement>;
    private settingsForm:HTMLFormElement;
    private description:HTMLDivElement;

    constructor() {

        this.settings = new Settings();
        this.game = new Game(this.settings);
        this.gameDiv = document.getElementById("game") as HTMLDivElement;
        this.startButtons = document.querySelectorAll<HTMLButtonElement>(".start-game");
        this.endDiv = document.getElementById("ending") as HTMLDivElement;
        this.settingsForm = document.getElementById("settings") as HTMLFormElement;
        this.description = document.getElementById("description") as HTMLDivElement;
        this.timerEl = document.getElementById("timer") as HTMLSpanElement;
        this.questionEl = document.getElementById("question") as HTMLParagraphElement;
        this.answerInput = document.getElementById("answerInput") as HTMLInputElement;
    
        // create the timer
        this.timerEl = document.getElementById("timer")!;
        this.timer = new Timer(
            (timeLeft) => this.updateTimerDisplay(timeLeft), // Update UI
            () => this.endGame() // Handle game end
        );

        // assign data operator types to the input elements
        for (const settingType of ["addition-settings", "subtraction-settings", "multiplication-settings", "division-settings"]) {
            const parentDiv = document.getElementById(settingType) as HTMLElement;
            
            if (parentDiv) {
                parentDiv.querySelectorAll<HTMLInputElement>("input").forEach(button => {
                    button.dataset.operatorType = parentDiv.dataset.operatorType;
                });
            }
        }

        // get the default values determined by the html
        this.assignDefaults();

        // attach listeners to the start buttons and the answer input box
        this.attachListeners();
    } 

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

        // user's answer box
        this.answerInput.addEventListener("input", () => {
            if (this.game.checkAnswer(this.answerInput.value)) this.processCorrectAnswer();
        });

        // we also need listeners on all the checkboxes that change the display of other elements
        // I guess for now I'll just handle these one at a time but there should be a better way
        this.

    }

    // Go through all the user-changeable settings on the page and update the settings accordingly
    private readSettings() {
    
        this.settingsForm.querySelectorAll<HTMLInputElement>("input").forEach((input) => {

            this.updateSetting(input);

        });

    }

    /**
     * Given an input element, which should be either a text/number box or a checkbox, processes it in the appropriate way
     *
     *
     */
    updateSetting(input: HTMLInputElement) {

        if (input.type === "number") {
            // if there is a valid number in the input, we want to use that, otherwise use the default value
            if (input.valueAsNumber) {
//                this.settings.updateBound(input.id, input.valueAsNumber);
                if (input.dataset.operatorType && input.dataset.boundType) this.settings.updateBound(input.dataset.operatorType, input.dataset.boundType, input.valueAsNumber);
            } else {
                // this.settings.updateBound(input.id, parseInt(input.placeholder));
                if (input.dataset.operatorType && input.dataset.boundType) this.settings.updateBound(input.dataset.operatorType, input.dataset.boundType, parseInt(input.placeholder));
            }
        }

        if (input.type === "checkbox") {

            // if this has a dataset.operatorType and dataset.numberType, is a checkbox for a question type, otherwise it is something else
            if (input.dataset.numberType && input.dataset.operatorType) {

                let masterNumberTypeEnabled = (document.getElementById(input.dataset.operatorType as string + "Toggle") as HTMLInputElement).checked;
                this.settings.updateQuestionType(input.dataset.numberType as NumberType, input.dataset.operatorType as OperatorType, input.checked && masterNumberTypeEnabled );
            }
        }
    }

    startGame = () => { // this has to be an arrow function for context reasons that I don't quite understand
        console.log("Starting the game");
        // check to see which question types are enabled and update the settings
        this.readSettings();

        // start the game logic
        this.game.startGame();

        // start the timer and update its display
        this.timer.start(this.settings.getSetting("timeLimit") as number);
        this.updateTimerDisplay(this.settings.getSetting("timeLimit") as number);

        // make sure only the game is showing
        this.settingsForm.style.display = "none";
        this.endDiv.style.display = "none";
        this.description.style.display = "none";
        this.gameDiv.style.display = "block";

        // load the next question and make sure the answer box is in focus
        this.updateQuestionDisplay();
    };

    updateQuestionDisplay() {
        this.questionEl.innerHTML = this.game.loadNextQuestion();
        this.answerInput.focus();
    }

    endGame() {
        console.log("Ending the game");
        this.gameDiv.style.display = "none";
        this.endDiv.style.display = "block";
    }

    updateTimerDisplay(timeLeft: number): void {
        this.timerEl.textContent = timeLeft.toString();
    }

    processCorrectAnswer() {
        this.updateQuestionDisplay();   // load the next question
        this.answerInput.value = "";    // clear the input box
        this.answerInput.focus();
    }


}
