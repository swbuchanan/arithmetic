// Manages the user-determined settings.

import type { NumberType, OperatorType, QuestionType } from "./question.js";

export const OPERATOR_TYPES: readonly OperatorType[] = [
    "addition",
    "subtraction",
    "multiplication",
    "division",
];

export const NUMBER_TYPES: readonly NumberType[] = ["integer", "decimal", "fraction"];

export type Bounds = {
    leftMin: number;
    leftMax: number;
    rightMin: number;
    rightMax: number;
};

export type OperationSettings = {
    bounds: Bounds;
    decimalPlaces: number;
    fractionDenominatorBound: number;
    fractionNumeratorBound: number;
    onlyReducedFractions: boolean;
    improperFractions: boolean;
};

export type OperatorSettingsSnapshot = {
    enabled: boolean;
    numberTypes: Record<NumberType, boolean>;
    operationSettings: OperationSettings;
};

export type SettingsSnapshot = {
    operators: Record<OperatorType, OperatorSettingsSnapshot>;
    timeLimit: number;
    allowRearrangements: boolean;
    subtractionReversedAddition: boolean;
    divisionReversedMultiplication: boolean;
};

export type EffectiveDecimalSettings = {
    decimalPlaces: number;
};

export type EffectiveFractionSettings = {
    fractionDenominatorBound: number;
    fractionNumeratorBound: number;
};

export type EffectiveOperationConfiguration = {
    operatorType: OperatorType;
    numberTypes: NumberType[];
    bounds: Bounds;
    /** Present for subtraction and division only. */
    reversed?: boolean;
    decimalSettings?: EffectiveDecimalSettings;
    fractionSettings?: EffectiveFractionSettings;
};

export type EffectiveConfiguration = {
    timeLimit: number;
    allowRearrangements: boolean;
    operators: EffectiveOperationConfiguration[];
};

type UnknownRecord = Record<string, unknown>;
type BoundName = keyof Bounds;

const BOUND_NAMES: readonly BoundName[] = ["leftMin", "leftMax", "rightMin", "rightMax"];

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

function isOperatorType(value: unknown): value is OperatorType {
    return typeof value === "string" && OPERATOR_TYPES.some(operatorType => operatorType === value);
}

function isNumberType(value: unknown): value is NumberType {
    return typeof value === "string" && NUMBER_TYPES.some(numberType => numberType === value);
}

function parseBounds(value: unknown): Bounds | null {
    if (!isRecord(value)) return null;

    for (const name of BOUND_NAMES) {
        if (!isFiniteNumber(value[name])) return null;
    }

    return {
        leftMin: value.leftMin as number,
        leftMax: value.leftMax as number,
        rightMin: value.rightMin as number,
        rightMax: value.rightMax as number,
    };
}

function parseOperationSettings(value: unknown): OperationSettings | null {
    if (!isRecord(value)) return null;

    const bounds = parseBounds(value.bounds);
    if (bounds === null) return null;

    const decimalPlaces = value.decimalPlaces;
    const fractionDenominatorBound = value.fractionDenominatorBound;
    const fractionNumeratorBound = value.fractionNumeratorBound;

    if (!Number.isInteger(decimalPlaces) || (decimalPlaces as number) < 0 || (decimalPlaces as number) > 10) return null;
    if (!Number.isInteger(fractionDenominatorBound) || (fractionDenominatorBound as number) < 2 || (fractionDenominatorBound as number) > 100) return null;
    if (!Number.isInteger(fractionNumeratorBound) || (fractionNumeratorBound as number) < 1) return null;
    if (typeof value.onlyReducedFractions !== "boolean" || typeof value.improperFractions !== "boolean") return null;

    return {
        bounds,
        decimalPlaces: decimalPlaces as number,
        fractionDenominatorBound: fractionDenominatorBound as number,
        fractionNumeratorBound: fractionNumeratorBound as number,
        onlyReducedFractions: value.onlyReducedFractions,
        improperFractions: value.improperFractions,
    };
}

function copyOperationSettings(settings: OperationSettings): OperationSettings {
    return {
        bounds: { ...settings.bounds },
        decimalPlaces: settings.decimalPlaces,
        fractionDenominatorBound: settings.fractionDenominatorBound,
        fractionNumeratorBound: settings.fractionNumeratorBound,
        onlyReducedFractions: settings.onlyReducedFractions,
        improperFractions: settings.improperFractions,
    };
}

