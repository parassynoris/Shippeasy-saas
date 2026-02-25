const cron = require('node-cron');
const axios = require('axios');
const uuid = require('uuid'); // Added this import
const emailReplyScheduler = require('../controller/emailReplyScheduler');
const inAppNotificationService = require("../service/inAppNotification"); // Added this import
const {getValidModelAndSchema, getTransporter, getSenderName} = require('../controller/helper.controller'); // Added getTransporter, getSenderName
const {triggerPointExecute} = require('../services/trigger.service'); // Added this import

async function sendMailSB(templateId, to, cc, params) {
    let mailData = JSON.stringify(cc.length === 0 ? {
        "to": to,
        "templateId": templateId,
        "params": params
    } : {
        "to": to,
        "cc": cc,
        "templateId": templateId,
        "params": params
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.EMAIL_KEY,
            'Accept': 'application/json',
        },
        data: mailData
    };

    let mailRequest = await axios.request(config);
    return mailRequest;
}

async function quotationExpire() {
    const quotationFilter = {};
    const currDate = new Date()
    currDate.setDate(currDate.getDate() + 1);
    quotationFilter["validTo"] = new RegExp(`^${currDate.toLocaleDateString('en-CA')}`)

    // scheduler for quotation expiration
    const {Model: quotationModel} = getValidModelAndSchema('quotation');
    await quotationModel.find(quotationFilter).then(async function (quotations) {
        for (let q = 0; q < quotations?.length; q++) {
            const quotation = quotations[q];
            const {Model: enquiryModel} = getValidModelAndSchema('enquiry');
            await enquiryModel.findOne({enquiryId: quotation.enquiryId}).then(async function (enquiry) {
                if (enquiry) {
                    const {Model: partymasterModel} = getValidModelAndSchema('partymaster');
                    await partymasterModel.findOne({partymasterId: enquiry?.basicDetails?.shipperId}).then(async function (partymaster) {
                        if (partymaster) {
                            const to = [{email: partymaster.primaryMailId, name: partymaster.primaryMailId}]
                            const params = {
                                referenceNumber: quotation.enquiryNo,
                                Origin: quotation.loadPortName,
                                Destination: quotation.dischargePortName
                            }
                            sendMailSB(10, to, [], params)
                        }
                    })
                }
            })
        }
    })
}

cron.schedule('0 10 * * *', () => {
    try {
        quotationExpire()
    } catch (err) {
        console.log("Err from quotationExpire scheduler: " + err)
    }
}, {
    scheduled: true,
    timezone: 'Asia/Kolkata' // Change this to your timezone
});

async function cutOffDate12Hour() {
    const currDate = new Date();
    currDate.setHours(currDate.getHours() + 12);
    const instructionFilter = {};
    instructionFilter["si.siCutOffDate"] = {"$lt": currDate.toISOString(), "$gt": new Date().toISOString()}
    const {Model: instructionModel} = getValidModelAndSchema('instruction');
    await instructionModel.find(instructionFilter).then(async function (instructions) {
        for (let i = 0; i < instructions?.length; i++) {
            const instruction = instructions[i];
            const {Model: batchModel} = getValidModelAndSchema('batch');
            await batchModel.findOne({batchId: instruction.batchId}).then(async function (batch) {
                if (batch) {
                    const {Model: partymasterModel} = getValidModelAndSchema('partymaster');
                    await partymasterModel.findOne({partymasterId: batch?.enquiryDetails?.basicDetails?.shipperId}).then(async function (partymaster) {
                        if (partymaster) {
                            const to = [{
                                email: partymaster.primaryMailId,
                                name: partymaster.primaryMailId
                            }, {email: instruction.si.siMail, name: instruction.si.siMail}]
                            const params = {
                                referenceNumber: batch.batchNo,
                                Origin: batch.enquiryDetails.routeDetails.loadPortName,
                                Destination: batch.enquiryDetails.routeDetails.destPortName,
                                bookingNo: batch.bookingNo,
                                quotationNo: batch.quotationNo
                            }
                            // sendMailSB is already defined in cron.worker.js
                            sendMailSB(27, to, [], params)
                        }
                    })
                }
            })
        }
    })
}

cron.schedule('0 */12 * * *', () => {
    try {
        cutOffDate12Hour()
    } catch (err) {
        console.log("Err from cutOffDate12Hour scheduler: " + err)
    }
}, {
    scheduled: true,
    timezone: 'Asia/Kolkata' // Change this to your timezone
});

