export const operations = {
    addition: (a, b) => a + b,
    subtraction: (a, b) => a - b,
    multiplication: (a, b) => a * b,
    division: (a, b) => a / b,
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
 * @param frac1 - an array of strings of length 2, where the first element is the numerator and the second is the denominator
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
// the important thing is that it can deal with fractions
export function parseNumber(number) {
    if (number.includes("/")) {
        let numberArr = number.split("/");
        if (numberArr.length > 2)
            return parseFloat(number);
        return parseFloat(numberArr[0]) / parseFloat(numberArr[1]);
    }
    ;
    return parseFloat(number);
}
// generates a number of the given type
export function generateNum(numberType, lowerBound, upperBound) {
    if (numberType === "integer")
        return generateInt(lowerBound, upperBound);
    if (numberType === "decimal")
        return generateDec(lowerBound, upperBound);
    if (numberType === "fraction")
        return generateFrac();
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
// generate a random fraction
// at the moment the numerator and denominator are always at most 9, and the denominator is at least 2
export function generateFrac() {
    let numerator;
    let denominator;
    do {
        numerator = parseInt(generateInt(1, 9));
        denominator = parseInt(generateInt(2, 9));
    } while (gcd(numerator, denominator) !== 1);
    return String(numerator) + "/" + String(denominator);
}
