const _ = require('lodash');
const {getValidModelAndSchema} = require('../controller/helper.controller');
const {createInAppNotification, sendMail} = require('./notification.service');

function isSubset(obj1, obj2) {
    if (obj1 == undefined) {
        console.log("❌ obj1 (trigger.value) is undefined");
        return false;
    }

    console.log("🔍 Checking isSubset:");
    console.log("obj1 (trigger.value):", JSON.stringify(obj1));
    console.log("obj2 keys being checked:", Object.keys(obj1).join(', '));

    for (const key in obj1) {
        const val1 = _.get(obj1, key);
        const val2 = _.get(obj2, key);

        console.log(`Comparing '${key}': "${val1}" === "${val2}" ? ${val1 === val2}`);

        if (val1 !== val2) {
            console.log(`❌ Mismatch at key '${key}'`);
            return false;
        }
    }

    console.log("✅ isSubset match found!");
    return true;
}

async function triggerPointExecute(req, updatedDocument, indexName) {
    console.log("\n 🎯 triggerPointExecute called:");
    console.log("traceId:", req.traceId);
    console.log("indexName:", indexName);
    console.log("batchNo:", updatedDocument?.batchNo);
    console.log("orgId:", updatedDocument?.orgId);
    console.log("alert_in_5_days_before_ETA_for_MBL_STATUS:", updatedDocument?.alert_in_5_days_before_ETA_for_MBL_STATUS);

    const {Model: EmailTriggerModel} = getValidModelAndSchema('notificationmaster');

    let notification = await EmailTriggerModel.findOne({
        'orgId': updatedDocument.orgId,
        module: indexName
    });

    if (!notification) {
        console.log("❌ No notification found for:");
        console.log("orgId:", updatedDocument.orgId);
        console.log("module:", indexName);
        console.log("⚠️ Please check if notification configuration exists in 'notificationmasters' collection");
        return;
    }

    notification = notification.toObject();
    console.log(`✅ Found notification with ${notification.trigger?.length || 0} triggers`);

    if (!notification.trigger || notification.trigger.length === 0) {
        console.log("⚠️ No triggers configured in notification");
        return;
    }

    for (let i = 0; i < notification.trigger?.length; i++) {
        console.log(`\n      📧 Checking trigger ${i + 1}/${notification.trigger.length}`);
        console.log(`triggerId: ${notification.trigger[i].triggerId}`);
        console.log(`trigger.value:`, JSON.stringify(notification.trigger[i].value));

        if (isSubset(notification.trigger[i].value, updatedDocument)) {
            console.log(`✅ Trigger ${i + 1} MATCHED! Processing email...`);

            const {Model: TriggerModel} = getValidModelAndSchema('trigger');

            let trigger = await TriggerModel.findOne({'triggerId': notification.trigger[i].triggerId});

            if (!trigger) {
                console.log(`❌ Trigger configuration not found for triggerId: ${notification.trigger[i].triggerId}`);
                continue;
            }

            trigger = trigger?.toObject();
            console.log(`✅ Loaded trigger configuration`);

            const fulfilledParameters = {};

            if (trigger) {
                console.log(`📋 Processing ${trigger?.params?.length || 0} parameters...`);

                for (let p = 0; p < trigger?.params?.length; p++) {
                    const parameter = trigger.params[p];

                    console.log(`Parameter ${p + 1}: ${parameter.object} (${parameter.isMultiple ? 'multiple' : 'single'})`);

                    const {Model: objectModel} = getValidModelAndSchema(parameter.object);
                    const objectFilter = {};

                    for (let f = 0; f < trigger.params[p].filters.length; f++) {
                        const filter = parameter.filters[f];

                        if (filter?.type === "or") {
                            objectFilter["$or"] = filter.conditions.map(c => ({
                                [c.filter]: updatedDocument[c.search] || c.search
                            }));
                        } else {
                            objectFilter[`${filter.filter}`] = updatedDocument[`${filter.search}`] || filter.search;
                        }
                    }

                    console.log(`Filter:`, JSON.stringify(objectFilter));

                    let sort = {};
                    for (var sortField in trigger?.params[p]?.sort) {
                        sort[sortField] = trigger?.params[p]?.sort[sortField];
                    }

                    if (parameter?.isMultiple) {
                        let foundDataFromObjects = await objectModel.find(objectFilter, null, {sort: sort});

                        if (foundDataFromObjects && foundDataFromObjects.length > 0) {
                            foundDataFromObjects = foundDataFromObjects?.map(e => e?.toObject());
                            console.log(`✅ Found ${foundDataFromObjects.length} records`);

                            for (let f = 0; f < trigger.params[p].fields.length; f++) {
                                const field = trigger.params[p].fields[f];

                                foundDataFromObjects.forEach(foundDataFromObject => {
                                    for (let t = 0; t < field.type.length; t++) {
                                        const type = field.type[t];

                                        const valueToBeFound = {};

                                        for (var fromField in field.value) {
                                            valueToBeFound[fromField] = _.get(foundDataFromObject, field.value[fromField]) || "-";
                                        }

                                        if (fulfilledParameters[type] && fulfilledParameters[type][parameter.fieldName]) {
                                            fulfilledParameters[type][parameter.fieldName].push(valueToBeFound);
                                        } else {
                                            const tempField = {};
                                            tempField[parameter.fieldName] = [valueToBeFound];
                                            fulfilledParameters[type] = {
                                                ...tempField,
                                                ...fulfilledParameters[type]
                                            };
                                        }
                                    }
                                });
                            }
                        } else {
                            console.log(`⚠️ No records found`);
                        }
                    } else {
                        let foundDataFromObject = await objectModel.findOne(objectFilter);

                        if (foundDataFromObject) {
                            foundDataFromObject = foundDataFromObject.toObject();
                            console.log(`✅ Found record`);

                            for (let f = 0; f < trigger.params[p].fields.length; f++) {
                                const field = trigger.params[p].fields[f];

                                for (let t = 0; t < field.type.length; t++) {
                                    const type = field.type[t];

                                    for (var fromField in field.value) {
                                        const valueToBeFound = {};
                                        valueToBeFound[fromField] = _.get(foundDataFromObject, field.value[fromField]) ?? "-";

                                        fulfilledParameters[type] = {
                                            ...valueToBeFound,
                                            ...fulfilledParameters[type]
                                        };
                                    }
                                }
                            }
                        } else {
                            console.log(`⚠️ No record found`);
                        }
                    }
                }

                console.log(`✅ Parameters collected`);

                let to = [];
                let cc = [];

                // Special handling for alert_in_5_days_before_ETA
                if (req.traceId == "alert_in_5_days_before_ETA") {
                    console.log(`🔍 Special handling for ETA alert - fetching agent emails`);

                    const {Model: PartymasterModel} = getValidModelAndSchema('partymaster');

                    const agentId = updatedDocument.enquiryDetails?.basicDetails?.agentId;
                    console.log(`Agent ID: ${agentId}`);

                    if (agentId) {
                        const partymaster = await PartymasterModel.findOne({"partymasterId": agentId}).exec();

                        if (partymaster && partymaster.primaryMailId) {
                            const emails = partymaster.primaryMailId.split(',').map(email => email.trim()).filter(Boolean);
                            console.log(`✅ Found ${emails.length} agent email(s): ${emails.join(', ')}`);

                            emails.forEach(email => {
                                to.push({
                                    email: email,
                                    name: partymaster.name
                                });
                            });
                        } else {
                            console.log(`⚠️ No primary email found for agent ${agentId}`);
                        }
                    } else {
                        console.log(`⚠️ No agent ID found in batch`);
                    }
                }

                console.log(`📧 Processing ${notification.trigger[i].emailSettings?.length || 0} email settings...`);

                for (let es = 0; es < notification.trigger[i].emailSettings?.length; es++) {
                    const emailSetting = notification.trigger[i].emailSettings[es];
                    console.log(`Email setting ${es + 1}: type=${emailSetting.type}`);

                    if (emailSetting['type'] === "departments") {
                        const {Model: DepartmentModel} = getValidModelAndSchema('department');

                        let department = await DepartmentModel.findOne({'departmentId': emailSetting.deptId});

                        if (department) {
                            console.log(`✅ Department: ${department.deptName}`);

                            if (emailSetting?.isEmailTo) {
                                to.push({email: department.deptEmail, name: department.deptName});
                            } else if (emailSetting?.isEmailCC) {
                                cc.push({email: department.deptEmail, name: department.deptName});
                            }

                            const {Model: UserModel} = getValidModelAndSchema('user');

                            let users = await UserModel.find({'department.item_id': department.departmentId});

                            console.log(`Found ${users?.length || 0} users in department`);

                            for (let u = 0; u < users?.length; u++) {
                                if (emailSetting?.isEmailTo) {
                                    to.push({
                                        email: users[u].userEmail,
                                        name: `${users[u].userFirstName} ${users[u].userLastName}`
                                    });
                                } else if (emailSetting?.isEmailCC) {
                                    cc.push({
                                        email: users[u].userEmail,
                                        name: `${users[u].userFirstName} ${users[u].userLastName}`
                                    });
                                }

                                if (trigger.inAppNotification?.enabled) {
                                    const notificationDescription = trigger.inAppNotification.inAppParams.notificationDescription;
                                    const filledNotificationDescription = await replacePlaceholdersNotification(
                                        notificationDescription,
                                        fulfilledParameters.inApp
                                    );

                                    await createInAppNotification(
                                        req,
                                        trigger.emailname,
                                        filledNotificationDescription,
                                        users[u]
                                    );
                                }
                            }
                        }
                    } else if (emailSetting['type'] === "direct") {
                        let toEmails = emailSetting.emailTo?.split(',') || [];
                        for (let em = 0; em < toEmails.length; em++) {
                            if (toEmails[em]) {
                                to.push({email: toEmails[em].trim(), name: toEmails[em].trim()});
                            }
                        }

                        if (emailSetting.emailCC && emailSetting.emailCC != "") {
                            let emailCC = emailSetting.emailCC?.split(',') || [];
                            for (let em = 0; em < emailCC.length; em++) {
                                if (emailCC[em]) {
                                    cc.push({email: emailCC[em].trim(), name: emailCC[em].trim()});
                                }
                            }
                        }

                        console.log(`✅ Direct emails - To: ${toEmails.length}, CC: ${emailSetting.emailCC?.split(',')?.length || 0}`);
                    } else if (emailSetting['type'] === "consignee" ||
                        emailSetting['type'] === "booking party" ||
                        emailSetting['type'] === "shipper") {

                        let shipperId;
                        let idToBeSearched = "";

                        if (emailSetting['type'] === "shipper") {
                            idToBeSearched = "shipperId";
                        } else if (emailSetting['type'] === "booking party") {
                            idToBeSearched = "agentId";
                        } else if (emailSetting['type'] === "consignee") {
                            idToBeSearched = "consigneeId";
                        }

                        if (indexName === "batch") {
                            shipperId = updatedDocument?.enquiryDetails?.basicDetails[idToBeSearched];
                        } else if (indexName === "invoice") {
                            shipperId = updatedDocument[idToBeSearched];
                        } else if (indexName === "enquiry") {
                            shipperId = updatedDocument.basicDetails[idToBeSearched];
                        } else if (indexName === "container") {
                            const {Model: batchModel} = getValidModelAndSchema('batch');
                            const bathData = await batchModel.findOne({batchId: updatedDocument.batchId});
                            shipperId = bathData?.enquiryDetails?.basicDetails[idToBeSearched];
                        } else if (indexName === "event") {
                            const {Model: batchModel} = getValidModelAndSchema('batch');
                            const bathData = await batchModel.findOne({batchId: updatedDocument.entityId});
                            shipperId = bathData?.enquiryDetails?.basicDetails[idToBeSearched];
                        }

                        console.log(`${emailSetting['type']} ID: ${shipperId}`);

                        if (emailSetting['type'] === "shipper" && trigger.inAppNotification?.enabled) {
                            const {Model: CustomerModel} = getValidModelAndSchema('user');

                            let customerData = await CustomerModel.findOne({"customerId": shipperId});

                            if (customerData) {
                                const notificationDescription = trigger.inAppNotification.inAppParams.notificationDescription;
                                const filledNotificationDescription = await replacePlaceholdersNotification(
                                    notificationDescription,
                                    fulfilledParameters.inApp
                                );

                                await createInAppNotification(
                                    req,
                                    trigger.emailname,
                                    filledNotificationDescription,
                                    customerData
                                );
                            }
                        }

                        const {Model: PartymasterModel} = getValidModelAndSchema('partymaster');

                        let partymaster = await PartymasterModel.findOne({"partymasterId": shipperId});

                        if (partymaster) {
                            if (emailSetting?.isEmailTo) {
                                const emails = partymaster.primaryMailId?.split(',')?.map(email => email?.trim()).filter(Boolean);
                                emails?.forEach(email => {
                                    to.push({email, name: partymaster?.name});
                                });
                                console.log(`✅ Added ${emails?.length || 0} TO email(s)`);
                            }
                            if (emailSetting?.isEmailCC) {
                                const emails = partymaster.primaryMailId?.split(',')?.map(email => email?.trim()).filter(Boolean);
                                emails?.forEach(email => {
                                    cc.push({email, name: partymaster?.name});
                                });
                                console.log(`✅ Added ${emails?.length || 0} CC email(s)`);
                            }
                        } else {
                            console.log(`⚠️ Partymaster not found for ID: ${shipperId}`);
                        }
                    }
                }

                console.log(`📬 Total recipients - To: ${to.length}, CC: ${cc.length}`);
                console.log(`To emails: ${to.map(t => t.email).join(', ')}`);
                console.log(`CC emails: ${cc.map(c => c.email).join(', ')}`);

                // Calculate days until ETA for alert_in_5_days_before_ETA trigger
                let daysUntilETA = null;
                if (req.traceId === "alert_in_5_days_before_ETA") {
                    const etaDateStr = updatedDocument?.routeDetails?.eta;
                    if (etaDateStr) {
                        const etaDate = new Date(etaDateStr);
                        const today = new Date();
                        // Reset time to midnight for accurate day calculation
                        etaDate.setHours(0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);
                        const diffTime = etaDate.getTime() - today.getTime();
                        daysUntilETA = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        // Show as 0 if ETA is today or already passed
                        if (daysUntilETA < 0) {
                            daysUntilETA = 0;
                        }

                        console.log(`📅 Days until ETA: ${daysUntilETA}`);
                    }
                }

                const emailParameters = {
                    ...fulfilledParameters["email"],
                    ...(req.traceId === "alert_in_5_days_before_ETA" && daysUntilETA !== null && {
                        batchNo: updatedDocument?.batchNo,
                        daysUntilETA: daysUntilETA
                    }),
                    // Override bls with allJobsData for consolidated agent-grouped emails
                    ...(req.traceId === "alert_in_5_days_before_ETA" && updatedDocument?.allJobsData && {
                        allJobsData: updatedDocument.allJobsData,
                        bls: updatedDocument.allJobsData
                    }),
                    params: JSON.stringify(fulfilledParameters["email"])
                };

                console.log(`📝 Email parameters prepared`);
                if (emailParameters.allJobsData) {
                    console.log(`📊 allJobsData contains ${emailParameters.allJobsData.length} job(s) for grouped email`);
                }

                for (let tId = 0; tId < trigger.template?.length; tId++) {
                    const templateId = trigger.template[tId].templateId;

                    console.log(`📄 Processing template ${tId + 1}/${trigger.template.length}: ${templateId}`);

                    if (trigger.template[tId]?.isConditionBased) {
                        if (!(trigger.template[tId]?.filter && isSubset(trigger.template[tId]?.filter, emailParameters))) {
                            console.log(`⏭️  Skipped (condition not met)`);
                            continue;
                        }
                    }

                    // WhatsApp notification for booking confirmed
                    if (indexName === "batch" && updatedDocument.statusOfBatch === "Booking Confirmed") {
                        const dataWH = getTextMessageInput("919727291020", "booking_confirmed", [
                            emailParameters.referenceNumber,
                            emailParameters.quotationNo,
                            emailParameters.Origin,
                            emailParameters.Destination
                        ])
                        sendMessage(dataWH).catch(function (err) {
                            console.error(JSON.stringify({
                                traceId: req.traceId,
                                error: err,
                                stack: err.stack
                            }))
                        });
                    }

                    // Process attachments
                    const attachments = [];
                    for (let a = 0; a < trigger?.attachment?.length; a++) {
                        const attachment = trigger?.attachment[a];

                        if (attachment?.type === "jasperReport") {
                            const jasperUrl = process.env.JASPER_URL;
                            const jasperheader = {
                                "Authorization": `Basic ${process.env.JASPER_Auth}`,
                                "Content-Type": "application/pdf",
                            }

                            if (attachment?.isMultiple) {
                                for (let mf = 0; mf < fulfilledParameters["jasperReport"][attachment?.multipleField]?.length; mf++) {
                                    const individualField = fulfilledParameters["jasperReport"][attachment?.multipleField][mf];

                                    const jasperRawParams = {
                                        ...individualField,
                                        ...fulfilledParameters["jasperReport"]
                                    }

                                    const jasperParams = Object.fromEntries(
                                        Object.entries(jasperRawParams).filter(
                                            ([_, value]) =>
                                                value === null ||
                                                ["string", "number", "boolean"].includes(typeof value)
                                        )
                                    );

                                    if (attachment?.conditions && (!(isObjectMatch(attachment?.conditions, jasperParams)))) {
                                        continue;
                                    }

                                    try {
                                        let headers = {
                                            params: jasperParams,
                                            headers: jasperheader,
                                            responseType: "arraybuffer",
                                        };
                                        let jasperdata = await axios.get(
                                            `${jasperUrl}/jasperserver/rest_v2/reports/${process.env.JASPER_PATH}/${attachment?.reportName}.${attachment?.format}`,
                                            headers
                                        );

                                        attachments.push({
                                            filename: replacePlaceholders(
                                                attachment.attachmentName,
                                                jasperParams
                                            ) + `.${attachment.format}`,
                                            content: Buffer.from(jasperdata.data),
                                            contentType: "application/pdf",
                                        });
                                    } catch (error) {
                                        console.error(JSON.stringify({
                                            traceId: req.traceId,
                                            message: `Error generating jasper report: ${attachment.attachmentName}`
                                        }))
                                    }
                                }
                            }
                        } else if (attachment?.type === "document") {
                            const documentParams = fulfilledParameters?.document
                            const {Model: documentModel} = getValidModelAndSchema('document');
                            let batchDocument = await documentModel.findOne({
                                refId: documentParams?.batchId,
                                documentType: attachment?.documentType
                            })

                            if (batchDocument) {
                                batchDocument = batchDocument?.toObject()
                                const docURL = batchDocument?.documentURL
                                const docName = batchDocument?.documentName
                                const docExt = path.extname(docName);

                                try {
                                    const content = await azureStorage.downloadFile(docURL);
                                    const chunks = [];
                                    for await (const chunk of content.readableStreamBody) {
                                        chunks.push(chunk);
                                    }
                                    const fileBuffer = Buffer.concat(chunks);

                                    attachments.push({
                                        filename: attachment?.attachmentNameOriginal ?
                                            batchDocument?.documentName :
                                            (replacePlaceholders(attachment.attachmentName, documentParams) + `.${docExt}`),
                                        content: fileBuffer,
                                    });
                                } catch (error) {
                                    console.error(JSON.stringify({
                                        traceId: req.traceId,
                                        message: `Error downloading document: ${attachment.attachmentName}`
                                    }))
                                }
                            }
                        }
                    }

                    if (emailParameters.bls) {
                        emailParameters.bls = emailParameters.bls.map(bl => {
                            return {
                                ...bl,
                                MBLStatus: bl.MBLStatus && bl.MBLStatus !== '-' ? bl.MBLStatus : '',
                                HBLStatus: bl.HBLStatus && bl.HBLStatus !== '-' ? bl.HBLStatus : ''
                            };
                        });
                    }

                    // Check if filtering is needed for 5-day ETA alert
                    if (req.traceId === "alert_in_5_days_before_ETA" &&
                        emailParameters.bls &&
                        emailParameters.bls.length > 0) {

                        console.log(`🔍 Filtering BLs (total: ${emailParameters.bls.length})`);

                        // Filter to only MBL with Pending status
                        const filteredBls = emailParameters.bls.filter(bl => {
                            if (bl.blType !== 'MBL') return false;
                            const status = bl.MBLStatus || '';
                            return status.toLowerCase().includes('pending');
                        });

                        console.log(`📋 Filtered BLs: ${filteredBls.length} MBLs with pending status`);

                        // Only send if there are qualifying BLs
                        if (filteredBls.length > 0) {
                            emailParameters.bls = filteredBls;

                            console.log(`📤 Sending email...`);

                            await sendMail(
                                req,
                                updatedDocument.orgId,
                                templateId,
                                to,
                                cc,
                                emailParameters,
                                updatedDocument?.batchId || "",
                                notification.trigger[i].triggerId,
                                attachments
                            );
                        } else {
                            console.log(`⚠️ No qualifying BLs found after filtering. Email not sent.`);
                        }
                    }
                    // For 48-hour POD arrival alert - send ALL BLs without filtering
                    else if (req.traceId === "alert_48_hour_before_pod_arrival") {
                        console.log(`📤 Sending email (48h POD alert, no BL filtering)`);

                        await sendMail(
                            req,
                            updatedDocument.orgId,
                            templateId,
                            to,
                            cc,
                            emailParameters,
                            updatedDocument?.batchId || "",
                            notification.trigger[i].triggerId,
                            attachments
                        );
                    }
                    // For all other triggers, send normally
                    else {
                        console.log(`📤 Sending email (no BL filtering)`);

                        await sendMail(
                            req,
                            updatedDocument.orgId,
                            templateId,
                            to,
                            cc,
                            emailParameters,
                            updatedDocument?.batchId || "",
                            notification.trigger[i].triggerId,
                            attachments
                        );
                    }
                }
            }
        } else {
            console.log(`⏭️  Trigger ${i + 1} did NOT match`);
        }
    }
}

module.exports = {
    triggerPointExecute,
    isSubset
}
