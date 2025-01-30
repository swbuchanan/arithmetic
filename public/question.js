export class QuestionGenerator {
    /*
    questionString is what's put into the html
    questionType is addition,

    */
    constructor() {
    }
    /**
     * Generates a math question of any type
     * @param allowedTypes - What sort of numbers are allowed in the question
     * @param allowRearrangements - If this is true, the question can look like 'a + ? = b' or '? + a = b', otherwise it will look like 'a + b = ?'.
     * @returns A string that can be inserted into html to display a math question
     */
    generateQuestion(allowedTypes, allowRearrangements) {
        if (allowedTypes.length === 0) {
            throw new Error("Must have at least one allowed question type");
        }
        let chosenType = false;
        //        while (!chosenType) {
        //            chosenType = allowedTypes[]
        //        }
        return { question: "2 + 2 = ?", type: "integer", answer: 4 };
    }
}