cron.schedule('* * * * *', () => {
    try {
        // console.log('Fetching and processing emails...');
        const request = emailReplyScheduler.fetchAndProcessEmails();
    } catch (err) {
        console.log("Err from emailReplyScheduler scheduler: " + err)
    }
});

function extractHours(text) {
    const regex = /(\d+)\s*Hours/i;
    const match = text?.match(regex);
    if (match && match[1]) {
        return parseInt(match[1]);
    } else {
        return null;
    }
}

const getCurrentFormattedDate = () => {
    const date = new Date();
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based in JavaScript
    const year = date.getUTCFullYear();

    return `${day}-${month}-${year}`;
};

async function sendReminderToUser(reminder, user) {
    let notificationData = {};
    // const uuid = require('uuid'); // Already imported
    // const inAppNotificationService = require("../service/inAppNotification") // Already imported


    notificationData.createdOn = new Date().toISOString();
    notificationData.inappnotificationId = uuid.v1();
    notificationData.notificationName = `Reminder for ${reminder.reminderType}`;
    notificationData.notificationType = "reminder";
    notificationData.description = reminder.description || ""
    notificationData.notificationURL = "";
    notificationData.read = false;
    notificationData.isReminder = true;
    notificationData.reminderData = reminder
    notificationData.userId = user.userId
    notificationData.createdBy = "AUTO"
    notificationData.module = "SE"

    const {Model: InAppNotificationModel} = getValidModelAndSchema('inappnotification');
    const document = InAppNotificationModel(notificationData);
    const options = {
        returnDocument: 'after',
        projection: {_id: 0, __v: 0},
    };
    await document.save(options).then(async savedDocument => {

        const {Model: agentModel} = getValidModelAndSchema('agent');
        let transporterAgent = await getTransporter(user)

        const agent = await agentModel.findOne({
            agentId: user.orgId
        })

        const mailOptions = {
            from: getSenderName(agent?.toObject() || agent),
            to: [user.userEmail],
            cc: [],
            subject: `Reminder for Job No. ${reminder.batchNo} is ${reminder.reminderStatus}`,
            text: '',
            html: `Dear ${user.name} ${user.userLastname}<br><br>This is to remind you for,<br><br>Job No :- ${reminder.batchNo}<br><br>Description :- ${reminder.description}<br><br>Status :- Pending<br><br>Here is link to Job :- <a href="${process.env.FRONTEND_URL}/batch/list/add/${reminder.batchId}/details">Click here To open Job ${reminder.batchNo}</a>`
        };

        transporterAgent?.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
                return error
            }

            return `Message sent: ${info.messageId}`
        });

        inAppNotificationService.sendNotification("inAppNotification", savedDocument);

    }).catch(function (err) {
        console.log(err)
    });


    console.log("Reminder sent for " + reminder.reminderId)
}

cron.schedule('* * * * *', async () => {
    try {
        // const uuid = require('uuid'); // Already imported
        // const inAppNotificationService = require("../service/inAppNotification") // Already imported

        // console.log("Scheduler for reminder executed");
        const {Model: reminderModel} = getValidModelAndSchema('reminder');
        const {Model: userModel} = getValidModelAndSchema('user');

        // Fetch reminders that are pending and due
        await reminderModel.find({
            isSent: false,
            reminderStatus: "Pending"
        }).then(async (reminders) => {
            // console.log("Running scheduler for reminder : " + reminders.length)

            if (reminders)
                for (let i = 0; i < reminders.length; i++) {
                    const reminder = reminders[i];

                    if (reminder?.reminderTime === "Custom Date") {

                        if (reminder.customDate && new Date(reminder.customDate) < new Date()) {

                            for (let j = 0; j < reminder?.userList?.length; j++) {
                                const user = await userModel.findOne({userId: reminder.userList[j].item_id})
                                await sendReminderToUser(reminder, user)
                            }

                            reminder.set("isSent", true)
                            reminder.set("isVisited", false)
                            reminder.set("reminderStatus", "Completed")

                            await reminder.save()
                        }
                    } else {
                        const afterTime = extractHours(reminder?.reminderTime)

                        if (reminder.updatedOn) {
                            const updatedOn = new Date(reminder.updatedOn).getTime()
                            const afterTimeOn = new Date().getTime() - (afterTime * 60 * 60 * 1000)
                            if (updatedOn < afterTimeOn) {

                                for (let j = 0; j < reminder?.userList?.length; j++) {
                                    const user = await userModel.findOne({userId: reminder.userList[j].item_id})
                                    await sendReminderToUser(reminder, user)
                                }

                                console.log("Reminder sent for " + reminder.reminderId)
                                reminder.set("isSent", true)
                                await reminder.save()
                            }
                        }
                    }
                    // Update reminder status to complete
                    // await reminderModel.updateOne({ _id: reminder._id }, { $set: { reminderStatus: "complete" } });
                }
        }).catch(async (error) => {
            console.log(error)
        });
    } catch (err) {
        console.log("Err from reminder scheduler: " + err)
    }
}, {
    scheduled: true
});

