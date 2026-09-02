const { config } = require('./config/env');
const { connectDB } = require('./config/database');
const app = require('./app');

const start = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
  });
};

start();
