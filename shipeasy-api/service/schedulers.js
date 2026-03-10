const { BlobServiceClient } = require("@azure/storage-blob");
const cron = require('node-cron');
const axios = require('axios');
const emailReplyScheduler = require('../controller/emailReplyScheduler');
const { connect } = require('imap-simple');
const { mongoose, getTransporter, uuid, triggerPointExecute, getSenderName, getTOCCEmailsForScheduler } = require('../controller/helper.controller');
const newSchemaWithObject = require('../schema');
const { scanEmailToCreateJob } = require('../controller/automations/jobautomation.controller');
const { sendSchedulMail } = require("../controller/insert.commonController");
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const cheerio = require('cheerio');

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
	const quotationModel = mongoose.models[`quotationModel`] || mongoose.model(`quotationModel`, newSchemaWithObject["quotation"], `quotations`);
	await quotationModel.find(quotationFilter).then(async function (quotations) {
		for (let q = 0; q < quotations?.length; q++) {
			const quotation = quotations[q];
			const enquiryModel = mongoose.models[`enquiryModel`] || mongoose.model(`enquiryModel`, newSchemaWithObject["enquiry"], `enquirys`);
			await enquiryModel.findOne({ enquiryId: quotation.enquiryId }).then(async function (enquiry) {
				if (enquiry) {
					const partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, newSchemaWithObject["partymaster"], `partymasters`);
					await partymasterModel.findOne({ partymasterId: enquiry?.basicDetails?.shipperId }).then(async function (partymaster) {
						if (partymaster) {
							const to = [{ email: partymaster.primaryMailId, name: partymaster.primaryMailId }]
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
async function cutOffDate12Hour() {
	const currDate = new Date();
	currDate.setHours(currDate.getHours() + 12);
	const instructionFilter = {};
	instructionFilter["si.siCutOffDate"] = { "$lt": currDate.toISOString(), "$gt": new Date().toISOString() }
	const instructionModel = mongoose.models[`instructionModel`] || mongoose.model(`instructionModel`, newSchemaWithObject["instruction"], `instructions`);
	await instructionModel.find(instructionFilter).then(async function (instructions) {
		for (let i = 0; i < instructions?.length; i++) {
			const instruction = instructions[i];
			const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, newSchemaWithObject["batch"], `batchs`);
			await batchModel.findOne({ batchId: instruction.batchId }).then(async function (batch) {
				if (batch) {
					const partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, newSchemaWithObject["partymaster"], `partymasters`);
					await partymasterModel.findOne({ partymasterId: batch?.enquiryDetails?.basicDetails?.shipperId }).then(async function (partymaster) {
						if (partymaster) {
							const to = [{ email: partymaster.primaryMailId, name: partymaster.primaryMailId }, { email: instruction.si.siMail, name: instruction.si.siMail }]
							const params = {
								referenceNumber: batch.batchNo,
								Origin: batch.enquiryDetails.routeDetails.loadPortName,
								Destination: batch.enquiryDetails.routeDetails.destPortName,
								bookingNo: batch.bookingNo,
								quotationNo: batch.quotationNo
							}
							sendMailSB(27, to, [], params)
						}
					})
				}
			})
		}
	})
}
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

async function sendReminderToUser(reminder, user) {
	let notificationData = {};
	const uuid = require('uuid');
	const inAppNotificationService = require("../service/inAppNotification")


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

	const InAppNotificationModel = mongoose.models[`InAppNotificationModel`] || mongoose.model(`InAppNotificationModel`, newSchemaWithObject['inappnotification'], `inappnotifications`);
	const document = InAppNotificationModel(notificationData);
	const options = {
		returnDocument: 'after',
		projection: { _id: 0, __v: 0 },
	};
	await document.save(options).then(async savedDocument => {

		const agentModel = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, newSchemaWithObject["agent"], `agents`);
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
		const uuid = require('uuid');
		const inAppNotificationService = require("../service/inAppNotification")

		// console.log("Scheduler for reminder executed");
		const reminderModel = mongoose.models.reminderModel || mongoose.model('reminderModel', newSchemaWithObject["reminder"], 'reminders');
		const userModel = mongoose.models.userModel || mongoose.model('userModel', newSchemaWithObject["user"], 'users');

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

						if (new Date(reminder?.customDate) < new Date()) {

							for (let j = 0; j < reminder?.userList?.length; j++) {
								const user = await userModel.findOne({ userId: reminder.userList[j].item_id })
								await sendReminderToUser(reminder, user)
							}

							reminder.set("isSent", true)
							reminder.set("isVisited", false)
							reminder.set("reminderStatus", "Completed")

							await reminder.save()
						}
					} else {
						const afterTime = extractHours(reminder?.reminderTime)

						const updatedOn = new Date(reminder.updatedOn).getTime()
						const afterTimeOn = new Date().getTime() - (afterTime * 60 * 60 * 1000)
						if (updatedOn < afterTimeOn) {

							for (let j = 0; j < reminder?.userList?.length; j++) {
								const user = await userModel.findOne({ userId: reminder.userList[j].item_id })
								await sendReminderToUser(reminder, user)
							}

							console.log("Reminder sent for " + reminder.reminderId)
							reminder.set("isSent", true)
							await reminder.save()
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
// invoice overdue scheduler
// cron.schedule('0 0 * * *', async () => {
// 	const uuid = require('uuid');

// 	try {
// 		const invoiceModel = mongoose.models.invoiceModel || mongoose.model('invoiceModel', newSchemaWithObject["invoice"], 'invoices');
// 		const userModel = mongoose.models.userModel || mongoose.model('userModel', newSchemaWithObject['user'], 'users');

// 		// Fetch invoice that are pending and due
// 		const query = {}
// 		const currDate = new Date().toISOString()
// 		query["invoiceDueDate"] = {$lt : currDate}
// 		query["paymentStatus"] = 'Unpaid'
// 		// query["invoiceStatus"] = 'Pending'

// 		await invoiceModel.find(query).then(async (invoices) => {
// 			if (invoices){
// 				for (let i = 0; i < invoices.length; i++){
// 					const invoice = invoices[i];

// 					await invoiceModel.findOneAndUpdate({invoiceId : invoice.invoiceId}, {$set : {
// 						invoiceStatus : "Overdue",
// 						statusOfinvoice : "Overdue",
// 						paymentStatus : "Overdue"
// 					}})

// 					const userIds = []

// 					userIds.push(invoice.createdByUID)

// 					const user = await userModel.findOne({customerId : invoice.invoiceToId})
// 					if (user)
// 						userIds.push(user.userId)

// 					for (let u = 0; u < userIds.length; u++){
// 						const inAppNotificationService = require("./service/inAppNotification")
// 						let notificationData = {};

// 						notificationData.createdOn = new Date().toISOString();
// 						notificationData.inappnotificationId = uuid.v1();
// 						notificationData.notificationName = `Reminder for invoice overdue`;
// 						notificationData.notificationType = "reminder";
// 						notificationData.description = `Invoice no. ${invoice.invoiceNo} against Booking no. ${invoice.batchNo} has Overdue.`
// 						notificationData.notificationURL = "";
// 						notificationData.read = false;
// 						notificationData.isReminder = true;
// 						notificationData.userId = userIds[u]
// 						notificationData.createdBy = "AUTO"
// 						notificationData.module = "SE"

// 						const InAppNotificationModel = mongoose.models[`InAppNotificationModel`] || mongoose.model(`InAppNotificationModel`, newSchemaWithObject['inappnotification'], `inappnotifications`);
// 						const document = InAppNotificationModel(notificationData);
// 						const options = {
// 							returnDocument: 'after',
// 							projection: { _id: 0, __v: 0 },
// 						};
// 						await document.save(options).then(async savedDocument => {
// 							console.log(notificationData.description + " for userId : " + userIds[u]);
// 							inAppNotificationService.sendNotification("inAppNotification", savedDocument);
// 						}).catch(function (err) {
// 							console.log(err)
// 						});
// 					}
// 				}
// 			} else {
// 				console.log("invoice not found")
// 			}
// 		})

// 	} catch (error) {
// 		console.log(error)
// 	}
// });
cron.schedule('0 0 * * *', async () => {
	console.log('Task is running every 30 seconds');

	try {
		const userModel = mongoose.models.userModel || mongoose.model('userModel', newSchemaWithObject['user'], 'users');
		const agentModel = mongoose.models.agentModel || mongoose.model('agentModel', newSchemaWithObject['agent'], 'agents');

		const agentData = await agentModel.find({ "isTrial": true, "trialValidTill": { "$lte": new Date().toISOString() } })
		// const filteredData = agentData.filter(e => !(e.agentStatusExpired))

		for (let i = 0; i < agentData.length; i++) {
			const agent = agentData[i]
			console.log("processing user : " + agent.agentId)

			agent.set("isTrial", false)
			agent.set("agentStatus", "expired")

			await agent.save()
			await userModel.updateMany({ orgId: agent.orgId }, { "$set": { status: false } })
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

		const userModel = mongoose.models.userModel || mongoose.model('userModel', newSchemaWithObject['user'], 'users');

		const twoDaysFromNow = new Date();
		twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

		const userData = await userModel.find({ "isTrial": true, "trialValidTill": { "$lte": twoDaysFromNow.toISOString() } })
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

			const InAppNotificationModel = mongoose.models[`InAppNotificationModel`] || mongoose.model(`InAppNotificationModel`, newSchemaWithObject['inappnotification'], `inappnotifications`);
			const document = InAppNotificationModel(notificationData);
			const options = {
				returnDocument: 'after',
				projection: { _id: 0, __v: 0 },
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
		const quotationModel = mongoose.models.quotationModel || mongoose.model('quotationModel', newSchemaWithObject['quotation'], 'quotations');
		const enquiryModel = mongoose.models.enquiryModel || mongoose.model('enquiryModel', newSchemaWithObject['enquiry'], 'enquirys');

		const quotationData = await quotationModel.find({ validTo: { "$lte": new Date().toISOString() }, quoteStatus: { $nin: ["Job Created", "Quotation Expired"] } })

		console.log(quotationData.length)
		for (let i = 0; i < quotationData.length; i++) {
			const quotation = quotationData[i]
			console.log("Quotation status has been changed to expired for " + quotation.quotationId)

			quotation.set("remarks", "Quotation has been expired")
			quotation.set("quoteStatus", "Quotation Expired")

			await quotation.save()
			const quotationDataExpired = await quotationModel.find({ enquiryId: quotation.enquiryId })
			if (quotationDataExpired.every(e => e.quoteStatus === "Quotation Expired")) {
				await enquiryModel.findOneAndUpdate({ enquiryId: quotation.enquiryId }, {
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
		const transportinquiryModel = mongoose.models.transportinquiryModel || mongoose.model('transportinquiryModel', newSchemaWithObject["transportinquiry"], 'transportinquirys');

		// fetch transport inquirys that are due
		const query = {}
		const currDate = getCurrentFormattedDate()
		query["biddingDueDate"] = { $lt: currDate }
		query["carrierStatus"] = {
			"$nin": ["Job Created", "Rejected", "Expired"]
		}

		await transportinquiryModel.find(query).then(async (transportinquirys) => {
			if (transportinquirys) {
				for (let i = 0; i < transportinquirys.length; i++) {
					const transportinquiry = transportinquirys[i];

					await transportinquiry.findOneAndUpdate({ transportinquiryId: transportinquiry.transportinquiryId }, {
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
	const containereventModel = mongoose.models.containereventModel || mongoose.model('containereventModel', newSchemaWithObject["containerevent"], 'containerevents');

	const storedEvent = await containereventModel.find({ batchId: container.batchId })

	return events.filter((e) => {
		return !storedEvent.find(c => c.currentlocation === e.currentlocation && c.eventname === e.eventname && c.latitude === e.latitude && c.longitude === e.longitude && c.containernumber === e.containernumber)
	})
}
async function containerEventsChanges(container, events, batchId) {
	const eventModel = mongoose.models.eventModel || mongoose.model('eventModel', newSchemaWithObject["event"], 'events');
	let perticularBatchEvent = await eventModel.findOne({
		entityId: batchId,
		eventName: "POD Arrival",
	})
	if (perticularBatchEvent)
		perticularBatchEvent = perticularBatchEvent?.toObject();

	events = events?.filter(e => new Date(e.timestamptimezone) > new Date(perticularBatchEvent?.eventData.bookingDate))

	const containereventModel = mongoose.models.containereventModel || mongoose.model('containereventModel', newSchemaWithObject["containerevent"], 'containerevents');
	const containerModel = mongoose.models.containerModel || mongoose.model('containerModel', newSchemaWithObject["container"], 'containers');

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
			await triggerPointExecute({ traceId: "container_ldb_event_scheduler" }, updatedContainer, "container")
		}
	}
}
async function containerScheduler() {
	try {
		const uuid = require('uuid');
		// console.log("running container scheduler")
		// console.log("Scheduler for reminder executed");
		const batchModel = mongoose.models.batchModel || mongoose.model('batchModel', newSchemaWithObject["batch"], 'batchs');
		const containerModel = mongoose.models.containerModel || mongoose.model('containerModel', newSchemaWithObject["container"], 'containers');
		const eventModel = mongoose.models.eventModel || mongoose.model('eventModel', newSchemaWithObject["event"], 'events');

		const batchDataFromEvent = await eventModel.aggregate([
			{
				$match: {
					eventName: "POD Arrival",
					eventData: { $exists: true }, // Check if eventData is not filled
					"eventData.eventState": { $ne: "" }
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
			statusOfBatch: { $ne: "Job Closed" }
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

const whatsappshareddocumentModel = mongoose.models.whatsappshareddocumentModel || mongoose.model('whatsappshareddocumentModel', newSchemaWithObject["whatsappshareddocument"], 'whatsappshareddocuments');

// Azure Blob Storage connection
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_CONNECTION_STRING || process.env.AZURE_STORAGE_CONNECTION_STRING;
let blobServiceClient = null;
if (AZURE_STORAGE_CONNECTION_STRING) {
    try {
        blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    } catch (err) {
        console.error('Azure Blob Storage client initialization failed in schedulers — check AZURE_STORAGE_CONNECTION_STRING:', err.message);
    }
}

async function deleteOldDocuments() {
	try {
		// Calculate the cutoff date (15 days ago)
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - 15);

		// Find documents older than 15 days with status 'active'
		const oldDocuments = await whatsappshareddocumentModel.find({
			createdOn: { $lt: cutoffDate },
			status: "active",
		});

		for (const doc of oldDocuments) {
			try {
				// Parse the blob URL to extract container and blob name
				const urlParts = new URL(doc.url);
				const containerName = urlParts.pathname.split("/")[1];
				const blobName = urlParts.pathname.split("/").slice(2).join("/");

				// Get the container client and delete the blob
				const containerClient = blobServiceClient.getContainerClient(containerName);
				const blockBlobClient = containerClient.getBlockBlobClient(blobName);
				await blockBlobClient.delete();

				console.log(`Deleted blob: ${doc.name}`);

				// Update the document's status to 'deleted'
				await whatsappshareddocumentModel.updateOne(
					{ _id: doc._id },
					{ $set: { status: "deleted", updatedOn: new Date() } }
				);

				console.log(`Marked document as deleted: ${doc._id}`);
			} catch (err) {
				console.error(`Failed to delete blob or update document: ${err.message}`);
			}
		}
	} catch (err) {
		console.error(`Error in deleting old documents: ${err.message}`);
	}
}

// Schedule the job to run daily at midnight
function getWeekDifference(date1, date2) {
	const msPerWeek = 1000 * 60 * 60 * 24 * 7;
	return Math.floor((new Date(date2) - new Date(date1)) / msPerWeek);
}
function getYearDifference(date1, date2) {
	const msPerYear = 1000 * 60 * 60 * 24 * 365.25; // Accounting for leap years
	return Math.floor((new Date(date2) - new Date(date1)) / msPerYear);
}
function getMonthDifference(date1, date2) {
	const d1 = new Date(date1);
	const d2 = new Date(date2);

	return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
}

async function checkSchdeuledMailsAndSend() {
	try {
		const now = new Date();
		const currentHour = now.getHours().toString();

		const schedulereportModel = mongoose.models[`schedulereportModel`] || mongoose.model(`schedulereportModel`, newSchemaWithObject["schedulereport"], `schedulereports`);
		let schedulereportData = await schedulereportModel.find(
			{
				timeofDay: currentHour
			}
		)
		for (let i = 0; i < schedulereportData?.length; i++) {
			const schedulereport = schedulereportData[i]

			if (schedulereport?.lastSentOn) {
				if (schedulereport && schedulereport?.schedule === "Weekly" && getWeekDifference(schedulereport?.lastSentOn, new Date().toISOString()) < 1)
					continue;
				if (schedulereport && schedulereport?.schedule === "Yearly" && getYearDifference(schedulereport?.lastSentOn, new Date().toISOString()) < 1)
					continue;
				if (schedulereport && schedulereport?.schedule === "Monthly" && getMonthDifference(schedulereport?.lastSentOn, new Date().toISOString()) < 1)
					continue;
			}

			await sendSchedulMail(schedulereport)
			await schedulereportModel.findOneAndUpdate(
				{
					schedulereportId: schedulereport.schedulereportId
				},
				{
					$set: {
						lastSentOn: new Date().toISOString()
					}
				}
			)
		}
	} catch (err) {
		console.error(JSON.stringify({
			traceId: "from_schedulmail_scheduler",
			error: err,
			stack: err?.stack
		}))
	}
}
cron.schedule("0 0 * * *", deleteOldDocuments);

cron.schedule("0 * * * *", () => {
	console.log("Checking for emails to send...");
	checkSchdeuledMailsAndSend();
}, {
	scheduled: true,
	timezone: "Asia/Kolkata"
});

async function getDueTaskOfToday() {
	try {
		const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, newSchemaWithObject["batch"], `batchs`);
		const userModel = mongoose.models[`userModel`] || mongoose.model(`userModel`, newSchemaWithObject["user"], `users`);
		const agentModel = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, newSchemaWithObject["agent"], `agents`);
		const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, newSchemaWithObject["event"], `events`);

		// Fetch batch data
		let batchData = await batchModel.find({
			statusOfBatch: {
				$nin: ['Job Cancelled', 'Job Closed', 'Job Created', 'Biz Completed']
			}
		}, { batchNo: 1, batchId: 1, statusOfBatch: 1, orgId: 1, "enquiryDetails.basicDetails.shipperName": 1, "enquiryDetails.basicDetails.consigneeName": 1 });

		if (batchData) batchData = batchData.map(e => e.toObject());

		// Fetch event data for batches
		let eventData = await eventModel.find({
			$or: batchData.map(e => ({
				eventName: e.statusOfBatch.replace(" Pending", ""),
				entityId: e.batchId,
				"eventData.eventState": "EstimatedDate",
				"eventData.bookingDateEst": { $ne: null }
			}))
		});

		if (eventData) eventData = eventData.map(e => e.toObject());

		// Add estimatedDate to batchData and filter today's pending tasks
		batchData = batchData.map(e => {
			const event = eventData.find(eventT => eventT?.entityId === e.batchId);
			return { ...e, estimatedDate: event?.eventData?.bookingDateEst };
		}).filter(e => {
			const estDateIST = new Date(e?.estimatedDate).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });
			const todayIST = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });
			return estDateIST === todayIST;
		});

		// Group batch data by orgId
		let groupedByOrgBatch = [];

		for (const item of batchData) {
			let group = groupedByOrgBatch.find(g => g.orgId === item.orgId);

			if (!group) {
				// Fetch users for the org
				let users = await userModel.find({ orgId: item.orgId, userStatus: true }, { userId: 1, userEmail: 1, name: 1 });
				let orgData = await agentModel.findOne({ agentId: item.orgId }, { uploadSign: 1, agentId: 1, agentName: 1, "emailConfig.emailId": 1 });
				if (orgData)
					orgData = orgData?.toObject();

				if (users) users = users.map(eU => eU.toObject());

				group = { orgId: item.orgId, batchs: [], users, orgData };
				groupedByOrgBatch.push(group);
			}

			const { _id, orgId, ...other } = item;
			group.batchs.push({ ...other });
		}

		// Generate table rows for batches
		groupedByOrgBatch.forEach(async e => {
			if (e?.batchs?.length > 0) {
				const batchRowText = e.batchs.map(b => `
					<tr>
						<td>${b.batchNo}</td>
						<td>${b?.enquiryDetails?.basicDetails?.shipperName || '-'}</td>
						<td>${b?.enquiryDetails?.basicDetails?.consigneeName || '-'}</td>
						<td>${b.statusOfBatch}</td>
						<td>${new Date(b?.estimatedDate).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' })?.replaceAll("/", "-")}</td>
						<td><a href="${process.env.FRONTEND_URL}/batch/list/add/${b.batchId}/details" target="_blank" style="text-decoration: none; background-color: #007bff; color: white; padding: 10px 15px; border-radius: 5px; display: inline-block;">Update Now</a></td>
					</tr>
				`).join("");

				const footer = e.orgData?.uploadSign ? `<footer><img style="height:125px;" src="https://shipeasy.blob.core.windows.net/ship-docs/${e.orgData?.uploadSign}" alt="Email Signature" /></footer>` : ""

				const mailBody = `<!DOCTYPE html>
					<html lang="en">

					<head>
					<style>
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
					</style>
					</head>

					<body>
						<p>Dear ${e?.orgData?.agentName} Team</p>
						<p>Please find below the updated status of pending tasks for today's freight jobs:</p>
					
						<figure class="table">
						<table>
							<thead>
								<tr>
								<th>Job No</th>
								<th>Shipper</th>
								<th>Consignee</th>  
								<th>Pending Task</th>
								<th>Estimated Date</th>
								<th>Action</th>
								</tr>
							</thead>
							<tbody>
								${batchRowText}
							</tbody>
						</table>
						</figure>
					</body>
					<footer>${footer}</footer>

					</html>`;


				let transporterAgent = await getTransporter({
					orgId: e.orgId
				})

				const { toMails, ccMails } = await getTOCCEmailsForScheduler({ traceId: "From scheduler : getDueTaskOfToday" }, {
					isDailyPendingStatus: true,
					orgId: e.orgId
				}, "batch")

				const mailOptions = {
					from: getSenderName(e.orgData),
					// to: e.users?.map(em => em?.userEmail).filter(Boolean),
					// cc: [],
					to: toMails.map((e) => e.email),
					cc: ccMails.map((e) => e.email),
					subject: `Freight Job Pending Tasks Update – ${new Date().toISOString().split('T')[0]}`,
					text: '',
					html: mailBody
				};

				transporterAgent?.sendMail(mailOptions, (error, info) => {
					if (error) {
						console.log(error)
						return error
					}

					console.log(`Message sent: ${info.messageId} for todays pending task`)
					return `Message sent: ${info.messageId}`
				});
			}
		});
	} catch (error) {
		console.log(error)
	}
}

async function getContainerReturningByToday() {
	try {
		const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, newSchemaWithObject["batch"], `batchs`);
		const userModel = mongoose.models[`userModel`] || mongoose.model(`userModel`, newSchemaWithObject["user"], `users`);
		const agentModel = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, newSchemaWithObject["agent"], `agents`);
		const containerModel = mongoose.models[`containerModel`] || mongoose.model(`containerModel`, newSchemaWithObject["container"], `containers`);

		// Fetch batch data
		let batchData = await batchModel.find({
			statusOfBatch: {
				$nin: ['Job Cancelled', 'Job Closed', 'Job Created', 'Biz Completed']
			}
		}, { batchNo: 1, batchId: 1, statusOfBatch: 1, orgId: 1, "enquiryDetails.basicDetails.shipperName": 1, "enquiryDetails.basicDetails.consigneeName": 1 });

		if (batchData) batchData = batchData.map(e => e.toObject());

		let containerData = await containerModel.find({
			$or: batchData.map(e => ({
				$or: [
					{
						batchId: {
							$in: [
								e.batchId
							]
						}
					},
					{
						"batchwiseGrouping.batchId": {
							$in: [
								e.batchId
							]
						}
					}
				]
			}))
		}, { containerNumber: 1, batchId: 1, "batchwiseGrouping.batchId": 1, mtyValidity: 1, mtyReturn: 1 })

		if (containerData) containerData = containerData.map(e => e.toObject())

		containerData = containerData.filter(e => e.containerNumber).filter(e => !e.hasOwnProperty("mtyReturn") || e.mtyReturn === "").filter(e => {
			const estDateIST = new Date(e?.mtyValidity).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });
			const todayIST = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });
			return estDateIST === todayIST;
		});

		// Add estimatedDate to batchData and filter today's pending tasks
		batchData = batchData.filter(e => containerData.find(c => c.batchId === e.batchId || c?.batchwiseGrouping?.batchId === e.batchId)).map(e => {
			const containers = containerData.filter(containerData => (containerData?.batchId === e.batchId || containerData?.batchwiseGrouping?.batchId === e.batchId));
			return { ...e, containersData: containers };
		});

		// Group batch data by orgId
		let groupedByOrgBatch = [];

		for (const item of batchData) {
			let group = groupedByOrgBatch.find(g => g.orgId === item.orgId);

			if (!group) {
				// Fetch users for the org
				let users = await userModel.find({ orgId: item.orgId, userStatus: true }, { userId: 1, userEmail: 1, name: 1 });
				let orgData = await agentModel.findOne({ agentId: item.orgId }, { uploadSign: 1, agentId: 1, agentName: 1, "emailConfig.emailId": 1 });
				if (orgData)
					orgData = orgData?.toObject();

				if (users) users = users.map(eU => eU.toObject());

				group = { orgId: item.orgId, batchs: [], users, orgData };
				groupedByOrgBatch.push(group);
			}

			const { _id, orgId, ...other } = item;
			group.batchs.push({ ...other });
		}

		// Generate table rows for batches
		groupedByOrgBatch.forEach(async e => {
			if (e?.batchs?.length > 0) {
				const batchRowText = e.batchs.map(b => `
					<tr>
						<td>${b.batchNo}</td>
						<td>${b?.enquiryDetails?.basicDetails?.shipperName || '-'}</td>
						<td>${b?.enquiryDetails?.basicDetails?.consigneeName || '-'}</td>
						<td>
							<table>
								<tbody>
									${b?.containersData?.map(ce => `<tr>
										<td>
											${ce.containerNumber}
										</td>
									</tr>`).join(" ")}
								</tbody>
							</table>
						</td>
						<td>${new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' })?.replaceAll("/", "-")}</td>
						<td><a href="${process.env.FRONTEND_URL}/batch/list/add/${b.batchId}/Container" target="_blank" style="text-decoration: none; background-color: #007bff; color: white; padding: 10px 15px; border-radius: 5px; display: inline-block;">Update Now</a></td>
					</tr>
				`).join("");

				const footer = e.orgData?.uploadSign ? `<footer><img style="height:125px;" src="https://shipeasy.blob.core.windows.net/ship-docs/${e.orgData?.uploadSign}" alt="Email Signature" /></footer>` : ""

				const mailBody = `<!DOCTYPE html>
					<html lang="en">

					<head>
					<style>
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
					</style>
					</head>

					<body>
						<p>Dear ${e?.orgData?.agentName} Team</p>
						<p>Please find below the list of containers that are scheduled to be returned by today.</p>
					
						<figure class="table">
						<table>
							<thead>
								<tr>
								<th>Job No</th>
								<th>Shipper</th>
								<th>Consignee</th>  
								<th>Container Nos</th>
								<th>Empty Validity Date</th>
								<th>Action</th>
								</tr>
							</thead>
							<tbody>
								${batchRowText}
							</tbody>
						</table>
						</figure>
					</body>
					<footer>${footer}</footer>

					</html>`;


				let transporterAgent = await getTransporter({
					orgId: e.orgId
				})

				const { toMails, ccMails } = await getTOCCEmailsForScheduler({ traceId: "From scheduler : getContainerReturningByToday" }, {
					isContainerReturnDue: true,
					orgId: e.orgId
				}, "container")

				const mailOptions = {
					from: getSenderName(e.orgData),
					to: toMails.map((e) => e.email),
					// to: e.users?.map(em => em?.userEmail).filter(Boolean),
					// cc: [],
					cc: ccMails.map((e) => e.email),
					subject: `Containers Due for Return as of Today – ${new Date().toISOString().split('T')[0]}`,
					text: '',
					html: mailBody
				};

				transporterAgent?.sendMail(mailOptions, (error, info) => {
					if (error) {
						console.log(error)
						return error
					}

					console.log(`Message sent: ${info.messageId} for todays returning container`)
					return `Message sent: ${info.messageId}`
				});
			}
		});
	} catch (error) {
		console.log(error)
	}
}

cron.schedule('0 9,11,13,15,18 * * *', () => {
	console.log('Running task at 6:00 AM every day');
	getDueTaskOfToday()
}, {
	scheduled: true,
	timezone: "Asia/Kolkata"
});

cron.schedule('0 10 * * *', () => {
	console.log('Running task at 10:00 AM every day');
	getContainerReturningByToday()
}, {
	scheduled: true,
	timezone: "Asia/Kolkata"
});

async function readIGMMailReply() {
	try {
		const agentModel = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, newSchemaWithObject["agent"], `agents`);

		let orgData = await agentModel.find();
		if (orgData)
			orgData = orgData?.map(e => e?.toObject());

		for (let account of orgData) {
			startMailListener(account);
		}
	} catch (error) {
		console.error("Error while setting mailbox for reading IGM Mail!", error);
	}
}

function extractTableData($, table) {
	const headers = [];
	const rows = [];

	$(table).find('tr').each((i, tr) => {
		const cells = $(tr).find('td, th').map((j, cell) =>
			$(cell).text().trim().replace(/\u00a0/g, ' ')
		).get();

		if (i === 0) {
			headers.push(...cells);
		} else {
			const row = {};
			headers.forEach((h, idx) => {
				row[h] = cells[idx] || '';
			});
			rows.push(row);
		}
	});

	return { headers, rows };
}

function matchTableByHeaders($, table, expectedHeaders) {
	const headers = $(table).find('tr').first().find('td, th').map((_, el) =>
		$(el).text().trim().replace(/\u00a0/g, ' ')
	).get();

	return expectedHeaders.every(h => headers.includes(h));
}

async function createBatchNotification(
	batchId,
	batchNo,
	notificationText,
	orgId,
	createdBy = 'System',
	createdByUID = 'System'
) {
	const now = new Date().toISOString();

	const batchnotificationModel = mongoose.models[`batchnotificationModel`] || mongoose.model(`batchnotificationModel`, newSchemaWithObject["batchnotification"], `batchnotifications`);

	const newNotification = new batchnotificationModel({
		batchnotificationId: uuid.v4(),
		notificationType: "success", // You can customize this or make it a parameter
		notificationText,
		readUsers: [],
		orgId,
		createdOn: now,
		updatedOn: now,
		createdBy,
		createdByUID,
		updatedBy: createdBy,
		updatedByUID: createdByUID,
		batchId,
		batchNo
	});

	try {
		const saved = await newNotification.save();
		console.log("✅ Batch Notification created:", saved.batchnotificationId);
		return saved;
	} catch (err) {
		console.error("❌ Failed to create batch notification:", err.message);
		throw err;
	}
}

async function checkAndFetchIGMDeatils(htmlContent, parsed) {
	try {
		const tableDefinitions = [
			{
				name: 'Cargo Details Table',
				headers: ['Line No', 'Subline No', 'BL No', 'BL Date', 'House BL No']
			},
			{
				name: 'IGM Table',
				headers: ['S No.', 'IGM No', 'IGM Date', 'INW Date', 'File Name']
			},
			{
				name: 'Container Status Table',
				headers: ['IGM No', 'Line No', 'Subline No', 'Container Details', 'Container Status']
			}
		];

		const $ = cheerio.load(htmlContent);
		const parsedTables = [];

		$('table').each((i, table) => {
			tableDefinitions.forEach(def => {
				if (matchTableByHeaders($, table, def.headers)) {
					const data = extractTableData($, table);
					parsedTables.push({ table: def.name, data });
				}
			});
		});

		const cargoDetailTable = parsedTables.find(e => e.table === "Cargo Details Table")
		const igmTable = parsedTables.find(e => e.table === "IGM Table")
		const containerStatusTable = parsedTables.find(e => e.table === "Container Status Table")

		if (cargoDetailTable && igmTable && containerStatusTable) {
			let blNumbers = [...new Set(cargoDetailTable.data.rows.map(e => e["BL No"]).filter(Boolean))]
			let hblNumbers = [...new Set(cargoDetailTable.data.rows.map(e => e["House BL No"]).filter(Boolean))]
			let igmNo = igmTable.data.rows.map(e => e["IGM No"]).join("")
			let igmDate = igmTable.data.rows.map(e => e["IGM Date"]).join("")
			let lineNo = [...new Set(containerStatusTable.data.rows.map(e => e["Line No"]))].join("");
			let subLineNo = [...new Set(containerStatusTable.data.rows.map(e => e["Subline No"]))].join("");
			let containerWiseData = cargoDetailTable.data.rows.map(e => {
				return {
					hblNumber: e["House BL No"],
					lineNo: e["Line No"],
					subLineNo: e["Subline No"]
				}
			})

			const igmcfsModel = mongoose.models[`igmcfsModel`] || mongoose.model(`igmcfsModel`, newSchemaWithObject["igmcfs"], `igmcfss`);
			const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, newSchemaWithObject["batch"], `batchs`);
			const blModel = mongoose.models[`blModel`] || mongoose.model(`blModel`, newSchemaWithObject["bl"], `bls`);

			if (lineNo && subLineNo && igmNo && igmDate && blNumbers && blNumbers?.length > 0) {
				igmDate = new Date(igmDate).toISOString()

				let igmcfsData = await igmcfsModel.findOne({
					"blData.blNo": {
						$in: blNumbers
					},
					type: "Addigm"
				})

				if (igmcfsData) {
					igmcfsData = igmcfsData?.toObject()

					let batchData = await batchModel.findOne({
						batchId: igmcfsData?.batchId
					})
					if (batchData)
						batchData = batchData?.toObject()

					let blDataDB = await blModel.find({
						blNumber: {
							$in: hblNumbers
						}
					})
					if (blDataDB)
						blDataDB = blDataDB?.map(e => e?.toObject())

					let containerNumber = blDataDB.flatMap(item => item.containers.map(c => c.containerNumber));

					const igmmailModel = mongoose.models[`igmmailModel`] || mongoose.model(`igmmailModel`, newSchemaWithObject["igmmail"], `igmmails`);
					const partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, newSchemaWithObject["partymaster"], `partymasters`);

					const savedMail = await igmmailModel({
						extractedData: {
							subLineNo: subLineNo,
							lineNo: lineNo,
							igmNo: igmNo,
							igmDate: igmDate,
							isAutoFilled: true
						},
						parsedTableData: parsedTables,
						isDataFilledWithThisEmail: !(igmcfsData?.isAutoFilled || (igmcfsData.igmNo === igmNo && igmcfsData.igmDate === igmDate && igmcfsData.lineNo === `${lineNo}/${subLineNo}`)),
						igmcfsId: igmcfsData.igmcfsId,
						orgId: igmcfsData.orgId,
						igmmailId: uuid.v4(),
						mailData: parsed,
						createdOn: new Date().toISOString(),
						updatedOn: new Date().toISOString(),
					}).save();

					if (igmcfsData?.isAutoFilled || (igmcfsData.igmNo === igmNo && igmcfsData.igmDate === igmDate && igmcfsData.lineNo === `${lineNo}/${subLineNo}`)) {
						// already filled
					} else {
						await igmcfsModel.findOneAndUpdate({
							igmcfsId: igmcfsData.igmcfsId
						}, {
							$set: {
								lineNo: `${lineNo}/${subLineNo}`,
								igmNo: igmNo,
								igmDate: igmDate,
								isAutoFilled: true,
								emailReply: {
									emailReplyOn: new Date().toISOString(),
									emailId: savedMail?.igmmailId
								}
							}
						})

						if (igmcfsData?.batchId && igmNo && lineNo && subLineNo)
							await batchModel.findOneAndUpdate({
								batchId: igmcfsData?.batchId
							}, {
								$set: {
									lineNo: `${lineNo}/${subLineNo}`,
									igmNo: igmNo
								}
							})

						let agentMails = [];

						if (batchData?.enquiryDetails?.basicDetails?.chaId) {
							try {
								let partymasterData = await partymasterModel.findOne({
									partymasterId: batchData?.enquiryDetails?.basicDetails?.chaId
								})
								if (partymasterData) {
									partymasterData = partymasterData?.toObject();

									agentMails = partymasterData?.primaryMailId?.split(',')?.map(email => email?.trim()) || [];
								}
							} catch (error) {
								console.error("Error in getting cha email in IGM EMAIL", error)
							}
						}

						createBatchNotification(igmcfsData?.batchId, igmcfsData?.batchNo,
							`IGM Detail with IGM No. ${igmNo} fetched successfully!`
							, igmcfsData?.orgId)

						const tableHTMLData = `
							<table>
								<thead>
									<tr>
										<th>Job No</th>
										<th>BL Number</th>
										<th>IGM No</th>
										<th>IGM Date</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>${igmcfsData?.batchNo}</td>
										<td>${blNumbers}</td>
										<td>${igmNo}</td>
										<td>${new Date(igmDate).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' }).replaceAll("/", "-")}</td>
									</tr>
								</tbody>
							</table>`

						const containerWiseTable = `
							<table>
								<thead>
									<tr>
										<th>S No.</th>
										<th>HBL Number</th>
										<th>Line No</th>  
										<th>Sub-Line No</th>
									</tr>
								</thead>
								<tbody>
									${containerWiseData.map((cd, index) => {
							return `
											<tr>
												<td>${index + 1}</td>
												<td>${cd.hblNumber}</td>
												<td>${cd.lineNo}</td>
												<td>${cd.subLineNo}</td>
											</tr>
										`
						}).join(" ")}
								</tbody>
							</table>`
						const userModel = mongoose.models[`userModel`] || mongoose.model(`userModel`, newSchemaWithObject["user"], `users`);
						const agentModel = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, newSchemaWithObject["agent"], `agents`);


						let orgData = await agentModel.findOne(
							{ agentId: igmcfsData.orgId },
							{ uploadSign: 1, agentId: 1, agentName: 1, "emailConfig.emailId": 1 }
						);
						if (orgData) {
							orgData = orgData?.toObject()

							let users = await userModel.find({ orgId: igmcfsData.orgId, userStatus: true }, { userId: 1, userEmail: 1, name: 1 });
							if (users)
								users = users?.map(e => e?.toObject())

							const footer = orgData?.uploadSign
								? `<footer><img style="height:125px;" src="https://shipeasy.blob.core.windows.net/ship-docs/${orgData.uploadSign}" alt="Email Signature" /></footer>`
								: '';

							const mailBody = `
								<!DOCTYPE html>
								<html lang="en">
									<head>
									<style>
										table, th, td {
											padding: 7px;
											border: 1px solid;
											text-align: center;
										}
										table {
											width: 100%;
											border-collapse: collapse;
										}
										
									</style>
									</head>
									<body>
									<p>Dear Sir/Mam,</p>
									<p>Hope you're doing well.</p>
									

									<p>Please find below IGM information of subject shipment, Kindly make sure to double check the information from ICEGATE.<p>

									<h3>IGM Details</h3>
									${tableHTMLData}

									<h3>HBL Details</h3>
									${containerWiseTable}
									
									</body>
									${footer}
								</html>
							`;

							const transporterAgent = await getTransporter({ orgId: igmcfsData.orgId });

							const { toMails, ccMails } = await getTOCCEmailsForScheduler({ traceId: "From scheduler : checkAndFetchIGMDeatils" }, {
								isIGMFetched: true,
								orgId: igmcfsData.orgId
							}, "igm")

							if (users?.map(u => u?.userEmail).filter(Boolean)?.length > 0) {
								const mailOptions = {
									from: getSenderName(orgData),
									// to: users?.map(u => u?.userEmail).filter(Boolean),
									// cc: [],
									to: toMails.map((e) => e.email),
									cc: [...ccMails.map((e) => e.email), ...agentMails],
									subject: `IGM DETAILS OF ${igmcfsData?.batchNo} / ${blNumbers.join(", ")} / ${hblNumbers.join(", ")} / ${containerNumber.join(", ")} / ${batchData?.enquiryDetails?.basicDetails?.consigneeName} / ${batchData?.enquiryDetails?.routeDetails?.locationName}`,
									text: '',
									html: mailBody
								};

								transporterAgent?.sendMail(mailOptions, (error, info) => {
									if (error) {
										console.log(error);
										return;
									}
									console.log(`Message sent to ${agentId}: ${info.messageId}`);
								});
							} else {
								console.log(`Emails not found for agent : ${agentId}`);
							}
						}
					}
				}
			}
		}
	} catch (error) {
		console.error("Error in function checkAndFetchIGMDeatils : ", error);
	}
}

async function checkAndFetchCFSDeatils(htmlContent, parsed) {
	try {
		const tableDefinitions = [
			{
				name: 'CFS Detail',
				headers: ['Sr. No.', 'MBL No.', 'DPD/CFS Name', 'Status']
			},
			{
				name: 'CFS Detail',
				headers: ['Sr. No.', 'MBL No.', 'SEZ Name', 'CFS Name', 'Status']
			},
			{
				name: 'CFS Detail',
				headers: ['Sr. No.', 'MBL No.', 'Status']
			}
		];

		const $ = cheerio.load(htmlContent);
		const parsedTables = [];

		$('table').each((i, table) => {
			tableDefinitions.forEach(def => {
				if (matchTableByHeaders($, table, def.headers)) {
					const data = extractTableData($, table);
					parsedTables.push({ table: def.name, data });
				}
			});
		});

		const cfsDetailTable = parsedTables.find(e => e.table === "CFS Detail")

		if (cfsDetailTable) {
			let mblNo = [...new Set(cfsDetailTable.data.rows.map(e => e["MBL No."]))].join("");
			let cfsStatus = [...new Set(cfsDetailTable.data.rows.map(e => e["Status"]))].join("");

			if (mblNo && cfsStatus) {
				let actualStatus;
				if (cfsStatus === "Confirmed" || cfsStatus === "Verified") {
					actualStatus = "Approve"
				} else if (cfsStatus === "Rejected")
					actualStatus = "Rejected"

				if (actualStatus) {
					const igmmailModel = mongoose.models[`igmmailModel`] || mongoose.model(`igmmailModel`, newSchemaWithObject["igmmail"], `igmmails`);
					const igmcfsModel = mongoose.models[`igmcfsModel`] || mongoose.model(`igmcfsModel`, newSchemaWithObject["igmcfs"], `igmcfss`);
					const agentModel = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, newSchemaWithObject["agent"], `agents`);
					const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, newSchemaWithObject["batch"], `batchs`);
					const blModel = mongoose.models[`blModel`] || mongoose.model(`blModel`, newSchemaWithObject["bl"], `bls`);

					let cfsData = await igmcfsModel.findOne(
						{
							"blData.blNo": mblNo
						}
					)
					if (cfsData) {
						cfsData = cfsData?.toObject()

						let batchData = await batchModel.findOne({ batchId: cfsData.batchId })
						if (batchData)
							batchData = batchData?.toObject()

						let hblData = await blModel.find({ $or: [{ "batchId": batchData?.batchId }, { "consolidatedJobs.batchId": batchData?.batchId }] })
						if (hblData)
							hblData = hblData?.map(e => e.toObject())?.filter(e => e.blTypeName === "HBL")

						const savedMail = await igmmailModel({
							extractedData: {
								mblNo: mblNo,
								status: cfsStatus,
								systemStatus: actualStatus,
								isAutoFilled: true
							},
							parsedTableData: parsedTables,
							isDataFilledWithThisEmail: !(cfsData?.isAutoFilled),
							igmcfsId: cfsData.igmcfsId,
							orgId: cfsData.orgId,
							igmmailId: uuid.v4(),
							mailData: parsed,
							createdOn: new Date().toISOString(),
							updatedOn: new Date().toISOString(),
						}).save();

						if (cfsData?.isAutoFilled && actualStatus === cfsData?.status) {

						} else {
							await igmcfsModel.findOneAndUpdate({
								igmcfsId: cfsData.igmcfsId
							}, {
								$set: {
									status: actualStatus,
									isAutoFilled: true,
									emailReply: {
										emailReplyOn: new Date().toISOString(),
										emailId: savedMail?.igmmailId
									}
								}
							})

							createBatchNotification(cfsData?.batchId, cfsData?.batchNo,
								`CFS Detail fetched successfully!`
								, cfsData?.orgId)

							const tableHTMLData = `
								<table>
									<thead>
										<tr>
											<th>Job No</th>
											<th>BL Number</th>
											<th>House BL Number</th>
											<th>CFS Name</th>
											<th>Updated Status</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>${cfsData?.batchNo}</td>
											<td>${mblNo}</td>
											<td>${hblData?.map(e => e?.blNumber)?.join(", ")}</td>
											<td>${cfsData?.cfsName}</td>
											<td>${actualStatus}</td>
										</tr>
									</tbody>
								</table>`

							let orgData = await agentModel.findOne(
								{ agentId: cfsData.orgId },
								{ uploadSign: 1, agentId: 1, agentName: 1, "emailConfig.emailId": 1 }
							);
							if (orgData) {
								orgData = orgData?.toObject()

								const footer = orgData?.uploadSign
									? `<footer><img style="height:125px;" src="https://shipeasy.blob.core.windows.net/ship-docs/${orgData.uploadSign}" alt="Email Signature" /></footer>`
									: '';

								const mailBody = `
									<!DOCTYPE html>
									<html lang="en">
										<head>
										<style>
											table, th, td {
												padding: 7px;
												border: 1px solid;
												text-align: center;
											}
											table {
												width: 100%;
												border-collapse: collapse;
											}
											
										</style>
										</head>
										<body>
										<p>Dear Sir/Mam,</p>
										<p>Hope you're doing well.</p>
										

										<p>Please find below CFS information of subject shipment, Kindly make sure to double check the information from ODEX.<p>

										<h3>CFS Details</h3>
										${tableHTMLData}

										</body>
										${footer}
									</html>
								`;

								const transporterAgent = await getTransporter({ orgId: cfsData.orgId });

								const { toMails, ccMails } = await getTOCCEmailsForScheduler({ traceId: "From scheduler : checkAndFetchCFSDeatils" }, {
									isCFSFetched: true,
									orgId: cfsData.orgId
								}, "cfs")

								if (toMails || ccMails) {
									const mailOptions = {
										from: getSenderName(orgData),
										// to: users?.map(u => u?.userEmail).filter(Boolean),
										to: toMails.map((e) => e.email),
										cc: ccMails.map((e) => e.email),
										subject: `CFS DETAILS OF ${cfsData?.batchNo} / ${mblNo} / ${hblData?.map(e => e?.blNumber)?.join(", ")} / ${batchData?.enquiryDetails?.basicDetails?.consigneeName} / ${batchData?.enquiryDetails?.routeDetails?.locationName}`,
										text: '',
										html: mailBody
									};

									transporterAgent?.sendMail(mailOptions, (error, info) => {
										if (error) {
											console.log(error);
											return;
										}
										console.log(`Message sent to ${agentId}: ${info.messageId}`);
									});
								} else {
									console.log(`Emails not found for agent : ${agentId}`);
								}
							}
						}
					}
				}
			}
		}
	} catch (error) {
		console.error("Error in function checkAndFetchCFSDeatils : ", error);
	}
}

async function checkAndFetchBLTELEXDeatils(htmlContent, parsed) {
	try {
		const tableDefinitions = [
			{
				name: 'BL Details Table',
				headers: ['eBL Number', 'Version', 'Document Type', 'Date of Issue', 'First Port of Loading', 'Last Port of Discharge', 'BL Vessel Voyage']
			}
		];

		const $ = cheerio.load(htmlContent);
		const parsedTables = [];

		$('table').each((i, table) => {
			tableDefinitions.forEach(def => {
				if (matchTableByHeaders($, table, def.headers)) {
					const data = extractTableData($, table);
					parsedTables.push({ table: def.name, data });
				}
			});
		});

		const blDetailTable = parsedTables.find(e => e.table === "BL Details Table")

		if (blDetailTable) {
			let blNumbers = [...new Set(blDetailTable.data.rows.map(e => e["eBL Number"]).filter(Boolean))]

			if (blNumbers?.length > 0) {
				const blModel = mongoose.models[`blModel`] || mongoose.model(`blModel`, newSchemaWithObject["bl"], `bls`);
				const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, newSchemaWithObject["batch"], `batchs`);

				let blData = await blModel.find({
					blNumber: {
						$in: blNumbers
					}
				})

				if (blData) {
					blData = blData?.map(e => e?.toObject())


					for (let i = 0; i < blData?.length; i++) {
						const bl = blData[i];

						if (blNumbers.includes(bl.blNumber)) {
							if (bl[`${bl.blTypeName}Status`] === "PENDING") {
								const condition = {};
								condition[`${bl.blTypeName}Status`] = "TELEX/SWB"

								const updatedBLData = await blModel.findOneAndUpdate(
									{
										blId: bl.blId
									},
									{
										$set: condition
									},
									{
										new: true
									}
								)

								let batchData = await batchModel.findOne({
									batchId: bl?.batchId
								})
								if (batchData)
									batchData = batchData?.toObject()

								createBatchNotification(bl?.batchId, bl?.batchNo,
									`BL with BL No. ${bl.blNumber} marked as TELEX successfully!`
									, bl?.orgId)

								const userModel = mongoose.models[`userModel`] || mongoose.model(`userModel`, newSchemaWithObject["user"], `users`);
								const agentModel = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, newSchemaWithObject["agent"], `agents`);

								let orgData = await agentModel.findOne(
									{ agentId: bl.orgId },
									{ uploadSign: 1, agentId: 1, agentName: 1, "emailConfig.emailId": 1 }
								);

								if (orgData) {
									orgData = orgData?.toObject()

									let users = await userModel.find({ orgId: bl.orgId, userStatus: true }, { userId: 1, userEmail: 1, name: 1 });
									if (users)
										users = users?.map(e => e?.toObject())

									const footer = orgData?.uploadSign
										? `<footer><img style="height:125px;" src="https://shipeasy.blob.core.windows.net/ship-docs/${orgData.uploadSign}" alt="Email Signature" /></footer>`
										: '';

									const tableHTMLData = `
										<table>
											<thead>
												<tr>
													<th>Job No</th>
													<th>BL Number</th>
													<th>Updated BL Status</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td>${bl?.batchNo}</td>
													<td>${bl?.blNumber}</td>
													<td>${updatedBLData[`${updatedBLData.blTypeName}Status`]}</td>
												</tr>
											</tbody>
										</table>`

									const mailBody = `
										<!DOCTYPE html>
										<html lang="en">
											<head>
											<style>
												table, th, td {
													padding: 7px;
													border: 1px solid;
													text-align: center;
												}
												table {
													width: 100%;
													border-collapse: collapse;
												}
												
											</style>
											</head>
											<body>
											<p>Dear Sir/Mam,</p>
											<p>Hope you're doing well.</p>
											

											<p>Please find below BL information of subject shipment which is being read from mail, Kindly make sure to double check the information<p>

											<h3>BL Details</h3>
											${tableHTMLData}
											
											</body>
											${footer}
										</html>
									`;

									const transporterAgent = await getTransporter({ orgId: bl.orgId });

									const { toMails, ccMails } = await getTOCCEmailsForScheduler({ traceId: "From scheduler : checkAndFetchIGMDeatils" }, {
										isBLTELEXReadFromMail: true,
										orgId: bl.orgId
									}, "bl")

									if (users?.map(u => u?.userEmail).filter(Boolean)?.length > 0) {
										const mailOptions = {
											from: getSenderName(orgData),
											// to: users?.map(u => u?.userEmail).filter(Boolean),
											// cc: [],
											to: toMails.map((e) => e.email),
											cc: [...ccMails.map((e) => e.email)],
											subject: `BL DETAIL AUTO SURRENDERED OF ${bl?.batchNo} / ${blNumbers.join(", ")} / ${batchData?.enquiryDetails?.basicDetails?.consigneeName} / ${batchData?.enquiryDetails?.routeDetails?.locationName}`,
											text: '',
											html: mailBody
										};

										transporterAgent?.sendMail(mailOptions, (error, info) => {
											if (error) {
												console.log(error);
												return;
											}
											console.log(`Message sent to ${agentId}: ${info.messageId}`);
										});
									} else {
										console.log(`Emails not found for agent : ${agentId}`);
									}
								}
							} else {
								// already done
							}
						}
					}
				}
			}
		}


	} catch (error) {
		console.error("Error in function checkAndFetchIGMDeatils : ", error);
	}
}

async function startMailListener(account) {
	if (!account?.secondaryEmailConfig?.emailId || !account?.secondaryEmailConfig?.mailServerPassword) {
		console.log("⚠️ Email credentials missing to read emails.");
		return;
	}

	const client = new ImapFlow({
		host: account?.secondaryEmailConfig?.mailServer,
		port: 993,
		secure: true,
		auth: {
			user: account?.secondaryEmailConfig?.emailId,
			pass: account?.secondaryEmailConfig?.mailServerPassword
		},
		logger: false
	});

	client.on('error', (err) => {
		console.error(`❌ IMAP Error for ${account.agentName}:`, err);
	});

	client.on('close', async () => {
		console.warn(`⚠️ IMAP Connection closed for ${account.agentName}, retrying in 5s...`);
		setTimeout(() => startMailListener(account), 5000); // Auto-reconnect
	});

	try {
		await client.connect();
		console.log(`📬 Connected to mailbox: ${account.agentName}`);

		// Select INBOX (no lock needed for long-lived listening)
		await client.mailboxOpen('INBOX');
		console.log(`📦 Mailbox opened for: ${account.agentName}`);

		// Process unseen emails on startup
		await processUnseen(client, account);

		// Listen for new messages
		client.on('exists', async () => {
			console.log(`📥 New email for ${account.agentName}`);
			await processUnseen(client, account);
		});

		// Keep connection alive
		while (!client.closed) {
			try {
				await client.idle({ timeout: 1000 * 60 * 10 }); // 10 min idle, re-loop
			} catch (err) {
				console.error(`⚠️ Idle error, reconnecting:`, err);
				break;
			}
		}
	} catch (err) {
		console.error(`💥 Fatal error for ${account?.agentId}:`, err);
	} finally {
		if (!client.closed) await client.logout();
	}
}

async function processUnseen(client, account) {
	let messages = await client.search({ seen: false });

	for (let seq of messages) {
		try {
			let { content } = await client.download(seq);
			let parsed = await simpleParser(content);

			if (parsed?.html) {
				if (account?.isJobAutomationEnabled) {
					await scanEmailToCreateJob(parsed);
				}
				await checkAndFetchBLTELEXDeatils(parsed.html, parsed);
				await checkAndFetchIGMDeatils(parsed.html, parsed);
				await checkAndFetchCFSDeatils(parsed.html, parsed);
			} else {
				console.error("⚠️ HTML content not found.");
			}

			await client.messageFlagsAdd(seq, ['\\Seen']);
		} catch (err) {
			console.error(`❌ Error processing email (seq: ${seq}):`, err);
		}
	}
}

readIGMMailReply()

async function getFollowMailForAgents() {
	try {
		const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, newSchemaWithObject["batch"], `batchs`);
		const userModel = mongoose.models[`userModel`] || mongoose.model(`userModel`, newSchemaWithObject["user"], `users`);
		const agentModel = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, newSchemaWithObject["agent"], `agents`);
		const partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, newSchemaWithObject["partymaster"], `partymasters`);
		const blModel = mongoose.models[`blModel`] || mongoose.model(`blModel`, newSchemaWithObject["bl"], `bls`);
		const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, newSchemaWithObject["event"], `events`);

		// Fetch batch data
		let batchData = await batchModel.find({
			statusOfBatch: {
				$in: ['SO Pending', 'Stuffing Pending', 'Sailing Pending']
			}
		}, {
			"enquiryDetails.basicDetails.shipperName": 1,
			"enquiryDetails.basicDetails.shipperId": 1,
			"enquiryDetails.basicDetails.consigneeName": 1,
			"enquiryDetails.basicDetails.consigneeId": 1,
			statusOfBatch: 1,
			orgId: 1,
			"enquiryDetails.basicDetails.agentId": 1,
			"enquiryDetails.basicDetails.agentName": 1,
			batchId: 1, batchNo: 1,
			batchDate: 1,
			"routeDetails.finalVesselName": 1,
			"routeDetails.etd": 1,
			"enquiryDetails.basicDetails.bookingRef": 1
		});

		if (batchData) batchData = batchData.map(e => e.toObject());

		const batchIds = batchData.map(e => e.batchId)
		const orConditions = batchIds.flatMap(id => [
			{ batchId: id },
			{ 'consolidatedJobs.batchId': id }
		]);
		let blDataMaster = await blModel.find({ $or: orConditions });
		if (blDataMaster)
			blDataMaster = blDataMaster?.map(e => e?.toObject())


		let eventDataMaster = await eventModel.find({
			$or: batchData.map((e) => {
				return {
					entityId: e.batchId,
					eventName: e?.statusOfBatch?.replace(" Pending", "")
				}
			}
			)
		})
		if (eventDataMaster)
			eventDataMaster = eventDataMaster?.map(e => e?.toObject())


		batchData = batchData.map((batch) => {
			const blData = blDataMaster.filter(e => e.batchId === batch.batchId || e.consolidatedJobs.find(ef => ef.batchId === batch.batchId))

			return {
				...batch,
				blNumbers: blData.map(b => b.blNumber).join(", "),
				estimatedDate: eventDataMaster?.find(pe => pe.entityId === batch.batchId)?.eventData?.bookingDateEst || ''
			}
		})

		let groupedByOrgBatch = [];

		for (const item of batchData) {
			let group = groupedByOrgBatch.find(g => g.orgId === item.orgId);

			if (!group) {
				// Fetch users and orgData for this orgId
				let users = await userModel.find({ orgId: item.orgId, userStatus: true }, { userId: 1, userEmail: 1, name: 1 });
				let orgData = await agentModel.findOne(
					{ agentId: item.orgId },
					{ uploadSign: 1, agentId: 1, agentName: 1, "emailConfig.emailId": 1 }
				);

				group = {
					orgId: item.orgId,
					agent: {
					}, // Will hold { agentId: { batchs: [...] } }
					users: users?.map(u => u.toObject()) || [],
					orgData: orgData?.toObject() || {}
				};

				groupedByOrgBatch.push(group);
			}

			const agentId = item.enquiryDetails?.basicDetails?.agentId;
			const { _id, orgId, ...batchWithoutIdOrg } = item;

			if (!agentId) continue; // Skip if agentId is missing

			// Initialize agent group if doesn't exist
			if (!group.agent[agentId]) {
				let agentData = await partymasterModel.findOne(
					{ partymasterId: item?.enquiryDetails?.basicDetails?.agentId },
					{ primaryMailId: 1 }
				);

				if (agentData)
					agentData = agentData?.toObject()

				group.agent[agentId] = { agentEmails: agentData?.primaryMailId, batchs: [], agentName: item.enquiryDetails?.basicDetails?.agentName };
			}

			// Push the batch
			group.agent[agentId].batchs.push(batchWithoutIdOrg);
		}

		for (const orgGroup of groupedByOrgBatch) {
			const { agent: agentGroups, users, orgData, orgId } = orgGroup;

			for (const [agentId, agentGroup] of Object.entries(agentGroups)) {
				const statusTables = ['SO Pending', 'Stuffing Pending', 'Sailing Pending'].map(status => {
					let batches = agentGroup.batchs.filter(b => b.statusOfBatch === status);

					if (status === "Sailing Pending") {
						batches = batches
							.filter(e => {
								const estDateIST = new Date(e?.estimatedDate).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });
								const todayIST = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });

								return estDateIST === todayIST;
							})
					} else if (status === "SO Pending" || status === "Stuffing Pending") {
						batches = batches
							.filter(e => {
								if (e?.estimatedDate) {
									const estDateUTC = new Date(e?.estimatedDate);

									// Convert estimatedDate to IST
									const estDateIST = new Date(estDateUTC.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

									// Get current time in IST
									const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

									// Strip time part for both dates
									const todayIST = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate());
									const estOnlyDateIST = new Date(estDateIST.getFullYear(), estDateIST.getMonth(), estDateIST.getDate());

									// Compare
									return estOnlyDateIST <= todayIST;
								} else {
									return true;
								}
							});
					}

					if (batches.length === 0) return '';

					const rows = batches.map(b => `
					<tr>
						<td>${new Date(b?.batchDate).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' }).replaceAll("/", "-")}</td>
						<td>${b.batchNo}</td>
						${['Stuffing Pending', 'Sailing Pending'].includes(status) ? `<td>${b?.enquiryDetails?.basicDetails?.bookingRef}</td>` : ''}
						<td>${b?.enquiryDetails?.basicDetails?.shipperName || '-'}</td>
						<td>${b?.enquiryDetails?.basicDetails?.consigneeName || '-'}</td>
						<td>${b.routeDetails.finalVesselName}</td>
						<td>${new Date(b.routeDetails.etd).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' }).replaceAll("/", "-")}</td>
						${['Sailing Pending'].includes(status) ? `<td>${b?.blNumbers}</td>` : ''}
					</tr>
				`).join('');

					return `
					<h3>${status}</h3>
					<table>
					<thead>
						<tr>
							<th>Job Date</th>
							<th>Job No</th>
							${['Stuffing Pending', 'Sailing Pending'].includes(status) ? `<th>Ref Number</th>` : ''}
							<th>Shipper</th>
							<th>Consignee</th>  
							<th>Vessel Name</th>
							<th>ETD</th>  
							${['Sailing Pending'].includes(status) ? '<th>BL Numbers</th>' : ''}
						</tr>
					</thead>
					<tbody>${rows}</tbody>
					</table>
					<br/>
				`;
				}).filter(Boolean).join('');

				if (!statusTables) continue; // No batches for this agent

				const footer = orgData?.uploadSign
					? `<footer><img style="height:125px;" src="https://shipeasy.blob.core.windows.net/ship-docs/${orgData.uploadSign}" alt="Email Signature" /></footer>`
					: '';

				const mailBody = `
					<!DOCTYPE html>
					<html lang="en">
						<head>
						<style>
							table, th, td {
							padding: 7px;
							border: 1px solid;
							}
							table {
							width: 100%;
							border-collapse: collapse;
							}
						</style>
						</head>
						<body>
						<p>Dear ${agentGroup?.agentName || ''} Team,</p>
						<p>Hope you're doing well.</p>
						<p>This is a gentle reminder to please share the latest updates on the below-mentioned jobs:</p>
						${statusTables}
						</body>
						${footer}
					</html>
				`;

				const transporterAgent = await getTransporter({ orgId });

				const { toMails, ccMails } = await getTOCCEmailsForScheduler({ traceId: "From scheduler : getFollowMailForAgents" }, {
					isDailyFollowupToAgent: true,
					orgId: orgId
				}, "batch")

				if (agentGroup?.agentEmails.split(", ").filter(Boolean)?.length > 0) {
					const mailOptions = {
						from: getSenderName(orgData),
						to: [...toMails.map((e) => e.email), agentGroup?.agentEmails.split(", ").filter(Boolean)],
						// to: agentGroup?.agentEmails.split(", ").filter(Boolean),
						// cc: users?.map(u => u?.userEmail).filter(Boolean),
						cc: ccMails.map((e) => e.email),
						subject: `STATUS UPDATE - ${orgData.agentName} – REPLY`,
						text: '',
						html: mailBody
					};

					transporterAgent?.sendMail(mailOptions, (error, info) => {
						if (error) {
							console.log(error);
							return;
						}
						console.log(`Message sent to ${agentId}: ${info.messageId}`);
					});
				} else {
					console.log(`Emails not found for agent : ${agentId}`);
				}
			}
		}

	} catch (error) {
		console.log(error)
	}
}

