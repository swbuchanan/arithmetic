import test from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_SETTINGS_SNAPSHOT, Settings } from "../public/settings.js";
import {
    BrowserStateRepository,
    StatePersistenceError,
    STORAGE_KEY,
} from "../public/storage.js";

class MemoryStorage {
    values = new Map();
    failReads = false;
    failWrites = false;

    getItem(key) {
        if (this.failReads) throw new Error("Storage read failed");
        return this.values.get(key) ?? null;
    }

    setItem(key, value) {
        if (this.failWrites) throw new Error("Storage quota exceeded");
        this.values.set(key, value);
    }
}

function copy(value) {
    return JSON.parse(JSON.stringify(value));
}

function ids(...values) {
    let index = 0;
    return () => values[index++] ?? `generated-${index}`;
}

function configurationFor(snapshot) {
    return new Settings(snapshot).toEffectiveConfiguration();
}

function attempt(score, id) {
    return {
        ...(id === undefined ? {} : { id }),
        startedAt: "2026-08-10T01:00:00.000Z",
        completedAt: "2026-08-10T01:02:00.000Z",
        score,
    };
}

test("an empty or corrupt storage value loads defensively", () => {
    const emptyStorage = new MemoryStorage();
    const emptyRepository = new BrowserStateRepository(emptyStorage);

    assert.equal(emptyRepository.getLoadWarning(), undefined);
    assert.equal(emptyRepository.getLastUsedSettings(), undefined);
    assert.deepEqual(emptyRepository.listPresets(), []);

    const corruptStorage = new MemoryStorage();
    corruptStorage.values.set(STORAGE_KEY, "{not-json");
    const corruptRepository = new BrowserStateRepository(corruptStorage);

    assert.match(corruptRepository.getLoadWarning(), /could not be loaded/i);
    assert.deepEqual(corruptRepository.listPresets(), []);

    corruptStorage.values.set(STORAGE_KEY, JSON.stringify({ schemaVersion: 99 }));
    const wrongVersionRepository = new BrowserStateRepository(corruptStorage);
    assert.match(wrongVersionRepository.getLoadWarning(), /could not be loaded/i);
});

test("persisted attempts require canonical ISO timestamps", () => {
    const storage = new MemoryStorage();
    const repository = new BrowserStateRepository(storage);
    repository.appendAttempt(configurationFor(copy(DEFAULT_SETTINGS_SNAPSHOT)), attempt(5, "timestamp-test"));

    const state = JSON.parse(storage.values.get(STORAGE_KEY));
    state.histories[0].attempts[0].completedAt = "August 10, 2026 01:02:00 UTC";
    storage.values.set(STORAGE_KEY, JSON.stringify(state));

    const reloaded = new BrowserStateRepository(storage);
    assert.match(reloaded.getLoadWarning(), /could not be loaded/i);
    assert.deepEqual(reloaded.getAttempts(configurationFor(copy(DEFAULT_SETTINGS_SNAPSHOT))), []);
});

test("last-used settings survive a repository round trip and are returned by value", () => {
    const storage = new MemoryStorage();
    const snapshot = copy(DEFAULT_SETTINGS_SNAPSHOT);
    snapshot.timeLimit = 75;

    const repository = new BrowserStateRepository(storage);
    repository.saveLastUsedSettings(snapshot);

    snapshot.timeLimit = 15;
    const returned = repository.getLastUsedSettings();
    returned.timeLimit = 30;

    assert.equal(repository.getLastUsedSettings().timeLimit, 75);
    assert.equal(new BrowserStateRepository(storage).getLastUsedSettings().timeLimit, 75);
});

test("preset names upsert case-insensitively, preserve IDs, sort, and delete independently", () => {
    const storage = new MemoryStorage();
    const repository = new BrowserStateRepository(storage, ids("preset-beta", "preset-alpha"));
    const original = copy(DEFAULT_SETTINGS_SNAPSHOT);
    const replacement = copy(DEFAULT_SETTINGS_SNAPSHOT);
    replacement.timeLimit = 45;

    const beta = repository.savePreset("Beta", original);
    repository.savePreset("Alpha", original);
    const replacedBeta = repository.savePreset("  bETA  ", replacement);
    const betaConfiguration = configurationFor(replacement);
    repository.appendAttempt(betaConfiguration, attempt(7, "beta-history"));

    assert.equal(replacedBeta.id, beta.id);
    assert.deepEqual(repository.listPresets().map(preset => preset.name), ["Alpha", "bETA"]);
    assert.equal(repository.findPresetByName(" BETA ").settings.timeLimit, 45);
    assert.equal(repository.listPresets().length, 2);

    assert.equal(repository.deletePreset(beta.id), true);
    assert.equal(repository.deletePreset("missing"), false);
    assert.deepEqual(repository.listPresets().map(preset => preset.name), ["Alpha"]);
    assert.deepEqual(repository.getAttempts(betaConfiguration).map(record => record.score), [7]);
    assert.deepEqual(new BrowserStateRepository(storage).listPresets().map(preset => preset.name), ["Alpha"]);
});

