
export class Settings {

    // private operationBounds: Record<string, { leftMin: number; leftMax: number; rightMin: number; rightMax: number }>;
    private operationBounds: Record<string, number>;


    constructor() {
        this.operationBounds = {
          additionLeftMin: 1,       additionLeftMax: 99,
          additionRightMin: 1,      additionRightMax: 99,
          subtractionLeftMin: 1,    subtractionLeftMax: 99,
          subtractionRightMin: 1,   subtractionRightMax: 99,
          multiplicationLeftMin: 2, multiplicationLeftMax: 12,
          multiplicationRightMin: 2,multiplicationRightMax: 99,
          divisionLeftMin: 1,       divisionLeftMax: 100,
          divisionRightMin: 1,      divisionRightMax: 100
        };
        console.log("Settings handler created.");
    }

    public updateSetting(input: HTMLInputElement) { // is it good practice to have this type of input??
        if (input.type === "number") {
            if (!input.valueAsNumber) throw new Error("Not a number");
            console.log(`updating ${input.id} with value ${input.valueAsNumber}`);
            console.log(this.operationBounds);
        }
    }
}
