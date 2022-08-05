import { logger } from 'logger';
import 'dotenv/config';
import { app } from './app';

logger.setServiceName('auth');
logger.shouldLogExceptions();
logger.shouldLogRejections();

// Start the server:
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    logger.log('info', `🚀 Server up and running on port ${PORT}`, { port: PORT });
});
