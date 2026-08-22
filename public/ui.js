import { Game } from "./game.js";
import { renderHistoryGraph } from "./history-graph.js";
import { applySettingsSnapshot, captureSettingsSnapshot, synchronizeDependentOptions } from "./settings-form.js";
import { DEFAULT_SETTINGS_SNAPSHOT, Settings } from "./settings.js";
import { BrowserStateRepository, StatePersistenceError } from "./storage.js";
import { Timer } from "./timer.js";
function getRequiredElement(id) {
    const element = document.getElementById(id);
    if (element === null) {
        throw new Error(`Required element #${id} was not found. Check that the deployed HTML and JavaScript versions match.`);
    }
    return element;
}
export class UI {
    constructor() {
        this.score = 0;
        this.activeAttempt = null;
        this.startGame = () => {
            if (this.activeAttempt !== null)
                return;
            try {
                const snapshot = this.captureCurrentSnapshot();
                this.settings.applySnapshot(snapshot);
                if (this.settings.validQuestionTypes.length === 0) {
                    throw new RangeError("Please select at least one question type.");
                }
                const duration = this.settings.getSetting("timeLimit");
                if (typeof duration !== "number" || !Number.isInteger(duration) || duration <= 0) {
                    throw new RangeError("The time limit must be a positive whole number.");
                }
                this.score = 0;
                this.game.startGame();
                this.answerInput.value = "";
                this.updateQuestionDisplay();
                this.updateScoreDisplay();
                this.activeAttempt = {
                    configuration: this.settings.toEffectiveConfiguration(),
                    startedAt: new Date().toISOString()
                };
                try {
                    this.repository.saveLastUsedSettings(snapshot);
                    this.setStorageStatus("");
                }
                catch (error) {
                    this.reportPersistenceError(error);
                }
                this.showGameScreen();
                this.timer.start(duration);
                this.answerInput.focus();
            }
            catch (error) {
                this.handleGameError(error);
            }
        };
        this.settingsForm = getRequiredElement("settings");
        this.gameDiv = getRequiredElement("game");
        this.endDiv = getRequiredElement("ending");
        this.description = getRequiredElement("description");
        this.timerEl = getRequiredElement("timer");
        this.leftQuestionEl = getRequiredElement("left-question");
        this.rightQuestionEl = getRequiredElement("right-question");
        this.answerInput = getRequiredElement("answerInput");
        this.scoreEl = getRequiredElement("score");
        this.endScoreEl = getRequiredElement("endScore");
        this.endScreenHomeButton = getRequiredElement("end-screen-home-button");
        this.startButtons = document.querySelectorAll(".start-game");
        this.presetName = getRequiredElement("presetName");
        this.presetSelect = getRequiredElement("presetSelect");
        this.savePresetButton = getRequiredElement("savePresetButton");
        this.loadPresetButton = getRequiredElement("loadPresetButton");
        this.deletePresetButton = getRequiredElement("deletePresetButton");
        this.storageStatus = getRequiredElement("storageStatus");
        this.history = getRequiredElement("history");
        this.historyEmpty = getRequiredElement("historyEmpty");
        this.historyGraph = getRequiredElement("historyGraph");
        this.repository = new BrowserStateRepository();
        const initialSnapshot = this.repository.getLastUsedSettings() ?? DEFAULT_SETTINGS_SNAPSHOT;
        this.settings = new Settings(initialSnapshot);
        this.game = new Game(this.settings);
        this.timer = new Timer(timeLeft => this.updateTimerDisplay(timeLeft), () => this.endGame());
        applySettingsSnapshot(this.settingsForm, initialSnapshot);
        this.attachListeners();
        this.renderPresetOptions();
        this.renderHistoryForSnapshot(initialSnapshot);
        const loadWarning = this.repository.getLoadWarning();
        if (loadWarning !== undefined)
            this.setStorageStatus(loadWarning, true);
    }
    attachListeners() {
        this.startButtons.forEach(button => button.addEventListener("click", this.startGame));
        this.endScreenHomeButton.addEventListener("click", () => {
            this.timer.stop();
            this.showSettingsScreen();
        });
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
        this.settingsForm.addEventListener("change", event => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement) || target.closest(".preset-controls") !== null)
                return;
            synchronizeDependentOptions(this.settingsForm);
            this.renderCurrentHistory();
        });
        this.presetSelect.addEventListener("change", () => this.updatePresetButtons());
        this.savePresetButton.addEventListener("click", () => this.savePreset());
        this.loadPresetButton.addEventListener("click", () => this.loadPreset());
        this.deletePresetButton.addEventListener("click", () => this.deletePreset());
    }
    updateQuestionDisplay() {
        const question = this.game.loadNextQuestion();
        this.leftQuestionEl.textContent = question.questionLeft;
        this.rightQuestionEl.textContent = question.questionRight;
    }
    endGame() {
        this.timer.stop();
        const attempt = this.activeAttempt;
        this.activeAttempt = null;
        if (attempt !== null) {
            try {
                this.repository.appendAttempt(attempt.configuration, {
                    startedAt: attempt.startedAt,
                    completedAt: new Date().toISOString(),
                    score: this.score
                });
                this.setStorageStatus("");
            }
            catch (error) {
                this.reportPersistenceError(error);
            }
            this.renderHistoryForConfiguration(attempt.configuration);
        }
        document.body.classList.remove("game-active");
        this.gameDiv.hidden = true;
        this.endDiv.hidden = false;
        this.storageStatus.hidden = false;
        this.history.hidden = false;
    }
    updateTimerDisplay(timeLeft) {
        this.timerEl.textContent = timeLeft.toString();
    }
    updateScoreDisplay() {
        this.scoreEl.textContent = this.score.toString();
        this.endScoreEl.textContent = this.score.toString();
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
    captureCurrentSnapshot() {
        return captureSettingsSnapshot(this.settingsForm, this.settings.toSnapshot());
    }
    savePreset() {
        try {
            const name = this.presetName.value.trim();
            if (name === "")
                throw new RangeError("Enter a name for these settings.");
            if (name.length > 60)
                throw new RangeError("Preset names can contain at most 60 characters.");
            const snapshot = this.captureCurrentSnapshot();
            const existing = this.repository.findPresetByName(name);
            if (existing !== undefined && !window.confirm(`Replace the saved settings named “${existing.name}”?`)) {
                return;
            }
            this.settings.applySnapshot(snapshot);
            let savedPreset;
            try {
                savedPreset = this.repository.savePreset(name, snapshot);
                this.setStorageStatus(existing === undefined ? `Saved “${name}”.` : `Updated “${name}”.`);
            }
            catch (error) {
                this.reportPersistenceError(error);
                savedPreset = this.repository.findPresetByName(name);
            }
            this.renderPresetOptions(savedPreset?.id);
            this.renderHistoryForSnapshot(snapshot);
        }
        catch (error) {
            this.setStorageStatus(error instanceof Error ? error.message : "Unable to save these settings.", true);
        }
    }
    loadPreset() {
        const preset = this.getSelectedPreset();
        if (preset === undefined)
            return;
        try {
            applySettingsSnapshot(this.settingsForm, preset.settings);
            this.settings.applySnapshot(preset.settings);
            this.presetName.value = preset.name;
            this.setStorageStatus(`Loaded “${preset.name}”.`);
            this.renderHistoryForSnapshot(preset.settings);
        }
        catch (error) {
            this.setStorageStatus(error instanceof Error ? error.message : "Unable to load these settings.", true);
        }
    }
    deletePreset() {
        const preset = this.getSelectedPreset();
        if (preset === undefined)
            return;
        if (!window.confirm(`Delete “${preset.name}”? Its attempt history will be kept.`))
            return;
        try {
            this.repository.deletePreset(preset.id);
            this.setStorageStatus(`Deleted “${preset.name}”. Attempt history was kept.`);
        }
        catch (error) {
            this.reportPersistenceError(error);
        }
        if (this.presetName.value.trim().toLowerCase() === preset.name.toLowerCase()) {
            this.presetName.value = "";
        }
        this.renderPresetOptions();
    }
    getSelectedPreset() {
        const selectedId = this.presetSelect.value;
        if (selectedId === "")
            return undefined;
        return this.repository.listPresets().find(preset => preset.id === selectedId);
    }
    renderPresetOptions(selectedId = "") {
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Choose saved settings";
        this.presetSelect.replaceChildren(placeholder);
        for (const preset of this.repository.listPresets()) {
            const option = document.createElement("option");
            option.value = preset.id;
            option.textContent = preset.name;
            option.selected = preset.id === selectedId;
            this.presetSelect.append(option);
        }
        this.updatePresetButtons();
    }
    updatePresetButtons() {
        const hasSelection = this.presetSelect.value !== "";
        this.loadPresetButton.disabled = !hasSelection;
        this.deletePresetButton.disabled = !hasSelection;
    }
    renderCurrentHistory() {
        try {
            this.renderHistoryForSnapshot(this.captureCurrentSnapshot());
        }
        catch (_error) {
            this.showEmptyHistory("Finish entering valid settings to view their history.");
        }
    }
    renderHistoryForSnapshot(snapshot) {
        const temporarySettings = new Settings(snapshot);
        if (temporarySettings.validQuestionTypes.length === 0) {
            this.showEmptyHistory("Select at least one question type to view its history.");
            return;
        }
        this.renderHistoryForConfiguration(temporarySettings.toEffectiveConfiguration());
    }
    renderHistoryForConfiguration(configuration) {
        this.historyEmpty.textContent = "No completed attempts for these settings yet.";
        renderHistoryGraph(this.historyGraph, this.historyEmpty, this.repository.getAttempts(configuration));
    }
    showEmptyHistory(message) {
        this.historyEmpty.textContent = message;
        renderHistoryGraph(this.historyGraph, this.historyEmpty, []);
    }
    showGameScreen() {
        document.body.classList.add("game-active");
        this.settingsForm.hidden = true;
        this.description.hidden = true;
        this.endDiv.hidden = true;
        this.storageStatus.hidden = true;
        this.history.hidden = true;
        this.gameDiv.hidden = false;
    }
    showSettingsScreen() {
        document.body.classList.remove("game-active");
        this.gameDiv.hidden = true;
        this.endDiv.hidden = true;
        this.settingsForm.hidden = false;
        this.description.hidden = false;
        this.storageStatus.hidden = false;
        this.history.hidden = false;
        this.renderCurrentHistory();
    }
    setStorageStatus(message, isError = false) {
        this.storageStatus.textContent = message;
        this.storageStatus.hidden = false;
        this.storageStatus.classList.toggle("error", isError);
        this.storageStatus.dataset.status = isError ? "error" : "success";
    }
    reportPersistenceError(error) {
        if (error instanceof StatePersistenceError || error instanceof Error) {
            this.setStorageStatus(error.message, true);
        }
        else {
            this.setStorageStatus("Unable to use browser storage. Changes will only last for this session.", true);
        }
    }
    handleGameError(error) {
        console.error(error);
        this.timer.stop();
        this.activeAttempt = null;
        this.showSettingsScreen();
        window.alert(error instanceof Error ? error.message : "Unable to generate a question.");
    }
}
