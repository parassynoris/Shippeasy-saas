const { mongoose, Schema, invoiceSchema, uuid, jwt, crypto, axios, azureStorage, inAppNotificationService, querystring, nodemailer, pdfScanner, ediController, OpenAI, objecdiff, sendMessage, getTextMessageInput, fs, _, simpleParser, connect, imapConfig, transporter, getChangedFields, removeIdField, recordLogAudit, encryptObject, decryptObject, isSubset, createInAppNotification, replacePlaceholders, generateRandomPassword, triggerPointExecute, insertIntoTally, getTransporter, getChildCompany} = require('./helper.controller')

exports.generateTALLYEntry = async (req, res, next) => {
    const { invoiceId } = req.body;

    const invoiceModel = mongoose.models[`invoiceModel`] || mongoose.model(`invoiceModel`, Schema["invoice"], `invoices`);
    const invoiceData = await invoiceModel.findOne({invoiceId : invoiceId})
    
    if(invoiceData){
        insertIntoTally(req, invoiceData)
        res.send({status : "invoice entered in tally!"})
    } else {
        console.error(JSON.stringify({
            traceId : req?.traceId,
            error: `no invoice found having invoiceId : ${invoiceId}!`
        }))
        res.status(401).send({status : `no invoice found having invoiceId : ${invoiceId}!`})
    }
}