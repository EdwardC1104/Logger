import { logger } from 'logger';
import { Request, Response, Router } from 'express';

const router = Router();

/**
 * Logs every request with the appropriate level and metadata.
 */
router.use((req, res, next) => {
    // Mesaure the time it takes to respond to the request
    const timer = logger.startTimer();

    const performLogging = (req: Request, res: Response) => {
        // Choose level based on the status code
        var level = '';
        if (res.statusCode >= 100) level = 'info';
        if (res.statusCode >= 400) level = 'warn';
        if (res.statusCode >= 500) level = 'error';

        // Get all the need information
        const { method, url, ip } = req;
        const { statusCode: statusCodeNum, statusMessage } = res;
        const statusCode = statusCodeNum.toString();

        const username = req.user?.username;
        const userId = req.user?.id;

        const responseTime = `${timer.stop()}ms`;

        // Perform the logging using the logger class
        logger.log(level, statusMessage, {
            method,
            url,
            statusCode,
            statusMessage,
            ip,
            responseTime,
            username,
            userId,
            level,
        });
    };

    // Logging should be performed after the response is sent
    if (res.headersSent) performLogging(req, res);
    else res.on('finish', () => performLogging(req, res));

    next();
});

export { router as expressLogger };
