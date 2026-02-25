const { mongoose, Schema, invoiceSchema, uuid, jwt, crypto, axios, azureStorage, inAppNotificationService, querystring, nodemailer, pdfScanner, ediController, OpenAI, objecdiff, sendMessage, getTextMessageInput, fs, _, simpleParser, connect, imapConfig, transporter, getChangedFields, removeIdField, recordLogAudit, encryptObject, decryptObject, isSubset, createInAppNotification, replacePlaceholders, generateRandomPassword, triggerPointExecute, insertIntoTally, getTransporter, getChildCompany, getSenderName} = require('./helper.controller')


exports.update = async (req, res, next) => {
    const indexName = req.params.indexName;
    const { _id, __v, ...data} = req.body;

    data.updatedOn = new Date().toISOString();

    const user = res.locals.user
    const agent = res.locals.agent

    let transporterAgent = await getTransporter(user)

    if (user) {
        data.updatedBy = `${user.name} ${user.userLastname}`
        data.updatedByUID = user.userId
    } else {
        data.tenantId = '1'
    }

    const query = {};
    query[`${indexName}Id`] = req.params.id

    const options = {
        returnDocument: 'after',
        projection: { _id: 0, __v: 0 },
    };

    const Model = mongoose.models[`${indexName}Model`] || mongoose.model(`${indexName}Model`, Schema[indexName], `${indexName}s`);

    let oldDocument;
    if (indexName === "batch" || indexName === "bl"){
        oldDocument = await Model.findOne(query, {_id : 0 , __v: 0, projection: { _id: 0, __v: 0 } });
        if (oldDocument)
            oldDocument = oldDocument?.toObject();
    }
    
    // record telexDate on changes of status of bl
    if (indexName === "bl" && oldDocument?.blType === "MBL" && data?.MBLStatus != oldDocument?.MBLStatus) {
        data["telexDate"] = data?.MBLStatus === "TELEX/SWB" ? new Date().toISOString() : ""
    } else if (indexName === "bl" && oldDocument?.blType === "HBL" && data?.HBLStatus != oldDocument?.HBLStatus) {
        data["telexDate"] = data?.HBLStatus === "TELEX/SWB" ? new Date().toISOString() : ""
    }
    
    Model.findOneAndUpdate(query, data, options).then(async function (updatedDocument) {
        if (updatedDocument) {
            if (typeof updatedDocument?.toObject === "function") {
                updatedDocument = updatedDocument.toObject();
            }
            triggerPointExecute(req, {...updatedDocument, orgId : user?.orgId}, indexName)

            if (indexName === "instruction") {
                if (data.si.updateField === "SI") {
                    const MBLStatus = "SI Filed";

                    const MilestoneExportModel = mongoose.models[`MilestoneExportModel`] || mongoose.model(`MilestoneExportModel`, Schema["event"], `events`);
                    await MilestoneExportModel.updateMany(
                        { entityId: data.batchId, eventTag: "si_reminder_received" },
                        {
                            $set: {
                                eventData: {
                                    eventState: "ActualDate",
                                    bookingDate: new Date().toISOString(),
                                    Remarks: data.si.siRemark
                                },
                                isUpdated: true
                            }
                        }
                    );

                    const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema['batch'], `batchs`);
                    await batchModel.findOneAndUpdate(
                        { batchId: data.batchId },
                        { $set: { MBLStatus: MBLStatus } },
                        {
                            new: true,
                            upsert: true
                        }
                    );
                } else if (data.si.updateField === "MBL-D" || data.si.updateField === "MBL-O") {
                    const MBLStatus = data.si.updateValue;

                    const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema['batch'], `batchs`);
                    await batchModel.findOneAndUpdate(
                        { batchId: data.batchId },
                        { $set: { MBLStatus: MBLStatus } },
                        {
                            new: true, // Return the modified document rather than the original
                            upsert: true // If no document matches, insert a new one
                        }
                    );
                } 
            } else if (indexName === "egm") {
                for (let i = 0; i < updatedDocument.egmcont.length; i++){
                    const egnCont = updatedDocument.egmcont[i];

                    const blModel = mongoose.models[`blModel`] || mongoose.model(`blModel`, Schema["bl"], `bls`);
                    await blModel.findOne({blId : egnCont.blId}).then(async function (bl) {
                        for (let j = 0; j < bl.containers.length; j++){
                            const blContainer = bl.containers[j];

                            const containerModel = mongoose.models[`containerModel`] || mongoose.model(`containerModel`, Schema["container"], `containers`);
                            const container = await containerModel.findOne({containerId : blContainer.containerId})

                            if (container){
                                await blModel.findOneAndUpdate({blId : bl.blId}, {$set: {
                                    'containers.$[innerObject].evgmNumber': container.evgmNumber,
                                    'containers.$[innerObject].evgmDate': container.evgmDate
                                }}, {arrayFilters: [{ 'innerObject.containerId': blContainer.containerId }]})
                            }
                        }
                    })
                }
            } else if (indexName === "transportinquiry" && data.adminStatus != updatedDocument.adminStatus) {
                const userModel = mongoose.models[`userModel`] || mongoose.model(`userModel`, Schema['user'], `users`);
            
                const userData = await userModel.findOne({
                    driverId : updatedDocument.shippinglineId
                })

                if(userData) {
                    let notificationData = {};

                    notificationData.createdOn = new Date().toISOString();
                    notificationData.email = userData.userEmail
                    notificationData.inappnotificationId = uuid.v1();
                    
                    notificationData.notificationName = `Inquiry bidding ${updatedDocument?.adminStatus}` || "";
                    notificationData.description = `Your bidding request no. ${updatedDocument?.transportinquiryNo} of inquiry no. ${updatedDocument?.enquiryNo} has been ${updatedDocument?.adminStatus}` || "";

                    notificationData.notificationType = "temp";
                    notificationData.notificationURL = "";
                    notificationData.read = false;
                    notificationData.tenantId = userData.tenantId
                    notificationData.userId = userData.userId
                    notificationData.notificationType = ""
                    notificationData.createdBy = "AUTO"
                    notificationData.orgId = userData.orgId
                    notificationData.userLogin = userData.userLogin
                    notificationData.module = "se"

                    const InAppNotificationModel = mongoose.models[`InAppNotificationModel`] || mongoose.model(`InAppNotificationModel`, Schema["inappnotification"], `inappnotifications`);
                    const document = InAppNotificationModel(notificationData);

                    const options = {
                        returnDocument: 'after',
                        projection: { _id: 0, __v: 0 },
                    };

                    document.save(options).then(async savedDocumentInApp => {
                        inAppNotificationService.sendNotification("inAppNotification", savedDocumentInApp);
                    }).catch(function (err) {
                        console.error(JSON.stringify({
                            traceId : req?.traceId,
                            error: err,
                            stack : err?.stack
                        }))
                    });            
                }
            } 
            // else if (indexName === "batch" && data?.routeDetails?.transhipment){
            //     const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
            
            //     await eventModel.updateMany(
            //         { entityId : data.batchId, referenceType : "Port of Transhipment"},
            //         { 
            //             $set : {
            //                 "location.locationId" : data?.routeDetails?.portOfTranshipmentId,
            //                 "location.locationName" : data?.routeDetails?.portOfTranshipmentName,
            //                 "locationTag" : data?.routeDetails?.portOfTranshipmentName,
            //                 referenceUpdatedFrom : "By Adding Transhipment"
            //             }
            //         }
            //     )
            // }

            // if (indexName === "batch" && (oldDocument?.routeDetails?.transhipment != updatedDocument?.routeDetails?.transhipment)) {
            //     const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
            
            //     if(updatedDocument?.routeDetails?.transhipment) {
            //         await eventModel.updateMany(
            //             { entityId : updatedDocument.batchId, referenceType : "Port of Transhipment"},
            //             { 
            //                 $set : {
            //                     "location.locationId" : updatedDocument?.routeDetails?.portOfTranshipmentId,
            //                     "location.locationName" : updatedDocument?.routeDetails?.portOfTranshipmentName,
            //                     "locationTag" : updatedDocument?.routeDetails?.portOfTranshipmentName,
            //                     referenceUpdatedFrom : "By Adding Transhipment"
            //                 }
            //             }
            //         )
            //     } else {
            //         await eventModel.updateMany(
            //             { entityId : updatedDocument.batchId, referenceType : "Port of Transhipment"},
            //             { 
            //                 $set : {
            //                     "location.locationId" : '',
            //                     "location.locationName" : '',
            //                     "locationTag" : '',
            //                     referenceUpdatedFrom : "By Removing Transhipment"
            //                 }
            //             }
            //         )
            //     }
            // }


            if (indexName === "event" && updatedDocument?.eventData?.bookingDate  && updatedDocument?.eventData?.eventState === "ActualDate"){
                const nextEvent = await Model.findOne({
                    locationTag : { $ne : "" },
                    "location.locationId" : { $ne : "" },
                    "location.locationName" : { $ne : "" },
                    entityId : updatedDocument.entityId, 
                    eventSeq : { $gt : updatedDocument.eventSeq }
                }, {}, {sort : {eventSeq : 1}})
            
                if (nextEvent && nextEvent.entityId && nextEvent.eventName) {
                    const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
                
                    await batchModel.findOneAndUpdate({
                        batchId : nextEvent.entityId
                    }, {
                        statusOfBatch : `${nextEvent.eventName} Pending`
                    })
                } else if(["Empty_Return", "AWB_Do", "Cargo_Out"].includes(updatedDocument.eventTag)){
                    const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
                
                    await batchModel.findOneAndUpdate({
                        batchId : updatedDocument?.entityId
                    }, {
                        statusOfBatch : `Biz Completed`
                    })
                }

                if(updatedDocument.eventName === "Sailing"){
                    const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
                
                    await batchModel.findOneAndUpdate(
                        {
                            batchId : updatedDocument.entityId
                        },
                        {
                            $set : {
                                "routeDetails.atd" : updatedDocument?.eventData?.bookingDate,
                                "routeDetails.polAtd" : updatedDocument?.eventData?.bookingDate
                            }
                        }
                    );

                    let batchData = await batchModel.findOne({batchId : nextEvent.entityId});
                    if(batchData)
                        batchData = batchData?.toObject();

                    await Model.findOneAndUpdate({
                        eventId : nextEvent.eventId
                    }, {
                        "eventData.eventState" : "EstimatedDate",
                        "isUpdated" : true,
                        updatedBy : "System",
                        updatedOn : new Date().toISOString(),
                        "eventData.bookingDateEst" : batchData?.routeDetails?.transhipment ? batchData?.routeDetails?.transhipmentETA : batchData?.routeDetails?.eta
                    })

                    await batchModel.findOneAndUpdate(
                        {
                            batchId : batchData?.batchId
                        },
                        {
                            $set : {
                                milestoneEstiDate : batchData?.routeDetails?.transhipment ? batchData?.routeDetails?.transhipmentETA : batchData?.routeDetails?.eta
                            }
                        }
                    )
                } else if(updatedDocument.eventName === "Stuffing"){
                    const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
                
                    let batchData = await batchModel.findOne({batchId : nextEvent.entityId});
                    if(batchData){
                        batchData = batchData?.toObject();

                        if(batchData?.routeDetails?.etd)
                            await Model.updateMany(
                                { entityId : batchData.batchId, eventSeq : {$gt : updatedDocument?.eventSeq}, referenceType : "Port of Loading"},
                                { 
                                    $set : {
                                        isUpdated : true,
                                        "eventData.eventState" : "EstimatedDate",
                                        "eventData.bookingDateEst" : batchData?.routeDetails?.etd,
                                        updatedBy : "By Filling Stuffing Milestone",
                                        updatedOn : new Date().toISOString()
                                    }
                                }
                            )
                            
                        if(batchData?.routeDetails?.eta)
                            await Model.updateMany(
                                { entityId : batchData.batchId, eventSeq : {$gt : updatedDocument?.eventSeq}, referenceType : "Port of Discharge"},
                                { 
                                    $set : {
                                        isUpdated : true,
                                        "eventData.eventState" : "EstimatedDate",
                                        "eventData.bookingDateEst" : batchData?.routeDetails?.eta,
                                        updatedBy : "By Filling Stuffing Milestone",
                                        updatedOn : new Date().toISOString()
                                    }
                                }
                            )

                        if(batchData?.routeDetails?.transhipment){
                            if(batchData?.routeDetails?.transhipmentETD)
                                await Model.updateMany(
                                    { entityId : batchData.batchId, eventName : RegExp("ETD"), eventSeq : {$gt : updatedDocument?.eventSeq}, referenceType : "Port of Transhipment", },
                                    { 
                                        $set : {
                                            isUpdated : true,
                                            "eventData.eventState" : "EstimatedDate",
                                            "eventData.bookingDateEst" : batchData?.routeDetails?.transhipmentETD,
                                            updatedBy : "By Filling Stuffing Milestone",
                                            updatedOn : new Date().toISOString()
                                        }
                                    }
                                )
                            if(batchData?.routeDetails?.transhipmentETA)
                                await Model.updateMany(
                                    { entityId : batchData.batchId, eventName : RegExp("ETA"), eventSeq : {$gt : updatedDocument?.eventSeq}, referenceType : "Port of Transhipment", },
                                    { 
                                        $set : {
                                            isUpdated : true,
                                            "eventData.eventState" : "EstimatedDate",
                                            "eventData.bookingDateEst" : batchData?.routeDetails?.transhipmentETA,
                                            updatedBy : "By Filling Stuffing Milestone",
                                            updatedOn : new Date().toISOString()
                                        }
                                    }
                                )
                        }


                        let nextEventForEstimate = await Model.findOne({
                            locationTag : { $ne : "" },
                            "location.locationId" : { $ne : "" },
                            "location.locationName" : { $ne : "" },
                            entityId : updatedDocument.entityId, 
                            eventSeq : { $gt : updatedDocument.eventSeq }
                        }, {}, {sort : {eventSeq : 1}})

                        if(nextEventForEstimate){
                            nextEventForEstimate = nextEventForEstimate?.toObject();
                        
                            await batchModel.findOneAndUpdate(
                                {
                                    batchId : updatedDocument?.entityId
                                },
                                {
                                    $set : {
                                        milestoneEstiDate : nextEventForEstimate?.eventData?.bookingDateEst
                                    }
                                }
                            )
                        }
                    }
                } else if(updatedDocument.eventName === "POD Arrival"){
                    const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
                
                    await batchModel.findOneAndUpdate(
                        {
                            batchId : updatedDocument.entityId
                        },
                        {
                            $set : {
                                "routeDetails.ata" : updatedDocument?.eventData?.bookingDate,
                                "routeDetails.podAta" : updatedDocument?.eventData?.bookingDate
                            }
                        }
                    );
                    try {
                        let batchTempData = await batchModel.findOne({batchId : updatedDocument.entityId});
                        if(batchTempData)
                            batchTempData = batchTempData?.toObject();

                        const totalFreeDays = batchTempData?.freeDaysTime?.reduce((partialSum, a) => partialSum + a, 0) || 1;
                        const date = new Date(updatedDocument?.eventData?.bookingDate);
                        date.setUTCDate(date.getUTCDate() + (totalFreeDays - 1));

                        await Model.findOneAndUpdate({
                            eventTag : "Empty_Return",
                            entityId : batchTempData?.batchId
                        }, {
                            $set : {
                                "eventData.eventState" : "EstimatedDate",
                                "eventData.bookingDateEst" : date.toISOString(),
                                updatedBy : `${user.name} ${user.userLastname}`,
                                referenceUpdatedFrom : "By Updating Actual Date in POD Arrival Milestone",
                                updatedOn : new Date().toISOString(),
                                isUpdated : true
                            }
                        })
                        await Model.findOneAndUpdate({
                            eventTag : "DO_Payment",
                            entityId : batchTempData?.batchId
                        }, {
                            $set : {
                                "eventData.eventState" : "EstimatedDate",
                                "eventData.bookingDateEst" : date.toISOString(),
                                updatedBy : `${user.name} ${user.userLastname}`,
                                referenceUpdatedFrom : "By Updating Actual Date in POD Arrival Milestone",
                                updatedOn : new Date().toISOString(),
                                isUpdated : true
                            }
                        })

                        await Model.findOneAndUpdate({
                            eventTag : "DO",
                            entityId : batchTempData?.batchId
                        }, {
                            $set : {
                                "eventData.eventState" : "EstimatedDate",
                                "eventData.bookingDateEst" : date.toISOString(),
                                updatedBy : `${user.name} ${user.userLastname}`,
                                referenceUpdatedFrom : "By Updating Actual Date in POD Arrival Milestone",
                                updatedOn : new Date().toISOString(),
                                isUpdated : true
                            }
                        })
                    } catch (error) {
                        console.error(
                            `Error while changing Empty_Return on changes of ATA: batchId: ${updatedDocument?.entityId}, Error : ${error}`
                        );
                    }
                }
            } else if (indexName === "event" && updatedDocument?.eventData?.bookingDateEst && updatedDocument?.eventData?.eventState === "EstimatedDate") {
                const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
                
                await batchModel.findOneAndUpdate(
                    {
                        batchId : updatedDocument?.entityId
                    },
                    {
                        $set : {
                            milestoneEstiDate : updatedDocument?.eventData?.bookingDateEst
                        }
                    }
                )
            }

            if (indexName === "batch" && oldDocument && updatedDocument && (oldDocument.enquiryDetails.basicDetails.importShipmentTypeId != updatedDocument.enquiryDetails.basicDetails.importShipmentTypeId)) {
                const MilestoneExportModel = mongoose.models[`MilestoneExportModel`] || mongoose.model(`MilestoneExportModel`, Schema["event"], `events`);
                await MilestoneExportModel.deleteMany(
                    {
                        entityId : updatedDocument.batchId
                    }
                )

                let customDetails;
                const enquiryModel = mongoose.models[`enquiryModel`] || mongoose.model(`enquiryModel`, Schema['enquiry'], `enquirys`);
                const agentadviceModel = mongoose.models[`agentadviceModel`] || mongoose.model(`agentadviceModel`, Schema['agentadvice'], `agentadvices`);
                
                if (updatedDocument?.enquiryDetails?.basicDetails?.ShipmentTypeName === "Ocean" && updatedDocument?.isExport){
                    await enquiryModel.findOne({ enquiryId: updatedDocument.enquiryId }).then(async function (foundEnquiry) {
                        customDetails = foundEnquiry?.customDetails
                    })
                } else if (updatedDocument?.enquiryDetails?.basicDetails?.ShipmentTypeName === "Ocean" && updatedDocument?.isExport === false) {
                    await agentadviceModel.findOne({ agentadviceId: updatedDocument.agentadviceId }).then(async function (foundEnquiry) {
                        customDetails = foundEnquiry?.customDetails
                    })
                } else {
                    await enquiryModel.findOne({ enquiryId: updatedDocument.enquiryId }).then(async function (foundEnquiry) {
                        customDetails = foundEnquiry?.customDetails
                    })
                }
                

                const milestoneMasterModel = mongoose.models[`milestoneMasterModel`] || mongoose.model(`milestoneMasterModel`, Schema["milestonemaster"], `milestonemasters`);
                let conditionMMEvents = {};

                conditionMMEvents["orgId"] = updatedDocument.orgId
                conditionMMEvents["flowType"] = updatedDocument.isExport ? "export" : (updatedDocument.isExport === false && updatedDocument?.enquiryDetails?.basicDetails?.ShipmentTypeName != "Land") ? "import" : "transporter"
                
                if (customDetails?.customOrigin) {
                    conditionMMEvents["customOrigin"] = { $in: [true, false, null] };
                } else 
                    conditionMMEvents["customOrigin"] = { $in: [null, false] };
                
                if (customDetails?.customDestination) {
                    conditionMMEvents["customDestination"] = { $in: [true, false, null] };
                } else 
                    conditionMMEvents["customDestination"] = { $in: [null, false] };

                conditionMMEvents["status"] = true
                conditionMMEvents["loadType"] = updatedDocument?.enquiryDetails?.basicDetails?.loadType
                conditionMMEvents["locationType"] = {$ne : "transhipment"}
                conditionMMEvents["shipmentType.item_id"] = updatedDocument?.enquiryDetails?.basicDetails?.importShipmentTypeId
                
                let mmEvents = await milestoneMasterModel.find(conditionMMEvents)

                mmEvents.sort((a, b) => a.seq - b.seq);

                for (i = 0; i < mmEvents.length; i++){
                    mmEvents[i]["name"] = mmEvents[i]["mileStoneName"]
                    mmEvents[i]["tag"] = mmEvents[i]["mileStoneName"].replace(" ", "_")

                    if (mmEvents[i]["locationType"] === "load") {
                        mmEvents[i]["locationId"] = updatedDocument.quotationDetails.loadPortId
                        mmEvents[i]["locationName"] = updatedDocument.quotationDetails.loadPortName
                        mmEvents[i]["referenceType"] = "Port of Loading"
                    } else if (mmEvents[i]["locationType"] === "transhipment") {
                        mmEvents[i]["locationId"] = updatedDocument?.routeDetails?.portOfTranshipmentId || ''
                        mmEvents[i]["locationName"] = updatedDocument?.routeDetails?.portOfTranshipmentName || ''
                        mmEvents[i]["referenceType"] = "Port of Transhipment"
                    } else if (mmEvents[i]["locationType"] === "discharge") {
                        mmEvents[i]["locationId"] = updatedDocument.enquiryDetails.routeDetails.destPortId
                        mmEvents[i]["locationName"] = updatedDocument.enquiryDetails.routeDetails.destPortName
                        mmEvents[i]["referenceType"] = "Port of Discharge"
                    }
                }

                const events = mmEvents;

                const milestones = [];

                for (let i = 0; i < events.length; i++) {
                    const milestoneData = {
                        orgId: updatedDocument.orgId,
                        referenceType: events[i].referenceType,
                        eventModule: "Booking",
                        eventType: "Milestone",
                        eventTag: events[i].tag,
                        eventName: events[i].name,
                        eventSeq: i + 1,
                        eventActualDate: "",
                        eventEstimatedDate: "",
                        locationTag: events[i].locationName,
                        location: {
                            locationId: events[i].locationId,
                            locationName: events[i].locationName,
                        },
                        createdOn: new Date().toISOString(),
                        createdBy: updatedDocument.createdBy,
                        createdByUID: updatedDocument.createdByUID,
                        tenantId: updatedDocument.tenantId,
                        eventId: uuid.v1(),
                        milestonemasterId: events[i].milestonemasterId,
                        entityId: updatedDocument.batchId,
                        entitysubId: updatedDocument.enquiryId,
                        event_payload: {}
                    }

                    milestones.push(milestoneData)
                }
                await MilestoneExportModel.insertMany(milestones);

                let nextEvent = await MilestoneExportModel.findOne({
                    locationTag : { $ne : "" },
                    "location.locationId" : { $ne : "" },
                    "location.locationName" : { $ne : "" },
                    entityId : updatedDocument.batchId
                }, null, { sort: { updatedOn: 1 } })

                nextEvent = nextEvent?.toObject();
            
                if (nextEvent && nextEvent.entityId && nextEvent.eventName) {
                    const savedNewBatch = await Model.findOneAndUpdate({
                        batchId : nextEvent.entityId
                    }, {
                        statusOfBatch : `${nextEvent.eventName} Pending`
                    }, { returnDocument : "after" })

                    if (savedNewBatch) 
                        updatedDocument = savedNewBatch
                }
            }

            // for milestone estimate date time changes when route tabs estimated date time changed
            if (indexName === "batch" && oldDocument && updatedDocument && (oldDocument?.routeDetails?.etd != updatedDocument?.routeDetails?.etd)) {
                const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
                let stuffingEvent = await eventModel.findOne({entityId : updatedDocument.batchId, eventName : "Stuffing"})
                if(stuffingEvent){
                    stuffingEvent = stuffingEvent?.toObject()

                    if(updatedDocument?.routeDetails?.etd)
                        await eventModel.updateMany(
                            { entityId : updatedDocument.batchId, eventSeq : {$gt : stuffingEvent?.eventSeq}, referenceType : "Port of Loading"},
                            { 
                                $set : {
                                    isUpdated : true,
                                    "eventData.eventState" : "EstimatedDate",
                                    "eventData.bookingDateEst" : updatedDocument?.routeDetails?.etd,
                                    updatedBy : `${user.name} ${user.userLastname}`,
                                    referenceUpdatedFrom : "By Updating ETD in Route Tab",
                                    updatedOn : new Date().toISOString(),
                                    isUpdated : true
                                }
                            }
                        )

                        let currentEvent = await eventModel.findOne({
                            entityId : updatedDocument.batchId, 
                            eventName : updatedDocument?.statusOfBatch?.replace(" Pending", "")
                        })
                        if(currentEvent){
                            currentEvent = currentEvent?.toObject()

                            if(currentEvent?.eventSeq <= stuffingEvent?.eventSeq) {
                                const etd = new Date(updatedDocument?.routeDetails?.etd);
                                const newDateM6 = new Date(etd);
                                newDateM6.setDate(newDateM6.getDate() - 6);

                                await eventModel.findOneAndUpdate({
                                    eventId : stuffingEvent.eventId
                                }, {
                                    "eventData.eventState" : "EstimatedDate",
                                    "eventData.bookingDateEst" : newDateM6.toISOString(),
                                    "isUpdated" : true,
                                    // updatedBy : `${user.name} ${user.userLastname}`,
                                    referenceUpdatedFrom : "By Updating ETD in Route Tab = ETD - 6",
                                    updatedOn : new Date().toISOString()
                                })
                            }
                        }
                }
            }
            if (indexName === "batch" && oldDocument && updatedDocument && (oldDocument?.routeDetails?.eta != updatedDocument?.routeDetails?.eta)) {
                const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
                let stuffingEvent = await eventModel.findOne({entityId : updatedDocument.batchId, eventName : "Stuffing"})
                if(stuffingEvent){
                    stuffingEvent = stuffingEvent?.toObject()
                
                    if(updatedDocument?.routeDetails?.eta)
                        await eventModel.updateMany(
                            { entityId : updatedDocument.batchId, eventSeq : {$gt : stuffingEvent?.eventSeq}, referenceType : "Port of Discharge"},
                            { 
                                $set : {
                                    isUpdated : true,
                                    "eventData.eventState" : "EstimatedDate",
                                    "eventData.bookingDateEst" : updatedDocument?.routeDetails?.eta,
                                    updatedBy : `${user.name} ${user.userLastname}`,
                                    referenceUpdatedFrom : "By Updating ETA in Route Tab",
                                    updatedOn : new Date().toISOString(),
                                    isUpdated : true
                                }
                            }
                        )
                }
            }
            if (indexName === "batch" && oldDocument && updatedDocument && updatedDocument?.routeDetails?.transhipment && (oldDocument?.routeDetails?.transhipmentETA != updatedDocument?.routeDetails?.transhipmentETA)) {
                const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
                let stuffingEvent = await eventModel.findOne({entityId : updatedDocument.batchId, eventName : "Stuffing"})
                if(stuffingEvent){
                    stuffingEvent = stuffingEvent?.toObject()
                
                    if (updatedDocument?.routeDetails?.transhipmentETA)
                        await eventModel.updateMany(
                            { entityId : updatedDocument.batchId, eventName : RegExp("ETA"), eventSeq : {$gt : stuffingEvent?.eventSeq}, referenceType : "Port of Transhipment"},
                            { 
                                $set : {
                                    isUpdated : true,
                                    "eventData.eventState" : "EstimatedDate",
                                    "eventData.bookingDateEst" : updatedDocument?.routeDetails?.transhipmentETA,
                                    updatedBy : `${user.name} ${user.userLastname}`,
                                    referenceUpdatedFrom : "By Updating Transhipment ETA in Route Tab",
                                    updatedOn : new Date().toISOString(),
                                    isUpdated : true
                                }
                            }
                        )
                }
            }
            if (indexName === "batch" && oldDocument && updatedDocument && updatedDocument?.routeDetails?.transhipment && (oldDocument?.routeDetails?.transhipmentETD != updatedDocument?.routeDetails?.transhipmentETD)) {
                const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
                let stuffingEvent = await eventModel.findOne({entityId : updatedDocument.batchId, eventName : "Stuffing"})
                if(stuffingEvent){
                    stuffingEvent = stuffingEvent?.toObject()
                
                    if(updatedDocument?.routeDetails?.transhipmentETD)
                        await eventModel.updateMany(
                            { entityId : updatedDocument.batchId, eventName : RegExp("ETD"), eventSeq : {$gt : stuffingEvent?.eventSeq}, referenceType : "Port of Transhipment"},
                            { 
                                $set : {
                                    isUpdated : true,
                                    "eventData.eventState" : "EstimatedDate",
                                    "eventData.bookingDateEst" : updatedDocument?.routeDetails?.transhipmentETD,
                                    updatedBy : `${user.name} ${user.userLastname}`,
                                    referenceUpdatedFrom : "By Updating Transhipment ETD in Route Tab",
                                    updatedOn : new Date().toISOString(),
                                    isUpdated : true
                                }
                            }
                        )
                }
            }

            // for milestone actual date time changes when route tabs actual date time changed
            if (indexName === "batch" && oldDocument && updatedDocument && (!oldDocument?.routeDetails?.polAtd) && (oldDocument?.routeDetails?.polAtd != updatedDocument?.routeDetails?.polAtd)) {
                const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
                
                let currentEvent = await eventModel.findOne({
                    entityId : updatedDocument.batchId, 
                    eventName : updatedDocument?.statusOfBatch?.replace(" Pending", "")
                })
                if(currentEvent){
                    currentEvent = currentEvent?.toObject()

                    if (updatedDocument?.routeDetails?.polAtd){
                        let milestoneActualDateUpdated = await eventModel.findOneAndUpdate({
                            eventId : currentEvent?.eventId
                        }, {
                            $set : {
                                "eventData.eventState" : "ActualDate",
                                "eventData.bookingDate" : updatedDocument?.routeDetails?.polAtd,
                                updatedBy : `${user.name} ${user.userLastname}`,
                                referenceUpdatedFrom : "By Updating POL ATD in Route Tab",
                                updatedOn : new Date().toISOString(),
                                isUpdated : true
                            }
                        }, { returnDocument : "after" })
                        milestoneActualDateUpdated = milestoneActualDateUpdated?.toObject()
                        triggerPointExecute(req, {...milestoneActualDateUpdated, orgId : user?.orgId}, "event")

                        let nextEvent = await eventModel.findOne({
                            locationTag : { $ne : "" },
                            "location.locationId" : { $ne : "" },
                            "location.locationName" : { $ne : "" },
                            entityId : updatedDocument.batchId, 
                            eventSeq : { $gt : currentEvent?.eventSeq }
                        }, {}, {sort : {eventSeq : 1}})

                        if(nextEvent){
                            nextEvent = nextEvent?.toObject()
                        
                            if (nextEvent && nextEvent.entityId && nextEvent.eventName) {
                                await Model.findOneAndUpdate({
                                    batchId : nextEvent.entityId
                                }, {
                                    statusOfBatch : `${nextEvent.eventName} Pending`
                                })
                            }
                        }
                    }
                }
            }
            if (indexName === "batch" && oldDocument && updatedDocument && (!oldDocument?.routeDetails?.podAta) && (oldDocument?.routeDetails?.podAta != updatedDocument?.routeDetails?.podAta)) {
                const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
                
                let currentEvent = await eventModel.findOne({
                    entityId : updatedDocument.batchId, 
                    eventName : updatedDocument?.statusOfBatch?.replace(" Pending", "")
                })
                if(currentEvent){
                    currentEvent = currentEvent?.toObject()

                    if (updatedDocument?.routeDetails?.podAta){
                        let milestoneActualDateUpdated = await eventModel.findOneAndUpdate({
                            eventId : currentEvent?.eventId
                        }, {
                            $set : {
                                "eventData.eventState" : "ActualDate",
                                "eventData.bookingDate" : updatedDocument?.routeDetails?.podAta,
                                updatedBy : `${user.name} ${user.userLastname}`,
                                referenceUpdatedFrom : "By Updating POD ATA in Route Tab",
                                updatedOn : new Date().toISOString(),
                                isUpdated : true
                            }
                        }, { returnDocument : "after" })
                        milestoneActualDateUpdated = milestoneActualDateUpdated?.toObject()
                        triggerPointExecute(req, {...milestoneActualDateUpdated, orgId : user?.orgId}, "event")

                        let nextEvent = await eventModel.findOne({
                            locationTag : { $ne : "" },
                            "location.locationId" : { $ne : "" },
                            "location.locationName" : { $ne : "" },
                            entityId : updatedDocument.batchId, 
                            eventSeq : { $gt : currentEvent?.eventSeq }
                        }, {}, {sort : {eventSeq : 1}})

                        if (nextEvent){
                            nextEvent = nextEvent?.toObject()
                        
                            if (nextEvent && nextEvent.entityId && nextEvent.eventName) {
                                await Model.findOneAndUpdate({
                                    batchId : nextEvent.entityId
                                }, {
                                    statusOfBatch : `${nextEvent.eventName} Pending`
                                })
                            }
                        }
                    }
                    try {
                        const totalFreeDays = updatedDocument?.freeDaysTime?.reduce((partialSum, a) => partialSum + a, 0) || 1;
                        const date = new Date(updatedDocument?.routeDetails?.podAta);
                        date.setUTCDate(date.getUTCDate() + (totalFreeDays - 1));

                        await eventModel.findOneAndUpdate({
                            eventTag : "Empty_Return",
                            entityId : updatedDocument?.batchId
                        }, {
                            $set : {
                                "eventData.eventState" : "EstimatedDate",
                                "eventData.bookingDateEst" : date.toISOString(),
                                updatedBy : `${user.name} ${user.userLastname}`,
                                referenceUpdatedFrom : "By Updating POD ATA in Route Tab",
                                updatedOn : new Date().toISOString(),
                                isUpdated : true
                            }
                        })
                        await eventModel.findOneAndUpdate({
                            eventTag : "DO_Payment",
                            entityId : updatedDocument?.batchId
                        }, {
                            $set : {
                                "eventData.eventState" : "EstimatedDate",
                                "eventData.bookingDateEst" : date.toISOString(),
                                updatedBy : `${user.name} ${user.userLastname}`,
                                referenceUpdatedFrom : "By Updating POD ATA in Route Tab",
                                updatedOn : new Date().toISOString(),
                                isUpdated : true
                            }
                        })

                        await eventModel.findOneAndUpdate({
                            eventTag : "DO",
                            entityId : updatedDocument?.batchId
                        }, {
                            $set : {
                                "eventData.eventState" : "EstimatedDate",
                                "eventData.bookingDateEst" : date.toISOString(),
                                updatedBy : `${user.name} ${user.userLastname}`,
                                referenceUpdatedFrom : "By Updating POD ATA in Route Tab",
                                updatedOn : new Date().toISOString(),
                                isUpdated : true
                            }
                        })
                    } catch (error) {
                        console.error(
                            `Error while changing Empty_Return on changes of ATA: batchId: ${updatedDocument?.batchId}, Error : ${error}`
                        );
                    }
                }
            }

            if (indexName === "batch" && oldDocument && updatedDocument && (!oldDocument?.enquiryDetails?.basicDetails?.bookingRef) && (oldDocument?.enquiryDetails?.basicDetails?.bookingRef != updatedDocument?.enquiryDetails?.basicDetails?.bookingRef)) {
                const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
                const options = {
                    returnDocument: 'after',
                    projection: { _id: 0, __v: 0 },
                };

                let currentSOEvent = await eventModel.findOne({
                    eventName : "SO",
                    entityId : updatedDocument.batchId
                })

                if(currentSOEvent){
                    currentSOEvent = currentSOEvent?.toObject();

                    let currentEvent = await eventModel.findOneAndUpdate({
                        eventId : currentSOEvent.eventId
                    }, {
                        "eventData.eventState" : "ActualDate",
                        "eventData.bookingDate" : new Date().toISOString(),
                        "isUpdated" : true,
                        updatedBy : `${user.name} ${user.userLastname}`,
                        referenceUpdatedFrom : "By Adding Booking Ref No",
                        updatedOn : new Date().toISOString()
                    }, options)

                    if (currentEvent){
                        currentEvent = currentEvent?.toObject();
                        triggerPointExecute(req, {...currentEvent, orgId : user?.orgId}, "event")

                        let nextEvent = await eventModel.findOne({
                            locationTag : { $ne : "" },
                            "location.locationId" : { $ne : "" },
                            "location.locationName" : { $ne : "" },
                            entityId : updatedDocument.batchId, 
                            eventSeq : { $gt : currentEvent?.eventSeq }
                        }, {}, {sort : {eventSeq : 1}})

                        if (nextEvent){
                            nextEvent = nextEvent?.toObject()
                        
                            if (nextEvent && nextEvent.entityId && nextEvent.eventName) {
                                await Model.findOneAndUpdate({
                                    batchId : nextEvent.entityId
                                }, {
                                    statusOfBatch : `${nextEvent.eventName} Pending`
                                })

                                if(nextEvent?.eventName === "Stuffing" && updatedDocument?.routeDetails?.etd) {
                                    const etd = new Date(updatedDocument?.routeDetails?.etd);
                                    const newDateM6 = new Date(etd);
                                    newDateM6.setDate(newDateM6.getDate() - 6);

                                    await eventModel.findOneAndUpdate({
                                        eventId : nextEvent.eventId
                                    }, {
                                        "eventData.eventState" : "EstimatedDate",
                                        "eventData.bookingDateEst" : newDateM6.toISOString(),
                                        "isUpdated" : true,
                                        updatedBy : `${user.name} ${user.userLastname}`,
                                        referenceUpdatedFrom : "By Adding Booking Ref No & ETD = ETD - 6",
                                        updatedOn : new Date().toISOString()
                                    })
                                }
                            }
                        }
                    }
                }
            }

            if (indexName === "batch" && oldDocument && updatedDocument) {
                if(oldDocument?.enquiryDetails?.containersDetails?.length > 0 && updatedDocument?.enquiryDetails?.containersDetails?.length > 0) {
                    const numOfContainersBatch = oldDocument?.enquiryDetails?.containersDetails?.map(e => e?.noOfContainer)?.reduce((prevValue, currentValue) => prevValue + currentValue) || 0
                    const numOfContainersAdded = updatedDocument?.enquiryDetails?.containersDetails?.map(e => e?.noOfContainer)?.reduce((prevValue, currentValue) => prevValue + currentValue) || 0
                
                    if(numOfContainersBatch != numOfContainersAdded) {
                        const enquiryitemModel = mongoose.models[`enquiryitemModel`] || mongoose.model(`enquiryitemModel`, Schema["enquiryitem"], `enquiryitems`);
                        let charges = await enquiryitemModel.find({
                            batchId : updatedDocument.batchId,
                            basic : "Container",
                            costItemName : new RegExp("FREIGHT", "i")
                        })

                        if(charges)
                            charges = charges?.map(e => e?.toObject())

                        for(let i = 0; i < charges.length; i++) {
                            const charge = charges[i];

                            let taxAmount = charge?.buyEstimates.taxableAmount * charge.gst / 100

                            charge.quantity = numOfContainersAdded;
                            charge.buyEstimates.amount = charge.buyEstimates.rate * numOfContainersAdded;
                            charge.buyEstimates.taxableAmount = charge.buyEstimates.exChangeRate * charge.buyEstimates.rate * numOfContainersAdded;
                            charge.buyEstimates.igst = taxAmount 
                            charge.buyEstimates.cgst = taxAmount / 2
                            charge.buyEstimates.sgst = taxAmount / 2

                            charge.buyEstimates.totalAmount = charge.buyEstimates.taxableAmount + charge.buyEstimates.igst

                            taxAmount = charge?.selEstimates.taxableAmount * charge.gst / 100

                            charge.selEstimates.amount = charge.selEstimates.rate * numOfContainersAdded;
                            charge.selEstimates.taxableAmount = charge.selEstimates.exChangeRate * charge.selEstimates.rate * numOfContainersAdded;
                            charge.selEstimates.igst = taxAmount 
                            charge.selEstimates.cgst = taxAmount / 2
                            charge.selEstimates.sgst = taxAmount / 2

                            charge.selEstimates.totalAmount = charge.selEstimates.taxableAmount + charge.selEstimates.igst

                            charge.tenantMargin = charge.selEstimates.totalAmount - charge.buyEstimates.totalAmount

                            await enquiryitemModel.findOneAndUpdate({
                                enquiryitemId : charge.enquiryitemId
                            }, charge)
                        }
                    }
                }
            }

            if (indexName === "batch" && oldDocument && updatedDocument && updatedDocument?.routeDetails?.rail && (oldDocument?.routeDetails?.railATD != updatedDocument?.routeDetails?.railATD)) {
                const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
                const options = {
                    returnDocument: 'after',
                    projection: { _id: 0, __v: 0 },
                };

                let currentRAILEvent = await eventModel.findOne({
                    eventName : "Rail Out",
                    entityId : updatedDocument.batchId
                })

                let currentBatchEventMilestone = await eventModel.findOne({
                    eventName : updatedDocument?.statusOfBatch?.replace(" Pending", ""),
                    entityId : updatedDocument.batchId
                })

                if(currentRAILEvent){
                    currentRAILEvent = currentRAILEvent?.toObject();

                    let currentEvent = await eventModel.findOneAndUpdate({
                        eventId : currentRAILEvent.eventId
                    }, {
                        "eventData.eventState" : "ActualDate",
                        "eventData.bookingDate" : new Date().toISOString(),
                        "isUpdated" : true,
                        updatedBy : `${user.name} ${user.userLastname}`,
                        referenceUpdatedFrom : "By Adding ATD in rail in Route Tab",
                        updatedOn : new Date().toISOString()
                    }, options)

                    if (currentEvent){
                        currentEvent = currentEvent?.toObject();
                        triggerPointExecute(req, {...currentEvent, orgId : user?.orgId}, "event")

                        let nextEvent = await eventModel.findOne({
                            locationTag : { $ne : "" },
                            "location.locationId" : { $ne : "" },
                            "location.locationName" : { $ne : "" },
                            entityId : updatedDocument.batchId, 
                            eventSeq : { $gt : currentEvent?.eventSeq }
                        }, {}, {sort : {eventSeq : 1}})

                        if (nextEvent){
                            nextEvent = nextEvent?.toObject()
                        
                            if (currentBatchEventMilestone?.eventSeq <= nextEvent?.eventSeq && nextEvent && nextEvent.entityId && nextEvent.eventName) {
                                await Model.findOneAndUpdate({
                                    batchId : nextEvent.entityId
                                }, {
                                    statusOfBatch : `${nextEvent.eventName} Pending`
                                })
                            }
                        }
                    }
                }
            }

            if(indexName === "deliveryorder") {
                const containerModel = mongoose.models[`containerModel`] || mongoose.model(`containerModel`, Schema['container'], `containers`);

                for(let i = 0; i < updatedDocument?.containers?.length; i++) {
                    const container = updatedDocument.containers[i];

                    if(container?.containerId && container.containerId != ""){
                        await containerModel.findOneAndUpdate(
                            {
                                containerId : container.containerId,
                                mtyValidity : {$ne : container.validTill}
                            }, 
                            {
                                mtyValidity : container.validTill,
                                updatedBy: `mtyValidity changes from DO changes (editing DO : ${updatedDocument?.deliveryOrderNo})`
                            }
                        )
                    }
                }
            }

            // if (indexName === "batch" && updatedDocument?.enquiryDetails.transhipmentHops?.every(e => e?.transhipmentHopId) && oldDocument?.enquiryDetails.transhipmentHops?.every(e => e?.transhipmentHopId)) {
            //     const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
            //     const milestoneMasterModel = mongoose.models[`milestoneMasterModel`] || mongoose.model(`milestoneMasterModel`, Schema["milestonemaster"], `milestonemasters`);            
                

            //     const { added, removed, updated } = diffTranshipmentHops(oldDocument?.enquiryDetails?.transhipmentHops || [], updatedDocument?.enquiryDetails.transhipmentHops || []);

            //     if (added?.length > 0) {
            //         let conditionMMEvents = {};

            //         conditionMMEvents["orgId"] = oldDocument.orgId
            //         conditionMMEvents["flowType"] = oldDocument.isExport ? "export" : (oldDocument.isExport === false && oldDocument?.enquiryDetails?.basicDetails?.ShipmentTypeName != "Land") ? "import" : "transporter"
            //         conditionMMEvents["status"] = true
            //         conditionMMEvents["loadType"] = oldDocument?.enquiryDetails?.basicDetails?.loadType
            //         conditionMMEvents["shipmentType.item_id"] = oldDocument?.enquiryDetails?.basicDetails?.importShipmentTypeId
            //         conditionMMEvents["locationType"] = "transhipment"

            //         let mmEvents = await milestoneMasterModel.find(conditionMMEvents)
            //         if(mmEvents)
            //             mmEvents = mmEvents.map(e => e?.toObject())

            //         let eventToBeAdded = [];

            //         let eventSeq = 0;

            //         if(mmEvents?.length > 0){
            //             for (let i = 0; i < added?.length; i++) {
            //                 const transhipment = added[i];

            //                 for (let j = 0; j < mmEvents?.length; j++) {
            //                     const milestoneData = {
            //                         transhipmentHopId: transhipment?.transhipmentHopId,
            //                         referenceType: "Port of Transhipment",
            //                         eventModule: "Booking",
            //                         eventType: "Milestone",
            //                         eventTag: mmEvents[j].mileStoneName.replace(" ", "_"),
            //                         eventName: `${mmEvents[j].mileStoneName} (${transhipment?.load_portName})`,
            //                         eventSeq: ++eventSeq,
            //                         eventActualDate: "",
            //                         eventEstimatedDate: "",
            //                         locationTag: transhipment?.load_portName,
            //                         location: {
            //                             locationId: transhipment?.load_port,
            //                             locationName: transhipment?.load_portName,
            //                         },
            //                         createdOn: new Date().toISOString(),
            //                         createdBy: `${user.name} ${user.userLastname}`,
            //                         createdByUID: user.userId,
            //                         eventId: uuid.v1(),
            //                         entityId: updatedDocument.batchId,
            //                         entitysubId: updatedDocument?.enquiryId,
            //                         event_payload: {}
            //                     }

            //                     eventToBeAdded.push(milestoneData)
            //                 }
            //             }

            //             // await eventModel.insertMany(eventToBeAdded)
            //             let oldEvent = await eventModel.find({entityId : oldDocument.batchId}, {}, {sort : {eventSeq : 1}})
            //             if(oldEvent)
            //                 oldEvent = oldEvent.map(e => e?.toObject())
                        
            //             let polEvents = oldEvent.filter(e => e.referenceType === "Port of Loading");
            //             let eventCounter = polEvents.length;

            //             let newPotEvents = []
            //             let potEvents = oldEvent.filter(e => e.referenceType === "Port of Transhipment");
            //             potEvents = [...potEvents, ...eventToBeAdded]

            //             updatedDocument?.enquiryDetails.transhipmentHops?.map((e) => {
            //                 const eventsForCurrentTrans = potEvents.filter(pot => pot.transhipmentHopId === e.transhipmentHopId)

            //                 eventsForCurrentTrans.map(tra => {
            //                     newPotEvents.push(tra)
            //                 })
            //             })

            //             newPotEvents = newPotEvents.map(
            //                 (e) => {
            //                     return {
            //                         ...e,
            //                         eventSeq: ++eventCounter,
            //                     }
            //                 }
            //             )

            //             let podEvents = oldEvent.filter(e => e.referenceType === "Port of Discharge");
            //             podEvents = podEvents.map(
            //                 (e) => {
            //                     return {
            //                         ...e,
            //                         eventSeq: ++eventCounter,
            //                     }
            //                 }
            //             )

            //             for(let i = 0 ; i < podEvents.length; i++) {
            //                 await eventModel.findOneAndUpdate(
            //                     { eventId : podEvents[i].eventId},
            //                     { eventSeq: podEvents[i].eventSeq }
            //                 )
            //             }

            //             for(let i = 0 ; i < newPotEvents.length; i++) {

            //                 if(eventToBeAdded.find(e => e.eventId === newPotEvents[i].eventId)) {
            //                     const eventData = eventModel(newPotEvents[i]);
            //                     await eventData.save();
            //                 } else {
            //                     await eventModel.findOneAndUpdate(
            //                         { eventId : newPotEvents[i].eventId},
            //                         { eventSeq: newPotEvents[i].eventSeq }
            //                     )
            //                 }
            //             }
                        
            //             console.log([...polEvents, ...newPotEvents, ...podEvents].map(e => {
            //                 return {
            //                     eventSeq : e.eventSeq,
            //                     eventName : e.eventName,
            //                     location : e.locationTag
            //                 }
            //             }));
            //         }
            //     }

            //     if (removed?.length > 0) {
            //         let eventIds = await eventModel.find({
            //             transhipmentHopId : {
            //                 $in : removed.map(e => e?.transhipmentHopId)
            //             }
            //         })
            //         if(eventIds){
            //             eventIds = eventIds.map(e => e?.toObject())

            //             console.log(`Event to be deleted : ${eventIds.length}`)

            //             if(eventIds?.length > 0) {
            //                 for(let i = 0; i < eventIds?.length; i++) {
            //                     await eventModel.findOneAndDelete(
            //                         {
            //                             eventId : eventIds[i].eventId
            //                         }
            //                     )
            //                 }
                            
            //                 let eventIdsToShift = await eventModel.find({
            //                     entityId : oldDocument.batchId,
            //                     eventSeq : {
            //                         "$gt" : Math.max(...eventIds.map(e => e.eventSeq))
            //                     }
            //                 })

            //                 console.log(`Event to be shift : ${eventIdsToShift.length}`)

            //                 if(eventIdsToShift){
            //                     eventIdsToShift = eventIdsToShift.map(e => e?.toObject())

            //                     for(let i = 0; i < eventIdsToShift?.length; i++) {
            //                         if(eventIdsToShift[i].referenceType === "Port of Transhipment" || removed?.length !== added?.length) {
            //                             await eventModel.findOneAndUpdate(
            //                                 {
            //                                     eventId : eventIdsToShift[i].eventId
            //                                 },
            //                                 {
            //                                     eventSeq : eventIdsToShift[i].eventSeq - eventIds?.length
            //                                 }
            //                             ) 
            //                         }
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // }

            if (indexName === "batch" && updatedDocument?.enquiryDetails.transhipmentHops?.every(e => e?.transhipmentHopId) && oldDocument?.enquiryDetails.transhipmentHops?.every(e => e?.transhipmentHopId)) {
                const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
                const milestoneMasterModel = mongoose.models[`milestoneMasterModel`] || mongoose.model(`milestoneMasterModel`, Schema["milestonemaster"], `milestonemasters`);            
                
                let allAvaialbleTPInDB = await eventModel.find({entityId : updatedDocument?.batchId, referenceType : "Port of Transhipment" })
                if(allAvaialbleTPInDB)
                    allAvaialbleTPInDB = allAvaialbleTPInDB?.map(e => e?.toObject())

                let allAvaialbleTPInDBIds = [...new Set(allAvaialbleTPInDB.map(e => e.transhipmentHopId))]

                let eventToDeleted = [];

                for(let i = 0; i < allAvaialbleTPInDBIds?.length; i++) {
                    const transhipments = updatedDocument?.enquiryDetails.transhipmentHops?.map(x => x?.transhipmentHopId)
                    
                    if(transhipments.includes(allAvaialbleTPInDBIds[i])){

                    } else {
                        if(allAvaialbleTPInDBIds[i]){
                            await eventModel.deleteMany({
                                transhipmentHopId: allAvaialbleTPInDBIds[i]
                            })

                            eventToDeleted.push(allAvaialbleTPInDBIds[i])
                        }
                    }
                }
                
                console.log(`Event deleted for batch: ${updatedDocument?.batchId} length : `, eventToDeleted?.length, JSON.stringify(eventToDeleted || []));

                let totalEvents = await eventModel.find({entityId : updatedDocument?.batchId })
                if(totalEvents)
                    totalEvents = totalEvents?.map(e => e?.toObject())
                
                const loadEvents = totalEvents?.filter(e => e?.referenceType === "Port of Loading" || e?.referenceType === "Port of Transhipment")
                let maxLoadSeq = loadEvents?.length
                    ? Math.max(...loadEvents.map(e => e.eventSeq || 0))
                    : null;
                

                const transhipmentHopeIdNotFound = [];

                let conditionMMEvents = {};

                conditionMMEvents["orgId"] = oldDocument.orgId
                conditionMMEvents["flowType"] = oldDocument.isExport ? "export" : (oldDocument.isExport === false && oldDocument?.enquiryDetails?.basicDetails?.ShipmentTypeName != "Land") ? "import" : "transporter"
                conditionMMEvents["status"] = true
                conditionMMEvents["loadType"] = oldDocument?.enquiryDetails?.basicDetails?.loadType
                conditionMMEvents["shipmentType.item_id"] = oldDocument?.enquiryDetails?.basicDetails?.importShipmentTypeId
                conditionMMEvents["locationType"] = "transhipment"

                let mmEvents = await milestoneMasterModel.find(conditionMMEvents)
                if(mmEvents)
                    mmEvents = mmEvents.map(e => e?.toObject())

                let eventToBeAdded = [];

                for(let i = 0; i < updatedDocument?.enquiryDetails.transhipmentHops?.length; i++) {
                    const transhipmentHop = updatedDocument?.enquiryDetails.transhipmentHops[i];

                    const events = await eventModel.findOne({transhipmentHopId : transhipmentHop?.transhipmentHopId})

                    if(events){

                    } else {
                        transhipmentHopeIdNotFound.push(transhipmentHop?.transhipmentHopId)


                        for (let j = 0; j < mmEvents?.length; j++) {
                            // maxLoadSeq = maxLoadSeq + 0.1;
                            maxLoadSeq = parseFloat((maxLoadSeq + 0.1).toFixed(2));

                            const milestoneData = {
                                orgId: updatedDocument.orgId,
                                milestonemasterId: mmEvents[j].milestonemasterId,
                                transhipmentHopId: transhipmentHop?.transhipmentHopId,
                                referenceType: "Port of Transhipment",
                                eventModule: "Booking",
                                eventType: "Milestone",
                                eventTag: mmEvents[j].mileStoneName.replace(" ", "_"),
                                eventName: `${mmEvents[j].mileStoneName} (${transhipmentHop?.load_portName})`,
                                eventSeq: maxLoadSeq,
                                eventActualDate: "",
                                eventEstimatedDate: "",
                                locationTag: transhipmentHop?.load_portName,
                                location: {
                                    locationId: transhipmentHop?.load_port,
                                    locationName: transhipmentHop?.load_portName,
                                },
                                createdOn: new Date().toISOString(),
                                createdBy: `${user.name} ${user.userLastname}`,
                                createdByUID: user.userId,
                                eventId: uuid.v1(),
                                entityId: updatedDocument.batchId,
                                entitysubId: updatedDocument?.enquiryId,
                                event_payload: {}
                            }

                            eventToBeAdded.push(milestoneData)
                        }
                    }
                }

                await eventModel.insertMany(eventToBeAdded);
                console.log(`Event added for batch: ${updatedDocument?.batchId} length : `, eventToBeAdded?.length, JSON.stringify(eventToBeAdded?.map(e => e?.eventId) || []));
            }

            if(indexName === "batch" && updatedDocument?.enquiryDetails.transhipmentHops?.every(e => e?.transhipmentHopId) && oldDocument?.enquiryDetails.transhipmentHops?.every(e => e?.transhipmentHopId)) {
                try {
                    const changes = detectTranshipmentUpdates(oldDocument?.enquiryDetails.transhipmentHops, updatedDocument?.enquiryDetails.transhipmentHops)

                    console.log("Detect changes in transhipment hops", JSON.stringify(changes));
                    
                    if(changes?.length > 0) {
                        const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
                        let currentBatchEvent = await eventModel.findOne({
                            entityId : updatedDocument.batchId,
                            eventName : updatedDocument?.statusOfBatch?.replace(" Pending", "")
                        })

                        if(currentBatchEvent){
                            currentBatchEvent = currentBatchEvent?.toObject()
                        
                            for (let i = 0; i < changes?.length; i++) {
                                const tChange = changes[i];
                                const trp = updatedDocument?.enquiryDetails.transhipmentHops?.find(e => e?.transhipmentHopId === tChange?.hopId)

                                if(tChange?.changes?.eta) {
                                    let currentEvent = await eventModel.findOne({
                                        entityId : updatedDocument.batchId, 
                                        transhipmentHopId: tChange?.hopId
                                    }, {}, {sort : {eventSeq : 1}})
                                    
                                    if(currentEvent){
                                        currentEvent = currentEvent?.toObject();
                                        
                                        await eventModel.findOneAndUpdate(
                                            {
                                                eventId: currentEvent?.eventId
                                            },
                                            {
                                                isUpdated : true,
                                                "eventData.eventState" : "EstimatedDate",
                                                "eventData.bookingDateEst" : trp?.eta,
                                                updatedBy : `${user.name} ${user.userLastname}`,
                                                referenceUpdatedFrom : `By Updating ETA in Transhipment Hope`,
                                                updatedOn : new Date().toISOString()
                                            }
                                        )
                                    }
                                } else if(tChange?.changes?.ata) {
                                    let currentEvent = await eventModel.findOne({
                                        entityId : updatedDocument.batchId, 
                                        transhipmentHopId: tChange?.hopId,
                                    }, {}, {sort : {eventSeq : 1}})

                                    if(currentEvent){
                                        currentEvent = currentEvent?.toObject();

                                        let milestoneActualDateUpdated = await eventModel.findOneAndUpdate({
                                            eventId : currentEvent?.eventId
                                        }, {
                                            $set : {
                                                "eventData.eventState" : "ActualDate",
                                                "eventData.bookingDate" : trp?.ata,
                                                updatedBy : `${user.name} ${user.userLastname}`,
                                                referenceUpdatedFrom : "By Updating ATA in Transhipment Hop",
                                                updatedOn : new Date().toISOString(),
                                                isUpdated : true
                                            }
                                        }, { returnDocument : "after" })
                                        milestoneActualDateUpdated = milestoneActualDateUpdated?.toObject()
                                        triggerPointExecute(req, {...milestoneActualDateUpdated, orgId : user?.orgId}, "event")

                                        if(currentEvent && currentBatchEvent?.eventSeq <= currentEvent?.eventSeq){
                                            
                                            let nextEvent = await eventModel.findOne({
                                                locationTag : { $ne : "" },
                                                "location.locationId" : { $ne : "" },
                                                "location.locationName" : { $ne : "" },
                                                entityId : updatedDocument.batchId, 
                                                eventSeq : { $gt : currentEvent?.eventSeq }
                                            }, {}, {sort : {eventSeq : 1}})

                                            if(nextEvent){
                                                nextEvent = nextEvent?.toObject()
                                            
                                                if (nextEvent && nextEvent.entityId && nextEvent.eventName) {
                                                    await Model.findOneAndUpdate({
                                                        batchId : nextEvent.entityId
                                                    }, {
                                                        statusOfBatch : `${nextEvent.eventName} Pending`
                                                    })
                                                }
                                            }
                                        }
                                    }
                                } else if(tChange?.changes?.etd) {
                                    let currentEvent = await eventModel.findOne({
                                        entityId : updatedDocument.batchId, 
                                        transhipmentHopId: tChange?.hopId
                                    }, {}, {sort : {eventSeq : -1}})
                                    
                                    if(currentEvent){
                                        currentEvent = currentEvent?.toObject()

                                        await eventModel.findOneAndUpdate(
                                            {
                                                eventId: currentEvent?.eventId
                                            },
                                            {
                                                isUpdated : true,
                                                "eventData.eventState" : "EstimatedDate",
                                                "eventData.bookingDateEst" : trp?.etd,
                                                updatedBy : `${user.name} ${user.userLastname}`,
                                                referenceUpdatedFrom : `By Updating ETD in Transhipment Hope`,
                                                updatedOn : new Date().toISOString()
                                            }
                                        )
                                    }
                                } else if(tChange?.changes?.atd) {
                                    let currentEvent = await eventModel.findOne({
                                        entityId : updatedDocument.batchId, 
                                        transhipmentHopId: tChange?.hopId
                                    }, {}, {sort : {eventSeq : -1}})

                                    if(currentEvent){
                                        currentEvent = currentEvent?.toObject()
                                    
                                        let milestoneActualDateUpdated = await eventModel.findOneAndUpdate({
                                            eventId : currentEvent?.eventId
                                        }, {
                                            $set : {
                                                "eventData.eventState" : "ActualDate",
                                                "eventData.bookingDate" : trp?.atd,
                                                updatedBy : `${user.name} ${user.userLastname}`,
                                                referenceUpdatedFrom : "By Updating ATD in Transhipment Hop",
                                                updatedOn : new Date().toISOString(),
                                                isUpdated : true
                                            }
                                        }, { returnDocument : "after" })
                                        milestoneActualDateUpdated = milestoneActualDateUpdated?.toObject()
                                        triggerPointExecute(req, {...milestoneActualDateUpdated, orgId : user?.orgId}, "event")

                                        if(currentEvent && currentBatchEvent?.eventSeq <= currentEvent?.eventSeq){
                                            let nextEvent = await eventModel.findOne({
                                                locationTag : { $ne : "" },
                                                "location.locationId" : { $ne : "" },
                                                "location.locationName" : { $ne : "" },
                                                entityId : updatedDocument.batchId, 
                                                eventSeq : { $gt : currentEvent?.eventSeq }
                                            }, {}, {sort : {eventSeq : 1}})

                                            if(nextEvent){
                                                nextEvent = nextEvent?.toObject()
                                            
                                                if (nextEvent && nextEvent.entityId && nextEvent.eventName) {
                                                    await Model.findOneAndUpdate({
                                                        batchId : nextEvent.entityId
                                                    }, {
                                                        statusOfBatch : `${nextEvent.eventName} Pending`
                                                    })
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error(error)
                }
            }

            res.send(updatedDocument)
        }
        else
            res.status(401).send({ "message": "Nothing to update." })
    }).catch(function (err) {
        console.error(JSON.stringify({
            traceId : req?.traceId,
            error: err,
            stack : err?.stack
        }))
        res.status(500).json({ error: err });
    });
}
exports.updateBatch = async (req, res, next) => {
    const indexName = req.params.indexName;
    const data = req.body;

    const user = res.locals.user

    for (let i = 0; i < data.length; i++) {
        data[i].updatedOn = new Date().toISOString();;


        
        if (user) {
            data[i].updatedBy = `${user.name} ${user.userLastname}`
            data[i].updatedByUID = user.userId
            data[i].tenantId = user.tenantId
            data[i].tenantId = user.tenantId
        } else {
            data.tenantId = '1'
        }
    }

    const options = {
        returnDocument: 'after',
        projection: { _id: 0, __v: 0 },
    };

    const Model = mongoose.models[`${indexName}Model`] || mongoose.model(`${indexName}Model`, Schema[indexName], `${indexName}s`);
    let updatedDataAll = []

    // for container updates in batch
    let textForContainerChange = "";
    let customerEmailForBatchContainerUpdate = "";
    
    for (let i = 0; i < data.length; i++) {
        const query = {};
        query[`${indexName}Id`] = data[i][`${indexName}Id`]

        const oldData = await Model.findOne(query);
        await Model.findOneAndUpdate(query, data[i], options).then(async function (updatedDocument) {
            if (updatedDocument) {
                triggerPointExecute(req, {...updatedDocument, orgId : user?.orgId}, indexName)

                const uploadedFile = await azureStorage.uploadAuditLog(updatedDocument[`${indexName}Id`], updatedDocument)
                const AuditLogModel = mongoose.models[`AuditLogModel`] || mongoose.model(`AuditLogModel`, Schema['auditlog'], `auditlogs`);
                const auditLogDocument = AuditLogModel({
                    "auditlogId": uuid.v1(),
                    "auditLogType": "delete-event",
                    "collection": indexName,
                    "id": updatedDocument[`${indexName}Id`],
                    "timestamp": Math.floor(Date.now() / 1000),
                    "azureBlobFile": uploadedFile.name
                });

                auditLogDocument.save();

                updatedDataAll.push(updatedDocument)

                if (indexName === "container" && data[i]?.notifyCustomer){
                    const partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, Schema["partymaster"], `partymasters`);
                    
                    const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
                    await batchModel.findOne({batchId : updatedDocument.batchId}).then(async function (foundBatch) {
                        const partymaster = await partymasterModel.findOne({partymasterId : foundBatch.enquiryDetails.basicDetails.shipperId})
                        
                        const changableKey = [  
                            {key : "shippingBillNumber", message : "BL NO Date"},
                            {key : "factoryIn", message : "Factory In Date"},
                            {key : "factoryOut", message : "Factory Out Date"}
                        ]
    
                        const changedKeyWithContainer = [];
    
                        for(let changableKeyIndex = 0; changableKeyIndex < changableKey.length; changableKeyIndex++){
                            if (oldData[changableKey[changableKeyIndex].key] != updatedDocument[changableKey[changableKeyIndex].key]){
                                changedKeyWithContainer.push({keyObject : changableKey[changableKeyIndex], value : updatedDocument[changableKey[changableKeyIndex].key], containerNumber : updatedDocument.containerNumber})
                            }
                        }
    
                        for (let textIndex = 0; textIndex < changedKeyWithContainer.length; textIndex++){
                            textForContainerChange += `${changedKeyWithContainer[textIndex].keyObject.message} has been changed to ${changedKeyWithContainer[textIndex].value} for container ${changedKeyWithContainer[textIndex].containerNumber} \n`
                        }
                        
    
                        customerEmailForBatchContainerUpdate = partymaster?.primaryMailId
                    })
                } else if (indexName === "transportinquiry" && data[i].adminStatus != updatedDocument.adminStatus) {
                    const userModel = mongoose.models[`userModel`] || mongoose.model(`userModel`, Schema['user'], `users`);
                
                    const userData = await userModel.findOne({
                        driverId : updatedDocument.shippinglineId
                    })
    
                    if(userData) {
                        let notificationData = {};
    
                        notificationData.createdOn = new Date().toISOString();
                        notificationData.email = userData.userEmail
                        notificationData.inappnotificationId = uuid.v1();
                        
                        notificationData.notificationName = `Inquiry bidding ${updatedDocument?.adminStatus}` || "";
                        notificationData.description = `Your bidding request no. ${updatedDocument?.transportinquiryNo} of inquiry no. ${updatedDocument?.enquiryNo} has been ${updatedDocument?.adminStatus}` || "";
    
                        notificationData.notificationType = "temp";
                        notificationData.notificationURL = "";
                        notificationData.read = false;
                        notificationData.tenantId = userData.tenantId
                        notificationData.userId = userData.userId
                        notificationData.notificationType = ""
                        notificationData.createdBy = "AUTO"
                        notificationData.orgId = userData.orgId
                        notificationData.userLogin = userData.userLogin
                        notificationData.module = "se"
    
                        const InAppNotificationModel = mongoose.models[`InAppNotificationModel`] || mongoose.model(`InAppNotificationModel`, Schema["inappnotification"], `inappnotifications`);
                        const document = InAppNotificationModel(notificationData);
    
                        const options = {
                            returnDocument: 'after',
                            projection: { _id: 0, __v: 0 },
                        };
    
                        document.save(options).then(async savedDocumentInApp => {
                            inAppNotificationService.sendNotification("inAppNotification", savedDocumentInApp);
                        }).catch(function (err) {
                            console.error(JSON.stringify({
                                traceId : req?.traceId,
                                error: err,
                                stack : err?.stack
                            }))
                        });            
                    }
                }    
            }
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId : req?.traceId,
                error: err,
                stack : err?.stack
            }))
        });
    }

    if (indexName === "container" && data.every(e => e?.mtyReturn)){
        const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema['batch'], `batchs`);
        let batchData = await batchModel.findOne({ batchId : data[0].batchId})
        if(batchData)
            batchData = batchData?.toObject();

        const currentMilestoneName = batchData?.statusOfBatch?.replace(" Pending", "")
        const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
        
        let currentMilestone = await eventModel.findOne({
            eventName : currentMilestoneName,
            entityId : batchData?.batchId
        })
        
        if(currentMilestone){
            currentMilestone = currentMilestone?.toObject();

            await batchModel.findOneAndUpdate({
                batchId : batchData?.batchId
            }, {
                statusOfBatch : `Biz Completed`
            })

            let milestoneActualDateUpdated = await eventModel.findOneAndUpdate({
                entityId : batchData?.batchId,
                eventTag : "Empty_Return"
            }, {
                "eventData.eventState" : "ActualDate",
                "eventData.bookingDate" : new Date().toISOString(),
                "isUpdated" : true,
                updatedBy : `${user.name} ${user.userLastname}`,
                referenceUpdatedFrom : "By Adding Empty Return Date in All Container",
                updatedOn : new Date().toISOString()
            }, { returnDocument : "after" })
            milestoneActualDateUpdated = milestoneActualDateUpdated?.toObject()
            triggerPointExecute(req, {...milestoneActualDateUpdated, orgId : user?.orgId}, "event")
        }
    }

    if (indexName === "container" && data.every(e => e?.railOut)){
        const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema['batch'], `batchs`);
        let batchData = await batchModel.findOne({ batchId : data[0].batchId})
        if(batchData)
            batchData = batchData?.toObject();

        const currentMilestoneName = batchData?.statusOfBatch?.replace(" Pending", "")
        const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
        
        let currentMilestone = await eventModel.findOne({
            eventName : currentMilestoneName,
            entityId : batchData?.batchId
        })
        
        if(currentMilestone){
            currentMilestone = currentMilestone?.toObject();

            let currentRailOutEvent = await eventModel.findOne({
                eventTag : "Rail_Out",
                entityId : batchData.batchId
            })

            if(currentRailOutEvent){
                currentRailOutEvent = currentRailOutEvent?.toObject();

                let currentEvent = await eventModel.findOneAndUpdate({
                    eventId : currentRailOutEvent.eventId
                }, {
                    "eventData.eventState" : "ActualDate",
                    "eventData.bookingDate" : new Date().toISOString(),
                    "isUpdated" : true,
                    updatedBy : `${user.name} ${user.userLastname}`,
                    referenceUpdatedFrom : "By Adding Rail Out Date In All Container",
                    updatedOn : new Date().toISOString()
                }, options)

                if (currentEvent){
                    currentEvent = currentEvent?.toObject();
                    triggerPointExecute(req, {...currentEvent, orgId : user?.orgId}, "event")

                    let nextEvent = await eventModel.findOne({
                        locationTag : { $ne : "" },
                        "location.locationId" : { $ne : "" },
                        "location.locationName" : { $ne : "" },
                        entityId : batchData.batchId, 
                        eventSeq : { $gt : currentEvent?.eventSeq }
                    }, {}, {sort : {eventSeq : 1}})

                    if (nextEvent){
                        nextEvent = nextEvent?.toObject()
                    
                        if (nextEvent && nextEvent.entityId && nextEvent.eventName) {
                            await batchModel.findOneAndUpdate({
                                batchId : nextEvent.entityId
                            }, {
                                statusOfBatch : `${nextEvent.eventName} Pending`
                            })
                        }
                    }
                }
            }
        }
    }

    if (indexName === "container" && data.every(e => e?.notifyCustomer) && textForContainerChange != ""){
        const containerObject = data[0];
        const batchObject = await Model.findOne({containerId : containerObject.containerId})

        await sendMail(user.orgId, "e6772f41-5555-11ef-91b3-939500dcf434", [{email : customerEmailForBatchContainerUpdate.replace("@", `+${batchObject.batchNo.replace("-", "")}@`)}], [], {text : textForContainerChange}, batchObject.batchId)
    }

    await res.send(updatedDataAll)
}