function copySettingsSnapshot(snapshot: SettingsSnapshot): SettingsSnapshot {
    const operators = {} as Record<OperatorType, OperatorSettingsSnapshot>;

    for (const operatorType of OPERATOR_TYPES) {
        const operator = snapshot.operators[operatorType];
        operators[operatorType] = {
            enabled: operator.enabled,
            numberTypes: { ...operator.numberTypes },
            operationSettings: copyOperationSettings(operator.operationSettings),
        };
    }

    return {
        operators,
        timeLimit: snapshot.timeLimit,
        allowRearrangements: snapshot.allowRearrangements,
        subtractionReversedAddition: snapshot.subtractionReversedAddition,
        divisionReversedMultiplication: snapshot.divisionReversedMultiplication,
    };
}

function freezeSettingsSnapshot(snapshot: SettingsSnapshot): SettingsSnapshot {
    for (const operatorType of OPERATOR_TYPES) {
        const operator = snapshot.operators[operatorType];
        Object.freeze(operator.operationSettings.bounds);
        Object.freeze(operator.operationSettings);
        Object.freeze(operator.numberTypes);
        Object.freeze(operator);
    }
    Object.freeze(snapshot.operators);
    return Object.freeze(snapshot);
}

function createDefaultOperator(
    bounds: Bounds,
): OperatorSettingsSnapshot {
    return {
        enabled: true,
        numberTypes: {
            integer: true,
            decimal: false,
            fraction: false,
        },
        operationSettings: {
            bounds,
            decimalPlaces: 2,
            fractionDenominatorBound: 9,
            fractionNumeratorBound: 9,
            onlyReducedFractions: true,
            improperFractions: true,
        },
    };
}

export const DEFAULT_SETTINGS_SNAPSHOT: SettingsSnapshot = freezeSettingsSnapshot({
    operators: {
        addition: createDefaultOperator({ leftMin: 1, leftMax: 99, rightMin: 1, rightMax: 99 }),
        subtraction: createDefaultOperator({ leftMin: 1, leftMax: 99, rightMin: 1, rightMax: 99 }),
        multiplication: createDefaultOperator({ leftMin: 2, leftMax: 12, rightMin: 2, rightMax: 12 }),
        division: createDefaultOperator({ leftMin: 1, leftMax: 100, rightMin: 1, rightMax: 10 }),
    },
    timeLimit: 120,
    allowRearrangements: false,
    subtractionReversedAddition: true,
    divisionReversedMultiplication: true,
});

/**
 * Validates persisted or otherwise untrusted data and returns an independent copy.
 */
export function parseSettingsSnapshot(value: unknown): SettingsSnapshot | null {
    if (!isRecord(value) || !isRecord(value.operators)) return null;
    if (!isFiniteNumber(value.timeLimit) || !Number.isInteger(value.timeLimit) || value.timeLimit <= 0) return null;
    if (typeof value.allowRearrangements !== "boolean") return null;
    if (typeof value.subtractionReversedAddition !== "boolean") return null;
    if (typeof value.divisionReversedMultiplication !== "boolean") return null;

    const operators = {} as Record<OperatorType, OperatorSettingsSnapshot>;
    for (const operatorType of OPERATOR_TYPES) {
        const rawOperator = value.operators[operatorType];
        if (!isRecord(rawOperator) || typeof rawOperator.enabled !== "boolean" || !isRecord(rawOperator.numberTypes)) return null;

        const numberTypes = {} as Record<NumberType, boolean>;
        for (const numberType of NUMBER_TYPES) {
            const enabled = rawOperator.numberTypes[numberType];
            if (typeof enabled !== "boolean") return null;
            numberTypes[numberType] = enabled;
        }

        const operationSettings = parseOperationSettings(rawOperator.operationSettings);
        if (operationSettings === null) return null;

        operators[operatorType] = {
            enabled: rawOperator.enabled,
            numberTypes,
            operationSettings,
        };
    }

    return {
        operators,
        timeLimit: value.timeLimit as number,
        allowRearrangements: value.allowRearrangements,
        subtractionReversedAddition: value.subtractionReversedAddition,
        divisionReversedMultiplication: value.divisionReversedMultiplication,
    };
}

