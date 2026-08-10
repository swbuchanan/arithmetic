import { Game } from "./game.js";
import { renderHistoryGraph } from "./history-graph.js";
import {
    applySettingsSnapshot,
    captureSettingsSnapshot,
    synchronizeDependentOptions
} from "./settings-form.js";
import { DEFAULT_SETTINGS_SNAPSHOT, Settings } from "./settings.js";
import type { EffectiveConfiguration, SettingsSnapshot } from "./settings.js";
import {
    BrowserStateRepository,
    StatePersistenceError
} from "./storage.js";
import type { SavedPreset } from "./storage.js";
import { Timer } from "./timer.js";

function getRequiredElement<T extends Element>(id: string): T {
    const element = document.getElementById(id);
    if (element === null) {
        throw new Error(`Required element #${id} was not found. Check that the deployed HTML and JavaScript versions match.`);
    }
    return element as unknown as T;
}

type ActiveAttempt = {
    configuration: EffectiveConfiguration;
    startedAt: string;
};

export class UI {
    private readonly settings: Settings;
    private readonly timer: Timer;
    private readonly game: Game;
    private readonly repository: BrowserStateRepository;
    private readonly timerEl: HTMLSpanElement;
    private readonly leftQuestionEl: HTMLSpanElement;
    private readonly rightQuestionEl: HTMLSpanElement;
    private readonly gameDiv: HTMLElement;
    private readonly endDiv: HTMLElement;
    private readonly answerInput: HTMLInputElement;
    private readonly startButtons: NodeListOf<HTMLButtonElement>;
    private readonly endScreenHomeButton: HTMLButtonElement;
    private readonly settingsForm: HTMLFormElement;
    private readonly description: HTMLElement;
    private readonly scoreEl: HTMLSpanElement;
    private readonly endScoreEl: HTMLSpanElement;
    private readonly presetName: HTMLInputElement;
    private readonly presetSelect: HTMLSelectElement;
    private readonly savePresetButton: HTMLButtonElement;
    private readonly loadPresetButton: HTMLButtonElement;
    private readonly deletePresetButton: HTMLButtonElement;
    private readonly storageStatus: HTMLElement;
    private readonly history: HTMLElement;
    private readonly historyEmpty: HTMLElement;
    private readonly historyGraph: SVGSVGElement;
    private score = 0;
    private activeAttempt: ActiveAttempt | null = null;

    constructor() {
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
        this.startButtons = document.querySelectorAll<HTMLButtonElement>(".start-game");
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
        this.timer = new Timer(
            timeLeft => this.updateTimerDisplay(timeLeft),
            () => this.endGame()
        );

        applySettingsSnapshot(this.settingsForm, initialSnapshot);
        this.attachListeners();
        this.renderPresetOptions();
        this.renderHistoryForSnapshot(initialSnapshot);

        const loadWarning = this.repository.getLoadWarning();
        if (loadWarning !== undefined) this.setStorageStatus(loadWarning, true);
    }

