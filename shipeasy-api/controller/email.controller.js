const { mongoose, Schema, invoiceSchema, uuid, jwt, crypto, axios, azureStorage, inAppNotificationService, querystring, nodemailer, pdfScanner, ediController, OpenAI, objecdiff, sendMessage, getTextMessageInput, fs, _, simpleParser, connect, imapConfig, transporter, getChangedFields, removeIdField, recordLogAudit, encryptObject, decryptObject, isSubset, createInAppNotification, replacePlaceholders, generateRandomPassword, triggerPointExecute, insertIntoTally, getTransporter, getChildCompany, saveEmailBatch, getSenderName} = require('./helper.controller')


exports.emailApi = async (req, res, next) => {
    const data = req.body;

    let updatedData = new Object(data);

    const user = res.locals.user
    const agent = res.locals.agent

    let transporterAgent = await getTransporter(user)

    for (let i = 0; i < updatedData?.attachment?.length; i++) {
        try {
            if (!(updatedData.attachment[i].hasOwnProperty("content"))){
                const attachmentContent = updatedData.hasOwnProperty("batchId") ? await azureStorage.downloadAttchmentFileBatchAttachment(data.attachment[i].name) : await azureStorage.downloadAttchmentFile(data.attachment[i].name)
                updatedData.attachment[i].content = attachmentContent
            } else {
                const base64String = updatedData.attachment[i].content;
                const buffer = Buffer.from(base64String, 'base64');
                fs.writeFileSync('do_jasper', buffer);
                updatedData.attachment[i].content = fs.readFileSync('do_jasper');
            }
            
            delete updatedData.attachment[i].url
        } catch (e) {
            continue;
        }
    }
    


    if (data.templateId === 3) {
        

        const obj = encryptObject(
            {
                "tenantId": user.tenantId,
                "userId": user.userId,
                "userLogin": user.userLogin,
                "orgId": user.orgId,
                "enquiryId": data.params.enquiryId,
                "createdOn": new Date(),
                "quotationId": data.params.quotationId,
                "quotationNo": data.params.quotationNo,
                "enquiryNo": data.params.enquiryNo,
                "createdBy": "AUTO",
                "validFrom": data.params.validFrom,
                "validTo": data.params.validTo
            }, process.env.SECRET_KEY_JWT)
        // updatedData.params["accepturl"] = `https://synoris-ship.azurewebsites.net/api/quotation/update/${obj}/accept`
        // updatedData.params["rejecturl"] = `https://synoris-ship.azurewebsites.net/api/quotation/update/${obj}/reject`
        updatedData.params["frontendUrl"] = `${process.env.FRONTEND_URL}/web-form/list/${data.params.quotationId}/?data=${obj}`
    }

    for (let i = 0; i < data.to?.length; i++) {
        const UserSearch = mongoose.models.UserSearch || mongoose.model('UserSearch', Schema['user'], 'users');

        await UserSearch.findOne({ 'userEmail': data.to[i]?.email }).then(async function (user) {
            if (user && data.subject) {
                let notificationData = {};

                notificationData.createdOn = new Date().toISOString();
                notificationData.email = data.to[i]?.email
                notificationData.inappnotificationId = uuid.v1();
                notificationData.notificationName = data.subject || "";
                notificationData.description = data.textContent || "";
                notificationData.notificationType = "temp";
                notificationData.notificationURL = "";
                notificationData.read = false;
                notificationData.tenantId = user.tenantId
                notificationData.userId = user.userId
                notificationData.notificationType = ""
                notificationData.createdBy = "AUTO"
                notificationData.userAWSProfile = user.userAWSProfile
                notificationData.orgId = user.orgId
                notificationData.userLogin = user.userLogin
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
            }
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId : req?.traceId,
                error: err,
                stack : err?.stack
            }))
        });

    }

    let batch;
    if(data.hasOwnProperty("batchId")){
        const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
        batch = await batchModel.findOne({ 'batchId': data.batchId });
    }

    const mailOptions = {
        from: getSenderName(agent),
        to: updatedData.to?.map(t => t.email).map((t) => {
            if (updatedData.hasOwnProperty("batchId") && t.includes(batch.batchNo.replace("-", "")))
                return t
            else if (updatedData.hasOwnProperty("batchId"))
                return t.replace("@", `+${batch.batchNo.replace("-", "")}@`)
            else 
                return t
        }),
        cc: updatedData.cc?.map(c => c.email).map((c) => {
            if (updatedData.hasOwnProperty("batchId") && c.includes(batch.batchNo.replace("-", "")))
                return c
            else if (updatedData.hasOwnProperty("batchId"))
                return c.replace("@", `+${batch.batchNo.replace("-", "")}@`)
            else 
                return c
        }),
        subject: updatedData.subject || "Event Updated",
        text: '',
        html: updatedData.textContent || '',
        headers: {
            'Message-ID': `${batch ? batch.batchId : ""}@gmail.com`
        },
        attachments: updatedData.attachment?.map((f) => {
            try {
                return {
                    "filename" : decodeURIComponent(f.name), "content" : f.content
                }  
            } catch (error) {
                return {
                    "filename" : f.name, "content" : f.content
                }
            }            
        })
    };

    if (batch?.batchId)
        saveEmailBatch(req, batch.batchId, mailOptions.from, mailOptions.to, mailOptions.cc, mailOptions.subject, mailOptions.text, mailOptions.html, mailOptions.headers, mailOptions.attachments)

    

    try {
        if(data?.templateId === 3){
            // let config = {
            //     method: 'post',
            //     maxBodyLength: Infinity,
            //     url: 'https://api.sendinblue.com/v3/smtp/email',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'api-key': process.env.EMAIL_KEY,
            //         'Accept': 'application/json',
            //     },
            //     data: updatedData
            // };
            const EmailTemplateModel = mongoose.models[`EmailTemplateModel`] || mongoose.model(`EmailTemplateModel`, Schema["emailtemplate"], `emailtemplates`);

            await EmailTemplateModel.findOne({emailtemplateId: "mp472f41-0622-11ef-91b3-939500dcf434"}).then(async function (emailTemplate) {
                let htmlContent = "<html>" + emailTemplate.header + emailTemplate.body + emailTemplate.footer + "</html>"
                
                htmlContent = replacePlaceholders(htmlContent, updatedData.params)
                htmlContent = htmlContent.replace(/{{params\.[^}]+}}/g, '');

                const mailOptionsQuotation = {
                    from: getSenderName(agent),
                    to: updatedData.to.map((e) => e.email),
                    cc: updatedData.cc?.map((c) => c.email) || [],
                    subject: emailTemplate.subject,
                    text: '',
                    html: htmlContent,
                    attachments: updatedData.attachment.map((f) => {return {"filename" : f.name, "content" : f.content}})
                };

                transporterAgent?.sendMail(mailOptionsQuotation, (error, info) => {
                    if (error) {
                        console.error(JSON.stringify({
                            traceId : req?.traceId,
                            error: error,
                            stack : error?.stack
                        }))
                        return res.status(500).send({status : "failed", message: "Error sending email" });
                    }
                    return res.status(200).send({status : "success",  message: "Email sent" });
                });
            })
        } else {
            transporterAgent?.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(JSON.stringify({
                        traceId : req?.traceId,
                        error: error,
                        stack : error?.stack
                    }))
                    return res.status(200).send({ message: "Error sending email" });
                }
                return res.status(200).send({status : "success",  message: "Email sent" });
            });
        }
    } catch (error) {
        res.status(400).send({ "error": error })
    }
}


