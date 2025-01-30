import { Game } from "./game.js";
import { Timer } from "./timer.js";
import { Settings } from "./settings.js";

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

    constructor(game: Game) {

        this.settings = new Settings();
        this.game = new Game;
        this.gameDiv = document.getElementById("game") as HTMLDivElement;
        this.startButtons = document.querySelectorAll<HTMLButtonElement>(".start-game");
        this.endDiv = document.getElementById("ending") as HTMLDivElement;
        this.settingsForm = document.getElementById("settings") as HTMLFormElement;
        this.description = document.getElementById("description") as HTMLDivElement;
        this.timerEl = document.getElementById("timer") as HTMLSpanElement;
        this.questionEl = document.getElementById("question") as HTMLParagraphElement;
        this.answerInput = document.getElementById("answerInput") as HTMLInputElement;
    
        console.log(this.settingsForm);
        this.assignDefaults();
        this.attachListeners();

        // create the timer
        this.timerEl = document.getElementById("timer")!;
        this.timer = new Timer(
        //    this.settings.getBound('timeLimit'), // Initial duration
            (timeLeft) => this.updateTimerDisplay(timeLeft), // Update UI
            () => this.endGame() // Handle game end
        );
        console.log("UI activated");

    } 

    private assignDefaults () {
        const form = document.getElementById("settings") as HTMLFormElement;
        form.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
            if (input.type === "number") this.settings.updateBound(input.id, parseInt(input.placeholder));
            if (input.type === "checkbox") this.settings.updateToggle(input.id, input.checked);
        });
    }

    private attachListeners() {
        // attach listeners to all input elements in the settings form
        console.log("attaching listeners to input elements...");
        const form = document.getElementById("settings") as HTMLFormElement;
        if (!form) return;

        form.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
            const settingKey = input.dataset.setting;

            input.addEventListener("input", () => {
                if (input.type === "number") this.settings.updateBound(input.id, input.valueAsNumber);
                if (input.type === "checkbox") this.settings.updateToggle(input.id, input.checked);

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
            if (this.game.checkAnswer(this.answerInput.value)) this.updateQuestionDisplay();
        });

    }

    startGame = () => { // this has to be an arrow function for context reasons that I don't quite understand
        console.log("Starting the game");
        this.timer.start(this.settings.getBound("timeLimit"));
        this.updateTimerDisplay(this.settings.getBound("timeLimit"));
        this.settingsForm.style.display = "none";
        this.endDiv.style.display = "none";
        this.gameDiv.style.display = "block";
        this.description.style.display = "none";
        this.updateQuestionDisplay();
    };

    updateQuestionDisplay() {
        this.questionEl.innerHTML = this.game.loadNextQuestion();
    }

    endGame() {
        console.log("Ending the game");
        this.gameDiv.style.display = "none";
        this.endDiv.style.display = "block";
    }

    updateTimerDisplay(timeLeft: number): void {
        console.log(timeLeft);
        this.timerEl.textContent = timeLeft.toString();
    }


}
