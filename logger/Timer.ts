/**
 *  Used for measuring the length of an operation.
 *  Timer starts at construction.
 */
class Timer {
    start: number;
    constructor() {
        this.start = Date.now();
    }
    stop(): number {
        return Date.now() - this.start;
    }
}

export default Timer;
