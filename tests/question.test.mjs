import test from "node:test";
import assert from "node:assert/strict";

import { QuestionGenerator } from "../public/question.js";
import { DEFAULT_SETTINGS_SNAPSHOT, Settings } from "../public/settings.js";
import {
    calculateExactResult,
    formatExactDecimal,
    formatExactFraction,
    formatOperationResult,
    generateDec,
    generateFrac,
    parseExactNumber,
} from "../public/utils.js";

function copy(value) {
    return JSON.parse(JSON.stringify(value));
}

function withRandom(random, callback) {
    const originalRandom = Math.random;
    Math.random = random;
    try {
        return callback();
    } finally {
        Math.random = originalRandom;
    }
}

function withoutConsoleLogs(callback) {
    const originalLog = console.log;
    console.log = () => {};
    try {
        return callback();
    } finally {
        console.log = originalLog;
    }
}

function seededRandom(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0x100000000;
    };
}

function randomSequence(values, fallback = 0) {
    let index = 0;
    return () => index < values.length ? values[index++] : fallback;
}

function disableEveryQuestionType(snapshot) {
    for (const operator of Object.values(snapshot.operators)) {
        operator.enabled = false;
        operator.numberTypes.integer = false;
        operator.numberTypes.decimal = false;
        operator.numberTypes.fraction = false;
    }
}

function divisionSettings(numberType, decimalPlaces = 2) {
    const snapshot = copy(DEFAULT_SETTINGS_SNAPSHOT);
    disableEveryQuestionType(snapshot);

    snapshot.operators.division.enabled = true;
    snapshot.operators.multiplication.numberTypes[numberType] = true;
    snapshot.operators.multiplication.operationSettings.decimalPlaces = decimalPlaces;
    snapshot.operators.multiplication.operationSettings.bounds = {
        leftMin: 1,
        leftMax: 9,
        rightMin: 1,
        rightMax: 9,
    };
    snapshot.divisionReversedMultiplication = true;
    return new Settings(snapshot);
}

function fixedDecimalAdditionSettings(allowRearrangements) {
    const snapshot = copy(DEFAULT_SETTINGS_SNAPSHOT);
    disableEveryQuestionType(snapshot);
    snapshot.operators.addition.enabled = true;
    snapshot.operators.addition.numberTypes.decimal = true;
    snapshot.operators.addition.operationSettings.decimalPlaces = 1;
    snapshot.operators.addition.operationSettings.bounds = {
        leftMin: 0.1,
        leftMax: 0.1,
        rightMin: 0.2,
        rightMax: 0.2,
    };
    snapshot.allowRearrangements = allowRearrangements;
    return new Settings(snapshot);
}

function fixedDirectSettings(operatorType, numberType, left, right, decimalPlaces = 2) {
    const snapshot = copy(DEFAULT_SETTINGS_SNAPSHOT);
    disableEveryQuestionType(snapshot);
    snapshot.operators[operatorType].enabled = true;
    snapshot.operators[operatorType].numberTypes[numberType] = true;
    snapshot.operators[operatorType].operationSettings.decimalPlaces = decimalPlaces;
    snapshot.operators[operatorType].operationSettings.bounds = {
        leftMin: left,
        leftMax: left,
        rightMin: right,
        rightMax: right,
    };
    snapshot.subtractionReversedAddition = false;
    snapshot.divisionReversedMultiplication = false;
    return new Settings(snapshot);
}

function fixedReversedSubtractionSettings() {
    const snapshot = copy(DEFAULT_SETTINGS_SNAPSHOT);
    disableEveryQuestionType(snapshot);
    snapshot.operators.subtraction.enabled = true;
    snapshot.operators.addition.numberTypes.fraction = true;
    snapshot.operators.addition.operationSettings.bounds = {
        leftMin: 0.5,
        leftMax: 0.5,
        rightMin: 0.5,
        rightMax: 0.5,
    };
    snapshot.subtractionReversedAddition = true;
    return new Settings(snapshot);
}

test("exact parsing handles decimals, fractions, mixed numbers, and signs", () => {
    assert.deepEqual(parseExactNumber("0.1"), {numerator: 1n, denominator: 10n});
    assert.deepEqual(parseExactNumber("2/4"), {numerator: 1n, denominator: 2n});
    assert.deepEqual(parseExactNumber("1 1/2"), {numerator: 3n, denominator: 2n});
    assert.deepEqual(parseExactNumber("-1 1/2"), {numerator: -3n, denominator: 2n});
    assert.deepEqual(parseExactNumber("3/-4"), {numerator: -3n, denominator: 4n});
    assert.equal(parseExactNumber("1/0"), null);
    assert.equal(parseExactNumber("not a number"), null);
});

test("fraction arithmetic stays exact and formats as a reduced mixed number", () => {
    const product = calculateExactResult("8 1/9", "8 7/8", "multiplication");
    assert.deepEqual(product, {numerator: 5183n, denominator: 72n});
    assert.equal(formatExactFraction(product), "71 71/72");
    assert.equal(
        formatOperationResult("8 1/9", "8 7/8", "multiplication", "fraction"),
        "71 71/72",
    );
});

test("fraction formatting handles negative, zero, and whole-number results", () => {
    assert.equal(formatOperationResult("-1 1/2", "3/4", "addition", "fraction"), "-3/4");
    assert.equal(formatOperationResult("-1/2", "1/2", "addition", "fraction"), "0");
    assert.equal(formatOperationResult("1/2", "4", "multiplication", "fraction"), "2");
});

