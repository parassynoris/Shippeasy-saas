const mongoose = require('mongoose');

const applyIndexes = () => {
    const indexes = {
        users: [
            { fields: { userLogin: 1 }, options: { unique: true, sparse: true } },
            { fields: { userEmail: 1 }, options: { sparse: true } },
            { fields: { orgId: 1, userStatus: 1 } },
            { fields: { orgId: 1, userType: 1 } },
            { fields: { tokenVersion: 1 } },
        ],
        agents: [
            { fields: { agentId: 1 }, options: { unique: true } },
            { fields: { isTrial: 1, trialValidTill: 1 } },
        ],
        batchs: [
            { fields: { batchId: 1 }, options: { unique: true } },
            { fields: { orgId: 1 } },
            { fields: { orgId: 1, 'statusOfBatch': 1 } },
            { fields: { orgId: 1, createdOn: -1 } },
        ],
        enquirys: [
            { fields: { enquiryId: 1 }, options: { unique: true } },
            { fields: { orgId: 1 } },
            { fields: { orgId: 1, createdOn: -1 } },
        ],
        quotations: [
            { fields: { quotationId: 1 }, options: { unique: true } },
            { fields: { orgId: 1 } },
            { fields: { orgId: 1, quoteStatus: 1 } },
            { fields: { orgId: 1, validTo: 1 } },
        ],
        invoices: [
            { fields: { invoiceId: 1 }, options: { unique: true } },
            { fields: { orgId: 1 } },
            { fields: { batchId: 1 } },
            { fields: { orgId: 1, createdOn: -1 } },
        ],
        transactions: [
            { fields: { transactionId: 1 }, options: { unique: true } },
            { fields: { orgId: 1 } },
            { fields: { batchId: 1 } },
            { fields: { invoiceId: 1 } },
        ],
        containers: [
            { fields: { containerId: 1 }, options: { unique: true } },
            { fields: { batchId: 1 } },
            { fields: { containerNumber: 1 } },
            { fields: { orgId: 1 } },
        ],
        containerevents: [
            { fields: { containereventId: 1 }, options: { unique: true } },
            { fields: { batchId: 1 } },
            { fields: { containerNumber: 1 } },
        ],
        documents: [
            { fields: { documentId: 1 }, options: { unique: true } },
            { fields: { batchId: 1 } },
            { fields: { orgId: 1 } },
        ],
        bls: [
            { fields: { blId: 1 }, options: { unique: true } },
            { fields: { batchId: 1 } },
            { fields: { orgId: 1, blType: 1 } },
            { fields: { blNumber: 1 } },
        ],
        payments: [
            { fields: { paymentId: 1 }, options: { unique: true } },
            { fields: { invoiceId: 1 } },
            { fields: { orgId: 1 } },
        ],
        events: [
            { fields: { eventId: 1 }, options: { unique: true } },
            { fields: { entityId: 1 } },
            { fields: { entityId: 1, eventTag: 1 } },
        ],
        milestones: [
            { fields: { milestoneId: 1 }, options: { unique: true } },
            { fields: { batchId: 1 } },
        ],
        emails: [
            { fields: { emailId: 1 }, options: { unique: true } },
            { fields: { batchId: 1 } },
            { fields: { orgId: 1 } },
        ],
        partymasters: [
            { fields: { partymasterId: 1 }, options: { unique: true } },
            { fields: { orgId: 1 } },
            { fields: { primaryMailId: 1 } },
        ],
        inappnotifications: [
            { fields: { userId: 1, isRead: 1 } },
            { fields: { orgId: 1 } },
            { fields: { createdOn: -1 } },
        ],
        logaudits: [
            { fields: { resource: 1, resourceId: 1 } },
            { fields: { recordedOn: -1 } },
            { fields: { traceId: 1 } },
        ],
        reminders: [
            { fields: { reminderId: 1 }, options: { unique: true } },
            { fields: { batchId: 1 } },
            { fields: { reminderTime: 1, isSent: 1 } },
        ],
        messages: [
            { fields: { messageId: 1 } },
            { fields: { fromUserId: 1 } },
            { fields: { createdOn: -1 } },
        ],
        carrierbookings: [
            { fields: { carrierbookingId: 1 }, options: { unique: true } },
            { fields: { batchId: 1 } },
            { fields: { orgId: 1 } },
        ],
        instructions: [
            { fields: { instructionId: 1 }, options: { unique: true } },
            { fields: { batchId: 1 } },
        ],
        igms: [
            { fields: { igmId: 1 }, options: { unique: true } },
            { fields: { batchId: 1 } },
        ],
        egms: [
            { fields: { egmId: 1 }, options: { unique: true } },
            { fields: { batchId: 1 } },
        ],
        shippingbills: [
            { fields: { shippingbillId: 1 }, options: { unique: true } },
            { fields: { batchId: 1 } },
        ],
        triggers: [
            { fields: { triggerId: 1 }, options: { unique: true } },
            { fields: { entityType: 1, triggerPoint: 1 } },
            { fields: { orgId: 1 } },
        ],
        schedulereports: [
            { fields: { schedulereportId: 1 }, options: { unique: true } },
            { fields: { orgId: 1 } },
        ],
    };

    mongoose.connection.on('connected', async () => {
        const db = mongoose.connection.db;
        if (!db) return;

        for (const [collectionName, collectionIndexes] of Object.entries(indexes)) {
            try {
                const collection = db.collection(collectionName);
                for (const { fields, options = {} } of collectionIndexes) {
                    try {
                        await collection.createIndex(fields, {
                            background: true,
                            ...options,
                        });
                    } catch (indexErr) {
                        if (indexErr.code !== 85 && indexErr.code !== 86) {
                            console.error(`Index creation failed for ${collectionName}:`, indexErr.message);
                        }
                    }
                }
            } catch (err) {
                console.error(`Failed to process indexes for ${collectionName}:`, err.message);
            }
        }
        console.log(`[${new Date().toISOString()}] Database indexes applied`);
    });
};

module.exports = { applyIndexes };
