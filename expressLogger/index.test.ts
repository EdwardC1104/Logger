import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';
import { expressLogger } from './index';

describe('Authorization middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = {
            method: 'GET',
            url: '/test',
            ip: '::1',
            user: {
                id: 0,
                username: 'testUsername',
                email: 'test@example.com',
                passwordHash: 'testPasswordHash',
                passwordSalt: 'testPasswordSalt',
            },
        };
        mockResponse = {
            statusCode: 200,
            statusMessage: 'OK',
            headersSent: true,
        };
    });

    test('logs metadata for OK response with the correct level', () => {
        const loggerSpy = jest.spyOn(logger, 'log');
        expressLogger(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(loggerSpy).toHaveBeenLastCalledWith('info', 'OK', {
            method: 'GET',
            url: '/test',
            statusCode: '200',
            statusMessage: 'OK',
            ip: '::1',
            responseTime: expect.any(String),
            username: 'testUsername',
            userId: 0,
            level: 'info',
        });
    });

    test('logs metadata for Not Found response with the correct level', () => {
        mockResponse.statusCode = 404;
        mockResponse.statusMessage = 'Not Found';

        const loggerSpy = jest.spyOn(logger, 'log');
        expressLogger(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(loggerSpy).toHaveBeenLastCalledWith('warn', 'Not Found', {
            method: 'GET',
            url: '/test',
            statusCode: '404',
            statusMessage: 'Not Found',
            ip: '::1',
            responseTime: expect.any(String),
            username: 'testUsername',
            userId: 0,
            level: 'warn',
        });
    });

    test('logs metadata for Internal Server Error response with the correct level', () => {
        mockResponse.statusCode = 500;
        mockResponse.statusMessage = 'Internal Server Error';

        const loggerSpy = jest.spyOn(logger, 'log');
        expressLogger(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(loggerSpy).toHaveBeenLastCalledWith('error', 'Internal Server Error', {
            method: 'GET',
            url: '/test',
            statusCode: '500',
            statusMessage: 'Internal Server Error',
            ip: '::1',
            responseTime: expect.any(String),
            username: 'testUsername',
            userId: 0,
            level: 'error',
        });
    });
});