cron.schedule('0 7 * * *', () => {
	console.log('Running scheduler at 7 AM IST getFollowMailForAgents()');

	try {
		getFollowMailForAgents()
	} catch (error) {
		console.error(error);
	}
}, {
	timezone: 'Asia/Kolkata'
});

async function checkPODArrivalBefore48Hours() {
	const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, newSchemaWithObject["batch"], `batchs`);

	const now = new Date();
	const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

	console.log(`[48h Alert] Checking batches. Current time: ${now.toISOString()}, Target time (now + 48h): ${fortyEightHoursFromNow.toISOString()}`);

	// Query docs where email not yet sent AND ETA is within the next 48 hours
	let docs = await batchModel.find({
		"routeDetails.emailBeforeArrivalSent": { $ne: true },
		"routeDetails.eta": { $nin: ["", " ", null, undefined] },
		$expr: {
			$and: [
				// ETA must be in the future
				{
					$gte: [
						{ $dateFromString: { dateString: "$routeDetails.eta" } },
						now
					]
				},
				// ETA must be within next 48 hours
				{
					$lte: [
						{ $dateFromString: { dateString: "$routeDetails.eta" } },
						fortyEightHoursFromNow
					]
				}
			]
		}
	});

	console.log(`[48h Alert] Found ${docs?.length || 0} batches matching criteria`);

	if (docs && docs.length > 0) {
		docs = docs.map(e => e?.toObject());

		for (let i = 0; i < docs.length; i++) {
			const batch = docs[i];

			console.log(`[48h Alert] Processing batch ${batch?.batchId}, ETA: ${batch?.routeDetails?.eta}`);

			batch["emailSendingStatusFor48Alert"] = "send";

			if (batch && batch?.batchId) {
				try {
					await batchModel.findOneAndUpdate(
						{ batchId: batch?.batchId },
						{ $set: { "routeDetails.emailBeforeArrivalSent": true } }
					);

					await triggerPointExecute(
						{ traceId: "alert_48_hour_before_pod_arrival" },
						batch,
						"batch"
					);

					console.log(`[48h Alert] Email sent successfully for batch ${batch?.batchId}`);
				} catch (error) {
					console.error(`[48h Alert] Error sending email for batch ${batch?.batchId}:`, error);
				}
			}
		}
	}
}

