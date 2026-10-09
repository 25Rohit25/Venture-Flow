import { app } from './app.js';
import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';
import { StartupModel } from './modules/startups/startup.model.js';
import { InterestModel } from './modules/interests/interest.model.js';
import { BookmarkModel } from './modules/bookmarks/bookmark.model.js';
import { UserModel } from './modules/auth/user.model.js';

async function bootstrap() {
  try {
    await connectDatabase();

    // Ensure critical unique and compound indexes are synced in MongoDB
    await Promise.all([
      UserModel.init(),
      StartupModel.init(),
      InterestModel.init(),
      BookmarkModel.init(),
    ]);
    logger.info('MongoDB indexes synchronized');

    const server = app.listen(config.port, () => {
      logger.info(`VentureFlow API server listening on port ${config.port}`, {
        environment: config.env,
        port: config.port,
      });
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start VentureFlow server', { error: String(error) });
    process.exit(1);
  }
}

bootstrap();
