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
    let base = 0;
    if (number.includes("/")) {
        if (number.includes(" ")) {
            if (number.split(" ").length > 2)
                return NaN;
            base = parseFloat(number.split(" ")[0]);
            // Removed unnecessary logging
            number = number.split(" ")[1];
        }
        let numberArr = number.split("/");
        if (numberArr.length > 2)
            return NaN;
        const denominator = parseFloat(numberArr[1]);
        if (denominator === 0)
            throw new Error("Division by zero error in parseNumber.");
        return base + parseFloat(numberArr[0]) / denominator;
    }
    ;
    return base + parseFloat(number);
}
// generates a number of the given type
export function generateNum(numberType, lowerBound, upperBound, operationSettings) {
    if (numberType === "integer")
        return generateInt(lowerBound, upperBound);
    if (numberType === "decimal")
        return generateDec(lowerBound, upperBound, operationSettings.decimalPlaces);
    if (numberType === "fraction")
        return generateFrac(lowerBound, upperBound);
    throw new Error("Invalid number type.");
}
// generate a random integer between the bounds, inclusive
export function generateInt(lowerBound, upperBound) {
    let randy = Math.round(Math.random() * (upperBound - lowerBound)) + lowerBound;
    console.log(`generated ${randy}`);
    return String(randy);
}
// generate a random decimal with the given conditions
export function generateDec(lowerBound, upperBound, decimalPlaces) {
    const num = Math.random() * (upperBound - lowerBound) + lowerBound;
    return String(parseFloat(num.toFixed(decimalPlaces)));
}
// generate a random mixed number between the bounds
// at the moment the numerator and denominator are always at most 9, and the denominator is at least 2
// TODO: add optional arguments that specify how large or small the numerator and denominator can be
// or think of another way to do it; maybe just a difficulty score for the fractions or some such
export function generateFrac(lowerBound, upperBound) {
    if (lowerBound > upperBound) {
        console.log("WARNING: for some reason the lower bound is above the upper bound. For now I'm just going to switch them, but this should be avoided.");
        const temp = lowerBound;
        lowerBound = upperBound;
        upperBound = temp;
    }
    if (lowerBound == upperBound)
        return String(lowerBound);
    let base;
    let numerator;
    let denominator;
    // TODO: it's hard to write a stupider method to generate a good fraction than this. FIX
    do {
        base = parseInt(generateInt(lowerBound, upperBound));
        numerator = parseInt(generateInt(1, 20));
        denominator = parseInt(generateInt(2, 10));
    } while (gcd(numerator, denominator) !== 1 || base - numerator / denominator < lowerBound);
    let baseStr = String(Math.floor(base - numerator / denominator));
    console.log(`The bounds are ${lowerBound} and ${upperBound}; the base I generated is ${base}, which after offsetting by ${numerator / denominator} becomes ${baseStr}`);
    if (baseStr === "0")
        return String(numerator) + "/" + String(denominator);
    return baseStr + " " + String(numerator) + "/" + String(denominator);
}
