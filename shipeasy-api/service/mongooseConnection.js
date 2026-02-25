const mongoose = require('mongoose');

exports.connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected');
  } catch (error) {
    console.error('Failed to connect to MongoDB database:', error);
  }
}
exports.disconnectFromDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB database:', error);
  }
}