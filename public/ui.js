import { Settings } from "./settings.js";
export class UI {
    constructor() {
        this.startGame = () => {
            // this.timer.start();
            console.log("Starting the game");
            this.settingsForm.style.display = "none";
            this.endDiv.style.display = "none";
            this.gameDiv.style.display = "block";
            this.description.style.display = "none";
        };
        this.settings = new Settings();
        this.gameDiv = document.getElementById("game");
        this.startButtons = document.querySelectorAll(".start-game");
        this.endDiv = document.getElementById("ending");
        this.settingsForm = document.getElementById("settings");
        this.description = document.getElementById("description");
        console.log(this.settingsForm);
        this.attachListeners();
        console.log("UI activated");
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
                console.log(input);
                this.settings.updateSetting(input);
            });
        });
        // start game buttons
        this.startButtons.forEach((button) => {
            button.addEventListener("click", this.startGame);
        });
    }
    endGame() {
        console.log("Ending the game");
        this.gameDiv.style.display = "none";
        this.endDiv.style.display = "block";
    }
}
