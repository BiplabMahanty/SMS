import { config } from './config/env';
import { connectDB } from './config/database';
import app from './app';

const start = async (): Promise<void> => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
  });
};

start();
