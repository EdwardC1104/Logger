import { logger } from './index';
import Timer from './Timer';
import fs from 'fs';
import winston from 'winston';
import Stream from 'stream';
import readline from 'readline';

abstract class LoggerNoPrivate extends logger {
    public winstonLogger: winston.Logger;
}
// logger.winstonLogger is a private property however it is needed for testing.
const loggerNoPrivate = logger as unknown as LoggerNoPrivate;

describe('logger', () => {
    const getLastLine = (fileName: string, minLength: number) => {
        let inStream = fs.createReadStream(fileName);
        let outStream = new Stream() as unknown as NodeJS.WritableStream;
        return new Promise((resolve, reject) => {
            let rl = readline.createInterface(inStream, outStream);

            let lastLine = '';
            rl.on('line', function (line) {
                if (line.length >= minLength) {
                    lastLine = line;
                }
            });

            rl.on('error', reject);

            rl.on('close', function () {
                resolve(lastLine);
            });
        });
    };

    test('startTimer() returns a timer', () => {
        const timer = logger.startTimer();
        expect(timer).toBeInstanceOf(Timer);
    });

    test('log() calls winston log with the correct parameters', () => {
        const winstonSpy = jest.spyOn(loggerNoPrivate.winstonLogger, 'log');

        logger.log('info', 'test', { testData: 'test' });

        expect(winstonSpy).toHaveBeenCalledWith('info', 'test', { testData: 'test' });

        logger.log('error', 'test error', { callstack: 'test test:1:34' });

        expect(winstonSpy).toHaveBeenCalledWith('error', 'test error', {
            callstack: 'test test:1:34',
        });
    });

    test('errors are appended to logs/error.log', async () => {
        logger.log('error', 'test error for file', { callstack: 'testfile testfile:1:34' });

        const lastLine = getLastLine('./logs/error.log', 1);

        await expect(lastLine).resolves.toContain('"callstack":"testfile testfile:1:34"');
        await expect(lastLine).resolves.toContain('"level":"error"');
        await expect(lastLine).resolves.toContain('"message":"test error for file"');
    });

    test('warnings are appended to logs/combined.log', async () => {
        logger.log('warn', 'test warn for file', { statusCode: '404' });

        const lastLine = getLastLine('./logs/combined.log', 1);

        await expect(lastLine).resolves.toContain('"statusCode":"404"');
        await expect(lastLine).resolves.toContain('"level":"warn"');
        await expect(lastLine).resolves.toContain('"message":"test warn for file"');
    });

    test('warnings are NOT appended to logs/error.log', async () => {
        logger.log('warn', 'test warn for file', { statusCode: '404' });

        const lastLine = getLastLine('./logs/error.log', 1);

        await expect(lastLine).resolves.not.toContain('"statusCode":"404"');
        await expect(lastLine).resolves.not.toContain('"level":"warn"');
        await expect(lastLine).resolves.not.toContain('"message":"test warn for file"');
    });

    test('setServiceName() adds {service: "serviceName"} to all logs', () => {
        logger.setServiceName('test');

        expect(loggerNoPrivate.winstonLogger.defaultMeta.service).toBe('test');
    });

    test('shouldLogExceptions() tells winston to log exceptions', () => {
        logger.shouldLogExceptions();

        expect(loggerNoPrivate.winstonLogger.exceptions.handlers.size).toBeGreaterThanOrEqual(1);
    });

    test('shouldLogExceptions(true) tells winston to log exceptions', () => {
        logger.shouldLogExceptions(true);

        expect(loggerNoPrivate.winstonLogger.exceptions.handlers.size).toBeGreaterThanOrEqual(1);
    });

    test('shouldLogExceptions(false) tells winston to NOT log exceptions', () => {
        logger.shouldLogExceptions(false);

        expect(loggerNoPrivate.winstonLogger.exceptions.handlers.size).toBe(0);
    });

    test('shouldLogRejections() tells winston to log rejections', () => {
        logger.shouldLogRejections();

        expect(loggerNoPrivate.winstonLogger.rejections.handlers.size).toBeGreaterThanOrEqual(1);
    });

    test('shouldLogRejections(true) tells winston to log rejections', () => {
        logger.shouldLogRejections(true);

        expect(loggerNoPrivate.winstonLogger.rejections.handlers.size).toBeGreaterThanOrEqual(1);
    });

    test('shouldLogRejections(false) tells winston to NOT log rejections', () => {
        logger.shouldLogRejections(false);

        expect(loggerNoPrivate.winstonLogger.rejections.handlers.size).toBe(0);
    });
});
