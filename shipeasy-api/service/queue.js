const { Queue } = require('bullmq');

const emailQueue = new Queue('email', {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
  },
});

module.exports = {
  emailQueue,
};
