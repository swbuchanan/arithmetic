
export class Settings {

    private operationBounds: Record<string, { leftMin: number; leftMax: number; rightMin: number; rightMax: number }>;


    constructor() {
        this.operationBounds = {
          addition: { leftMin: 1, leftMax: 99, rightMin: 1, rightMax: 99 },
          subtraction: { leftMin: 1, leftMax: 99, rightMin: 1, rightMax: 99 },
          multiplication: { leftMin: 2, leftMax: 12, rightMin: 2, rightMax: 99 },
          division: { leftMin: 1, leftMax: 100, rightMin: 1, rightMax: 100 }
        };
    }

    public updateSetting(input: HTMLInputElement) { // is it good practice to have this type of input??
        if (input.type === "number") {
            if (!input.valueAsNumber) throw new Error("Not a number");
            console.log(`updating ${input.id} with value ${input.valueAsNumber}`);
            console.log(this.operationBounds);
        }
    }
}
