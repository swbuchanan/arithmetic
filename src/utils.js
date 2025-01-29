"use strict";
exports.__esModule = true;
exports.generateFrac = exports.generateDec = exports.generateInt = exports.addFracs = exports.gcd = void 0;
var operations = {
    add: function (a, b) { return a + b; },
    subtract: function (a, b) { return a - b; },
    multiply: function (a, b) { return a * b; },
    divide: function (a, b) { return a / b; }
};
// find gcd using Euclid's algorithm
function gcd(a, b) {
    while (b != 0) {
        var temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}
exports.gcd = gcd;
;
function addFracs(num1, den1, num2, den2) {
    return (num1 * den2 + num2 * den1) / (den1 * den2);
}
exports.addFracs = addFracs;
// generate a random integer between the bounds
function generateInt(lowerBound, upperBound) {
    return Math.floor(Math.random() * (upperBound - lowerBound)) + lowerBound;
}
exports.generateInt = generateInt;
// generate a random decimal with the given conditions
function generateDec(lowerBound, upperBound, decimalPlaces) {
    var num = Math.random() * (upperBound - lowerBound) + lowerBound;
    return parseFloat(num.toFixed(decimalPlaces));
}
exports.generateDec = generateDec;
// generate a random fraction
// at the moment the numerator and denominator are always at most 9, and the denominator is at least 2
function generateFrac() {
    var numerator;
    var denominator;
    do {
        numerator = generateInt(1, 9);
        denominator = generateInt(2, 9);
    } while (gcd(numerator, denominator) !== 1);
    return [numerator, denominator];
}
exports.generateFrac = generateFrac;
