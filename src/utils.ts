
type Operation = (a: number, b: number) => number;

export const operations: Record<string, Operation> = {
  addition: (a, b) => a + b,
  subtraction: (a, b) => a - b,
  multiplication: (a, b) => a * b,
  division: (a, b) => a / b,
}

// find gcd using Euclid's algorithm
export function gcd(a: number, b: number): number {
  while (b != 0){
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

export function addFracs(num1: number, den1: number, num2: number, den2: number): number {
  return (num1*den2 + num2*den1)/(den1*den2);
}

// generate a random integer between the bounds
export function generateInt(lowerBound: number, upperBound: number): number {
  return Math.floor(Math.random()*(upperBound - lowerBound)) + lowerBound;
}

  // generate a random decimal with the given conditions
export function generateDec(lowerBound: number, upperBound: number, decimalPlaces: number): number {
  const num = Math.random()*(upperBound - lowerBound) + lowerBound;
  return parseFloat(num.toFixed(decimalPlaces));
}

  // generate a random fraction
  // at the moment the numerator and denominator are always at most 9, and the denominator is at least 2
export function generateFrac(): number[] {
  let numerator: number;
  let denominator: number;
  do {
    numerator = generateInt(1,9);
    denominator = generateInt(2,9);
  } while (gcd(numerator, denominator) !== 1);
  return [numerator, denominator];
}
