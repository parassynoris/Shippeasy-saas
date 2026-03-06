const winston = require('winston');
const { format } = winston;

const transports = [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    })
];

if (process.env.CLOUDWATCH_LOG_GROUP && process.env.AWS_REGION) {
    try {
        const WinstonCloudWatch = require('winston-cloudwatch');
        transports.push(new WinstonCloudWatch({
            logGroupName: process.env.CLOUDWATCH_LOG_GROUP,
            logStreamName: `${process.env.ENVIRONMENT || 'unknown'}-${process.env.HOSTNAME || 'local'}`,
            awsRegion: process.env.AWS_REGION,
            jsonMessage: true,
            retentionInDays: process.env.CLOUDWATCH_RETENTION_DAYS
                ? parseInt(process.env.CLOUDWATCH_RETENTION_DAYS, 10)
                : 30,
            level: process.env.CLOUDWATCH_LOG_LEVEL || 'info',
        }));
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to initialize CloudWatch transport:', err.message);
    }
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports,
});

module.exports = logger;