exports.sendBookingMail = async (req, res, next) => {
    const data = req.body;

    let batchData;
    const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
    batchData = await batchModel.findOne({"enquiryDetails.enquiryId" : data.enquiryId });

    const user = res.locals.user
    const agent = res.locals.agent
    
    let transporterAgent = await getTransporter(user);
    let noOfContainers = "N/A";

    if (batchData?.enquiryDetails?.basicDetails?.loadType === "LCL") {
        noOfContainers = batchData?.enquiryDetails?.looseCargoDetails?.cargos?.map((data, index) => 
            `${data.units} * (${data.lengthp} X ${data.Weightp} X ${data.heightp})${data.DimensionUnitp} * ${data.volumep} ${data.volumebs}`
        ).join(', ');
    } else if(batchData?.enquiryDetails?.basicDetails?.loadType === "FCL") {
        noOfContainers = batchData?.enquiryDetails?.containersDetails?.map((data, index) => 
        `${data.containerType} * ${data.noOfContainer}`
        ).join(', ');
    } else {
        noOfContainers = batchData?.enquiryDetails?.containersDetails?.map(e => e.noOfContainer).reduce((partialSum, a) => partialSum + a, 0) || 0;
    }
    const params = {
    shippingline: batchData?.enquiryDetails?.routeDetails?.shippingLineName,
        PortofLoading: batchData?.enquiryDetails?.routeDetails?.loadPortName,
        PortofDishcarge: batchData?.enquiryDetails?.routeDetails?.destPortName,
        NoofContainers: noOfContainers,
        TargetDeliveryDate: batchData?.enquiryDetails?.productDetails?.targetDeliveryDate.split("T")[0]
    };

    try {
        const EmailTemplateModel = mongoose.models[`EmailTemplateModel`] || mongoose.model(`EmailTemplateModel`, Schema["emailtemplate"], `emailtemplates`);

        await EmailTemplateModel.findOne({emailtemplateId: "0f96aab1-2174-11ef-be84-addd3b15378b"}).then(async function (emailTemplate) {
            let htmlContent = "<html>" + emailTemplate.header + emailTemplate.body + emailTemplate.footer + "</html>"
            
            htmlContent = replacePlaceholders(htmlContent, params)
            htmlContent = htmlContent.replace(/{{params\.[^}]+}}/g, '');

            const mailOptionsBooking = {
                from: getSenderName(agent),
                to: data.to?.map((e) => e.email.replace("@", `+${batchData.batchNo.replace("-", "")}@`)),
                cc: data.cc?.map((c) => c.email.replace("@", `+${batchData.batchNo.replace("-", "")}@`)) || [],
                subject: emailTemplate.subject,
                text: '',
                html: htmlContent,
                attachments: data?.attachments?.map((f) => {return {"filename" : f.name, "content" : f.content}}),
                headers: {
                    'Message-ID': `${batchData ? batchData.batchId : ""}@gmail.com`
                }
            };

            if(batchData?.batchId)
                saveEmailBatch(req, batchData.batchId, mailOptionsBooking.from, mailOptionsBooking.to, mailOptionsBooking.cc, mailOptionsBooking.subject, mailOptionsBooking.text, mailOptionsBooking.html, mailOptionsBooking.headers)


            transporterAgent?.sendMail(mailOptionsBooking, (error, info) => {
                if (error) {
                    console.error(JSON.stringify({
                        traceId : req?.traceId,
                        error: error,
                        stack : error?.stack
                    }))
                    return res.status(500).send({status : "failed", message: "Error sending email" });
                }
                return res.status(200).send({status : "success",  message: "Email sent" });
            });
        })
    } catch (err) {
        console.error(JSON.stringify({
            traceId : req?.traceId,
            error: err,
            stack : err?.stack
        }))
        res.status(400).send({ "error": err })
    }
}

