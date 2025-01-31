"use strict";
// timer
exports.__esModule = true;
exports.Timer = void 0;
var Timer = /** @class */ (function () {
    function Timer(onUpdate, onEnd) {
        this.timerId = null;
        this.timeLeft = 0;
        this.onUpdate = onUpdate;
        this.onEnd = onEnd;
    }
    Timer.prototype.start = function (duration) {
        var _this = this;
        this.timeLeft = duration;
        if (this.timerId !== null)
            return; // Prevent multiple timers
        this.timerId = setInterval(function () {
            _this.timeLeft--;
            _this.onUpdate(_this.timeLeft);
            if (_this.timeLeft <= 0) {
                _this.stop();
                _this.onEnd();
            }
        }, 1000);
    };
    Timer.prototype.stop = function () {
        if (this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    };
    Timer.prototype.reset = function (duration) {
        this.stop();
        this.timeLeft = duration;
    };
    Timer.prototype.getTimeLeft = function () {
        return this.timeLeft;
    };
    return Timer;
}());
exports.Timer = Timer;
