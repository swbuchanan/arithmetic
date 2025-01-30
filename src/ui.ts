import { Game } from "./game.js";
import { Timer } from "./timer.js";
import { Settings } from "./settings.js";

export class UI {

    private settings: Settings;

    private gameDiv:HTMLDivElement;
    private startButtons:NodeListOf<HTMLButtonElement>;
    private settingsForm:HTMLFormElement;

    constructor() {

        this.settings = new Settings();
        this.gameDiv = document.getElementById("game") as HTMLDivElement;
        this.startButtons = document.querySelectorAll<HTMLButtonElement>(".start-game");
        this.settingsForm = document.getElementById("settings") as HTMLFormElement;
    
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
    }

}
