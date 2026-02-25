const {emailQueue} = require('../service/queue');
const uuid = require('uuid');
const inAppNotificationService = require('../service/inAppNotification')
const {getValidModelAndSchema} = require('../controller/helper.controller');

async function createInAppNotification(req, notificationName, notificationDescription, userData) {
    let notificationData = {};

    notificationData.createdOn = new Date().toISOString();
    notificationData.email = userData?.userEmail
    notificationData.inappnotificationId = uuid.v1();
    notificationData.notificationName = notificationName;
    notificationData.notificationType = "temp";
    notificationData.description = notificationDescription || ""
    notificationData.notificationURL = "";
    notificationData.read = false;
    notificationData.tenantId = userData?.tenantId
    notificationData.userId = userData?.userId
    notificationData.createdBy = "AUTO"
    notificationData.orgId = userData?.orgId
    notificationData.userLogin = userData?.userLogin
    notificationData.module = "SE"

    const {Model: InAppNotificationModel} = getValidModelAndSchema('inappnotification');
    const document = InAppNotificationModel(notificationData);

    const options = {
        returnDocument: 'after',
        projection: {_id: 0, __v: 0},
    };

    document.save(options).then(async savedDocument => {
        inAppNotificationService.sendNotification("inAppNotification", savedDocument);
    }).catch(function (err) {
        console.error(JSON.stringify({
            traceId: req.traceId,
            error: err,
            stack: err.stack
        }))
    });
}

async function sendMail(req, orgId, templateId, to, cc, params, batchId, triggerId, attachments = [], subject = '', htmlBody = '') {
    await emailQueue.add('sendEmail', {
        orgId,
        templateId,
        to,
        cc,
        params,
        batchId,
        triggerId,
        attachments,
        traceId: req.traceId,
        subject,
        htmlBody
    });
}

module.exports = {
    createInAppNotification,
    sendMail
}