function normalizeBounds(bounds: Bounds): Bounds {
    return {
        leftMin: Math.min(bounds.leftMin, bounds.leftMax),
        leftMax: Math.max(bounds.leftMin, bounds.leftMax),
        rightMin: Math.min(bounds.rightMin, bounds.rightMax),
        rightMax: Math.max(bounds.rightMin, bounds.rightMax),
    };
}

function parseEffectiveOperation(value: unknown): EffectiveOperationConfiguration | null {
    if (!isRecord(value) || !isOperatorType(value.operatorType) || !Array.isArray(value.numberTypes)) return null;

    const numberTypeSet = new Set<NumberType>();
    for (const numberType of value.numberTypes) {
        if (!isNumberType(numberType) || numberTypeSet.has(numberType)) return null;
        numberTypeSet.add(numberType);
    }
    if (numberTypeSet.size === 0) return null;

    const numberTypes = Array.from(numberTypeSet).sort() as NumberType[];
    const bounds = parseBounds(value.bounds);
    if (bounds === null) return null;

    const operatorType = value.operatorType;
    const isReversible = operatorType === "subtraction" || operatorType === "division";
    if (isReversible ? typeof value.reversed !== "boolean" : value.reversed !== undefined) return null;

    const hasDecimals = numberTypeSet.has("decimal");
    if (hasDecimals && !isRecord(value.decimalSettings)) return null;
    if (!hasDecimals && value.decimalSettings !== undefined) return null;
    let decimalSettings: EffectiveDecimalSettings | undefined;
    if (hasDecimals) {
        const decimalPlaces = (value.decimalSettings as UnknownRecord).decimalPlaces;
        if (!Number.isInteger(decimalPlaces) || (decimalPlaces as number) < 0 || (decimalPlaces as number) > 10) return null;
        decimalSettings = { decimalPlaces: decimalPlaces as number };
    }

    const hasFractions = numberTypeSet.has("fraction");
    if (hasFractions && !isRecord(value.fractionSettings)) return null;
    if (!hasFractions && value.fractionSettings !== undefined) return null;
    let fractionSettings: EffectiveFractionSettings | undefined;
    if (hasFractions) {
        const rawFractionSettings = value.fractionSettings as UnknownRecord;
        const denominatorBound = rawFractionSettings.fractionDenominatorBound;
        const numeratorBound = rawFractionSettings.fractionNumeratorBound;
        if (!Number.isInteger(denominatorBound) || (denominatorBound as number) < 2 || (denominatorBound as number) > 100) return null;
        if (!Number.isInteger(numeratorBound) || (numeratorBound as number) < 1) return null;
        fractionSettings = {
            fractionDenominatorBound: denominatorBound as number,
            fractionNumeratorBound: numeratorBound as number,
        };
    }

    const parsed: EffectiveOperationConfiguration = {
        operatorType,
        numberTypes,
        bounds: normalizeBounds(bounds),
    };
    if (isReversible) parsed.reversed = value.reversed as boolean;
    if (decimalSettings !== undefined) parsed.decimalSettings = decimalSettings;
    if (fractionSettings !== undefined) parsed.fractionSettings = fractionSettings;
    return parsed;
}

/**
 * Validates and canonicalizes a configuration read from persisted history.
 */
export function parseEffectiveConfiguration(value: unknown): EffectiveConfiguration | null {
    if (!isRecord(value) || !isFiniteNumber(value.timeLimit) || !Number.isInteger(value.timeLimit) || value.timeLimit <= 0) return null;
    if (typeof value.allowRearrangements !== "boolean" || !Array.isArray(value.operators)) return null;

    const operatorSet = new Set<OperatorType>();
    const operators: EffectiveOperationConfiguration[] = [];
    for (const rawOperator of value.operators) {
        const operator = parseEffectiveOperation(rawOperator);
        if (operator === null || operatorSet.has(operator.operatorType)) return null;
        operatorSet.add(operator.operatorType);
        operators.push(operator);
    }

    operators.sort((left, right) => OPERATOR_TYPES.indexOf(left.operatorType) - OPERATOR_TYPES.indexOf(right.operatorType));
    return {
        timeLimit: value.timeLimit as number,
        allowRearrangements: value.allowRearrangements,
        operators,
    };
}

/** Returns a deterministic history-bucket key for an effective configuration. */
export function canonicalConfigurationKey(configuration: EffectiveConfiguration): string {
    const parsed = parseEffectiveConfiguration(configuration);
    if (parsed === null) throw new TypeError("Invalid effective settings configuration.");
    return JSON.stringify(parsed);
}

