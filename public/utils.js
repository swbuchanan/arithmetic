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
    const normalized = number.trim();
    if (normalized === "")
        return NaN;
    if (!normalized.includes("/"))
        return Number(normalized);
    const parts = normalized.split(/\s+/);
    if (parts.length > 2)
        return NaN;
    const fractionParts = parts[parts.length - 1].split("/");
    if (fractionParts.length !== 2)
        return NaN;
    const numerator = Number(fractionParts[0]);
    const denominator = Number(fractionParts[1]);
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0)
        return NaN;
    const fraction = numerator / denominator;
    if (parts.length === 1)
        return fraction;
    const whole = Number(parts[0]);
    if (!Number.isFinite(whole))
        return NaN;
    // In a mixed number such as "-1 1/2", the sign applies to the
    // complete value rather than only to the whole-number component.
    return parts[0].startsWith("-")
        ? whole - Math.abs(fraction)
        : whole + fraction;
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
    if (lower > upper) {
        throw new RangeError("The selected range does not contain an integer.");
    }
    const randy = Math.floor(Math.random() * (upper - lower + 1)) + lower;
    console.log(`generated ${randy}`);
    return String(randy);
}
// generate a random decimal with the given conditions
export function generateDec(lowerBound, upperBound, decimalPlaces) {
    if (!Number.isFinite(lowerBound) || !Number.isFinite(upperBound)) {
        throw new RangeError("Decimal bounds must be finite numbers.");
    }
    const lower = Math.min(lowerBound, upperBound);
    const upper = Math.max(lowerBound, upperBound);
    const places = decimalPlaces !== null && decimalPlaces !== void 0 ? decimalPlaces : 2;
    const num = Math.random() * (upper - lower) + lower;
    return String(parseFloat(num.toFixed(places)));
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
    if (lower === upper)
        return String(lower);
    const tolerance = Number.EPSILON * Math.max(1, Math.abs(lower), Math.abs(upper)) * 16;
    const candidates = [];
    const maxNumerator = Math.floor(numeratorBound);
    const maxDenominator = Math.min(100, Math.floor(denominatorBound));
    for (let denominator = 2; denominator <= maxDenominator; denominator++) {
        const first = Math.ceil((lower - tolerance) * denominator);
        const last = Math.floor((upper + tolerance) * denominator);
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
                const value = numerator / denominator;
                if (value >= lower - tolerance && value <= upper + tolerance) {
                    candidates.push({ numerator, denominator });
                }
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
