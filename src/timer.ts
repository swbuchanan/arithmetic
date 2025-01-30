
export class Timer {
    private timerId: ReturnType<typeof setInterval> | null = null;
    private timeLeft: number;
    private onUpdate: (timeLeft: number) => void;
    private onEnd: () => void;

    constructor(onUpdate: (timeLeft: number) => void, onEnd: () => void) {
        this.timeLeft = 0;
        this.onUpdate = onUpdate;
        this.onEnd = onEnd;
  }

    start(duration: number): void {
        this.timeLeft = duration;
        if (this.timerId !== null) return; // Prevent multiple timers

        this.timerId = setInterval(() => {
            this.timeLeft--;
            this.onUpdate(this.timeLeft);

            if (this.timeLeft <= 0) {
                this.stop();
                this.onEnd();
            }
        }, 1000);
    }

    stop(): void {
        if (this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    reset(duration: number): void {
        this.stop();
        this.timeLeft = duration;
    }

    getTimeLeft(): number {
        return this.timeLeft;
    }
}

