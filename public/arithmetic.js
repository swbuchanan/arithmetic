import { UI } from "./ui.js";
import { Game } from "./game.js";
document.addEventListener("DOMContentLoaded", () => {
    // this is the main game file
    let game = new Game();
    let ui = new UI(game);
});
