const { mongoose, Schema, invoiceSchema, uuid, jwt, crypto, axios, azureStorage, inAppNotificationService, querystring, nodemailer, pdfScanner, ediController, OpenAI, objecdiff, sendMessage, getTextMessageInput, fs, _, simpleParser, connect, imapConfig, transporter, getChangedFields, removeIdField, recordLogAudit, encryptObject, decryptObject, isSubset, createInAppNotification, replacePlaceholders, generateRandomPassword, triggerPointExecute, insertIntoTally, getTransporter, getChildCompany} = require('./helper.controller')

exports.chartDataDashboard = async (req, res, next) => {
    try {
        const user = res.locals.user;

        // Define the date range for the last 6 months
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);

        // Define the enquiry and batch models
        const enquiryModel = mongoose.models[`enquiryModel`] || mongoose.model(`enquiryModel`, Schema["enquiry"], `enquirys`);
        const agentAdviceModel = mongoose.models[`agentAdviceModel`] || mongoose.model(`agentAdviceModel`, Schema["agentadvice"], `agentadvices`);
        const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);

        // Aggregation pipeline
        const enquiryPipeline = [
            {
                $addFields: {
                    createdOn: { $dateFromString: { dateString: "$createdOn" } }
                }
            },
            {
                $match: {
                    "basicDetails.ShipmentTypeName" : req.body.query.flowType === "Transport" ? "Land" : {$ne : "Land"},
                    orgId : user.orgId,
                    createdOn: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdOn" },
                        month: { $month: "$createdOn" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    count: 1
                }
            }
        ];

        const batchPipeline = [
            {
                $addFields: {
                    createdOn: { $dateFromString: { dateString: "$createdOn" } }
                }
            },
            {
                $match: {
                    "enquiryDetails.basicDetails.ShipmentTypeName" : req.body.query.flowType === "Transport" ? "Land" : {$ne : "Land"},
                    orgId : user.orgId,
                    createdOn: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdOn" },
                        month: { $month: "$createdOn" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    count: 1
                }
            }
        ];

        // Execute the aggregation for both models
        let enquiryResults;

        if (req.body.query.flowType === "Import")
            enquiryResults = await agentAdviceModel.aggregate(enquiryPipeline);
        else 
            enquiryResults = await enquiryModel.aggregate(enquiryPipeline);
        
        const batchResults = await batchModel.aggregate(batchPipeline);

        // Convert results to a map for easier merging
        const convertToMap = (results, countKey) => {
            return results.reduce((acc, item) => {
                const key = `${item.year}-${item.month}`;
                if (!acc[key]) {
                    acc[key] = { year: item.year, month: item.month, [countKey]: 0 };
                }
                acc[key][countKey] += item.count;
                return acc;
            }, {});
        };

        const enquiryMap = convertToMap(enquiryResults, 'enquiryCount');
        const batchMap = convertToMap(batchResults, 'batchCount');

        // Merge results
        const mergedResults = { ...enquiryMap };

        for (const [key, value] of Object.entries(batchMap)) {
            if (mergedResults[key]) {
                mergedResults[key].batchCount = value.batchCount;
            } else {
                mergedResults[key] = { ...value, enquiryCount: 0 };
            }
        }

        // Convert merged results to an array and sort
        const finalResults = Object.values(mergedResults).sort((a, b) => {
            if (a.year === b.year) {
                return a.month - b.month;
            }
            return a.year - b.year;
        });

        // Define month names for formatting
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // Format the results to include month names
        const formattedResults = finalResults.map(item => ({
            month: monthNames[item.month - 1], // Convert month number to name
            year: item.year,
            enquiryCount: item.enquiryCount || 0,
            batchCount: item.batchCount || 0
        }));

        // Return the formatted response
        res.json({
            success: true,
            data: formattedResults
        });
    } catch (error) {
        next(error);
    }
};

