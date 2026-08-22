// I'm not using these two functions at the moment but it might be nice to have them in at some point to make the fractions pretty
function toSubscript(input) {
    const subscriptMap = {
        "0": "₀",
        "1": "₁",
        "2": "₂",
        "3": "₃",
        "4": "₄",
        "5": "₅",
        "6": "₆",
        "7": "₇",
        "8": "₈",
        "9": "₉"
    };
    return input
        .split("") // Split the string into individual characters
        .map(char => subscriptMap[char] || char) // Replace numbers with subscripts, leave other characters unchanged
        .join(""); // Join the characters back into a string
}
export function toSuperscript(input) {
    const superscriptMap = {
        "0": "⁰",
        "1": "¹",
        "2": "²",
        "3": "³",
        "4": "⁴",
        "5": "⁵",
        "6": "⁶",
        "7": "⁷",
        "8": "⁸",
        "9": "⁹"
    };
    return input
        .split("") // Split the string into individual characters
        .map(char => superscriptMap[char] || char) // Replace numbers with superscripts, leave other characters unchanged
        .join(""); // Join the characters back into a string
}
export const operations = {
    addition: (a, b) => parseNumber(a) + parseNumber(b),
    subtraction: (a, b) => parseNumber(a) - parseNumber(b),
    multiplication: (a, b) => parseNumber(a) * parseNumber(b),
    division: (a, b) => parseNumber(a) / parseNumber(b),
};
const MAX_EXACT_DIGITS = 100;
const MAX_DECIMAL_EXPONENT = 100;
function bigintAbs(value) {
    return value < 0n ? -value : value;
}
function bigintGcd(a, b) {
    a = bigintAbs(a);
    b = bigintAbs(b);
    while (b !== 0n) {
        const remainder = a % b;
        a = b;
        b = remainder;
    }
    return a;
}
function normalizeExactNumber(numerator, denominator) {
    if (denominator === 0n)
        throw new RangeError("Division by zero is not allowed.");
    if (numerator === 0n)
        return { numerator: 0n, denominator: 1n };
    const sign = denominator < 0n ? -1n : 1n;
    const divisor = bigintGcd(numerator, denominator);
    return {
        numerator: sign * numerator / divisor,
        denominator: sign * denominator / divisor
    };
}
function floorExactDivision(numerator, denominator) {
    const quotient = numerator / denominator;
    const remainder = numerator % denominator;
    return remainder !== 0n && numerator < 0n ? quotient - 1n : quotient;
}
function ceilExactDivision(numerator, denominator) {
    const quotient = numerator / denominator;
    const remainder = numerator % denominator;
    return remainder !== 0n && numerator > 0n ? quotient + 1n : quotient;
}
function scaleExactBoundary(value, scale, round) {
    const exact = parseExactNumber(String(value));
    if (exact === null) {
        throw new RangeError("The numeric bound cannot be represented exactly.");
    }
    const scaledNumerator = exact.numerator * scale;
    return round === "up"
        ? ceilExactDivision(scaledNumerator, exact.denominator)
        : floorExactDivision(scaledNumerator, exact.denominator);
}
function toSafeInteger(value, errorMessage) {
    const converted = Number(value);
    if (!Number.isSafeInteger(converted))
        throw new RangeError(errorMessage);
    return converted;
}
function hasReasonableDigitCount(...parts) {
    return parts.every(part => part.replace(/^[+-]/, "").length <= MAX_EXACT_DIGITS);
}
/** Parse an integer, decimal, fraction, or mixed number without losing precision. */
export function parseExactNumber(input) {
    const normalized = input.trim();
    if (normalized === "")
        return null;
    if (normalized.includes("/")) {
        const parts = normalized.split(/\s+/);
        if (parts.length > 2)
            return null;
        if (parts.length === 1) {
            const fractionMatch = /^([+-]?\d+)\/([+-]?\d+)$/.exec(parts[0]);
            if (fractionMatch === null || !hasReasonableDigitCount(fractionMatch[1], fractionMatch[2]))
                return null;
            const denominator = BigInt(fractionMatch[2]);
            if (denominator === 0n)
                return null;
            return normalizeExactNumber(BigInt(fractionMatch[1]), denominator);
        }
        const wholeMatch = /^([+-]?\d+)$/.exec(parts[0]);
        const fractionMatch = /^(\d+)\/(\d+)$/.exec(parts[1]);
        if (wholeMatch === null || fractionMatch === null ||
            !hasReasonableDigitCount(wholeMatch[1], fractionMatch[1], fractionMatch[2])) {
            return null;
        }
        const denominator = BigInt(fractionMatch[2]);
        if (denominator === 0n)
            return null;
        const fractionalNumerator = BigInt(fractionMatch[1]);
        const whole = BigInt(wholeMatch[1]);
        const sign = wholeMatch[1].startsWith("-") ? -1n : 1n;
        const numerator = sign * (bigintAbs(whole) * denominator + fractionalNumerator);
        return normalizeExactNumber(numerator, denominator);
    }
    const decimalMatch = /^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d+))?$/.exec(normalized);
    if (decimalMatch === null)
        return null;
    const integerDigits = decimalMatch[2] ?? "0";
    const fractionDigits = decimalMatch[3] ?? decimalMatch[4] ?? "";
    const exponentText = decimalMatch[5] ?? "0";
    if (!hasReasonableDigitCount(integerDigits, fractionDigits, exponentText))
        return null;
    const exponent = Number(exponentText);
    if (!Number.isInteger(exponent) || Math.abs(exponent) > MAX_DECIMAL_EXPONENT)
        return null;
    const digits = `${integerDigits}${fractionDigits}`;
    let numerator = BigInt(digits === "" ? "0" : digits);
    let denominator = 1n;
    const decimalScale = fractionDigits.length - exponent;
    if (decimalScale > 0)
        denominator = 10n ** BigInt(decimalScale);
    else if (decimalScale < 0)
        numerator *= 10n ** BigInt(-decimalScale);
    if (decimalMatch[1] === "-")
        numerator = -numerator;
    return normalizeExactNumber(numerator, denominator);
}
function addExactNumbers(left, right) {
    const commonDivisor = bigintGcd(left.denominator, right.denominator);
    const leftScale = right.denominator / commonDivisor;
    const rightScale = left.denominator / commonDivisor;
    return normalizeExactNumber(left.numerator * leftScale + right.numerator * rightScale, left.denominator * leftScale);
}
function multiplyExactNumbers(left, right) {
    const leftCancellation = bigintGcd(left.numerator, right.denominator);
    const rightCancellation = bigintGcd(right.numerator, left.denominator);
    return normalizeExactNumber((left.numerator / leftCancellation) * (right.numerator / rightCancellation), (left.denominator / rightCancellation) * (right.denominator / leftCancellation));
}
export function calculateExactResult(leftInput, rightInput, operatorType) {
    const left = parseExactNumber(leftInput);
    const right = parseExactNumber(rightInput);
    if (left === null || right === null) {
        throw new TypeError("Generated operands must be valid integers, decimals, or fractions.");
    }
    switch (operatorType) {
        case "addition":
            return addExactNumbers(left, right);
        case "subtraction":
            return addExactNumbers(left, { numerator: -right.numerator, denominator: right.denominator });
        case "multiplication":
            return multiplyExactNumbers(left, right);
        case "division":
            if (right.numerator === 0n)
                throw new RangeError("Division by zero is not allowed.");
            return multiplyExactNumbers(left, {
                numerator: right.denominator,
                denominator: right.numerator
            });
    }
}
export function formatExactFraction(value) {
    const normalized = normalizeExactNumber(value.numerator, value.denominator);
    const sign = normalized.numerator < 0n ? "-" : "";
    const absoluteNumerator = bigintAbs(normalized.numerator);
    const whole = absoluteNumerator / normalized.denominator;
    const remainder = absoluteNumerator % normalized.denominator;
    if (remainder === 0n)
        return `${sign}${whole}`;
    if (whole === 0n)
        return `${sign}${remainder}/${normalized.denominator}`;
    return `${sign}${whole} ${remainder}/${normalized.denominator}`;
}
/** Return an exact decimal when the rational has a finite base-10 expansion. */
export function formatExactDecimal(value) {
    const normalized = normalizeExactNumber(value.numerator, value.denominator);
    let remainingDenominator = normalized.denominator;
    let factorsOfTwo = 0;
    let factorsOfFive = 0;
    while (remainingDenominator % 2n === 0n) {
        remainingDenominator /= 2n;
        factorsOfTwo++;
    }
    while (remainingDenominator % 5n === 0n) {
        remainingDenominator /= 5n;
        factorsOfFive++;
    }
    if (remainingDenominator !== 1n)
        return null;
    const decimalPlaces = Math.max(factorsOfTwo, factorsOfFive);
    const scale = 10n ** BigInt(decimalPlaces);
    const scaledNumerator = bigintAbs(normalized.numerator) * scale / normalized.denominator;
    const sign = normalized.numerator < 0n ? "-" : "";
    if (decimalPlaces === 0)
        return `${sign}${scaledNumerator}`;
    const digits = scaledNumerator.toString().padStart(decimalPlaces + 1, "0");
    const integerPart = digits.slice(0, -decimalPlaces);
    const fractionalPart = digits.slice(-decimalPlaces).replace(/0+$/, "");
    return fractionalPart === "" ? `${sign}${integerPart}` : `${sign}${integerPart}.${fractionalPart}`;
}
export function formatExactResult(value, numberType) {
    if (numberType === "decimal") {
        return formatExactDecimal(value) ?? formatExactFraction(value);
    }
    if (numberType === "integer" && value.denominator === 1n) {
        return value.numerator.toString();
    }
    return formatExactFraction(value);
}
export function formatOperationResult(leftInput, rightInput, operatorType, numberType) {
    return formatExactResult(calculateExactResult(leftInput, rightInput, operatorType), numberType);
}
// find gcd using Euclid's algorithm
export function gcd(a, b) {
    a = Math.abs(Math.trunc(a));
    b = Math.abs(Math.trunc(b));
    while (b != 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}
;
/**
 * Adds two fractions together and returns the result in the form of a fraction
 * @param frac1 - a string of the form A B/C representing a mixed number
 * @param frac2 - same as frac1
 * @returns a fraction of the form a/b
 */
export function addFracs(frac1, frac2) {
    if (frac1.length !== 2 || frac2.length !== 2)
        throw new Error("Bad input; an array representing a fraction must have length 2.");
    let num1 = parseInt(frac1[0]);
    let num2 = parseInt(frac1[1]);
    let den1 = parseInt(frac2[0]);
    let den2 = parseInt(frac2[1]);
    let num = num1 * den2 + num2 * den1;
    let dec = den1 * den2;
    let _gcd = gcd(num, dec);
    num = num / _gcd;
    dec = dec / _gcd;
    return String(num) + "/" + String(dec);
}
/**
 *
 * @param string
 * @returns a dictionary containing the numerical value of the fraction,
 * the numerator and the denominator in reduced form, and a boolean
 * indicating whether the fraction part of the original input is in reduced form
 *
 * TODO: copilot wrote this; i better check it
 */
export function parseFraction(input) {
    let value = parseNumber(input);
    let whole = 0;
    let num = 0;
    let den = 1;
    let reduced = true;
    if (input.includes("/")) {
        // Determine if a whole part exists
        const parts = input.split(" ");
        let fracPart;
        if (parts.length > 1) {
            whole = parseInt(parts[0]);
            fracPart = parts[1];
        }
        else {
            fracPart = parts[0];
        }
        const fracParts = fracPart.split("/");
        num = parseInt(fracParts[0]);
        den = parseInt(fracParts[1]);
        if (gcd(num, den) !== 1)
            reduced = false;
    }
    else {
        // No fraction part, treat as whole number
        whole = parseInt(input);
    }
    // Reduce the fraction part (if any)
    const commonGcd = gcd(num, den);
    const reducedNum = num / commonGcd;
    const reducedDen = den / commonGcd;
    // Convert to an improper fraction
    const improper = whole * den + num;
    const improperGcd = gcd(improper, den);
    const improperNumerator = improper / improperGcd;
    const improperDenominator = den / improperGcd;
    return {
        value,
        numerator: reducedNum,
        denominator: reducedDen,
        reduced,
        improperNumerator,
        improperDenominator
    };
}
// given a string, returns a number
// the important thing is that it can deal with mixed numbers
export function parseNumber(number) {
    const exact = parseExactNumber(number);
    if (exact === null)
        return NaN;
    return Number(exact.numerator) / Number(exact.denominator);
}
// generates a number of the given type
export function generateNum(numberType, lowerBound, upperBound, operationSettings) {
    switch (numberType) {
        case "integer":
            return generateInt(lowerBound, upperBound);
        case "decimal":
            return generateDec(lowerBound, upperBound, operationSettings.decimalPlaces);
        case "fraction":
            return generateFrac(lowerBound, upperBound, operationSettings.fractionNumeratorBound, operationSettings.fractionDenominatorBound);
    }
}
// generate a random integer between the bounds, inclusive
export function generateInt(lowerBound, upperBound) {
    if (!Number.isFinite(lowerBound) || !Number.isFinite(upperBound)) {
        throw new RangeError("Integer bounds must be finite numbers.");
    }
    const lower = Math.ceil(Math.min(lowerBound, upperBound));
    const upper = Math.floor(Math.max(lowerBound, upperBound));
    if (!Number.isSafeInteger(lower) || !Number.isSafeInteger(upper)) {
        throw new RangeError("Integer bounds must be within the safe integer range.");
    }
    if (lower > upper) {
        throw new RangeError("The selected range does not contain an integer.");
    }
    const candidateCount = upper - lower + 1;
    if (!Number.isSafeInteger(candidateCount)) {
        throw new RangeError("The integer range is too large to generate safely.");
    }
    const randy = Math.floor(Math.random() * candidateCount) + lower;
    console.log(`generated ${randy}`);
    return String(randy);
}
// generate a random decimal with the given conditions
export function generateDec(lowerBound, upperBound, decimalPlaces) {
    if (!Number.isFinite(lowerBound) || !Number.isFinite(upperBound)) {
        throw new RangeError("Decimal bounds must be finite numbers.");
    }
    const places = decimalPlaces ?? 2;
    if (!Number.isInteger(places) || places < 0 || places > 10) {
        throw new RangeError("Decimal places must be a whole number between 0 and 10.");
    }
    const lower = Math.min(lowerBound, upperBound);
    const upper = Math.max(lowerBound, upperBound);
    const scale = 10n ** BigInt(places);
    const rangeError = "The decimal bounds and precision produce values that are too large to generate safely.";
    const scaledLower = toSafeInteger(scaleExactBoundary(lower, scale, "up"), rangeError);
    const scaledUpper = toSafeInteger(scaleExactBoundary(upper, scale, "down"), rangeError);
    if (scaledLower > scaledUpper) {
        throw new RangeError("The selected range contains no value at the requested decimal precision.");
    }
    const candidateCount = scaledUpper - scaledLower + 1;
    if (!Number.isSafeInteger(candidateCount)) {
        throw new RangeError("The decimal range is too large to generate safely.");
    }
    const scaledValue = Math.floor(Math.random() * candidateCount) + scaledLower;
    return formatScaledDecimal(scaledValue, places);
}
function formatScaledDecimal(scaledValue, decimalPlaces) {
    const sign = scaledValue < 0 ? "-" : "";
    const absoluteDigits = Math.abs(scaledValue).toString();
    if (decimalPlaces === 0)
        return `${sign}${absoluteDigits}`;
    const digits = absoluteDigits.padStart(decimalPlaces + 1, "0");
    const integerPart = digits.slice(0, -decimalPlaces);
    const fractionalPart = digits.slice(-decimalPlaces).replace(/0+$/, "");
    return fractionalPart === "" ? `${sign}${integerPart}` : `${sign}${integerPart}.${fractionalPart}`;
}
// Generate a reduced fraction between the bounds. The search is deliberately
// bounded so a narrow range can never lock the browser's main thread.
export function generateFrac(lowerBound, upperBound, numeratorBound = 9, denominatorBound = 9) {
    if (!Number.isFinite(lowerBound) || !Number.isFinite(upperBound)) {
        throw new RangeError("Fraction bounds must be finite numbers.");
    }
    if (!Number.isFinite(numeratorBound) || numeratorBound < 1 ||
        !Number.isFinite(denominatorBound) || denominatorBound < 2) {
        throw new RangeError("Fraction numerator and denominator bounds are invalid.");
    }
    const lower = Math.min(lowerBound, upperBound);
    const upper = Math.max(lowerBound, upperBound);
    if (lower === upper && Number.isInteger(lower)) {
        if (!Number.isSafeInteger(lower)) {
            throw new RangeError("Fraction bounds must be within the safe integer range.");
        }
        return String(lower);
    }
    const candidates = [];
    const maxNumerator = Math.floor(numeratorBound);
    const maxDenominator = Math.min(100, Math.floor(denominatorBound));
    if (!Number.isSafeInteger(maxNumerator)) {
        throw new RangeError("The fraction numerator bound is too large to generate safely.");
    }
    for (let denominator = 2; denominator <= maxDenominator; denominator++) {
        const rangeError = "The fraction bounds are too large to generate safely.";
        const first = toSafeInteger(scaleExactBoundary(lower, BigInt(denominator), "up"), rangeError);
        const last = toSafeInteger(scaleExactBoundary(upper, BigInt(denominator), "down"), rangeError);
        if (first > last)
            continue;
        // Split at zero because the displayed numerator of a negative mixed
        // number uses its absolute remainder. Within each half, eligible
        // residues repeat every `denominator` values.
        const signedRanges = [
            [first, Math.min(last, -1)],
            [Math.max(first, 0), last]
        ];
        for (const [rangeFirst, rangeLast] of signedRanges) {
            if (rangeFirst > rangeLast)
                continue;
            const count = rangeLast - rangeFirst + 1;
            if (!Number.isSafeInteger(count)) {
                throw new RangeError("The fraction range is too large to generate safely.");
            }
            const checks = Math.min(count, denominator);
            for (let offset = 0; offset < checks; offset++) {
                const baseNumerator = rangeFirst + offset;
                const fractionalNumerator = Math.abs(baseNumerator) % denominator;
                if (fractionalNumerator === 0 ||
                    fractionalNumerator > maxNumerator ||
                    gcd(baseNumerator, denominator) !== 1) {
                    continue;
                }
                const cycles = Math.floor((rangeLast - baseNumerator) / denominator);
                const numerator = baseNumerator + Math.floor(Math.random() * (cycles + 1)) * denominator;
                candidates.push({ numerator, denominator });
            }
        }
    }
    if (candidates.length === 0) {
        throw new RangeError("The selected range contains no reduced fraction within the numerator and denominator bounds.");
    }
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    return formatMixedFraction(chosen.numerator, chosen.denominator);
}
function formatMixedFraction(numerator, denominator) {
    const sign = numerator < 0 ? "-" : "";
    const absoluteNumerator = Math.abs(numerator);
    const whole = Math.floor(absoluteNumerator / denominator);
    const remainder = absoluteNumerator % denominator;
    if (whole === 0)
        return `${sign}${remainder}/${denominator}`;
    return `${sign}${whole} ${remainder}/${denominator}`;
}