test("decimal arithmetic has no binary floating-point tails", () => {
    assert.equal(formatOperationResult("0.1", "0.2", "addition", "decimal"), "0.3");
    assert.equal(formatOperationResult("1.23", "4.56", "addition", "decimal"), "5.79");
    assert.equal(formatOperationResult("1.23", "4.56", "multiplication", "decimal"), "5.6088");
    assert.equal(formatExactDecimal(calculateExactResult("1", "8", "division")), "0.125");
    assert.equal(formatOperationResult("1", "3", "division", "decimal"), "1/3");
});

test("decimal generation samples the requested grid without rounding outside it", () => {
    assert.equal(withRandom(() => 0, () => generateDec(0, 1, 2)), "0");
    assert.equal(withRandom(() => 0.999999, () => generateDec(0, 1, 2)), "1");
    assert.equal(withRandom(() => 0, () => generateDec(-0.05, -0.01, 2)), "-0.05");
    assert.equal(withRandom(() => 0, () => generateDec(0.07, 0.07, 2)), "0.07");
    assert.equal(withRandom(() => 0, () => generateDec(0.29, 0.29, 2)), "0.29");
    assert.equal(withRandom(() => 0, () => generateDec(1.15, 1.15, 2)), "1.15");
    assert.equal(withRandom(() => 0, () => generateDec(-0.29, -0.29, 2)), "-0.29");
    assert.throws(() => generateDec(0.101, 0.109, 2), /no value/i);
    assert.throws(() => generateDec(0.30000000000000004, 0.31, 1), /no value/i);
});

test("every result produced from supported-size operands remains parseable", () => {
    const integerProduct = formatOperationResult(
        String(Number.MAX_SAFE_INTEGER),
        String(Number.MAX_SAFE_INTEGER),
        "multiplication",
        "integer",
    );
    assert.notEqual(parseExactNumber(integerProduct), null);
    assert.throws(() => generateDec(1e100, 1e100, 2), /too large/i);
});

test("a fixed fractional bound remains a fraction instead of becoming a decimal", () => {
    assert.equal(withRandom(() => 0, () => generateFrac(0.5, 0.5, 9, 9)), "1/2");
});

test("rearranged decimal questions display an exact result", () => {
    const settings = fixedDecimalAdditionSettings(true);
    const question = withoutConsoleLogs(() => withRandom(
        () => 0.5,
        () => new QuestionGenerator(settings.getOperationBounds()).generateQuestion(settings),
    ));

    assert.equal(question.questionLeft, "0.1 + ");
    assert.equal(question.questionRight, " = 0.3");
    assert.equal(question.answer, "0.2");
});

test("direct decimal questions use the exact formatted answer", () => {
    const settings = fixedDirectSettings("multiplication", "decimal", 1.23, 4.56, 2);
    const question = withoutConsoleLogs(() => withRandom(
        () => 0,
        () => new QuestionGenerator(settings.getOperationBounds()).generateQuestion(settings),
    ));

    assert.deepEqual(question, {
        questionLeft: "1.23 × 4.56 = ",
        questionRight: "",
        type: "decimal",
        answer: "5.6088",
    });
});

test("reversed fraction subtraction uses an exact generated sum", () => {
    const settings = fixedReversedSubtractionSettings();
    const question = withoutConsoleLogs(() => withRandom(
        () => 0,
        () => new QuestionGenerator(settings.getOperationBounds()).generateQuestion(settings),
    ));

    assert.deepEqual(question, {
        questionLeft: "1 − 1/2 = ",
        questionRight: "",
        type: "fraction",
        answer: "1/2",
    });
});

test("division retries a zero divisor and fails when the range is only zero", () => {
    const retrySettings = fixedDirectSettings("division", "integer", 4, 0);
    retrySettings.updateBound("division", "rightMax", 1);
    const retriedQuestion = withoutConsoleLogs(() => withRandom(
        randomSequence([0, 0, 0, 0.99]),
        () => new QuestionGenerator(retrySettings.getOperationBounds()).generateQuestion(retrySettings),
    ));
    assert.equal(retriedQuestion.questionLeft, "4 ÷ 1 = ");
    assert.equal(retriedQuestion.answer, "4");

    const zeroOnlySettings = fixedDirectSettings("division", "integer", 4, 0);
    assert.throws(
        () => withoutConsoleLogs(() => withRandom(
            () => 0,
            () => new QuestionGenerator(zeroOnlySettings.getOperationBounds()).generateQuestion(zeroOnlySettings),
        )),
        /must contain a non-zero value/i,
    );
});

test("reversed fraction division never renders a decimal artifact", () => {
    const settings = divisionSettings("fraction");

    withoutConsoleLogs(() => withRandom(seededRandom(42), () => {
        const generator = new QuestionGenerator(settings.getOperationBounds());
        for (let index = 0; index < 100; index++) {
            const question = generator.generateQuestion(settings);
            assert.match(question.questionLeft, /^[\d\s/\-]+ ÷ [\d\s/\-]+ = $/);
            assert.doesNotMatch(question.questionLeft, /[.eE]/);
            assert.doesNotMatch(question.answer, /[.eE]/);
        }
    }));
});

test("reversed decimal division has only the mathematically required digits", () => {
    const settings = divisionSettings("decimal", 2);

    withoutConsoleLogs(() => withRandom(seededRandom(99), () => {
        const generator = new QuestionGenerator(settings.getOperationBounds());
        for (let index = 0; index < 100; index++) {
            const question = generator.generateQuestion(settings);
            assert.doesNotMatch(question.questionLeft, /e[+-]?\d/i);
            for (const match of question.questionLeft.matchAll(/-?\d+(?:\.(\d+))?/g)) {
                assert.ok((match[1]?.length ?? 0) <= 4, `Unexpected decimal artifact in ${question.questionLeft}`);
            }
        }
    }));
});
