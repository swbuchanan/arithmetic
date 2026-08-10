// timer
export class Timer {
    constructor(onUpdate, onEnd) {
        this.timerId = null;
        this.deadline = 0;
        this.timeLeft = 0;
        this.onUpdate = onUpdate;
        this.onEnd = onEnd;
    }
    start(duration) {
        this.stop();
        this.timeLeft = Math.ceil(duration);
        this.deadline = Date.now() + duration * 1000;
        this.onUpdate(this.timeLeft);
        this.timerId = setInterval(() => this.tick(), 250);
    }
    stop() {
        if (this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }
    reset(duration) {
        this.stop();
        this.timeLeft = Math.ceil(duration);
        this.deadline = 0;
    }
    getTimeLeft() {
        return this.timeLeft;
    }
    hasExpired() {
        return this.deadline > 0 && Date.now() >= this.deadline;
    }
    tick() {
        const nextTimeLeft = Math.max(0, Math.ceil((this.deadline - Date.now()) / 1000));
        if (nextTimeLeft !== this.timeLeft) {
            this.timeLeft = nextTimeLeft;
            this.onUpdate(this.timeLeft);
        }
        if (this.timeLeft === 0) {
            this.stop();
            this.onEnd();
        }
    }
}