exports.resetEvent = async (req, res, next) => {
    try {
        const eventModel =
            mongoose.models.eventModel ||
            mongoose.model("eventModel", Schema["event"], "events");

        const batchModel =
            mongoose.models.batchModel ||
            mongoose.model("batchModel", Schema["batch"], "batchs");

        const options = {
            returnDocument: "after",
            projection: { _id: 0, __v: 0 }
        };

        // 1️⃣ Reset selected event
        const resetEvent = await eventModel.findOneAndUpdate(
            { eventId: req.params.id },
            {
                $unset: { eventData: 1 },
                $set: { isUpdated: false }
            },
            options
        );

        if (!resetEvent) {
            return res.status(404).json({ message: "Event not found" });
        }

        // 2️⃣ Find previous milestone
        const previousEvent = await eventModel.findOne(
            {
                entityId: resetEvent.entityId,
                eventSeq: { $lt: resetEvent.eventSeq }
            },
            {},
            { sort: { eventSeq: -1 } }
        );

        // 3️⃣ Decide which milestone should be pending
        const pendingEventName = previousEvent
            ? previousEvent.eventName   // normal case
            : resetEvent.eventName;     // Rate (first milestone)

        // 4️⃣ Update batch status
        await batchModel.findOneAndUpdate(
            { batchId: resetEvent.entityId },
            {
                $set: {
                    statusOfBatch: `${pendingEventName} Pending`
                }
            }
        );

        return res.status(200).json({
            message: "Event successfully reset",
            currentStatus: `${pendingEventName} Pending`
        });

    } catch (error) {
        console.error("resetEvent error:", error);
        next(error);
    }
};