exports.chatInitialization = async (req, res, next) => {
    const user = res.locals.user

    const userModel = mongoose.models[`userModel`] || mongoose.model(`userModel`, Schema["user"], `users`);
    const groupchatModel = mongoose.models[`groupchatModel`] || mongoose.model(`groupchatModel`, Schema["groupchat"], `groupchats`);
    const departmentModel = mongoose.models[`departmentModel`] || mongoose.model(`departmentModel`, Schema["department"], `departments`);
    const messageModel = mongoose.models[`messageModel`] || mongoose.model(`messageModel`, Schema["message"], `messages`);
    
    let userData;

    if (user.userType === "customer"){
        const departmentData = await departmentModel.find({status : true, orgId : user.orgId, assignedChatPerson : {"$exists" : true}})
        const dictionaryDepartment = {}
        for(let i = 0; i < departmentData?.length; i++){
            dictionaryDepartment[departmentData[i]?.assignedChatPerson?.userId] = departmentData[i]
        }

        const userIds = departmentData?.map(e => e.assignedChatPerson?.userId)
        
        userData = await userModel.find({userId : { "$in" : userIds}, status : true})
        userData = userData?.map(e => {
            return {
                ...e,
                name : dictionaryDepartment[e.userId].deptName
            }
        })
    } else {
        userData = await userModel.find({userId : { $ne : user.userId }, orgId : user.orgId, status : true})
    }

    let groupchatData = await groupchatModel.find({
        orgId : user.orgId,
        "users.userId" : user.userId
    })

    groupchatData = await Promise.all(groupchatData.map(async (e) => {
        // {toUserId : user.userId, fromUserId : e.userId}
        const count = await messageModel.countDocuments({"usersStatus.userId" : {$ne : user.userId}, toGroupId : e.groupchatId})
        let lastMessage = await messageModel.findOne({toGroupId : e.groupchatId}, null, { sort : {createdOn : -1}}) 

        let lastMessagePayload = lastMessage?.toObject()    
        if (lastMessagePayload)
            lastMessagePayload.isSent = lastMessagePayload?.fromUserId === user?.userId    

        return {
            userLogin : e.groupchatName,
            orgId : e.orgId,
            name : e.groupchatName,
            isGroup : true,
            // userEmail : e.userEmail,
            // department : e.department,
            groupchatId : e.groupchatId,
            // userSocketStatus : e.userSocketStatus,
            unReadCount : count,
            lastMessage : lastMessagePayload
        }
    }))

    userData = await Promise.all(userData.map(async (e) => {
        // {toUserId : user.userId, fromUserId : e.userId}
        const count = await messageModel.countDocuments({isRead : false, toUserId : user.userId, fromUserId : e.userId})
        let lastMessage = await messageModel.findOne({"$or" : [
            {
                "$and" : [
                    {toUserId : user.userId},
                    {fromUserId : e.userId}
                ]
            },
            {
                "$and" : [
                    {toUserId : e.userId},
                    {fromUserId : user.userId}
                ]
            }
        ]}, null, { sort : {createdOn : -1}}) 

        let lastMessagePayload = lastMessage?.toObject()    
        if (lastMessagePayload)
            lastMessagePayload.isSent = lastMessagePayload?.fromUserId === user?.userId    

        return {
            userLogin : e.userLogin,
            orgId : e.orgId,
            name : e.name,
            userEmail : e.userEmail,
            department : e.department,
            userId : e.userId,
            userSocketStatus : e.userSocketStatus,
            unReadCount : count,
            lastMessage : lastMessagePayload
        }
    }))

    const totalCount = userData.map(e => e.unReadCount).reduce((partialSum, a) => partialSum + a, 0) || 0;
    res.send({
        userData : [...userData, ...groupchatData], 
        badgeData : {
            unReadMessageCount : totalCount,
            unReadPeopleCount : userData.filter(e => e.unReadCount > 0).length
        }
    })
}

exports.sendBookingConfirmation = async (req, res, next) => {
    const body = req.body;
    const user = res.locals.user

    const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
    let batchData = await batchModel.findOne({batchId : req.params.id});

    if(batchData){
        batchData = batchData?.toObject();

        await triggerPointExecute(req, {
            ...batchData,
            sendBookingConfirmationMail : true,
            batchId : req.params.id
        }, "batch");

        const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
        const options = {
            returnDocument: 'after',
            projection: { _id: 0, __v: 0 },
        };

        let currentBookingEvent = await eventModel.findOne({
            eventName : "Booking",
            entityId : batchData.batchId
        })

        let currentBatchEventMilestone = await eventModel.findOne({
            eventName : batchData?.statusOfBatch?.replace(" Pending", ""),
            entityId : batchData.batchId
        })
        if(currentBatchEventMilestone)
            currentBatchEventMilestone = currentBatchEventMilestone?.toObject();

        if(currentBookingEvent){
            currentBookingEvent = currentBookingEvent?.toObject();

            let currentEvent = await eventModel.findOneAndUpdate({
                eventId : currentBookingEvent.eventId
            }, {
                "eventData.eventState" : "ActualDate",
                "eventData.bookingDate" : new Date().toISOString(),
                "isUpdated" : true,
                updatedBy : `${user.name} ${user.userLastname}`,
                referenceUpdatedFrom : "By Sending Booking Confirmation Email",
                updatedOn : new Date().toISOString()
            }, options)

            if (currentEvent){
                currentEvent = currentEvent?.toObject();

                let nextEvent = await eventModel.findOne({
                    locationTag : { $ne : "" },
                    "location.locationId" : { $ne : "" },
                    "location.locationName" : { $ne : "" },
                    entityId : batchData.batchId, 
                    eventSeq : { $gt : currentEvent?.eventSeq }
                })

                if (nextEvent){
                    nextEvent = nextEvent?.toObject()
                
                    if (currentBatchEventMilestone.eventSeq <= nextEvent.eventSeq && nextEvent && nextEvent.entityId && nextEvent.eventName) {
                        await batchModel.findOneAndUpdate({
                            batchId : nextEvent.entityId
                        }, {
                            statusOfBatch : `${nextEvent.eventName} Pending`
                        })
                    }
                }
            }
        }

        res.status(200).send({
            message : "Email sent"
        })
    } else 
        res.status(500).send({
            message : "Job not found with given id"
        })
}