cron.schedule('0 0 * * *', async () => {
    console.log('Task is running every 30 seconds');

    try {
        const {Model: userModel} = getValidModelAndSchema('user');
        const {Model: agentModel} = getValidModelAndSchema('agent');

        const agentData = await agentModel.find({"isTrial": true, "trialValidTill": {"$lte": new Date().toISOString()}})
        // const filteredData = agentData.filter(e => !(e.agentStatusExpired))

        for (let i = 0; i < agentData.length; i++) {
            const agent = agentData[i]
            console.log("processing user : " + agent.agentId)

            agent.set("isTrial", false)
            agent.set("agentStatus", "expired")

            await agent.save()
            await userModel.updateMany({orgId: agent.orgId}, {"$set": {status: false}})
        }
    } catch (error) {
        console.log(error)
    }
});

cron.schedule('0 1 * * *', async () => {
    console.log('Task is running every 30 seconds');

    try {
        const uuid = require('uuid');
        const inAppNotificationService = require("./service/inAppNotification")

        const {Model: userModel} = getValidModelAndSchema('user');

        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

        const userData = await userModel.find({
            "isTrial": true,
            "trialValidTill": {"$lte": twoDaysFromNow.toISOString()}
        })
        const filteredData = userData.filter(e => !(e.alertForExpirationSent))

        for (let i = 0; i < filteredData.length; i++) {
            const user = filteredData[i]
            console.log("processing user : " + user.userId)

            let notificationData = {};

            notificationData.createdOn = new Date().toISOString();
            notificationData.inappnotificationId = uuid.v1();
            notificationData.notificationName = `Reminder for you trial expiration`;
            notificationData.notificationType = "reminder";
            notificationData.description = "Your login is expiring in 2 days" || ""
            notificationData.notificationURL = "";
            notificationData.read = false;
            notificationData.isReminder = true;
            notificationData.userId = user.userId
            notificationData.createdBy = "AUTO"

            const {Model: InAppNotificationModel} = getValidModelAndSchema('inappnotification');
            const document = InAppNotificationModel(notificationData);
            const options = {
                returnDocument: 'after',
                projection: {_id: 0, __v: 0},
            };
            await document.save(options).then(async savedDocument => {

                inAppNotificationService.sendNotification("inAppNotification", savedDocument);

            }).catch(function (err) {
                console.log(err)
            });

            user.set("alertForExpirationSent", true)
            await user.save()
        }
    } catch (error) {
        console.log(error)
    }
});

cron.schedule('0 2 * * *', async () => {
    try {
        console.log("Quotation scheduler runnig : ")
        const {Model: quotationModel} = getValidModelAndSchema('quotation');
        const {Model: enquiryModel} = getValidModelAndSchema('enquiry');

        const quotationData = await quotationModel.find({
            validTo: {"$lte": new Date().toISOString()},
            quoteStatus: {$nin: ["Job Created", "Quotation Expired"]}
        })

        console.log(quotationData.length)
        for (let i = 0; i < quotationData.length; i++) {
            const quotation = quotationData[i]
            console.log("Quotation status has been changed to expired for " + quotation.quotationId)

            quotation.set("remarks", "Quotation has been expired")
            quotation.set("quoteStatus", "Quotation Expired")

            await quotation.save()
            const quotationDataExpired = await quotationModel.find({enquiryId: quotation.enquiryId})
            if (quotationDataExpired.every(e => e.quoteStatus === "Quotation Expired")) {
                await enquiryModel.findOneAndUpdate({enquiryId: quotation.enquiryId}, {
                    $set: {
                        enquiryStatus: "Inquiry Expired",
                        enquiryStatusCustomer: "Inquiry Expired"
                    }
                })
            }

            // const enquiryData =

        }
    } catch (error) {
        console.log(error)
    }
});

