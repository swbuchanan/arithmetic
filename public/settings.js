"use strict";
// manages the user-determined settings
exports.__esModule = true;
exports.Settings = void 0;
var Settings = /** @class */ (function () {
    function Settings() {
        this.operationBounds = {
            additionLeftMin: 1, additionLeftMax: 99,
            additionRightMin: 1, additionRightMax: 99,
            subtractionLeftMin: 1, subtractionLeftMax: 99,
            subtractionRightMin: 1, subtractionRightMax: 99,
            multiplicationLeftMin: 2, multiplicationLeftMax: 12,
            multiplicationRightMin: 2, multiplicationRightMax: 99,
            divisionLeftMin: 1, divisionLeftMax: 100,
            divisionRightMin: 1, divisionRightMax: 100,
            timeLimit: 120
        };
        this.includeTypes = {
            integerAdditionToggle: true,
            decimalAdditionToggle: false,
            fractionAdditionToggle: false,
            integerSubtractionToggle: true,
            decimalSubtractionToggle: false,
            fractionSubtractionToggle: false,
            integerMultiplicationToggle: true,
            decimalMultplicationToggle: false,
            fractionMultplicationToggle: false,
            integerDivisionToggle: true,
            decimalDivisionToggle: false,
            fractionDivisionToggle: false
        };
        console.log("Settings handler created.");
    }
    Settings.prototype.getOperationBounds = function () {
        return this.operationBounds;
    };
    Settings.prototype.updateBound = function (name, value) {
        if (!value) {
            throw new Error("Bad value passed.");
        }
        if (!name) {
            throw new Error("No such bound exists.");
        }
        console.log("updating ".concat(name, " with value ").concat(value));
        this.operationBounds[name] = value;
    };
    Settings.prototype.getBound = function (name) {
        return this.operationBounds[name];
    };
    Settings.prototype.updateToggle = function (name, value) {
        if (!name) {
            throw new Error("No such toggle exists.");
        }
        console.log("updating ".concat(name, " with value ").concat(value));
        this.includeTypes[name] = value;
    };
    return Settings;
}());
exports.Settings = Settings;
