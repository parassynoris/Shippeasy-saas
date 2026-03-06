const mongoose = require('mongoose');

exports.connectToDatabase = async () => {
  try {
    const connectionOptions = {
      // Connection pool settings for production performance
      maxPoolSize: parseInt(process.env.MONGO_POOL_SIZE, 10) || 10,
      minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE, 10) || 2,
      maxIdleTimeMS: 30000,
      // Timeouts
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      // Heartbeat
      heartbeatFrequencyMS: 10000,
    };

    await mongoose.connect(process.env.MONGO_CONNECTION, connectionOptions);
    console.log(JSON.stringify({
      event: 'database_connected',
      poolSize: connectionOptions.maxPoolSize,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error(JSON.stringify({
      event: 'database_connection_failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }));
    // Exit process on DB connection failure in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

exports.disconnectFromDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log(JSON.stringify({
      event: 'database_disconnected',
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error(JSON.stringify({
      event: 'database_disconnect_failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }));
  }
}