exports.getMails = async (req, res, next) => {
    try {
        const { batchNo } = req.body;

        // Retrieve the batch
        const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
        const batch = await batchModel.findOne({ 'batchNo': batchNo });

        if (!batch) {
            return res.status(400).send({ message: `Job not found having batch number ${batchNo}` });
        }

        // Retrieve the emails for the batch
        const emailModel = mongoose.models[`emailModel`] || mongoose.model(`emailModel`, Schema["email"], `emails`);
        let emaildata = await emailModel.findOne({ 'batchId': batch.toObject().batchId });
        emaildata = emaildata?.toObject();

        if (!emaildata) {
            return res.status(200).send([]);
        }

        let processedMails = [];

        await Promise.all(emaildata?.emails?.sort((a, b) => a.createdOn < b.createdOn)?.map(async email => {
            let attachments = [];

            if (email.attachments && email.attachments.length > 0) {
                attachments = await Promise.all(email.attachments.map(async attachment => {
                    if (attachment.content) {
                        // Old data - stored in DB
                        return {
                            name: attachment.name,
                            content: attachment.content, // Use content directly from DB
                            isPublic: attachment.isPublic || false
                        };
                    } else if (attachment.name) {
                        // New data - stored on Azure
                        try {
                            const content = await azureStorage.downloadAttchmentFileBatchAttachment(attachment.azureStorageFileName);
                            return {
                                name: attachment.name,
                                content: content.toString('base64'), // Download and encode content to base64
                                isPublic: attachment.isPublic || false
                            };
                        } catch (error) {
                            console.error(JSON.stringify({
                                traceId : req?.traceId,
                                error: error,
                                stack : error?.stack
                            }))
                            return null; // Skip this attachment or handle as needed
                        }
                    }
                    return null;
                }));

                attachments = attachments.filter(att => att != null); // Filter out any null entries
            }

            let isAdded = false;
            for (let i = 0; i < processedMails.length; i++) {
                if (processedMails[i].conversationSubject === email.subject) {
                    processedMails[i].conversations.push({
                        attachment: attachments,
                        emailType: email.isReply ? "reply" : "sent",
                        subject: email.subject,
                        body: email.html ? email.html : "",
                        to: Array.isArray(email.to) ? email.to : [{ email: email.to.match(/<(.+)>/)[1], name: email.to.match(/"(.+)" <.+>/)[1] }],
                        from: email.from.match(/<(.+)>/)[1],
                        time: email.createdOn
                    })

                    isAdded = true;
                }
            }

            if (!isAdded){
                processedMails.push({
                    from: [{ email: email?.from, name: email?.from }],
                    to: Array.isArray(email.to) ? email.to : email.to?.map(em => {return { email: em, name: em }}),
                    cc: email.cc ? email.cc : "",
                    conversationSubject: email.subject,
                    startedOn: email.createdOn,
                    conversations: [
                        {
                            attachment: attachments,
                            emailType: email.isReply ? "reply" : "sent",
                            subject: email.subject,
                            body: email.html ? email.html : "",
                            to: Array.isArray(email.to) ? email.to : [{ email: email.to.match(/<(.+)>/)[1], name: email.to.match(/"(.+)" <.+>/)[1] }],
                            from: email.from.match(/<(.+)>/)[1],
                            time: email.createdOn
                        }
                    ]
                });
            }
        }));

        const sortedMails = processedMails.sort((a, b) => {
            return new Date(a.conversations[0].time) - new Date(b.conversations[0].time);
        });

        res.send(sortedMails);

    } catch (err) {
        console.error(JSON.stringify({
            traceId : req?.traceId,
            error: err,
            stack : err?.stack
        }))
        res.status(500).send({ message: `Issue with reading mail` });
    }
};