cron.schedule('0 0 * * *', async () => {
    console.log("running transport enquiry scheduler")
    const uuid = require('uuid');

    try {
        const {Model: transportinquiryModel} = getValidModelAndSchema('transportinquiry');

        // fetch transport inquirys that are due
        const query = {}
        const currDate = getCurrentFormattedDate()
        query["biddingDueDate"] = {$lt: currDate}
        query["carrierStatus"] = {
            "$nin": ["Job Created", "Rejected", "Expired"]
        }

        await transportinquiryModel.find(query).then(async (transportinquirys) => {
            if (transportinquirys) {
                for (let i = 0; i < transportinquirys.length; i++) {
                    const transportinquiry = transportinquirys[i];

                    await transportinquiry.findOneAndUpdate({transportinquiryId: transportinquiry.transportinquiryId}, {
                        $set: {
                            carrierStatus: "Expired",
                            adminStatus: "Expired"
                        }
                    })
                }
            } else {
                console.log("transportinquirys not found")
            }
        })

    } catch (error) {
        console.log(error)
    }
});

async function getDifferntEvents(container, events) {
    const {Model: containereventModel} = getValidModelAndSchema('containerevent');

    const storedEvent = await containereventModel.find({batchId: container.batchId})

    return events.filter((e) => {
        return !storedEvent.find(c => c.currentlocation === e.currentlocation && c.eventname === e.eventname && c.latitude === e.latitude && c.longitude === e.longitude && c.containernumber === e.containernumber)
    })
}

async function containerEventsChanges(container, events, batchId) {
    const {Model: eventModel} = getValidModelAndSchema('event');
    let perticularBatchEvent = await eventModel.findOne({
        entityId: batchId,
        eventName: "POD Arrival",
    })
    if (perticularBatchEvent)
        perticularBatchEvent = perticularBatchEvent?.toObject();

    events = events?.filter(e => new Date(e.timestamptimezone) > new Date(perticularBatchEvent?.eventData.bookingDate))

    const {Model: containereventModel} = getValidModelAndSchema('containerevent');
    const {Model: containerModel} = getValidModelAndSchema('container');

    let differentEvent = await getDifferntEvents(container, events)

    differentEvent = differentEvent.map((e) => {
        return {
            ...e,
            containereventId: uuid.v4(),
            batchId: container.batchId,
            orgId: container.orgId,
            createdOn: new Date().toISOString(),
            updatedOn: new Date().toISOString(),
            containerNumber: container.containerNumber
        }
    })

    console.log(`${differentEvent.length} different events found for container : ${container.containerId} (${container.containerNumber})`)

    await containereventModel.insertMany(differentEvent);

    for (let i = 0; i < differentEvent.length; i++) {
        const event = differentEvent[i];

        let updatedContainer;

        console.log(`${event.eventname} found for container : ${container.containerId} (${container.containerNumber}) with eventId :${event.containereventId}`)

        if (event.eventname === "PORT IN") {
            updatedContainer = await containerModel.findOneAndUpdate(
                {
                    containerId: container?.containerId
                },
                {
                    $set: {
                        terminalIn: new Date(event.timestamptimezone).toISOString(),
                        terminalInName: event.currentlocation,
                    }
                },
                {
                    new: true
                }
            );

            updatedContainer = {
                ...updatedContainer.toObject(),
                terminalIn: new Date(event.timestamptimezone).toLocaleString(),
                containerLDBEvent: event.eventname
            }
        } else if (event.eventname === "PORT OUT" && event.currentlocation.toLowerCase().includes("customs")) {
            updatedContainer = await containerModel.findOneAndUpdate(
                {
                    containerId: container?.containerId
                },
                {
                    $set: {
                        customsCheck: new Date(event.timestamptimezone).toISOString(),
                        customsCheckLocation: event.currentlocation
                    }
                },
                {
                    new: true
                }
            );

            updatedContainer = {
                ...updatedContainer.toObject(),
                customsCheck: new Date(event.timestamptimezone).toLocaleString(),
                containerLDBEvent: "CUSTOMS"
            }
        } else if (event.eventname === "PORT OUT" && (!event.currentlocation.toLowerCase().includes("customs"))) {
            updatedContainer = await containerModel.findOneAndUpdate(
                {
                    containerId: container?.containerId
                },
                {
                    $set: {
                        terminalOut: new Date(event.timestamptimezone).toISOString(),
                        terminalOutName: event.currentlocation
                    }
                },
                {
                    new: true
                }
            );

            updatedContainer = {
                ...updatedContainer.toObject(),
                terminalOut: new Date(event.timestamptimezone).toLocaleString(),
                containerLDBEvent: event.eventname
            }
        } else if (event.eventname === "CFS IN") {
            updatedContainer = await containerModel.findOneAndUpdate(
                {
                    containerId: container?.containerId
                },
                {
                    $set: {
                        cfsIn: new Date(event.timestamptimezone).toISOString(),
                        cfsInName: event.currentlocation
                    }
                },
                {
                    new: true
                }
            );

            updatedContainer = {
                ...updatedContainer.toObject(),
                cfsIn: new Date(event.timestamptimezone).toLocaleString(),
                containerLDBEvent: event.eventname
            }
        } else if (event.eventname === "CFS OUT") {
            updatedContainer = await containerModel.findOneAndUpdate(
                {
                    containerId: container?.containerId
                },
                {
                    $set: {
                        cfsOut: new Date(event.timestamptimezone).toISOString(),
                        cfsOutName: event.currentlocation
                    }
                },
                {
                    new: true
                }
            );

            updatedContainer = {
                ...updatedContainer.toObject(),
                cfsOut: new Date(event.timestamptimezone).toLocaleString(),
                containerLDBEvent: event.eventname
            }
        } else if (event.eventname === "ICD IN") {
            updatedContainer = await containerModel.findOneAndUpdate(
                {
                    containerId: container?.containerId
                },
                {
                    $set: {
                        icdIn: new Date(event.timestamptimezone).toISOString(),
                        icdInName: event.currentlocation
                    }
                },
                {
                    new: true
                }
            );

            updatedContainer = {
                ...updatedContainer.toObject(),
                icdIn: new Date(event.timestamptimezone).toLocaleString(),
                containerLDBEvent: event.eventname
            }
        } else if (event.eventname === "ICD OUT") {
            updatedContainer = await containerModel.findOneAndUpdate(
                {
                    containerId: container?.containerId
                },
                {
                    $set: {
                        icdOut: new Date(event.timestamptimezone).toISOString(),
                        icdOutName: event.currentlocation
                    }
                },
                {
                    new: true
                }
            );

            updatedContainer = {
                ...updatedContainer.toObject(),
                icdOut: new Date(event.timestamptimezone).toLocaleString(),
                containerLDBEvent: event.eventname
            }
        } else if (["STATION CROSSED", "GATE CROSSED"].includes(event.eventname)) {
            updatedContainer = {
                ...event,
                containerId: container?.containerId,
                containerLDBEvent: event.eventname
            }
        } else {
            updatedContainer = {
                ...event,
                containerId: container?.containerId,
                containerLDBEvent: "OTHER EVENT"
            }
        }

        if (updatedContainer) {
            await triggerPointExecute({traceId: "container_ldb_event_scheduler"}, updatedContainer, "container")
        }
    }
}