    private attachListeners(): void {
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
            if (this.game.checkAnswer(this.answerInput.value)) this.processCorrectAnswer();
        });

        this.settingsForm.addEventListener("change", event => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement) || target.closest(".preset-controls") !== null) return;
            synchronizeDependentOptions(this.settingsForm);
            this.renderCurrentHistory();
        });

        this.presetSelect.addEventListener("change", () => this.updatePresetButtons());
        this.savePresetButton.addEventListener("click", () => this.savePreset());
        this.loadPresetButton.addEventListener("click", () => this.loadPreset());
        this.deletePresetButton.addEventListener("click", () => this.deletePreset());
    }

    startGame = (): void => {
        if (this.activeAttempt !== null) return;

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
            } catch (error) {
                this.reportPersistenceError(error);
            }

            this.showGameScreen();
            this.timer.start(duration);
            this.answerInput.focus();
        } catch (error) {
            this.handleGameError(error);
        }
    };

    private updateQuestionDisplay(): void {
        const question = this.game.loadNextQuestion();
        this.leftQuestionEl.textContent = question.questionLeft;
        this.rightQuestionEl.textContent = question.questionRight;
    }

    private endGame(): void {
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
            } catch (error) {
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

    private updateTimerDisplay(timeLeft: number): void {
        this.timerEl.textContent = timeLeft.toString();
    }

    private updateScoreDisplay(): void {
        this.scoreEl.textContent = this.score.toString();
        this.endScoreEl.textContent = this.score.toString();
    }

    private processCorrectAnswer(): void {
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

    private captureCurrentSnapshot(): SettingsSnapshot {
        return captureSettingsSnapshot(this.settingsForm, this.settings.toSnapshot());
    }

    private savePreset(): void {
        try {
            const name = this.presetName.value.trim();
            if (name === "") throw new RangeError("Enter a name for these settings.");
            if (name.length > 60) throw new RangeError("Preset names can contain at most 60 characters.");

            const snapshot = this.captureCurrentSnapshot();
            const existing = this.repository.findPresetByName(name);
            if (existing !== undefined && !window.confirm(`Replace the saved settings named “${existing.name}”?`)) {
                return;
            }

            this.settings.applySnapshot(snapshot);
            let savedPreset: SavedPreset | undefined;
            try {
                savedPreset = this.repository.savePreset(name, snapshot);
                this.setStorageStatus(existing === undefined ? `Saved “${name}”.` : `Updated “${name}”.`);
            } catch (error) {
                this.reportPersistenceError(error);
                savedPreset = this.repository.findPresetByName(name);
            }
            this.renderPresetOptions(savedPreset?.id);
            this.renderHistoryForSnapshot(snapshot);
        } catch (error) {
            this.setStorageStatus(error instanceof Error ? error.message : "Unable to save these settings.", true);
        }
    }

    private loadPreset(): void {
        const preset = this.getSelectedPreset();
        if (preset === undefined) return;

        try {
            applySettingsSnapshot(this.settingsForm, preset.settings);
            this.settings.applySnapshot(preset.settings);
            this.presetName.value = preset.name;
            this.setStorageStatus(`Loaded “${preset.name}”.`);
            this.renderHistoryForSnapshot(preset.settings);
        } catch (error) {
            this.setStorageStatus(error instanceof Error ? error.message : "Unable to load these settings.", true);
        }
    }

    private deletePreset(): void {
        const preset = this.getSelectedPreset();
        if (preset === undefined) return;
        if (!window.confirm(`Delete “${preset.name}”? Its attempt history will be kept.`)) return;

        try {
            this.repository.deletePreset(preset.id);
            this.setStorageStatus(`Deleted “${preset.name}”. Attempt history was kept.`);
        } catch (error) {
            this.reportPersistenceError(error);
        }

        if (this.presetName.value.trim().toLowerCase() === preset.name.toLowerCase()) {
            this.presetName.value = "";
        }
        this.renderPresetOptions();
    }

    private getSelectedPreset(): SavedPreset | undefined {
        const selectedId = this.presetSelect.value;
        if (selectedId === "") return undefined;
        return this.repository.listPresets().find(preset => preset.id === selectedId);
    }

    private renderPresetOptions(selectedId = ""): void {
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

    private updatePresetButtons(): void {
        const hasSelection = this.presetSelect.value !== "";
        this.loadPresetButton.disabled = !hasSelection;
        this.deletePresetButton.disabled = !hasSelection;
    }

    private renderCurrentHistory(): void {
        try {
            this.renderHistoryForSnapshot(this.captureCurrentSnapshot());
        } catch (_error) {
            this.showEmptyHistory("Finish entering valid settings to view their history.");
        }
    }

    private renderHistoryForSnapshot(snapshot: SettingsSnapshot): void {
        const temporarySettings = new Settings(snapshot);
        if (temporarySettings.validQuestionTypes.length === 0) {
            this.showEmptyHistory("Select at least one question type to view its history.");
            return;
        }
        this.renderHistoryForConfiguration(temporarySettings.toEffectiveConfiguration());
    }

    private renderHistoryForConfiguration(configuration: EffectiveConfiguration): void {
        this.historyEmpty.textContent = "No completed attempts for these settings yet.";
        renderHistoryGraph(this.historyGraph, this.historyEmpty, this.repository.getAttempts(configuration));
    }

    private showEmptyHistory(message: string): void {
        this.historyEmpty.textContent = message;
        renderHistoryGraph(this.historyGraph, this.historyEmpty, []);
    }

    private showGameScreen(): void {
        document.body.classList.add("game-active");
        this.settingsForm.hidden = true;
        this.description.hidden = true;
        this.endDiv.hidden = true;
        this.storageStatus.hidden = true;
        this.history.hidden = true;
        this.gameDiv.hidden = false;
    }

    private showSettingsScreen(): void {
        document.body.classList.remove("game-active");
        this.gameDiv.hidden = true;
        this.endDiv.hidden = true;
        this.settingsForm.hidden = false;
        this.description.hidden = false;
        this.storageStatus.hidden = false;
        this.history.hidden = false;
        this.renderCurrentHistory();
    }

    private setStorageStatus(message: string, isError = false): void {
        this.storageStatus.textContent = message;
        this.storageStatus.hidden = false;
        this.storageStatus.classList.toggle("error", isError);
        this.storageStatus.dataset.status = isError ? "error" : "success";
    }

    private reportPersistenceError(error: unknown): void {
        if (error instanceof StatePersistenceError || error instanceof Error) {
            this.setStorageStatus(error.message, true);
        } else {
            this.setStorageStatus("Unable to use browser storage. Changes will only last for this session.", true);
        }
    }

    private handleGameError(error: unknown): void {
        console.error(error);
        this.timer.stop();
        this.activeAttempt = null;
        this.showSettingsScreen();
        window.alert(error instanceof Error ? error.message : "Unable to generate a question.");
    }
}
