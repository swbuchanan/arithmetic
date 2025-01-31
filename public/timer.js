// timer
export class Timer {
    constructor(onUpdate, onEnd) {
        this.timerId = null;
        this.timeLeft = 0;
        this.onUpdate = onUpdate;
        this.onEnd = onEnd;
    }
    start(duration) {
        this.timeLeft = duration;
        if (this.timerId !== null)
            return; // Prevent multiple timers
        this.timerId = setInterval(() => {
            this.timeLeft--;
            this.onUpdate(this.timeLeft);
            if (this.timeLeft <= 0) {
                this.stop();
                this.onEnd();
            }
        }, 1000);
    }
    stop() {
        if (this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }
    reset(duration) {
        this.stop();
        this.timeLeft = duration;
    }
    getTimeLeft() {
        return this.timeLeft;
    }
}
