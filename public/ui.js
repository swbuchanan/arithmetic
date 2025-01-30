import { Settings } from "./settings.js";
export class UI {
    constructor() {
        this.settings = new Settings();
        this.gameDiv = document.getElementById("game");
        this.startButtons = document.querySelectorAll(".start-game");
        this.settingsForm = document.getElementById("settings");
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
    }
}