export class Settings {

    operationSettings: Record<OperatorType, OperationSettings>;
    validQuestionTypes: QuestionType[];
    private operatorControls: Record<OperatorType, Pick<OperatorSettingsSnapshot, "enabled" | "numberTypes">>;
    private miscSettings: Record<string, number | boolean>;

    constructor(snapshot: SettingsSnapshot = DEFAULT_SETTINGS_SNAPSHOT) {
        this.operationSettings = {} as Record<OperatorType, OperationSettings>;
        this.operatorControls = {} as Record<OperatorType, Pick<OperatorSettingsSnapshot, "enabled" | "numberTypes">>;
        this.miscSettings = {};
        this.validQuestionTypes = [];
        this.applySnapshot(snapshot);
    }

    public applySnapshot(snapshot: SettingsSnapshot): void {
        const parsed = parseSettingsSnapshot(snapshot);
        if (parsed === null) throw new TypeError("Invalid settings snapshot.");

        for (const operatorType of OPERATOR_TYPES) {
            const operator = parsed.operators[operatorType];
            this.operationSettings[operatorType] = copyOperationSettings(operator.operationSettings);
            this.operatorControls[operatorType] = {
                enabled: operator.enabled,
                numberTypes: { ...operator.numberTypes },
            };
        }

        this.miscSettings = {
            timeLimit: parsed.timeLimit,
            allowRearrangements: parsed.allowRearrangements,
            subtractionReversedAddition: parsed.subtractionReversedAddition,
            divisionReversedMultiplication: parsed.divisionReversedMultiplication,
        };
        this.rebuildValidQuestionTypes();
    }

    public toSnapshot(): SettingsSnapshot {
        const operators = {} as Record<OperatorType, OperatorSettingsSnapshot>;
        for (const operatorType of OPERATOR_TYPES) {
            const controls = this.operatorControls[operatorType];
            operators[operatorType] = {
                enabled: controls.enabled,
                numberTypes: { ...controls.numberTypes },
                operationSettings: copyOperationSettings(this.operationSettings[operatorType]),
            };
        }

        const snapshot: SettingsSnapshot = {
            operators,
            timeLimit: this.miscSettings.timeLimit as number,
            allowRearrangements: this.miscSettings.allowRearrangements as boolean,
            subtractionReversedAddition: this.miscSettings.subtractionReversedAddition as boolean,
            divisionReversedMultiplication: this.miscSettings.divisionReversedMultiplication as boolean,
        };
        const parsed = parseSettingsSnapshot(snapshot);
        if (parsed === null) throw new TypeError("Settings contain invalid values.");
        return parsed;
    }

    public toEffectiveConfiguration(): EffectiveConfiguration {
        const snapshot = this.toSnapshot();
        const operators: EffectiveOperationConfiguration[] = [];

        for (const operatorType of OPERATOR_TYPES) {
            const target = snapshot.operators[operatorType];
            if (!target.enabled) continue;

            const sourceOperatorType = this.getEffectiveSourceOperator(operatorType);
            const source = snapshot.operators[sourceOperatorType];
            const numberTypes = NUMBER_TYPES
                .filter(numberType => source.numberTypes[numberType])
                .slice()
                .sort() as NumberType[];
            if (numberTypes.length === 0) continue;

            const settings = source.operationSettings;
            const effective: EffectiveOperationConfiguration = {
                operatorType,
                numberTypes,
                bounds: normalizeBounds(settings.bounds),
            };

            if (operatorType === "subtraction") effective.reversed = snapshot.subtractionReversedAddition;
            if (operatorType === "division") effective.reversed = snapshot.divisionReversedMultiplication;
            if (numberTypes.indexOf("decimal") !== -1) {
                effective.decimalSettings = { decimalPlaces: settings.decimalPlaces };
            }
            if (numberTypes.indexOf("fraction") !== -1) {
                effective.fractionSettings = {
                    fractionDenominatorBound: settings.fractionDenominatorBound,
                    fractionNumeratorBound: settings.fractionNumeratorBound,
                };
            }
            operators.push(effective);
        }

        return {
            timeLimit: snapshot.timeLimit,
            allowRearrangements: snapshot.allowRearrangements,
            operators,
        };
    }