async function containerScheduler() {
    try {
        // const uuid = require('uuid'); // Already imported
        // console.log("running container scheduler")
        // console.log("Scheduler for reminder executed");
        const {Model: batchModel} = getValidModelAndSchema('batch');
        const {Model: containerModel} = getValidModelAndSchema('container');
        const {Model: eventModel} = getValidModelAndSchema('event');

        const batchDataFromEvent = await eventModel.aggregate([
            {
                $match: {
                    eventName: "POD Arrival",
                    eventData: {$exists: true}, // Check if eventData is not filled
                    "eventData.eventState": {$ne: ""}
                },
            },
            {
                $group: {
                    _id: "$entityId", // Group by jobId
                },
            },
            {
                $project: {
                    batchId: "$_id", // Project jobId
                    _id: 0,
                },
            },
        ]);

        const batchIds = batchDataFromEvent?.map(e => e?.batchId)
        const batchData = await batchModel.find({
            batchId: {
                $in: batchIds
            },
            statusOfBatch: {$ne: "Job Closed"}
        })

        const containerData = [];

        for (let i = 0; i < batchData?.length; i++) {
            const batch = batchData[i]

            const containers = await containerModel.find({
                "batchId": batch?.batchId
            })

            for (let j = 0; j < containers?.length; j++) {
                const container = containers[j]

                console.log(`Processing container : ${container.containerId} (${container.containerNumber})`)

                let config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: `${process.env.ULIP_SERVER_URL}/containerTrack`,
                    data: {
                        containerNumber: container?.containerNumber
                    },
                    timeout: 60000 * 3
                };

                await axios.request(config).then(async (response) => {
                    const events = response.data
                    console.log(`Tracking found for container : ${container.containerId} (${container.containerNumber}) with ${events.length} events`)

                    await containerEventsChanges(container, events, batch?.batchId)
                }).catch((error) => {
                    console.log(`Error while tracking container : ${container.containerId} (${container.containerNumber})`)
                    console.log(error)
                })
            }
        }


        console.log(containerData)
    } catch (err) {
        console.log("Err from reminder scheduler: " + err)
    }
}

// 0 */2 * * *
cron.schedule('0 */2 * * *', () => {
    console.log('Running the container scheduler');
    containerScheduler();
});