function detectTranshipmentUpdates(oldData, newData) {
  const fieldsToCheck = ["etd", "eta", "ata", "atd"];
  const changes = [];

  const oldHops = oldData || [];
  const newHops = newData || [];

  newHops.forEach((newHop) => {
    const oldHop = oldHops.find(
      (h) => h.transhipmentHopId === newHop.transhipmentHopId
    );

    if (oldHop) {
      const hopChanges = { hopId: newHop.transhipmentHopId, changes: {} };

      fieldsToCheck.forEach((field) => {
        const oldVal = oldHop[field] || "";
        const newVal = newHop[field] || "";

        if (oldVal !== newVal) {
          hopChanges.changes[field] = { oldValue: oldVal, newValue: newVal };
        }
      });

      // only push if there are actual changes
      if (Object.keys(hopChanges.changes).length > 0) {
        changes.push(hopChanges);
      }
    }
  });

  return changes;
}


function diffTranshipmentHops(oldArray, newArray) {
    const oldMap = new Map(oldArray.map(item => [item.transhipmentHopId, item]));
    const newMap = new Map(newArray.map(item => [item.transhipmentHopId, item]));

    const added = [];
    const removed = [];
    const updated = [];

    for (const [id, newItem] of newMap.entries()) {
        if (!oldMap.has(id)) {
            added.push(newItem);
        } else {
            const oldItem = oldMap.get(id);
            if (!isEqual(oldItem, newItem)) {
                updated.push({ before: oldItem, after: newItem });
            }
        }
    }

    for (const [id, oldItem] of oldMap.entries()) {
        if (!newMap.has(id)) {
            removed.push(oldItem);
        }
    }

    return { added, removed, updated };
}

// Helper: shallow equality check (or use deep equality lib like lodash.isEqual)
function isEqual(obj1, obj2) {
  if (typeof obj1 !== typeof obj2) return false;

  if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
    return obj1 === obj2;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!isEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}