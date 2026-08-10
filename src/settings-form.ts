import {
    DEFAULT_SETTINGS_SNAPSHOT,
    NUMBER_TYPES,
    OPERATOR_TYPES,
    parseSettingsSnapshot
} from "./settings.js";
import type { OperationSettings, SettingsSnapshot } from "./settings.js";
import type { NumberType, OperatorType } from "./question.js";

const OPERATOR_LABELS: Record<OperatorType, string> = {
    addition: "Addition",
    subtraction: "Subtraction",
    multiplication: "Multiplication",
    division: "Division"
};

function getRequiredInput(form: HTMLFormElement, id: string): HTMLInputElement {
    const input = form.querySelector<HTMLInputElement>(`#${id}`);
    if (input === null) throw new Error(`Required setting #${id} was not found.`);
    return input;
}

function getOptionalInput(form: HTMLFormElement, id: string): HTMLInputElement | null {
    return form.querySelector<HTMLInputElement>(`#${id}`);
}

function readNumber(form: HTMLFormElement, id: string): number {
    const input = getRequiredInput(form, id);
    const value = Number.isFinite(input.valueAsNumber)
        ? input.valueAsNumber
        : Number(input.placeholder);

    if (!Number.isFinite(value)) {
        throw new RangeError(`${input.labels?.[0]?.textContent?.trim() ?? id} needs a valid number.`);
    }
    if (input.value !== "" && !input.checkValidity()) {
        throw new RangeError(input.validationMessage || `${id} is outside the allowed range.`);
    }
    return value;
}

function setNumber(form: HTMLFormElement, id: string, value: number): void {
    const input = getOptionalInput(form, id);
    if (input !== null) input.value = String(value);
}

function cloneOperationSettings(settings: OperationSettings): OperationSettings {
    return {
        bounds: {...settings.bounds},
        decimalPlaces: settings.decimalPlaces,
        fractionDenominatorBound: settings.fractionDenominatorBound,
        fractionNumeratorBound: settings.fractionNumeratorBound,
        onlyReducedFractions: settings.onlyReducedFractions,
        improperFractions: settings.improperFractions
    };
}

function numberTypeToggleId(numberType: NumberType, operatorType: OperatorType): string {
    return `${numberType}${OPERATOR_LABELS[operatorType]}Toggle`;
}

export function captureSettingsSnapshot(
    form: HTMLFormElement,
    previousSnapshot: SettingsSnapshot = DEFAULT_SETTINGS_SNAPSHOT
): SettingsSnapshot {
    const operators = {} as SettingsSnapshot["operators"];

    for (const operatorType of OPERATOR_TYPES) {
        const operationSettings = cloneOperationSettings(
            previousSnapshot.operators[operatorType].operationSettings
        );

        operationSettings.bounds = {
            leftMin: readNumber(form, `${operatorType}LeftMin`),
            leftMax: readNumber(form, `${operatorType}LeftMax`),
            rightMin: readNumber(form, `${operatorType}RightMin`),
            rightMax: readNumber(form, `${operatorType}RightMax`)
        };
        operationSettings.decimalPlaces = readNumber(
            form,
            `decimal${OPERATOR_LABELS[operatorType]}Amount`
        );

        const denominatorInput = getOptionalInput(
            form,
            `${operatorType}FractionDenominatorBound`
        );
        if (denominatorInput !== null) {
            operationSettings.fractionDenominatorBound = readNumber(
                form,
                denominatorInput.id
            );
        }

        const numeratorInput = getOptionalInput(
            form,
            `${operatorType}FractionNumeratorBound`
        );
        if (numeratorInput !== null) {
            operationSettings.fractionNumeratorBound = readNumber(form, numeratorInput.id);
        }

        const numberTypes = {} as Record<NumberType, boolean>;
        for (const numberType of NUMBER_TYPES) {
            numberTypes[numberType] = getRequiredInput(
                form,
                numberTypeToggleId(numberType, operatorType)
            ).checked;
        }

        operators[operatorType] = {
            enabled: getRequiredInput(form, `${operatorType}Toggle`).checked,
            numberTypes,
            operationSettings
        };
    }

    const candidate: SettingsSnapshot = {
        operators,
        timeLimit: readNumber(form, "timeLimit"),
        allowRearrangements: previousSnapshot.allowRearrangements,
        subtractionReversedAddition: getRequiredInput(form, "subtractionReverseToggle").checked,
        divisionReversedMultiplication: getRequiredInput(form, "divisionReverseToggle").checked
    };

    const parsed = parseSettingsSnapshot(candidate);
    if (parsed === null) throw new RangeError("The settings contain an invalid value.");
    return parsed;
}

export function applySettingsSnapshot(form: HTMLFormElement, snapshot: SettingsSnapshot): void {
    const parsed = parseSettingsSnapshot(snapshot);
    if (parsed === null) throw new Error("The saved settings are invalid.");

    for (const operatorType of OPERATOR_TYPES) {
        const operation = parsed.operators[operatorType];
        getRequiredInput(form, `${operatorType}Toggle`).checked = operation.enabled;

        for (const numberType of NUMBER_TYPES) {
            getRequiredInput(form, numberTypeToggleId(numberType, operatorType)).checked =
                operation.numberTypes[numberType];
        }

        setNumber(form, `${operatorType}LeftMin`, operation.operationSettings.bounds.leftMin);
        setNumber(form, `${operatorType}LeftMax`, operation.operationSettings.bounds.leftMax);
        setNumber(form, `${operatorType}RightMin`, operation.operationSettings.bounds.rightMin);
        setNumber(form, `${operatorType}RightMax`, operation.operationSettings.bounds.rightMax);
        setNumber(
            form,
            `decimal${OPERATOR_LABELS[operatorType]}Amount`,
            operation.operationSettings.decimalPlaces
        );
        setNumber(
            form,
            `${operatorType}FractionDenominatorBound`,
            operation.operationSettings.fractionDenominatorBound
        );
        setNumber(
            form,
            `${operatorType}FractionNumeratorBound`,
            operation.operationSettings.fractionNumeratorBound
        );
    }

    getRequiredInput(form, "timeLimit").value = String(parsed.timeLimit);
    getRequiredInput(form, "subtractionReverseToggle").checked = parsed.subtractionReversedAddition;
    getRequiredInput(form, "divisionReverseToggle").checked = parsed.divisionReversedMultiplication;
    synchronizeDependentOptions(form);
}

export function synchronizeDependentOptions(form: HTMLFormElement): void {
    const dependentElements = form.querySelectorAll<HTMLElement>("[data-dependent-on]");
    dependentElements.forEach(element => {
        const parentId = element.dataset.dependentOn;
        if (parentId === undefined) return;
        const parentInput = getRequiredInput(form, parentId);
        const shouldHide = element.dataset.reverse === "true"
            ? parentInput.checked
            : !parentInput.checked;
        element.classList.toggle("hidden", shouldHide);
    });
}
