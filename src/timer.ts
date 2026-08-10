// timer

export class Timer {
    private timerId: ReturnType<typeof setInterval> | null = null;
    private timeLeft: number;
    private deadline = 0;
    private onUpdate: (timeLeft: number) => void;
    private onEnd: () => void;

    constructor(onUpdate: (timeLeft: number) => void, onEnd: () => void) {
        this.timeLeft = 0;
        this.onUpdate = onUpdate;
        this.onEnd = onEnd;
  }

    start(duration: number): void {
        this.stop();
        this.timeLeft = Math.ceil(duration);
        this.deadline = Date.now() + duration * 1000;
        this.onUpdate(this.timeLeft);

        this.timerId = setInterval(() => this.tick(), 250);
    }

    stop(): void {
        if (this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    reset(duration: number): void {
        this.stop();
        this.timeLeft = Math.ceil(duration);
        this.deadline = 0;
    }

    getTimeLeft(): number {
        return this.timeLeft;
    }

    hasExpired(): boolean {
        return this.deadline > 0 && Date.now() >= this.deadline;
    }

    private tick(): void {
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
