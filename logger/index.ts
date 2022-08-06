import { transports, format, createLogger as createWinstonLogger, Logger } from 'winston';
import Timer from './Timer';

/**
 * A service-wide logger class.
 */
class logger {
    private static winstonLogger: Logger = createWinstonLogger({
        level: 'info',
        defaultMeta: { service: '' },
        transports: [
            new transports.File({
                filename: 'logs/error.log',
                level: 'error',
                format: format.combine(format.timestamp(), format.json()),
            }),
            new transports.File({
                filename: 'logs/combined.log',
                level: 'warn',
                format: format.combine(format.timestamp(), format.json()),
            }),
            new transports.Console({
                level: 'silly',
                format: format.combine(format.colorize(), format.timestamp(), format.simple()),
            }),
        ],
    });

    /**
     * Logs a message and any metadata.
     */
    static log(level: string, message: string, meta?: any) {
        logger.winstonLogger.log(level, message, meta);
    }

    /**
     * Controls whether unhandled exceptions are logged.
     */
    static shouldLogExceptions = (should: boolean = true) => {
        const file = new transports.File({
            filename: 'logs/exceptions.log',
            format: format.combine(format.timestamp(), format.json()),
        });
        if (should) this.winstonLogger.exceptions.handle(file);
        else this.winstonLogger.exceptions.handlers = new Map();
    };

    /**
     * Controls whether unhandled rejections are logged.
     */
    static shouldLogRejections = (should: boolean = true) => {
        if (should)
            this.winstonLogger.rejections.handle(
                new transports.File({
                    filename: 'logs/rejections.log',
                    format: format.combine(format.timestamp(), format.json()),
                }),
            );
        else this.winstonLogger.rejections.handlers = new Map();
    };

    /**
     * Sets the service name.
     * This is included in the metadata of all logs.
     */
    static setServiceName = (serviceName: string) => {
        this.winstonLogger.defaultMeta.service = serviceName;
    };

    /**
     * Starts a new timer and returns it.
     */
    static startTimer = () => {
        return new Timer();
    };
}

export { logger };