exports.sendBatchEmail = async (req, res, next) => {
    const { batchNo, message, to, cc, subject, documents, igmcfsId } = req.body;

    if (batchNo && message && to && subject) {
        let footer;
        let headerStyle = `<style>
            table,
            th,
            td {
            padding: 7px;
            border: 1px solid;
            }

            table {
            width: 100%;
            border-collapse: collapse;
            }
        </style>`

        const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
        const documentModel = mongoose.models[`documentModel`] || mongoose.model(`documentModel`, Schema["document"], `documents`);
        const batch = await batchModel.findOne({ 'batchNo': batchNo });

        const user = res.locals.user
        const agent = res.locals.agent

        if(agent)
            footer = `<footer><img style="height:125px;" src="https://shipeasy.blob.core.windows.net/ship-docs/${agent?.uploadSign}" alt="Email Signature" /></footer>`
        

        let transporterAgent = await getTransporter(user)

        if (batch) {
            let attachments = req.files?.map(file => ({
                filename: file.originalname,
                content: file.buffer,
            }));

            if (documents && documents.length > 0) {
                try {
                    const parsedDocuments = JSON.parse(documents);
                    let documentMONGOs = await documentModel.find({documentURL : {$in : parsedDocuments?.map(e => e?.name)}})
                    if(documentMONGOs)
                        documentMONGOs = documentMONGOs?.map(e => e?.toObject())
                    let processedAttachment = await Promise.all(parsedDocuments.map(async attachment => {
                        try {
                            const content = await azureStorage.downloadFile(attachment.name);
                            const chunks = [];
                            for await (const chunk of content.readableStreamBody) {
                                chunks.push(chunk);
                            }
                            const fileBuffer = Buffer.concat(chunks);

                            return {
                                filename: documentMONGOs?.find(d => d?.documentURL === attachment?.name)?.documentName || attachment.name,
                                content: fileBuffer
                            };
                        } catch (error) {
                            console.error(JSON.stringify({
                                traceId : req?.traceId,
                                error: error,
                                stack : error?.stack
                            }))
                            return null; // Skip this attachment or handle as needed
                        }
                    }));

                    processedAttachment = processedAttachment.filter(att => att != null); // Filter out any null entries

                    attachments = attachments.concat(processedAttachment || [])
                } catch (error) {
                    console.error(error)
                }
            }

            const mailOptions = {
                from: getSenderName(agent),
                to: to.split(","),
                cc: cc.split(","),
                subject: subject || "",
                text:  `<html>${headerStyle}<body>${message}</body>${footer ? footer : ''}</html>` || '',
                html: `<html>${headerStyle}<body>${message}</body>${footer ? footer : ''}</html>` || '',
                headers: {
                    'Message-ID': `${igmcfsId ? "igm-" : ""}${igmcfsId ? igmcfsId : batch.batchId}@gmail.com`
                },
                attachments: attachments
            };

            await saveEmailBatch(req, batch.batchId, mailOptions.from, mailOptions.to, mailOptions.cc, mailOptions.subject, mailOptions.text, mailOptions.html, mailOptions.headers,mailOptions.attachments?.map(e => {
                return {...e, content : Buffer.from(e?.content, 'base64')}
            }),true)


            transporterAgent?.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(JSON.stringify({
                        traceId : req?.traceId,
                        error: error,
                        stack : error?.stack
                    }))
                    return res.status(500).send({ message: "Error sending email" });
                }
                return res.status(200).send({ message: "Email sent" });
            });
        } else {
            res.status(400).send({ message: `Job not found having batch number ${batchNo}` });
        }
    } else {
        res.status(500).send({ message: `Please provide all parameters such as batchNo, message, to, cc, subject` });
    }
};