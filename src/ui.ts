import { Game } from "./game.js";
import { Timer } from "./timer.js";
import { Settings } from "./settings.js";

export class UI {

    private settings: Settings;

    private gameDiv:HTMLDivElement;
    private endDiv:HTMLDivElement;
    private startButtons:NodeListOf<HTMLButtonElement>;
    private settingsForm:HTMLFormElement;
    private description:HTMLDivElement;

    constructor() {

        this.settings = new Settings();
        this.gameDiv = document.getElementById("game") as HTMLDivElement;
        this.startButtons = document.querySelectorAll<HTMLButtonElement>(".start-game");
        this.endDiv = document.getElementById("ending") as HTMLDivElement;
        this.settingsForm = document.getElementById("settings") as HTMLFormElement;
        this.description = document.getElementById("description") as HTMLDivElement;
    
        console.log(this.settingsForm);
        this.attachListeners();
        console.log("UI activated");
    } 

    private attachListeners() {
        // attach listeners to all input elements in the settings form
        console.log("attaching listeners to input elements...");
        const form = document.getElementById("settings") as HTMLFormElement;
        if (!form) return;

        form.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
            const settingKey = input.dataset.setting;

            input.addEventListener("input", () => {
                console.log(input);
                this.settings.updateSetting(input);
            });
        });

        // start game buttons
        this.startButtons.forEach((button) => {
            button.addEventListener("click", this.startGame);
        });
    }

    startGame = () => { // this has to be an arrow function for context reasons that I don't quit understand
        // this.timer.start();
        console.log("Starting the game");
        this.settingsForm.style.display = "none";
        this.endDiv.style.display = "none";
        this.gameDiv.style.display = "block";
        this.description.style.display = "none";
    };

    endGame() {
        console.log("Ending the game");
        this.gameDiv.style.display = "none";
        this.endDiv.style.display = "block";
    }



}
