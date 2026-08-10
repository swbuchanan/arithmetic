const result = document.getElementById("result");
const frame = document.getElementById("appFrame");

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function wait(milliseconds) {
    return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}

function loadFrame(source) {
    return new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error("The app iframe did not load.")), 5000);
        frame.addEventListener("load", () => {
            window.clearTimeout(timeout);
            resolve();
        }, {once: true});
        frame.src = source;
    });
}

function input(documentObject, id) {
    const element = documentObject.getElementById(id);
    assert(element !== null && element.tagName === "INPUT", `Missing input #${id}.`);
    return element;
}

function button(documentObject, id) {
    const element = documentObject.getElementById(id);
    assert(element !== null && element.tagName === "BUTTON", `Missing button #${id}.`);
    return element;
}

async function run() {
    window.localStorage.removeItem("arithmetic.state.v1");
    await loadFrame("../public/index.html?browser-smoke");

    let appDocument = frame.contentDocument;
    assert(appDocument !== null, "The app document is unavailable.");
    const additionMaximum = input(appDocument, "additionLeftMax");
    assert(additionMaximum.value === "99", "Typed defaults were not applied to the form.");

    additionMaximum.value = "20";
    input(appDocument, "presetName").value = "Quick practice";
    button(appDocument, "savePresetButton").click();

    let persisted = JSON.parse(window.localStorage.getItem("arithmetic.state.v1"));
    assert(persisted.presets.length === 1, "The named preset was not persisted.");
    assert(persisted.presets[0].settings.operators.addition.operationSettings.bounds.leftMax === 20,
        "The preset did not capture current settings.");

    additionMaximum.value = "35";
    button(appDocument, "loadPresetButton").click();
    assert(additionMaximum.value === "20", "Loading the preset did not restore the form.");

    input(appDocument, "timeLimit").value = "1";
    appDocument.querySelector("#settings .start-game").click();
    await wait(100);
    assert(!appDocument.getElementById("game").hidden, "Starting a run did not show the game screen.");
    assert(appDocument.getElementById("history").hidden, "History remained visible during a run.");

    await wait(1400);
    assert(!appDocument.getElementById("ending").hidden, "Timer completion did not show the results screen.");
    assert(!appDocument.getElementById("history").hidden, "History was not shown with the result.");
    assert(appDocument.querySelectorAll("#historyGraph .history-point").length === 1,
        "The first completed run was not graphed exactly once.");

    appDocument.querySelector("#ending .start-game").click();
    await wait(1400);
    assert(appDocument.querySelectorAll("#historyGraph .history-point").length === 2,
        "Try again did not append a second attempt to the same graph.");

    const reload = new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error("The reloaded app did not finish loading.")), 5000);
        frame.addEventListener("load", () => {
            window.clearTimeout(timeout);
            resolve();
        }, {once: true});
    });
    frame.contentWindow.location.reload();
    await reload;

    appDocument = frame.contentDocument;
    assert(input(appDocument, "additionLeftMax").value === "20", "Reload did not restore last-used settings.");
    assert(input(appDocument, "timeLimit").value === "1", "Reload did not restore the last-used duration.");
    assert(appDocument.querySelectorAll("#presetSelect option").length === 2,
        "Reload did not restore the named preset.");
    assert(appDocument.querySelectorAll("#historyGraph .history-point").length === 2,
        "Reload did not restore the configuration's attempt graph.");

    persisted = JSON.parse(window.localStorage.getItem("arithmetic.state.v1"));
    assert(persisted.histories.length === 1 && persisted.histories[0].attempts.length === 2,
        "Completed attempts were not stored in one exact-configuration history bucket.");
}

run().then(() => {
    result.textContent = "PASS";
    document.body.dataset.result = "pass";
}).catch(error => {
    result.textContent = `FAIL: ${error instanceof Error ? error.stack : String(error)}`;
    document.body.dataset.result = "fail";
});
