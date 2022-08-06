import Timer from './Timer';

describe('Timer', () => {
    test('stop returns a number', () => {
        const timer = new Timer();
        const time = timer.stop();
        expect(typeof time).toBe('number');
        expect(time).toBeGreaterThanOrEqual(0);
    });
});
