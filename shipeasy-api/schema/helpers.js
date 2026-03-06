const mongoose = require('mongoose');
const requestContext = require('../service/requestContext');

const AUDIT_EXEMPT_COLLECTIONS = new Set(['inappnotification', 'logaudit']);

async function createAuditLog(collectionName, action, resourceId, updatedData) {
    const traceId = requestContext.getTraceId();

    const auditlogModel = mongoose.models['auditlogModel'] ||
        mongoose.model('auditlogModel', new mongoose.Schema({
            action: String,
            resource: String,
            resourceId: String,
            updatedData: Object,
            updatedByUID: String,
            updatedBy: String,
            updatedOn: String,
            recordedOn: Date,
            traceId: String
        }), 'logaudits');

    await auditlogModel({
        action,
        resource: collectionName,
        resourceId,
        updatedByUID: updatedData?.updatedByUID || updatedData?.$set?.updatedByUID,
        updatedBy: updatedData?.updatedBy || updatedData?.$set?.updatedBy,
        updatedOn: updatedData?.updatedOn || updatedData?.$set?.updatedOn,
        updatedData: updatedData?.$set ? updatedData?.$set : updatedData,
        traceId,
        recordedOn: new Date().toISOString()
    }).save();
}

function registerSchemas(schemas) {
    const result = {};

    for (const [collectionName, definition] of Object.entries(schemas)) {
        const schema = new mongoose.Schema(definition);

        if (!AUDIT_EXEMPT_COLLECTIONS.has(collectionName)) {
            schema.post('findOneAndUpdate', async function (doc) {
                const updatedData = this.getUpdate();
                await createAuditLog(collectionName, 'UPDATE', doc ? doc[`${collectionName}Id`] : '', updatedData);
            });

            schema.post('findOneAndDelete', async function (doc) {
                const updatedData = this.getUpdate();
                await createAuditLog(collectionName, 'UPDATE', doc[`${collectionName}Id`], updatedData);
            });

            schema.post('findOneAndDelete', async function (doc) {
                if (doc) {
                    await createAuditLog(collectionName, 'DELETE', doc[`${collectionName}Id`], doc);
                }
            });

            schema.post('insertMany', async function (resultDocs) {
                for (let i = 0; i < resultDocs?.length; i++)
                    await createAuditLog(collectionName, 'CREATE', resultDocs[i][`${collectionName}Id`], resultDocs[i]);
            });

            schema.post('updateMany', async function (resultDocs) {
                for (let i = 0; i < resultDocs?.length; i++)
                    await createAuditLog(collectionName, 'UPDATE', resultDocs[i][`${collectionName}Id`], resultDocs[i]);
            });

            schema.post('save', async function (doc) {
                const updatedData = doc.toObject();
                await createAuditLog(collectionName, 'CREATE', doc[`${collectionName}Id`], updatedData);
            });
        }

        result[collectionName] = schema;
    }

    return result;
}

module.exports = { registerSchemas, createAuditLog };
