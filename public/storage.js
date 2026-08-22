import { canonicalConfigurationKey, parseEffectiveConfiguration, parseSettingsSnapshot, } from "./settings.js";
export const STORAGE_KEY = "arithmetic.state.v1";
const EMPTY_STATE = () => ({
    schemaVersion: 1,
    presets: [],
    histories: [],
});
const UNAVAILABLE_STORAGE = {
    getItem: () => null,
    setItem: () => {
        throw new Error("Browser storage is unavailable.");
    },
};
let fallbackIdCounter = 0;
function defaultIdFactory() {
    const cryptoWithUuid = globalThis.crypto;
    if (typeof cryptoWithUuid?.randomUUID === "function") {
        return cryptoWithUuid.randomUUID();
    }
    fallbackIdCounter += 1;
    return `${Date.now().toString(36)}-${fallbackIdCounter.toString(36)}-${Math.random().toString(36).slice(2)}`;
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function clone(value) {
    return JSON.parse(JSON.stringify(value));
}
function requireSettingsSnapshot(value) {
    const parsed = parseSettingsSnapshot(value);
    if (parsed === null) {
        throw new TypeError("Invalid settings snapshot.");
    }
    return parsed;
}
function requireEffectiveConfiguration(value) {
    const parsed = parseEffectiveConfiguration(value);
    if (parsed === null) {
        throw new TypeError("Invalid effective configuration.");
    }
    return parsed;
}
function requireNonEmptyString(value, field) {
    if (typeof value !== "string" || value.trim() === "") {
        throw new TypeError(`${field} must be a non-empty string.`);
    }
    return value;
}
function requireIsoTimestamp(value, field) {
    const timestamp = requireNonEmptyString(value, field);
    const date = new Date(timestamp);
    if (!Number.isFinite(date.getTime()) || date.toISOString() !== timestamp) {
        throw new TypeError(`${field} must be a canonical ISO timestamp.`);
    }
    return timestamp;
}
function parseAttempt(value) {
    if (!isRecord(value)) {
        throw new TypeError("Invalid attempt record.");
    }
    const id = requireNonEmptyString(value.id, "Attempt ID");
    const startedAt = requireIsoTimestamp(value.startedAt, "Attempt start time");
    const completedAt = requireIsoTimestamp(value.completedAt, "Attempt completion time");
    const startedTime = Date.parse(startedAt);
    const completedTime = Date.parse(completedAt);
    if (!Number.isFinite(startedTime) || !Number.isFinite(completedTime)) {
        throw new TypeError("Attempt timestamps must be valid ISO date strings.");
    }
    if (completedTime < startedTime) {
        throw new RangeError("An attempt cannot finish before it starts.");
    }
    if (typeof value.score !== "number" || !Number.isInteger(value.score) || value.score < 0) {
        throw new TypeError("Attempt score must be a non-negative whole number.");
    }
    return { id, startedAt, completedAt, score: value.score };
}
function parsePersistedState(value) {
    if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.presets) || !Array.isArray(value.histories)) {
        throw new TypeError("Invalid versioned browser state.");
    }
    const state = EMPTY_STATE();
    if (value.lastUsedSettings !== undefined) {
        state.lastUsedSettings = requireSettingsSnapshot(value.lastUsedSettings);
    }
    const presetIds = new Set();
    const presetNames = new Set();
    state.presets = value.presets.map((candidate) => {
        if (!isRecord(candidate)) {
            throw new TypeError("Invalid saved preset.");
        }
        const id = requireNonEmptyString(candidate.id, "Preset ID");
        const name = requireNonEmptyString(candidate.name, "Preset name").trim();
        const normalizedName = name.toLowerCase();
        if (presetIds.has(id) || presetNames.has(normalizedName)) {
            throw new TypeError("Saved preset IDs and names must be unique.");
        }
        presetIds.add(id);
        presetNames.add(normalizedName);
        return {
            id,
            name,
            settings: requireSettingsSnapshot(candidate.settings),
        };
    });
    const attemptIds = new Set();
    const bucketByKey = new Map();
    for (const candidate of value.histories) {
        if (!isRecord(candidate) || !Array.isArray(candidate.attempts)) {
            throw new TypeError("Invalid history bucket.");
        }
        const configuration = requireEffectiveConfiguration(candidate.configuration);
        const key = canonicalConfigurationKey(configuration);
        let bucket = bucketByKey.get(key);
        if (bucket === undefined) {
            bucket = { configuration, attempts: [] };
            bucketByKey.set(key, bucket);
        }
        for (const rawAttempt of candidate.attempts) {
            const attempt = parseAttempt(rawAttempt);
            if (attemptIds.has(attempt.id)) {
                throw new TypeError("Attempt IDs must be unique.");
            }
            attemptIds.add(attempt.id);
            bucket.attempts.push(attempt);
        }
    }
    state.histories = Array.from(bucketByKey.values());
    return state;
}
function getDefaultStorage() {
    if (typeof globalThis.localStorage === "undefined") {
        throw new Error("Browser storage is unavailable.");
    }
    return globalThis.localStorage;
}
export class StatePersistenceError extends Error {
    constructor(cause) {
        super("Unable to save settings and attempt history in browser storage. Changes remain available for this session.");
        this.name = "StatePersistenceError";
        this.cause = cause;
    }
}
export class BrowserStateRepository {
    constructor(storage, idFactory = defaultIdFactory) {
        if (storage === undefined) {
            try {
                this.storage = getDefaultStorage();
            }
            catch (_error) {
                this.storage = UNAVAILABLE_STORAGE;
                this.loadWarning = "Browser storage is unavailable; settings and attempt history will only last for this session.";
            }
        }
        else {
            this.storage = storage;
        }
        this.idFactory = idFactory;
        this.state = this.load();
    }
    getLoadWarning() {
        return this.loadWarning;
    }
    getLastUsedSettings() {
        return this.state.lastUsedSettings === undefined
            ? undefined
            : clone(this.state.lastUsedSettings);
    }
    listPresets() {
        return clone(this.state.presets).sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" }));
    }
    findPresetByName(name) {
        const normalizedName = name.trim().toLowerCase();
        const preset = this.state.presets.find(candidate => candidate.name.toLowerCase() === normalizedName);
        return preset === undefined ? undefined : clone(preset);
    }
    savePreset(name, snapshot) {
        const trimmedName = name.trim();
        if (trimmedName === "") {
            throw new TypeError("Preset name must not be empty.");
        }
        const settings = requireSettingsSnapshot(snapshot);
        const normalizedName = trimmedName.toLowerCase();
        const existing = this.state.presets.find(candidate => candidate.name.toLowerCase() === normalizedName);
        let preset;
        if (existing === undefined) {
            preset = { id: this.idFactory(), name: trimmedName, settings };
            requireNonEmptyString(preset.id, "Preset ID");
            if (this.state.presets.some(candidate => candidate.id === preset.id)) {
                throw new Error(`A preset with ID "${preset.id}" already exists.`);
            }
            this.state.presets.push(preset);
        }
        else {
            existing.name = trimmedName;
            existing.settings = settings;
            preset = existing;
        }
        this.persist();
        return clone(preset);
    }
    deletePreset(id) {
        const index = this.state.presets.findIndex(candidate => candidate.id === id);
        if (index === -1) {
            return false;
        }
        this.state.presets.splice(index, 1);
        this.persist();
        return true;
    }
    saveLastUsedSettings(snapshot) {
        this.state.lastUsedSettings = requireSettingsSnapshot(snapshot);
        this.persist();
    }
    appendAttempt(configuration, input) {
        const parsedConfiguration = requireEffectiveConfiguration(configuration);
        const attempt = parseAttempt({
            ...input,
            id: input.id ?? this.idFactory(),
        });
        if (this.state.histories.some(bucket => bucket.attempts.some(candidate => candidate.id === attempt.id))) {
            throw new Error(`An attempt with ID "${attempt.id}" already exists.`);
        }
        const key = canonicalConfigurationKey(parsedConfiguration);
        let bucket = this.state.histories.find(candidate => canonicalConfigurationKey(candidate.configuration) === key);
        if (bucket === undefined) {
            bucket = { configuration: parsedConfiguration, attempts: [] };
            this.state.histories.push(bucket);
        }
        bucket.attempts.push(attempt);
        this.persist();
        return clone(attempt);
    }
    getAttempts(configuration) {
        const parsedConfiguration = requireEffectiveConfiguration(configuration);
        const key = canonicalConfigurationKey(parsedConfiguration);
        const bucket = this.state.histories.find(candidate => canonicalConfigurationKey(candidate.configuration) === key);
        return bucket === undefined ? [] : clone(bucket.attempts);
    }
    load() {
        let raw;
        try {
            raw = this.storage.getItem(STORAGE_KEY);
        }
        catch (_error) {
            this.loadWarning = "Browser storage is unavailable; settings and attempt history will only last for this session.";
            return EMPTY_STATE();
        }
        if (raw === null) {
            return EMPTY_STATE();
        }
        try {
            return parsePersistedState(JSON.parse(raw));
        }
        catch (_error) {
            this.loadWarning = "Saved settings and attempt history could not be loaded; starting with empty browser data.";
            return EMPTY_STATE();
        }
    }
    persist() {
        try {
            this.storage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        }
        catch (error) {
            throw new StatePersistenceError(error);
        }
    }
}