exports.profileCompletion = async (req, res, next) => {
    const user = res.locals.user

    const collections = ["branch", "department", "bank", "role", "partymaster", "costitem", "shippingline", "vessel", "containermaster", "emailtemplate"]
    let collectionWithCount = {};

    let model = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, Schema["agent"], `agents`);
    const agentData = await model.findOne({agentId : user.orgId})


    const requiredFields = [
        {
            fieldName: "agentName",
            errorMsg: "Agent Name"
        },
        {
            fieldName: "addressInfo.countryId",
            errorMsg: "Country"
        },
        {
            fieldName: "addressInfo.stateId",
            errorMsg: "State"
        },
        {
            fieldName: "addressInfo.cityId",
            errorMsg: "City"
        },
        {
            fieldName: "addressInfo.postalCode",
            errorMsg: "Postal Code"
        },
        {
            fieldName: "addressInfo.address",
            errorMsg: "Address"
        },
        {
            fieldName: "primaryNo.primaryNumber",
            errorMsg: "Primary Number"
        },
        {
            fieldName: "primaryMailId",
            errorMsg: "Primary Mail ID"
        },
        {
            fieldName: "taxType",
            errorMsg: "Tax Type"
        },
        {
            fieldName: "taxId",
            errorMsg: "Tax ID"
        },
        {
            fieldName: "currency.currencyId",
            errorMsg: "Currency"
        }
    ];


    let issues = [];

    requiredFields?.map(e => e.fieldName)?.forEach(field => {
        const value = _.get(agentData, field);
        if (_.isNil(value) || (_.isString(value) && _.isEmpty(value)) || (_.isNumber(value) && isNaN(value))) {
            issues.push({
                field: field,
                status: _.isNil(value) ? "not found" : "empty"
            });
        }
    });


    // res.send(issues.map(e => {
    //     return {
    //         ...e,
    //         name : requiredFields.find(et => et.fieldName === e.field).errorMsg
    //     }
    // }))

    const issuesFound = issues?.map(e => {
        return {
            ...e,
            name : requiredFields?.find(et => et?.fieldName === e?.field)?.errorMsg
        }
    })


    const badges = [
        {
            name : "companyprofile",
            count : issuesFound > 1 ? 0 : 1,
            isCompleted : !(issuesFound > 1),
            errors : issuesFound
        }
    ]

    for(let i = 0; i < collections?.length; i++){
        model = mongoose.models[`${collections[i]}Model`] || mongoose.model(`${collections[i]}Model`, Schema[collections[i] === "vendor"?`partymaster` :`${collections[i]}`], collections[i] === "vendor"?`partymasters` :`${collections[i]}s`);
        let count;

        if (collections[i] === "vendor")
            count = await model.countDocuments({orgId : user.orgId, "customerType.item_text" : "Vendor"});
        else
            count = await model.countDocuments({orgId : user.orgId});

        badges.push({
            name : collections[i],
            count : count,
            isCompleted : count >= 1,
            errors : count >= 1 ? [] : [
                {
                    field: collections[i],
                    status: "not found",
                    name: collections[i]
                }
            ]
        })
    }

    res.send(badges)    
}

exports.clearAllNotification = async (req, res, next) => {
    const {userId} = req.body

    if (!userId) {
        return res.ststus(500).send({
            error : "Please enter userId!"
        })
    } else {
        const inappnotificationModel = mongoose.models.inappnotificationModel || mongoose.model('inappnotificationModel', Schema["inappnotification"], 'inappnotifications');
        
        const options = {
            returnDocument: 'after',
            projection: { _id: 0, __v: 0 },
        };

        await inappnotificationModel.updateMany(
            {
                userId : userId
            },
            {
                $set : {
                    read : true
                }
            },
            options
        ).then(async function (updatedDocument) {
            if (updatedDocument?.modifiedCount == 0)
                res.status(500).send({status : "failed", message:"UserId not found!"})
            else 
                res.status(200).send({status : "success", message:`${updatedDocument?.modifiedCount} notifications has been marked as read!`})
        })
    }
}