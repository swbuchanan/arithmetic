const operations = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    multiply: (a, b) => a * b,
    divide: (a, b) => a / b,
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
export function addFracs(num1, den1, num2, den2) {
    return (num1 * den2 + num2 * den1) / (den1 * den2);
}
// generate a random integer between the bounds
export function generateInt(lowerBound, upperBound) {
    return Math.floor(Math.random() * (upperBound - lowerBound)) + lowerBound;
}
// generate a random decimal with the given conditions
export function generateDec(lowerBound, upperBound, decimalPlaces) {
    const num = Math.random() * (upperBound - lowerBound) + lowerBound;
    return parseFloat(num.toFixed(decimalPlaces));
}
// generate a random fraction
// at the moment the numerator and denominator are always at most 9, and the denominator is at least 2
export function generateFrac() {
    let numerator;
    let denominator;
    do {
        numerator = generateInt(1, 9);
        denominator = generateInt(2, 9);
    } while (gcd(numerator, denominator) !== 1);
    return [numerator, denominator];
}
