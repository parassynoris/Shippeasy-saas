const { mongoose, Schema, invoiceSchema, uuid, jwt, crypto, axios, azureStorage, inAppNotificationService, querystring, nodemailer, pdfScanner, ediController, OpenAI, objecdiff, sendMessage, getTextMessageInput, fs, _, simpleParser, connect, imapConfig, transporter, getChangedFields, removeIdField, recordLogAudit, encryptObject, decryptObject, isSubset, createInAppNotification, replacePlaceholders, generateRandomPassword, triggerPointExecute, insertIntoTally, getTransporter, getChildCompany} = require('./helper.controller')

exports.deleteCommon = async (req, res, next) => {
    const indexName = `${req.params.indexName}`;
    const documentId = req.params.id

    const Model = mongoose.models[`${indexName}Model`] || mongoose.model(`${indexName}Model`, Schema[indexName], `${indexName}s`);

    const query = {}
    query[`${req.params.indexName}Id`] = documentId

    Model.findOneAndDelete(query, {returnDocument : "before"})
        .then(async deletedDocument => {
            if (deletedDocument) {
                res.status(200).send(deletedDocument)
            }
            else
                res.status(404).send({ "error": "No document exist with provided id." })
        })
        .catch(err => {
            console.error(JSON.stringify({
                traceId : req?.traceId,
                error: err,
                stack : err?.stack
            }))
            res.status(500).send({ error : err?.message })
        });
}