"use strict";
// generates questions to display
exports.__esModule = true;
exports.QuestionGenerator = void 0;
var Utils = require("./utils.js");
var QuestionGenerator = /** @class */ (function () {
    function QuestionGenerator(operationBounds) {
        this.operationBounds = operationBounds;
        console.log("Question generator created.");
    }
    /**
     * Generates a math question of any type
     * @param allowedTypes - What sort of numbers are allowed in the question; should be a set containing some combination of the allowed types listed above
     * @param allowRearrangements - If this is true, the question can look like 'a + ? = b' or '? + a = b', otherwise it will look like 'a + b = ?'.
     * @returns A string that can be inserted into html to display a math question
     */
    QuestionGenerator.prototype.generateQuestion = function (allowedTypes, allowRearrangements) {
        if (allowedTypes.length === 0) {
            throw new Error("Must have at least one allowed question type.");
        }
        var chosenType = allowedTypes[Utils.generateInt(0, allowedTypes.length)];
        var num1 = Utils.generateInt(this.operationBounds.additionLeftMin, this.operationBounds.additionLeftMax);
        var num2 = Utils.generateInt(this.operationBounds.additionRightMin, this.operationBounds.additionRightMax);
        return { question: "".concat(num1, " + ").concat(num2, " = "), type: 'integer', answer: num1 + num2 };
        //        return {question: "2 + 2 = ?", type: "integer", answer: 4};
    };
    return QuestionGenerator;
}());
exports.QuestionGenerator = QuestionGenerator;
