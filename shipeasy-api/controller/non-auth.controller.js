const { mongoose, Schema, invoiceSchema, uuid, jwt, crypto, axios, azureStorage, inAppNotificationService, querystring, nodemailer, pdfScanner, ediController, OpenAI, objecdiff, sendMessage, getTextMessageInput, fs, _, simpleParser, connect, imapConfig, transporter, getChangedFields, removeIdField, recordLogAudit, encryptObject, decryptObject, isSubset, createInAppNotification, replacePlaceholders, generateRandomPassword, triggerPointExecute, insertIntoTally, getTransporter, getChildCompany} = require('./helper.controller')

exports.quotationUpdates = async (req, res, next) => {
    const quotationId = `${req.params.id}`
    const action = `${req.params.status}`;
    const quotationData = decryptObject(quotationId, process.env.SECRET_KEY_JWT)

    if ((new Date(quotationData.validFrom) <= new Date()) && (new Date() <= new Date(quotationData.validTo))) {
        let notificationData = {};

        const Model = mongoose.models[`QuotationModel`] || mongoose.model(`QuotationModel`,Schema["quotation"], `quotations`);
        const enquiryModel = mongoose.models[`enquiryModel`] || mongoose.model(`enquiryModel`, Schema["enquiry"], `enquirys`);
        await Model.findOne({ quotationId: quotationData.quotationId }).then(async function (foundDocument) {
            if (foundDocument && foundDocument.toObject().quoteStatus === "Quotation Accepted") {
                res.send({status : "failed", message:"Quotation already accepted"})
            } else if (foundDocument && foundDocument.toObject().quoteStatus === "Quotation Rejected") {
                res.send({status : "failed", message:"Quotation already rejected"})
            } else {
                if (action === "accept") {
                    const options = {
                        returnDocument: 'after',
                        projection: { _id: 0, __v: 0 },
                    };

                    await Model.updateMany({ enquiryId: quotationData.enquiryId, quotationId: { "$ne": quotationData.quotationId } }, { quoteStatus: "Quotation Rejected" });
                    await Model.updateMany({ quotationId: quotationData.quotationId }, { quoteStatus: "Quotation Accepted" }, options).then(async function (updatedDocument) {
                        if (updatedDocument?.modifiedCount == 0)
                            res.send({status : "failed", message:"Quotation already accepted"})
                        else {
                            notificationData.notificationName = `Quotation accepted`;
                            notificationData.description = `Quotation accepted by customer on ${new Date().toISOString()} having Inquiry No : ${quotationData.enquiryNo} and  Quotation No. ${quotationData.quotationNo}`;

                            await enquiryModel.findOneAndUpdate(
                                { enquiryId : quotationData.enquiryId },
                                {
                                    $set : {
                                        enquiryStatus : "Inquiry Approved"
                                    }
                                }
                            )

                            triggerPointExecute(req, updatedDocument[0], "quotation")
                            res.send({status : "success", message:"Quotation accepted"})
                        }
                    }).catch(function (err) {
                        console.error(JSON.stringify({
                            traceId : req?.traceId,
                            error: err,
                            stack : err?.stack
                        }))
                        res.status(500).json({ error: err });
                    });
                } else if (action === "reject") {
                    const options = {
                        returnDocument: 'after',
                        projection: { _id: 0, __v: 0 },
                    };

                    const Model = mongoose.models[`QuotationModel`] || mongoose.model(`QuotationModel`,Schema["quotation"], `quotations`);

                    await Model.updateMany({ quotationId: quotationData.quotationId }, { quoteStatus: "Quotation Rejected" }, options).then(async function (updatedDocument) {
                        if (updatedDocument?.modifiedCount == 0) {
                            res.send({status : "failed", message:"Quotation already rejected"})
                        }
                        else {
                            const quotationsOfEnquiry = await Model.find({enquiryId : quotationData.enquiryId})

                            if (quotationsOfEnquiry?.every(e => e.quoteStatus.toLowerCase() === "quotation rejected")) {
                                await enquiryModel.findOneAndUpdate(
                                    { enquiryId : quotationData.enquiryId },
                                    {
                                        $set : {
                                            enquiryStatus : "Inquiry Rejected"
                                        }
                                    }
                                )
                            }

                            notificationData.notificationName = `Quotation rejected`;
                            notificationData.description = `Quotation rejected by customer on ${new Date().toISOString()} having Inquiry No : ${quotationData.enquiryNo} and  Quotation No. ${quotationData.quotationNo}`;
                            triggerPointExecute(req, updatedDocument[0], "quotation")
                            res.send({status : "success", message:"Quotation rejected"})
                        }
                    }).catch(function (err) {
                        console.error(JSON.stringify({
                            traceId : req?.traceId,
                            error: err,
                            stack : err?.stack
                        }))
                        res.status(500).json({ error: err });
                    });

                } else {
                    res.send({status : "failed", message:"You are not allowed to perform this action"})
                }
            }
        })

        notificationData.createdOn = new Date().toISOString();
        notificationData.inappnotificationId = uuid.v1();

        notificationData["notificationData"] = {
            "enquiryId": quotationData.enquiryId,
            "quotationId": quotationData.quotationId,
            "enquiryNo": quotationData.enquiryNo,
            "quotationNo": quotationData.quotationNo,
        }

        notificationData.notificationType = "quotation";
        notificationData.notificationURL = "";
        notificationData.read = false;
        notificationData.tenantId = quotationData.tenantId
        notificationData.userId = quotationData.userId
        notificationData.notificationType = ""
        notificationData.createdBy = "AUTO"
        notificationData.orgId = quotationData.orgId
        notificationData.userLogin = quotationData.userLogin
        notificationData.module = "se"

        const InAppNotificationModel = mongoose.models[`InAppNotificationModel`] || mongoose.model(`InAppNotificationModel`, Schema["inappnotification"], `inappnotifications`);
        const document = InAppNotificationModel(notificationData);

        const options = {
            returnDocument: 'after',
            projection: { _id: 0, __v: 0 },
        };

        document.save(options).then(async savedDocument => {
            inAppNotificationService.sendNotification("inAppNotification", savedDocument);
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId : req?.traceId,
                error: err,
                stack : err?.stack
            }))
        });

    } else {
        res.send({status : "failed", message:"Quotation invitation is expired."});
    }
}


exports.contactFormFilled = async (req, res, next) => {
    const data = req.body
    const fromPage = req.params.fromPage;

    const updatedData = {...data}

    updatedData["fromPage"] = fromPage

    updatedData["assingedPerson"] = {
        "personName" : "",
        "personId" : "",
        "personEmail" : ""
    }

    updatedData["leadId"] = uuid.v1();
    updatedData.createdOn = new Date().toISOString();
    updatedData.updatedOn = new Date().toISOString();

    updatedData["leadSatus"] = "lead arrived"

    updatedData["leadCreatedOn"] = new Date().toISOString();

    const Model = mongoose.models[`leadModel`] || mongoose.model(`leadModel`, Schema["lead"], `leads`);
    const document = Model(updatedData);
    await document.save()
    res.status(200).send("saved")
}