test("attempts stay grouped by canonical configuration when switching away and back", () => {
    const storage = new MemoryStorage();
    const repository = new BrowserStateRepository(storage, ids("attempt-a", "attempt-b", "attempt-c"));
    const snapshotA = copy(DEFAULT_SETTINGS_SNAPSHOT);
    const snapshotB = copy(DEFAULT_SETTINGS_SNAPSHOT);
    snapshotB.timeLimit += 60;
    const configurationA = configurationFor(snapshotA);
    const configurationB = configurationFor(snapshotB);

    repository.appendAttempt(configurationA, attempt(8));
    repository.appendAttempt(configurationB, attempt(3));
    repository.appendAttempt(configurationFor(copy(snapshotA)), attempt(12));

    assert.deepEqual(repository.getAttempts(configurationA).map(record => record.score), [8, 12]);
    assert.deepEqual(repository.getAttempts(configurationB).map(record => record.score), [3]);

    const reloaded = new BrowserStateRepository(storage);
    assert.deepEqual(reloaded.getAttempts(configurationFor(copy(snapshotA))).map(record => record.score), [8, 12]);
});

test("history identity ignores dormant fields and normalizes equivalent bounds", () => {
    const baseline = copy(DEFAULT_SETTINGS_SNAPSHOT);
    const equivalent = copy(DEFAULT_SETTINGS_SNAPSHOT);

    equivalent.operators.subtraction.operationSettings.bounds.leftMin = 500;
    equivalent.operators.subtraction.operationSettings.bounds.leftMax = 900;
    const multiplicationBounds = equivalent.operators.multiplication.operationSettings.bounds;
    [multiplicationBounds.leftMin, multiplicationBounds.leftMax] = [
        multiplicationBounds.leftMax,
        multiplicationBounds.leftMin,
    ];
    equivalent.operators.addition.operationSettings.decimalPlaces = 7;

    assert.deepEqual(configurationFor(equivalent), configurationFor(baseline));
});

test("history identity changes for effective settings, including duration and reverse mode", () => {
    const baseline = copy(DEFAULT_SETTINGS_SNAPSHOT);
    const changedDuration = copy(DEFAULT_SETTINGS_SNAPSHOT);
    changedDuration.timeLimit = 60;

    const changedEffectiveBounds = copy(DEFAULT_SETTINGS_SNAPSHOT);
    changedEffectiveBounds.operators.addition.operationSettings.bounds.leftMax = 20;

    const directSubtraction = copy(DEFAULT_SETTINGS_SNAPSHOT);
    directSubtraction.subtractionReversedAddition = false;

    assert.notDeepEqual(configurationFor(changedDuration), configurationFor(baseline));
    assert.notDeepEqual(configurationFor(changedEffectiveBounds), configurationFor(baseline));
    assert.notDeepEqual(configurationFor(directSubtraction), configurationFor(baseline));
});

test("duplicate attempt IDs are rejected without appending twice", () => {
    const storage = new MemoryStorage();
    const repository = new BrowserStateRepository(storage);
    const configuration = configurationFor(copy(DEFAULT_SETTINGS_SNAPSHOT));

    repository.appendAttempt(configuration, attempt(10, "same-attempt"));
    assert.throws(
        () => repository.appendAttempt(configuration, attempt(99, "same-attempt")),
        /already exists/i,
    );
    assert.deepEqual(repository.getAttempts(configuration).map(record => record.score), [10]);
});

test("quota failures throw a useful error but retain the mutation in memory", () => {
    const storage = new MemoryStorage();
    const repository = new BrowserStateRepository(storage, ids("session-preset"));
    storage.failWrites = true;

    assert.throws(
        () => repository.savePreset("Session only", copy(DEFAULT_SETTINGS_SNAPSHOT)),
        error => error instanceof StatePersistenceError && /remain available for this session/i.test(error.message),
    );
    assert.equal(repository.findPresetByName("session only").id, "session-preset");
    assert.equal(new BrowserStateRepository(new MemoryStorage()).findPresetByName("session only"), undefined);
});

test("storage read failures start an in-memory session with a warning", () => {
    const storage = new MemoryStorage();
    storage.failReads = true;
    const repository = new BrowserStateRepository(storage);

    assert.match(repository.getLoadWarning(), /storage is unavailable/i);
    assert.deepEqual(repository.listPresets(), []);
});
