const simpleParser = require('mailparser').simpleParser;
const { connect } = require('imap-simple');
const mongoose = require('mongoose');
const Schema = require('../schema/schema');
const uuid = require('uuid');
const inAppNotificationService = require('../service/inAppNotification')
const azureStorage = require('./azureStorageController');
const newSchemaWithObject = require('../schema/schema');

let connection;

const imapConfig = {
    imap: {
        user: process.env.EMAIL_SMTP,
        password: process.env.PASS_SMTP,
        host: process.env.SERVER_SMTP,
        port: 993,
        tls: true,
        authTimeout: 3000,
        tlsOptions: {
            rejectUnauthorized: false // Ignore SSL/TLS errors
        }
    }
};

// Function to establish IMAP connection
async function establishConnection() {
    try {
        connection = await connect(imapConfig);
    } catch (err) {
        console.error('Failed to connect to IMAP server:', err.message);
        // Handle the error, e.g., notify an admin, retry logic, etc.
    }
}

// Function to fetch and process emails
exports.fetchAndProcessEmails = async () => {
    if (!connection) {
        console.error('No connection established. Exiting email fetch process.');
        await establishConnection();
        return;
    }

    try {
        await connection.openBox('INBOX');
        const searchCriteria = ['UNSEEN'];
        const messages = await connection.search(searchCriteria, { bodies: '' });

        for (const message of messages) {
            try {
                await connection.addFlags(message.attributes.uid, ['\\Seen']);

                simpleParser(message.parts[0].body, async (err, parsed) => {
                    if (err) {
                        console.error('Error parsing email:', err);
                        return;
                    }

                    if (parsed.inReplyTo) {
                        const batchId = parsed.references[0].replace("<", "").replace("@gmail.com>", "");
                        const BatchModel = mongoose.models[`BatchModel`] || mongoose.model(`BatchModel`, Schema["batch"], `batchs`);
                        
                        const batch = await BatchModel.findOne({ 'batchId': batchId });
                        if (batch) {
                            const emailModel = mongoose.models[`emailModel`] || mongoose.model(`emailModel`, Schema["email"], `emails`);
    
                            const attachmentsForEmail = []
                            for(let attachment = 0; attachment < parsed.attachments.length; attachment++){
                                const attachmentObj = parsed.attachments[attachment]
                                        
                                
                                const response = await azureStorage.uploadFile(attachmentObj.filename, 
                                    {
                                        buffer : attachmentObj.content,
                                        size : attachmentObj.size
                                    }
                                )

                                attachmentsForEmail.push({
                                    name : response?.name,
                                    attchmentId : uuid.v1(),
                                    contentType : attachmentObj.contentType,
                                    size : attachmentObj.size
                                })
                            }

                            const emailData = await emailModel.findOne({batchId : batchId})
                            const emailDoc = {
                                from : parsed?.from?.text,
                                to : parsed?.to?.text,
                                cc : parsed?.cc?.text,
                                subject : parsed?.subject,
                                text : parsed?.text,
                                html : parsed?.html || parsed?.textAsHtml,
                                createdOn : new Date().toISOString(),
                                isReply : true,
                                attachments : attachmentsForEmail
                            }

                            if (emailData){
                                const oldMails = emailData["emails"]
                                oldMails.push(emailDoc)
                    
                                await emailModel.findOneAndUpdate({batchId : batchId}, {emails : oldMails})
                            } else {
                                let updatedData = {}

                                updatedData["batchId"] = batchId

                                updatedData["emails"] = [
                                    emailDoc
                                ]

                                updatedData["emailId"] = uuid.v1();
                                updatedData.createdOn = new Date().toISOString();
                                updatedData.updatedOn = new Date().toISOString();

                                const document = emailModel(updatedData);
                                await document.save()
                            }

                            const UserModel = mongoose.models[`UserModel`] || mongoose.model(`UserModel`, newSchemaWithObject['user'], `users`);
                            const userData = await UserModel.findOne({ 'userId': batch.createdByUID });

                            if (userData) {
                                const notificationName = `You got reply on your email from ${parsed.from.text} regarding batch ${batch.batchNo}`;
                                let notificationData = {
                                    createdOn: new Date().toISOString(),
                                    email: userData.userEmail,
                                    inappnotificationId: uuid.v1(),
                                    notificationName,
                                    notificationType: "batch email reply",
                                    description: parsed.text || "",
                                    notificationURL: "",
                                    read: false,
                                    tenantId: userData.tenantId,
                                    userId: userData.userId,
                                    createdBy: "AUTO",
                                    orgId: userData.orgId,
                                    userLogin: userData.userLogin,
                                    module: "SE"
                                };

                                const InAppNotificationModel = mongoose.models[`InAppNotificationModel`] || mongoose.model(`InAppNotificationModel`, Schema["inappnotification"], `inappnotifications`);
                                const document = new InAppNotificationModel(notificationData);
                                await document.save();

                                inAppNotificationService.sendNotification("inAppNotification", document);
                            }
                        }
                    }
                });
            } catch (messageProcessingError) {
                console.error('Error processing message:', messageProcessingError);
            }
        }
    } catch (err) {
        console.error('Error fetching or processing emails:', err);
    }
}

// Establish connection and start email processing
(async () => {
    await establishConnection();
    exports.fetchAndProcessEmails();
})();