// Run every 6 hours to catch all batches within the 48-hour window
cron.schedule("0 */6 * * *", async () => {
	console.log("[48h Alert Scheduler] Running...");
	try {
		await checkPODArrivalBefore48Hours();
	} catch (error) {
		console.error("[48h Alert Scheduler] Error:", error);
	}
});

async function chechETAdatesendStatusEveryDay() {
	console.log("=".repeat(80));
	console.log("🔍 Checking ETA dates which are about to come in next 5 days");
	console.log("=".repeat(80));

	const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, newSchemaWithObject["batch"], `batchs`);
	const partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, newSchemaWithObject["partymaster"], `partymasters`);
	const blModel = mongoose.models[`blModel`] || mongoose.model(`blModel`, newSchemaWithObject["bl"], `bls`);
	const containerModel = mongoose.models[`containerModel`] || mongoose.model(`containerModel`, newSchemaWithObject["container"], `containers`);
	const agentModel = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, newSchemaWithObject["agent"], `agents`);

	const now = new Date();
	const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

	console.log(`📅 Date range: ${now.toISOString()} to ${fiveDaysFromNow.toISOString()}`);

	// Get today's date at midnight (IST timezone)
	const todayIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
	const todayMidnight = new Date(todayIST.getFullYear(), todayIST.getMonth(), todayIST.getDate());

	console.log(`🕐 Today midnight (IST): ${todayMidnight.toISOString()}`);

	try {
		// Query docs where MBL is pending AND ETA is within next 5 days
		let docs = await batchModel.find({
			// Direct matches
			"MBLStatus": "PENDING",
			"isExport": false,

			// Existence and Format checks
			"routeDetails.eta": { $nin: ["", " ", null, undefined] },

			// Date Logic - ETA is within next 5 days
			$expr: {
				$and: [
					{ $gte: [{ $dateFromString: { dateString: "$routeDetails.eta" } }, now] },
					{ $lte: [{ $dateFromString: { dateString: "$routeDetails.eta" } }, fiveDaysFromNow] }
				]
			}
		});

		console.log(`📦 Found ${docs?.length || 0} batches with ETA in next 5 days`);

		if (!docs || docs.length === 0) {
			console.log("⚠️ No batches found matching criteria. Exiting.");
			return;
		}

		docs = docs?.map(e => e?.toObject());

		// Filter out batches that already received email today
		const batchesToProcess = [];
		for (const batch of docs) {
			if (batch.lastETAEmailSentDate) {
				const lastSentDateIST = new Date(new Date(batch.lastETAEmailSentDate).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
				const lastSentMidnight = new Date(lastSentDateIST.getFullYear(), lastSentDateIST.getMonth(), lastSentDateIST.getDate());

				if (lastSentMidnight.getTime() === todayMidnight.getTime()) {
					console.log(`  ⏭️  Email already sent today for batch ${batch.batchNo}, skipping...`);
					continue;
				}
			}
			batchesToProcess.push(batch);
		}

		console.log(`📦 ${batchesToProcess.length} batches to process after filtering already-sent-today`);

		if (batchesToProcess.length === 0) {
			console.log("⚠️ All batches already received emails today. Exiting.");
			return;
		}

		// ============ STEP 1: Fetch all BL and Container data upfront ============
		const batchIds = batchesToProcess.map(b => b.batchId);

		// Fetch BL data for all batches
		const orConditions = batchIds.flatMap(id => [
			{ batchId: id },
			{ 'consolidatedJobs.batchId': id }
		]);
		let blDataMaster = await blModel.find({ $or: orConditions });
		if (blDataMaster) blDataMaster = blDataMaster.map(e => e.toObject());
		console.log(`📄 Fetched ${blDataMaster?.length || 0} BL records`);

		// Fetch Container data for all batches
		let containerDataMaster = await containerModel.find({ batchId: { $in: batchIds } });
		if (containerDataMaster) containerDataMaster = containerDataMaster.map(e => e.toObject());
		console.log(`📦 Fetched ${containerDataMaster?.length || 0} Container records`);

		// ============ STEP 2: Group batches by Agent ============
		const agentGroupedBatches = {};

		for (const batch of batchesToProcess) {
			const agentId = batch?.enquiryDetails?.basicDetails?.agentId;
			const orgId = batch?.orgId;

			if (!agentId) {
				console.log(`  ❌ No agentId for batch ${batch.batchNo}, skipping...`);
				continue;
			}

			// Calculate daysUntilETA for this batch
			let daysUntilETA = 0;
			const etaDateStr = batch?.routeDetails?.eta;
			if (etaDateStr) {
				const etaDate = new Date(etaDateStr);
				const today = new Date();
				etaDate.setHours(0, 0, 0, 0);
				today.setHours(0, 0, 0, 0);
				const diffTime = etaDate.getTime() - today.getTime();
				daysUntilETA = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
				if (daysUntilETA < 0) daysUntilETA = 0;
			}

			// Get BL data for this batch
			const batchBLs = blDataMaster?.filter(bl =>
				bl.batchId === batch.batchId ||
				bl.consolidatedJobs?.find(cj => cj.batchId === batch.batchId)
			) || [];

			// Filter for MBL with Pending status
			const pendingMBLs = batchBLs.filter(bl =>
				bl.blType === 'MBL' &&
				(bl.MBLStatus || '').toLowerCase().includes('pending')
			);

			// Get Container data for this batch
			const batchContainers = containerDataMaster?.filter(c => c.batchId === batch.batchId) || [];

			// Create unique key for agent+org combination
			const groupKey = `${orgId}_${agentId}`;

			if (!agentGroupedBatches[groupKey]) {
				// Fetch agent data once per group
				let agentData = await partymasterModel.findOne(
					{ partymasterId: agentId },
					{ primaryMailId: 1, name: 1 }
				);
				if (agentData) agentData = agentData.toObject();

				// Fetch org data for email configuration
				let orgData = await agentModel.findOne(
					{ agentId: orgId },
					{ uploadSign: 1, agentId: 1, agentName: 1, "emailConfig.emailId": 1 }
				);
				if (orgData) orgData = orgData.toObject();

				agentGroupedBatches[groupKey] = {
					agentId,
					agentName: agentData?.name || batch?.enquiryDetails?.basicDetails?.agentName || '',
					agentEmail: agentData?.primaryMailId || '',
					orgId,
					orgData,
					batches: []
				};
			}

			// Prepare BL-wise data - each pending MBL as a separate row
			// This allows the email to show individual BL rows per job
			for (const bl of pendingMBLs) {
				// Use BL-specific containers (from bl.containers array)
				const blContainers = bl.containers || [];
				const blContainerNumbers = blContainers
					.map(c => c.containerNumber || c.containerNo)
					.filter(Boolean);

				const blRowData = {
					batchId: batch.batchId,
					batchNo: batch.batchNo,
					daysUntilETA: daysUntilETA,
					blNumber: bl.blNumber || '-',
					blType: bl.blType || 'MBL',
					MBLStatus: bl.MBLStatus || 'Pending',
					shipperName: bl.shipperName || batch?.enquiryDetails?.basicDetails?.shipperName || '-',
					consigneeName: bl.consigneeName || batch?.enquiryDetails?.basicDetails?.consigneeName || '-',
					// BL-specific container data (from bl.containers)
					containers: blContainers,
					containersText: blContainerNumbers.join(', ') || '-',
					// Package data from BL's containers
					packagesText: blContainers.length > 0
						? blContainers.map(c => `${c.noOfPkg || c.quantity || 1} X ${c.containerTypeName || c.containerType || 'Container'}`).join(', ')
						: (batch?.enquiryDetails?.containersDetails?.map(c => `${c.noOfContainer} X ${c.containerType}`).join(', ') || '-'),
					containersDetails: blContainers.length > 0 ? blContainers : (batch?.enquiryDetails?.containersDetails || []),
					eta: batch?.routeDetails?.eta || '',
					loadPortName: batch?.enquiryDetails?.routeDetails?.loadPortName || '-',
					destPortName: batch?.enquiryDetails?.routeDetails?.destPortName || '-'
				};

				agentGroupedBatches[groupKey].batches.push({
					...batch,
					jobData: blRowData,
					daysUntilETA,
					bl: bl,
					containers: blContainers
				});
			}
		}

		// Remove agent groups that ended up with no batches (no pending MBLs found in BL collection)
		for (const groupKey of Object.keys(agentGroupedBatches)) {
			if (agentGroupedBatches[groupKey].batches.length === 0) {
				console.log(`  🗑️  Removing empty agent group: ${agentGroupedBatches[groupKey].agentName} (no pending MBLs found in BL records)`);
				delete agentGroupedBatches[groupKey];
			}
		}

		if (Object.keys(agentGroupedBatches).length === 0) {
			console.log("⚠️ No agent groups with pending MBL data to email. Exiting.");
			return;
		}

		console.log("\n" + "=".repeat(80));
		console.log(`📧 Processing ${Object.keys(agentGroupedBatches).length} agent groups...`);
		console.log("=".repeat(80) + "\n");

		// ============ STEP 3: Send one email per agent with all their jobs ============
		for (const [groupKey, agentGroup] of Object.entries(agentGroupedBatches)) {
			console.log(`\n👤 Processing agent group: ${agentGroup.agentName} (${agentGroup.batches.length} BL rows)`);
			console.log("-".repeat(60));

			if (!agentGroup.agentEmail) {
				console.log(`  ❌ No email found for agent ${agentGroup.agentName}, skipping...`);
				continue;
			}

			// Skip groups with no batches/BL data to avoid sending empty emails
			if (!agentGroup.batches || agentGroup.batches.length === 0) {
				console.log(`  ⏭️  No pending MBL data for agent ${agentGroup.agentName}, skipping to avoid empty email...`);
				continue;
			}

			// Prepare consolidated data for email template
			// allJobsData will be used in {{params.row.allJobsData.xxx}} format
			const allJobsData = agentGroup.batches.map(b => b.jobData);

			// Create a virtual batch object with all jobs data for triggerPointExecute
			const consolidatedBatchData = {
				...agentGroup.batches[0], // Use first batch as base
				// Set BOTH trigger field names to ensure matching with different database configurations
				alertinfivedaysbeforeETA: "send",
				"alert_in_5_days_before_ETA_for_MBL_STATUS": "send",
				agentPrimaryEmail: agentGroup.agentEmail,
				agentName: agentGroup.agentName,
				orgId: agentGroup.orgId,
				// Add allJobsData array for the email template row iteration
				allJobsData: allJobsData,
				// Keep individual batch data in case needed
				_groupedBatches: agentGroup.batches
			};

			console.log(`  📊 Consolidated ${allJobsData.length} BL rows for agent ${agentGroup.agentName}`);
			console.log(`  📧 Agent email: ${agentGroup.agentEmail}`);

			// Get unique batch IDs to avoid duplicate updates
			const uniqueBatchIds = [...new Set(agentGroup.batches.map(b => b.batchId))];

			// Update all unique batches in the group
			for (const batchId of uniqueBatchIds) {
				const batch = agentGroup.batches.find(b => b.batchId === batchId);
				await batchModel.findOneAndUpdate(
					{ batchId: batchId },
					{
						$inc: { "emailsentforETA_MBL_Status": 1 },
						$set: { "lastETAEmailSentDate": new Date().toISOString() }
					}
				);
				console.log(`  💾 Updated batch ${batch?.batchNo} with email sent date`);
			}

			console.log(`  📤 Calling triggerPointExecute for agent group...`);

			try {
				await triggerPointExecute({ traceId: "alert_in_5_days_before_ETA" }, consolidatedBatchData, "batch");
				console.log(`  ✅ triggerPointExecute completed for agent ${agentGroup.agentName}`);
			} catch (error) {
				console.error(`  ❌ Error in triggerPointExecute for agent ${agentGroup.agentName}:`, error.message);
				console.error(`  Stack:`, error.stack);
			}
		}

		console.log("\n" + "=".repeat(80));
		console.log(`✅ Completed processing ${Object.keys(agentGroupedBatches).length} agent groups`);
		console.log("=".repeat(80) + "\n");

	} catch (error) {
		console.error("❌ Error in chechETAdatesendStatusEveryDay:", error.message);
		console.error("Stack:", error.stack);
		throw error;
	}
}

// 2:50 PM IST = 09:20 AM UTC
cron.schedule("31 6 * * *", async () => {
	try {
		const now = new Date();

		console.log("UTC Time:", now.toISOString());

		console.log(
			"IST Time:",
			new Date(
				now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
			).toString()
		);

		await chechETAdatesendStatusEveryDay();
	} catch (error) {
		console.error("Error in chechETAdatesendStatusEveryDay:", error);
	}
});