    public canonicalConfigurationKey(): string {
        return canonicalConfigurationKey(this.toEffectiveConfiguration());
    }

    public printValidQuestionTypes(): void {
        console.log("Valid question types:");
        for (const type of this.validQuestionTypes) {
            console.log(`Number type: ${type.numberType}, Operator type: ${type.operatorType}`);
        }
    }

    public getOperationBounds(): Record<OperatorType, Bounds> {
        const boundsMap = {} as Record<OperatorType, Bounds>;
        for (const operatorType of OPERATOR_TYPES) {
            boundsMap[operatorType] = { ...this.operationSettings[operatorType].bounds };
        }
        return boundsMap;
    }

    public getOperationSettings(operatorType: OperatorType): OperationSettings {
        return this.operationSettings[this.getEffectiveSourceOperator(operatorType)];
    }

    /**
     * Returns an operation's bounds, resolving reversed subtraction and division
     * to the addition and multiplication settings respectively.
     */
    public getOperationBoundsByName(operatorType: OperatorType): Record<string, number> {
        return this.operationSettings[this.getEffectiveSourceOperator(operatorType)].bounds;
    }

    public updateSetting(setting: string, value: number | boolean): void {
        if (setting === "timeLimit" && (!Number.isInteger(value) || (value as number) <= 0)) {
            throw new RangeError("The time limit must be a positive whole number.");
        }
        if ((setting === "allowRearrangements" || setting === "divisionReversedMultiplication" || setting === "subtractionReversedAddition") && typeof value !== "boolean") {
            throw new TypeError(`${setting} must be a boolean.`);
        }

        console.log(`${setting} -> ${value}`);
        this.miscSettings[setting] = value;
        if (setting === "divisionReversedMultiplication" || setting === "subtractionReversedAddition") {
            this.rebuildValidQuestionTypes();
        }
    }

    public updateOperationSetting(
        operationName: OperatorType,
        setting: "decimalPlaces" | "fractionDenominatorBound" | "fractionNumeratorBound",
        value: number,
    ): void {
        if (!Number.isInteger(value)) {
            throw new RangeError(`${setting} must be a whole number.`);
        }
        if (setting === "decimalPlaces" && (value < 0 || value > 10)) {
            throw new RangeError("Decimal places must be between 0 and 10.");
        }
        if (setting === "fractionDenominatorBound" && (value < 2 || value > 100)) {
            throw new RangeError("The fraction denominator bound must be between 2 and 100.");
        }
        if (setting === "fractionNumeratorBound" && value < 1) {
            throw new RangeError("The fraction numerator bound must be at least 1.");
        }
        this.operationSettings[operationName][setting] = value;
    }

    public updateBound(operationName: OperatorType, boundName: string, value: number): void {
        if (!Number.isFinite(value)) throw new Error("Bad value passed.");
        if (!BOUND_NAMES.some(name => name === boundName)) throw new Error("No such bound exists.");

        this.operationSettings[operationName].bounds = {
            ...this.operationSettings[operationName].bounds,
            [boundName]: value,
        };
    }

    public getSetting(name: string): number | boolean {
        return this.miscSettings[name];
    }

    public updateQuestionType(numberType: NumberType, operatorType: OperatorType, include: boolean): void {
        this.operatorControls[operatorType].numberTypes[numberType] = include;
        if (include) this.operatorControls[operatorType].enabled = true;
        this.rebuildValidQuestionTypes();

        if (include) console.log(`Added ${numberType} ${operatorType} to valid question types.`);
        else console.log(`Removed ${numberType} ${operatorType} from valid question types.`);
    }

    private getEffectiveSourceOperator(operatorType: OperatorType): OperatorType {
        if (operatorType === "subtraction" && this.miscSettings.subtractionReversedAddition) return "addition";
        if (operatorType === "division" && this.miscSettings.divisionReversedMultiplication) return "multiplication";
        return operatorType;
    }

    private rebuildValidQuestionTypes(): void {
        this.validQuestionTypes = [];
        for (const operatorType of OPERATOR_TYPES) {
            if (!this.operatorControls[operatorType].enabled) continue;

            const sourceOperatorType = this.getEffectiveSourceOperator(operatorType);
            for (const numberType of NUMBER_TYPES) {
                if (this.operatorControls[sourceOperatorType].numberTypes[numberType]) {
                    this.validQuestionTypes.push({ numberType, operatorType });
                }
            }
        }
    }
}
