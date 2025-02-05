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
// given a string, returns a number
// the important thing is that it can deal with mixed numbers
export function parseNumber(number) {
    let base = 0;
    if (number.includes("/")) {
        if (number.includes(" ")) {
            if (number.split(" ").length > 2)
                return NaN;
            base = parseFloat(number.split(" ")[0]);
            console.log(`found a base ${base}`);
            number = number.split(" ")[1];
        }
        let numberArr = number.split("/");
        if (numberArr.length > 2)
            return NaN;
        return base + parseFloat(numberArr[0]) / parseFloat(numberArr[1]);
    }
    ;
    return base + parseFloat(number);
}
// generates a number of the given type
export function generateNum(numberType, lowerBound, upperBound) {
    if (numberType === "integer")
        return generateInt(lowerBound, upperBound);
    if (numberType === "decimal")
        return generateDec(lowerBound, upperBound);
    if (numberType === "fraction")
        return generateFrac(lowerBound, upperBound);
    throw new Error("Invalid number type.");
}
// generate a random integer between the bounds
export function generateInt(lowerBound, upperBound) {
    return String(Math.floor(Math.random() * (upperBound - lowerBound)) + lowerBound);
}
// generate a random decimal with the given conditions
export function generateDec(lowerBound, upperBound, decimalPlaces) {
    const num = Math.random() * (upperBound - lowerBound) + lowerBound;
    return String(parseFloat(num.toFixed(decimalPlaces)));
}
// generate a random mixed number between the bounds
// at the moment the numerator and denominator are always at most 9, and the denominator is at least 2
// TODO: add optional arguments that specify how large or small the numerator and denominator can be
export function generateFrac(lowerBound, upperBound) {
    if (lowerBound == upperBound)
        return String(lowerBound);
    let base = parseInt(generateInt(lowerBound, upperBound));
    let numerator;
    let denominator;
    do {
        numerator = parseInt(generateInt(1, 20));
        denominator = parseInt(generateInt(2, 10));
    } while (gcd(numerator, denominator) !== 1 || numerator / denominator > base);
    let baseStr = String(Math.floor(base - numerator / denominator));
    if (baseStr === "0")
        baseStr = "";
    return baseStr + " " + String(numerator) + "/" + String(denominator);
}
