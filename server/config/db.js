import mongoose from 'mongoose';

export const connectDB = async (retryCount = 0) => {
  const maxRetries = 5;
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/raza_shoe_palace';

  const mongooseOptions = {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    maxPoolSize: 50,
  };

  try {
    const conn = await mongoose.connect(mongoUri, mongooseOptions);
    console.log(`[MongoDB Atlas/Server] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection attempt ${retryCount + 1} failed: ${error.message}`);

    if (retryCount < maxRetries) {
      const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(`[MongoDB] Retrying connection in ${waitTime / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return connectDB(retryCount + 1);
    } else {
      console.error('[MongoDB Error] Maximum connection retries exceeded. Application running in degraded state.');
      return null;
    }
  }
};

// Monitor connection state changes
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB Event] Connection lost. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB Event] Connection re-established.');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB Event] Runtime error:', err.message);
});
