const { mongoose, Schema, invoiceSchema, uuid, jwt, crypto, axios, azureStorage, inAppNotificationService, querystring, nodemailer, pdfScanner, ediController, OpenAI, objecdiff, sendMessage, getTextMessageInput, fs, _, simpleParser, connect, imapConfig, transporter, getChangedFields, removeIdField, recordLogAudit, encryptObject, decryptObject, isSubset, createInAppNotification, replacePlaceholders, generateRandomPassword, triggerPointExecute, insertIntoTally, getTransporter, getChildCompany } = require('./helper.controller')

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const stringSimilarity = require("string-similarity");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


exports.get = async (req, res, next) => {
    try {
        const indexName = `${req.params.indexName}`;
        const documentId = req.params.id

        const user = res.locals.user
        const agent = res.locals.agent

        const Model = mongoose.models[`${indexName}Model`] || mongoose.model(`${indexName}Model`, Schema[indexName], `${indexName}s`);

        let query = req.body.query || {};
        const projection = {};
        const sort = {};

        if (indexName === "batch" && req?.body?.query?.containerNos) {
            const containerModel = mongoose.models[`containerModel`] || mongoose.model(`containerModel`, Schema["container"], `containers`);

            const batchData = await containerModel.find({ containerNumber: req?.body?.query?.containerNos })

            if (batchData) {
                const batchIds = batchData?.map(e => e.batchId)

                if (batchIds) {
                    query["batchId"] = {
                        $in: batchIds
                    }

                    delete query["containerNos"]
                }
            }
        }

        if (indexName === "batch" && req?.body?.query?.telexStatus === 'MBL Telex Pending') {
            const blModel = mongoose.models[`blModel`] || mongoose.model(`blModel`, Schema["bl"], `bls`);

            let blData = await blModel.find(
                {
                    orgId: agent.agentId,
                    blType: "MBL",
                    $or: [
                        { MBLStatus: "PENDING" },
                        { MBLStatus: { $exists: false } }
                    ]
                },
                { batchId: 1, consolidatedJobs: 1 }
            );

            if (blData) {
                blData = blData?.map(e => e.toObject())
                const batchIds = blData.flatMap(item => {
                    const mainId = item.batchId ? [item.batchId] : [];
                    const subIds = item.consolidatedJobs
                        ? item.consolidatedJobs.map(j => j.batchId)
                        : [];
                    return [...subIds, ...mainId];
                });

                if (batchIds) {
                    if (query?.batchId?.includes("$in")) {
                        query["batchId"] = {
                            $in: [
                                ...query?.batchId["$in"],
                                ...batchIds
                            ]
                        }
                    } else {
                        query["batchId"] = {
                            ...query?.batchId,
                            $in: batchIds
                        }
                    }


                    delete query["telexStatus"]
                }
            }
        } else if (indexName === "batch" && req?.body?.query?.telexStatus === 'HBL Telex Pending') {
            const blModel = mongoose.models[`blModel`] || mongoose.model(`blModel`, Schema["bl"], `bls`);

            let blData = await blModel.find(
                {
                    orgId: agent.agentId,
                    blType: "HBL",
                    $or: [
                        { HBLStatus: "PENDING" },
                        { HBLStatus: { $exists: false } }
                    ]
                },
                { batchId: 1, consolidatedJobs: 1 }
            );

            if (blData) {
                blData = blData?.map(e => e.toObject())
                const batchIds = blData.flatMap(item => {
                    const mainId = item.batchId ? [item.batchId] : [];
                    const subIds = item.consolidatedJobs
                        ? item.consolidatedJobs.map(j => j.batchId)
                        : [];
                    return [...subIds, ...mainId];
                });

                if (batchIds) {
                    if (query?.batchId?.includes("$in")) {
                        query["batchId"] = {
                            $in: [
                                ...query?.batchId["$in"],
                                ...batchIds
                            ]
                        }
                    } else {
                        query["batchId"] = {
                            ...query?.batchId,
                            $in: batchIds
                        }
                    }


                    delete query["telexStatus"]
                }
            }
        }

        if (indexName === "batch" && ["Transshipment ETA/Arrival Pending", "Transshipment ETD/Departure Pending"].includes(req?.body?.query?.statusOfBatch)) {
            const baseStatus = req.body.query.statusOfBatch;

            // Escape slashes for regex
            const escapedBaseStatus = baseStatus.replace("/", "\\/");

            // Build regex pattern: e.g., Transshipment ETA/Arrival(?: \([^)]+\))? Pending
            const pattern = `^${escapedBaseStatus.split(" Pending")[0]}(?: \\([^)]+\\))? Pending$`;

            query["statusOfBatch"] = {
                $regex: pattern,
                $options: "i" // optional: case-insensitive
            };
        }


        for (let i = 0; i < req.body?.project?.length; i++) {
            projection[req.body.project[i]] = 1;
        }

        for (let i = 0; i < req.body?.sort?.asc?.length; i++) {
            sort[req.body.sort.asc[i]] = 1;
        }

        for (let i = 0; i < req.body?.sort?.desc?.length; i++) {
            sort[req.body.sort.desc[i]] = -1;
        }

        if (documentId && documentId != ',')
            query[`${indexName}Id`] = req.params.id

        if (indexName === "event") {
            query["locationTag"] = { $ne: "" }
            query["location.locationId"] = { $ne: "" }
            query["location.locationName"] = { $ne: "" }
        }

        // if(["systemtype"].includes(indexName)){
        //     query["orgId"] = user.orgId
        // }
        if (["uom", "systemtype"].includes(indexName)) {
            query["orgId"] = user.orgId
        }
        // query["orgId"] = user

        // role based access for job/batch
        if (indexName === "batch" && user.userType != "internal" && agent?.batchAccessFeature) {
            query["$or"] = [
                { isAccessAssigned: { $exists: false } },
                { isAccessAssigned: false },
                {
                    isAccessAssigned: true,
                    'accessUser.userId': user.userId
                }
            ]
        }

        // Enforce pagination limits to prevent excessive data retrieval
        const MAX_PAGE_SIZE = 500;
        const DEFAULT_PAGE_SIZE = 20;
        const requestedSize = parseInt(req.body?.size, 10) || DEFAULT_PAGE_SIZE;
        const pageSize = Math.min(Math.max(1, requestedSize), MAX_PAGE_SIZE);
        const skip = Math.max(0, parseInt(req.body?.from, 10) || 0);

        await Model.find(query, projection, { "sort": sort, "skip": skip, "limit": pageSize }).then(async function (foundDocument) {
            const totalCount = await Model.countDocuments(query);

            // foundDocument = foundDocument?.map(
            //     (e) => e?.toObject() || e
            // )

            if (indexName === "consolidationbooking") {
                const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);

                const newRes = await Promise.all(foundDocument.map(async e => {
                    let batchWiseGrouping = {}
                    for (let i = 0; i < e?.items?.length; i++) {
                        const item = e.items[i];

                        if (!(batchWiseGrouping.hasOwnProperty(item.batchId)))
                            batchWiseGrouping[item.batchId] = { batchNo: item.batchNo, "containers": [] }

                        if (!batchWiseGrouping[item.batchId].containers.includes(item.assignContainer?.containermasterId))
                            batchWiseGrouping[item.batchId].containers.push(item.assignContainer?.containermasterId)
                    }

                    const newDataToReturn = []
                    for (const id in batchWiseGrouping) {
                        if (batchWiseGrouping.hasOwnProperty(id)) {
                            const batchId = id;
                            const batchData = await batchModel.findOne({ batchId: batchId })
                            newDataToReturn.push({
                                batchId: batchId,
                                loadPortId: batchData?.enquiryDetails?.routeDetails?.loadPortId,
                                loadPortName: batchData?.enquiryDetails?.routeDetails?.loadPortName,
                                destPortId: batchData?.enquiryDetails?.routeDetails?.destPortId,
                                destPortName: batchData?.enquiryDetails?.routeDetails?.destPortName,
                                batchNo: batchWiseGrouping[id].batchNo,
                                items: e.items.filter(e => e.batchId === batchId)
                            })
                        }
                    }
                    const { items, ...other } = e.toObject()

                    return { ...other, "batchwiseGrouping": newDataToReturn }
                }))
                res.send({ "documents": newRes, "totalCount": totalCount })
            } else if (indexName === "auditlog") {
                let processedAuditLog = new Object(foundDocument);

                processedAuditLog = await Promise.all(await foundDocument.map(async (document) => {
                    const { azureBlobFile, ...other } = document.toObject();
                    if (document.azureBlobFile) {
                        const eventData = await azureStorage.downloadAudioLog(document.azureBlobFile);

                        return { ...other, eventData };
                    } else
                        return { ...other };
                }));

                await res.status(200).send({ "documents": processedAuditLog, "totalCount": totalCount })
            } else if (indexName === "batch") {
                foundDocument = foundDocument.map(e => e?.toObject())

                if (foundDocument.length === 0) {
                    res.status(200).send({ "documents": foundDocument, "totalCount": totalCount })
                } else {
                    // let processedAuditLog = new Object(foundDocument);
                    const blModel = mongoose.models[`blModel`] || mongoose.model(`blModel`, Schema["bl"], `bls`);
                    const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
                    const containerModel = mongoose.models[`containerModel`] || mongoose.model(`containerModel`, Schema["container"], `containers`);
                    const shippinglineModel = mongoose.models[`shippinglineModel`] || mongoose.model(`shippinglineModel`, Schema["shippingline"], `shippinglines`);
                    const partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, Schema["partymaster"], `partymasters`);
                    const branchModel = mongoose.models[`branchModel`] || mongoose.model(`branchModel`, Schema["branch"], `branchs`);
                    const deliveryorderModel = mongoose.models[`deliveryorderModel`] || mongoose.model(`deliveryorderModel`, Schema["deliveryorder"], `deliveryorders`);

                    let shippinglineIds = []
                    let vesselIds = []
                    let addressBooksIds = []
                    let branchIds = []

                    const batchIds = foundDocument.map(e => e.batchId)

                    const orConditions = batchIds.flatMap(id => [
                        { batchId: id },
                        { 'consolidatedJobs.batchId': id }
                    ]);

                    let deliveryorderData = await deliveryorderModel.find({ batchId: { $in: batchIds } });

                    if (deliveryorderData)
                        deliveryorderData = deliveryorderData?.map(e => e?.toObject())

                    let blDataMaster = await blModel.find({ $or: orConditions });

                    if (blDataMaster)
                        blDataMaster = blDataMaster?.map(e => e?.toObject())
                    let eventDataMaster = await eventModel.find({
                        $or: foundDocument.map((e) => {
                            return {
                                entityId: e.batchId,
                                eventName: e?.statusOfBatch?.replace(" Pending", "")
                            }
                        }
                        )
                    })
                    if (eventDataMaster)
                        eventDataMaster = eventDataMaster?.map(e => e?.toObject())

                    let processedBatch = foundDocument.map((document) => {
                        const { ...other } = document;

                        // const blData = await blModel.find({ batchId: document.batchId })
                        // let eventData = await eventModel.findOne({ entityId: document.batchId, eventName: document?.statusOfBatch?.replace(" Pending", "") })
                        // if (eventData)
                        //     eventData = eventData?.toObject()

                        const blData = blDataMaster.filter(e => e.batchId === document.batchId || e.consolidatedJobs.find(ef => ef.batchId === document.batchId))
                        const eventData = eventDataMaster.find(e => e.entityId === document.batchId)

                        const hblType = blData.find(e => e.blTypeName === "HBL")?.blType
                        const hblNumber = blData.find(e => e.blTypeName === "HBL")?.blNumber

                        shippinglineIds.push(other?.enquiryDetails?.routeDetails?.shippingLineId)
                        vesselIds.push(other?.quotationDetails?.vesselId)
                        addressBooksIds.push(other?.enquiryDetails?.basicDetails?.consigneeId)
                        addressBooksIds.push(other?.enquiryDetails?.basicDetails?.shipperId)
                        addressBooksIds.push(other?.enquiryDetails?.basicDetails?.agentId)
                        shippinglineIds.push(other?.quotationDetails?.carrierId)
                        branchIds.push(other?.quotationDetails?.branchId)

                        return {
                            ...other, blData: blData.map(bl => {
                                return {
                                    isBlConsolidated: bl.isBlConsolidated,
                                    consolidatedJobs: bl.consolidatedJobs,
                                    blType: bl.blType,
                                    blStatus: bl[`${bl.blType}Status`] || "PENDING",
                                    blNumber: bl.blNumber
                                }
                            }), milestoneEstiDate: eventData?.eventData?.bookingDateEst || '', hblNumber: hblNumber, hblType: hblType, containersName: document?.enquiryDetails?.containersDetails?.map(e => e.containerType).join(", ")
                        };
                    })

                    let shippingLineDatas = await shippinglineModel.find({
                        shippinglineId: { $in: shippinglineIds }
                    }, { shortName: 1, shippinglineId: 1 })
                    if (shippingLineDatas)
                        shippingLineDatas = shippingLineDatas?.map(e => e?.toObject())

                    let addressBookDatas = await partymasterModel.find({
                        partymasterId: { $in: addressBooksIds }
                    }, { partyShortcode: 1, partymasterId: 1 })
                    if (addressBookDatas)
                        addressBookDatas = addressBookDatas?.map(e => e?.toObject())

                    let branchDatas = await branchModel.find({
                        branchId: { $in: branchIds }
                    }, { branchShortName: 1, branchId: 1 })
                    if (branchDatas)
                        branchDatas = branchDatas?.map(e => e?.toObject())


                    let containerDataMaster = await containerModel.find({
                        "$or": [
                            {
                                "batchId": {
                                    $in: batchIds
                                }
                            },
                            {
                                "batchwiseGrouping.batchId": {
                                    $in: batchIds
                                }
                            }
                        ]
                    })

                    if (containerDataMaster)
                        containerDataMaster = containerDataMaster?.map(e => e?.toObject())

                    processedBatch = await Promise.all(processedBatch.map(async (doc) => {
                        const containers = containerDataMaster.filter(e => (e?.batchId === doc.batchId || e?.batchwiseGrouping?.some(bc => bc.batchId === doc.batchId)))

                        try {
                            doc["containerNos"] = containers?.map(e => e.containerNumber).filter(e => e).join(", ")
                            doc["enquiryDetails"]["routeDetails"]["shippingLineShortName"] = shippingLineDatas.find(e => e?.shippinglineId === doc?.enquiryDetails?.routeDetails?.shippingLineId)?.shortName
                            doc["quotationDetails"]["vesselShortName"] = doc["quotationDetails"]["vesselName"]
                            doc["enquiryDetails"]["basicDetails"]["consigneeShortName"] = addressBookDatas.find(e => e?.partymasterId === doc?.enquiryDetails?.basicDetails?.consigneeId)?.partyShortcode
                            doc["enquiryDetails"]["basicDetails"]["shipperShortName"] = addressBookDatas.find(e => e?.partymasterId === doc?.enquiryDetails?.basicDetails?.shipperId)?.partyShortcode
                            doc["enquiryDetails"]["basicDetails"]["agentShortName"] = addressBookDatas.find(e => e?.partymasterId === doc?.enquiryDetails?.basicDetails?.agentId)?.partyShortcode
                            doc["quotationDetails"]["carrierShortName"] = shippingLineDatas.find(e => e?.shippinglineId === doc?.quotationDetails?.carrierId)?.shortName
                            doc["quotationDetails"]["branchShortName"] = branchDatas.find(e => e?.branchId === doc?.quotationDetails?.branchId)?.branchShortName

                            doc["containerNosDataWithTooltip"] = containers?.filter(e => e?.containerNumber).map(cont => {
                                const findDO = deliveryorderData?.find(hdo => hdo?.containers?.find(cnt => cnt?.containerId === cont.containerId))?.containers
                                return {
                                    containerNumber: cont.containerNumber,
                                    isDetentionTaken: deliveryorderData?.some(hdo => hdo?.containers?.find(cnt => cnt?.containerId === cont.containerId)?.isDetentionTaken),
                                    detentionTakenDate: findDO?.find(hdoc => hdoc?.containerId === cont.containerId)?.detentionTakenDate,
                                    validTill: findDO?.find(hdoc => hdoc?.containerId === cont.containerId)?.validTill
                                }
                            })
                        } catch (err) {
                            console.error(JSON.stringify({
                                traceId: req?.traceId,
                                error: err,
                                stack: err?.stack
                            }))
                        }

                        return doc
                    }))

                    await res.status(200).send({ "documents": processedBatch, "totalCount": totalCount })
                }
            } else if (indexName === "invoice") {
                foundDocument = foundDocument?.map(
                    (e) => e?.toObject() || e
                )
                const invoiceapprovalModel = mongoose.models[`invoiceapprovalModel`] || mongoose.model(`invoiceapprovalModel`, Schema['invoiceapproval'], `invoiceapprovals`);

                let orgInvoiceSetting = await invoiceapprovalModel.findOne({ orgId: agent?.agentId })
                if (orgInvoiceSetting) {
                    orgInvoiceSetting = orgInvoiceSetting?.toObject();

                    if (checkUserExists(orgInvoiceSetting, user?.userId)) {
                        res.status(200).send({
                            "documents": foundDocument?.map(e => {
                                return {
                                    ...e,
                                    hasInvoiceApprovalAccess: true
                                }
                            }), "totalCount": totalCount
                        })
                    } else {
                        res.status(200).send({
                            "documents": foundDocument?.map(e => {
                                return {
                                    ...e,
                                    hasInvoiceApprovalAccess: false
                                }
                            }), "totalCount": totalCount
                        })
                    }
                } else
                    res.status(200).send({
                        "documents": foundDocument?.map(e => {
                            return {
                                ...e,
                                hasInvoiceApprovalAccess: false
                            }
                        }), "totalCount": totalCount
                    })
            } else if (indexName === "user")
                res.status(200).send({ "documents": foundDocument?.map(e => e.toObject())?.map(({ password, ...rest }) => rest), "totalCount": totalCount })
            else if (indexName === "warehousedataentry") {
                foundDocument = foundDocument.map(e => e?.toObject())

                if (foundDocument.length === 0) {
                    res.status(200).send({ "documents": foundDocument, "totalCount": totalCount })
                } else {
                    // let processedAuditLog = new Object(foundDocument);
                    const warehousebillofentryModel =
                        mongoose.models[`warehousebillofentryModel`] ||
                        mongoose.model(
                            `warehousebillofentryModel`,
                            Schema["warehousebillofentry"],
                            `warehousebillofentry`
                        );

                    const warehousegateinentryModel = mongoose.models[`warehousegateinentryModel`] || mongoose.model(`warehousegateinentryModel`, Schema["warehousegateinentry"], `warehousegateinentrys`);
                    const warehousegateoutentryModel = mongoose.models[`warehousegateoutentryModel`] || mongoose.model(`warehousegateoutentryModel`, Schema["warehousegateoutentry"], `warehousegateoutentrys`);
                    const warehousedispatchModel = mongoose.models[`warehousedispatchModel`] || mongoose.model(`warehousedispatchModel`, Schema["warehousedispatch"], `warehousedispatchs`);
                    const warehousecontainerModel = mongoose.models[`warehousecontainerModel`] || mongoose.model(`warehousecontainerModel`, Schema["warehousecontainer"], `warehousecontainers`);

                    const warehousedataentryIds = foundDocument.map(e => e.warehousedataentryId);

                    const [
                        warehousebillofentryData,
                        warehousegateinentryData,
                        warehousegateoutentryData,
                        warehousedispatchData,
                        warehousecontainerData,
                        exbondbillentryData
                    ] = await Promise.all([
                        warehousebillofentryModel.find({ warehousedataentryId: { $in: warehousedataentryIds } }).lean(),
                        warehousegateinentryModel.find({ warehousedataentryId: { $in: warehousedataentryIds } }).lean(),
                        warehousegateoutentryModel.find({ warehousedataentryId: { $in: warehousedataentryIds } }).lean(),
                        warehousedispatchModel.find({ warehousedataentryId: { $in: warehousedataentryIds } }).lean(),
                        warehousecontainerModel.find({ warehousedataentryId: { $in: warehousedataentryIds } }).lean(),

                    ])

                    const finalDocs = foundDocument.map(e => {
                        return {
                            ...e,
                            containers: warehousecontainerData.filter(w => w.warehousedataentryId === e.warehousedataentryId)?.map(con => {
                                return {
                                    ...con,
                                    cargoStatus: warehousegateoutentryData?.find(qgoe => qgoe?.warehousecontainerId === con?.warehousecontainerId) ? "Done" : "Pending"
                                }
                            }) || [],
                            inEntryDateTime: warehousegateinentryData.find(w => w.warehousedataentryId === e.warehousedataentryId)?.entryDateTime,
                            gateOutDate: warehousegateoutentryData.find(w => w.warehousedataentryId === e.warehousedataentryId)?.gateOutDate,
                            gateInPackages: warehousegateinentryData.find(w => w.warehousedataentryId === e.warehousedataentryId)?.packages,
                            gateInUnit: warehousegateinentryData.find(w => w.warehousedataentryId === e.warehousedataentryId)?.unitName,
                            gateOutPackages: warehousegateoutentryData.find(w => w.warehousedataentryId === e.warehousedataentryId)?.packages,
                            gateOutUnit: warehousegateoutentryData.find(w => w.warehousedataentryId === e.warehousedataentryId)?.unitName,
                            warehouseNumber: warehousegateinentryData.find(w => w.warehousedataentryId === e.warehousedataentryId)?.warehouseNumber,
                            totalDutyAmount: warehousebillofentryData.filter(w => w.warehousedataentryId === e.warehousedataentryId)?.map(e => e?.dutyAmount)?.reduce((partialSum, a) => partialSum + a, 0) || 0
                        }
                    })
                    return res.status(200).send({ documents: finalDocs, totalCount });
                }
            } else if (indexName === "warehousecontainer") {

                foundDocument = foundDocument.map(e => e?.toObject());

                if (foundDocument.length === 0) {
                    return res.status(200).send({
                        documents: foundDocument,
                        totalCount: totalCount
                    });
                }

                const warehousegateinentryModel =
                    mongoose.models[`warehousegateinentryModel`] ||
                    mongoose.model(
                        `warehousegateinentryModel`,
                        Schema["warehousegateinentry"],
                        `warehousegateinentrys`
                    );

                const warehousegateoutentryModel =
                    mongoose.models[`warehousegateoutentryModel`] ||
                    mongoose.model(
                        `warehousegateoutentryModel`,
                        Schema["warehousegateoutentry"],
                        `warehousegateoutentrys`
                    );

                const inwardcontainerhandoverModel =
                    mongoose.models[`inwardcontainerhandoverModel`] ||
                    mongoose.model(
                        `inwardcontainerhandoverModel`,
                        Schema["inwardcontainerhandover"],
                        `inwardcontainerhandovers`
                    );

                const warehouseinwardModel =
                    mongoose.models[`warehouseinwardModel`] ||
                    mongoose.model(
                        `warehouseinwardModel`,
                        Schema["warehouseinward"],
                        `warehouseinwards`
                    );

                const warehousedispatchModel =
                    mongoose.models[`warehousedispatchModel`] ||
                    mongoose.model(
                        `warehousedispatchModel`,
                        Schema["warehousedispatch"],
                        `warehousedispatchs`
                    );

                const warehousebillofentryModel =
                    mongoose.models[`warehousebillofentryModel`] ||
                    mongoose.model(
                        `warehousebillofentryModel`,
                        Schema["warehousebillofentry"],
                        `warehousebillofentry`
                    );

                const warehousedataentryIds =
                    foundDocument.map(e => e.warehousedataentryId);

                const [
                    warehousegateinentryData,
                    warehousegateoutentryData,
                    inwardcontainerhandoverData,
                    warehouseinwardData,
                    warehousedispatchData,
                    warehousebillofentry
                ] = await Promise.all([
                    warehousegateinentryModel.find({ warehousedataentryId: { $in: warehousedataentryIds } }).lean(),
                    warehousegateoutentryModel.find({ warehousedataentryId: { $in: warehousedataentryIds } }).lean(),
                    inwardcontainerhandoverModel.find({ warehousedataentryId: { $in: warehousedataentryIds } }).lean(),
                    warehouseinwardModel.find({ warehousedataentryId: { $in: warehousedataentryIds } }).lean(),
                    warehousedispatchModel.find({ warehousedataentryId: { $in: warehousedataentryIds } }).lean(),
                    warehousebillofentryModel.find({ warehousedataentryId: { $in: warehousedataentryIds } }).lean()
                ]);

                const finalDocs = foundDocument.map(e => {

                    const gateInQty =
                        Number(
                            warehousegateinentryData.find(
                                w => w.warehousecontainerId === e.warehousecontainerId
                            )?.packages
                        ) || 0;

                    const gateOutQty =
                        Number(
                            warehousegateoutentryData.find(
                                w => w.warehousecontainerId === e.warehousecontainerId
                            )?.packages
                        ) || 0;

                    const totalDispatchQty =
                        warehousedispatchData
                            .filter(w => w.warehousedataentryId === e.warehousedataentryId)
                            .reduce((sum, d) => sum + (Number(d?.qty) || 0), 0);

                    const qtyAsPerBOE =
                        Number(
                            warehousebillofentry.find(
                                w => String(w.warehousedataentryId) === String(e.warehousedataentryId)
                            )?.grossQty
                        ) || 0;

                    return {
                        ...e,

                        gateInStatus:
                            warehousegateinentryData.find(w => w.warehousecontainerId === e.warehousecontainerId)
                                ? "Done"
                                : "Pending",

                        inWardStatus:
                            warehouseinwardData.find(w => w.warehousecontainerId === e.warehousecontainerId)
                                ? "Done"
                                : "Pending",

                        inWardHandOver:
                            inwardcontainerhandoverData.find(w => w.warehousecontainerId === e.warehousecontainerId)
                                ? "Done"
                                : "Pending",

                        gateOutStatus:
                            warehousegateoutentryData.find(w => w.warehousecontainerId === e.warehousecontainerId)
                                ? "Done"
                                : "Pending",

                        inWardLocation:
                            warehouseinwardData.find(w => w.warehousecontainerId === e.warehousecontainerId)?.location || "",

                        gateInQty,
                        gateOutQty,
                        totalDispatchQty,

                        balanceQty: gateInQty - totalDispatchQty,

                        qtyAsPerBOE:
                            Number(
                                warehousebillofentry.find(
                                    w => String(w.warehousedataentryId).trim() ===
                                        String(e.warehousedataentryId).trim()
                                )?.packages
                            ) || 0

                    };
                });

                return res.status(200).send({
                    documents: finalDocs,
                    totalCount
                });
            }

            else
                res.status(200).send({ "documents": foundDocument, "totalCount": totalCount })
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: req?.traceId,
                error: err,
                stack: err?.stack
            }))
            res.status(500).send({ error: err?.message })
        });
    } catch (err) {
        console.error(JSON.stringify({
            traceId: req?.traceId,
            error: err,
            stack: err?.stack
        }))
        res.status(500).send({ error: err?.message })
    }
}

exports.globalSearch = async (req, res, next) => {
    const cNames = ["enquiry", "batch", "container", "invoice", "quotation", "bl"];
    const searchedData = { foundInCollections: [] };
    const searchValue = req?.body?.key?.trim(); // <-- Trim spaces

    const user = res.locals.user
    const agent = res.locals.agent

    try {
        if (!searchValue) return res.send(searchedData);

        // Escape regex special chars
        const safeValue = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(safeValue, 'i'); // <-- use safe regex

        for (let i = 0; i < cNames.length; i++) {
            const indexName = cNames[i];
            const Model = mongoose.models[`${indexName}Model`] || mongoose.model(`${indexName}Model`, Schema[indexName], `${indexName}s`);

            let conditions = [];

            if (indexName === "bl" || indexName === "container") {
                conditions.push({ [`${indexName}Number`]: regex });
            } else if (indexName === "batch") {
                conditions.push(
                    { "enquiryDetails.basicDetails.bookingRef": regex },
                    { "batchNo": regex }
                );
            } else {
                conditions.push({ [`${indexName}No`]: regex });
            }

            const query = { "$or": conditions, orgId: agent?.agentId };

            const foundDocument = await Model.find(query);
            if (foundDocument?.length > 0) {
                searchedData[indexName] = foundDocument;
                searchedData["foundInCollections"].push(indexName);
            }
        }

    } catch (err) {
        console.error(JSON.stringify({
            traceId: req?.traceId,
            error: err,
            stack: err?.stack
        }));
    }

    res.send(searchedData);
};


exports.quotationRate = async (req, res, next) => {
    const { fromLocationId, toLocationId, containers, loose, freightType, loadType } = req.body

    const airportmasterModel = mongoose.models[`airportmasterModel`] || mongoose.model(`airportmasterModel`, Schema["airportmaster"], `airportmasters`);
    const PortModel = mongoose.models[`portModel`] || mongoose.model(`portModel`, Schema["port"], `ports`);

    if (loadType !== "ULD Container" && (freightType === "Air" || (loadType === "LCL" && freightType === "Ocean"))) {
        if (freightType === "Air") {
            if (!(loose?.every(loose => loose.packageType === "pallets" || loose.packageType === "boxes"))) {
                res.status(500).send({ error: "packageType should be pallets or boxes for freightType Air" });
                return;
            }
        }

        const PortModel = mongoose.models[`portModel`] || mongoose.model(`portModel`, Schema["port"], `ports`);
        const airportmasterModel = mongoose.models[`airportmasterModel`] || mongoose.model(`airportmasterModel`, Schema["airportmaster"], `airportmasters`);

        let originData;
        let destinationData;

        if (freightType === "Air") {
            await airportmasterModel.findOne({ 'airportmasterId': fromLocationId }).then(async function (foundAirPort) {
                if (foundAirPort)
                    originData = foundAirPort?.toObject();
            })
            await airportmasterModel.findOne({ 'airportmasterId': toLocationId }).then(async function (foundAirPort) {
                if (foundAirPort)
                    destinationData = foundAirPort?.toObject();
            });
        } else {
            await PortModel.findOne({ 'portId': fromLocationId }).then(async function (foundPort) {
                if (foundPort)
                    originData = foundPort?.toObject();
            })
            await PortModel.findOne({ 'portId': toLocationId }).then(async function (foundPort) {
                if (foundPort)
                    destinationData = foundPort?.toObject();
            });
        }

        const legs = [
            {
                "origin": {},
                "destination": {},
                "mode": loadType
            }
        ]

        legs[0]["origin"][freightType === "Air" ? "airportCode" : "unLocationCode"] = freightType === "Air" ? originData?.airPortcode : originData?.portDetails?.description;
        legs[0]["destination"][freightType === "Air" ? "airportCode" : "unLocationCode"] = freightType === "Air" ? destinationData?.airPortcode : destinationData?.portDetails?.description;

        const load = loose.map(data => ({
            quantity: data?.quantity,
            unitType: data?.packageType?.toLowerCase(),
            unitWeightKg: data?.weight,
            unitVolumeCBM: data?.volume
        }))

        let payload = {
            "load": load,
            "legs": legs
        }

        let response = {
            fromLocationName: freightType === "Air" ? originData?.airPortname : originData?.portDetails?.portName,
            toLocationName: freightType === "Air" ? destinationData?.airPortname : destinationData?.portDetails?.portName,
            fromLocationId: freightType === "Air" ? originData?.airportmasterId : originData?.portId,
            toLocationId: freightType === "Air" ? destinationData?.airportmasterId : destinationData?.portId,
            rates: []
        }

        try {
            console.log(JSON.stringify(payload))
            let data = await axios.post(`${process.env.FREIGHTOS_URL}`, payload,
                {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "x-apikey": `${process.env.FREIGHTOS_API_KEY}`
                    }
                }
            )
            if (data.status === 200) {
                const priceEstimateMin = data.data[freightType.toUpperCase()].priceEstimate?.min;
                const priceEstimateMax = data.data[freightType.toUpperCase()].priceEstimate?.max;
                const priceEstimateAverage = (priceEstimateMin + priceEstimateMax) / 2;

                const transitTime = data.data[freightType.toUpperCase()].transitTime;
                const priceEstimate = data.data[freightType.toUpperCase()].priceEstimate;


                response.rates = [
                    {
                        shippingLineName: "",
                        shippingLineId: "",
                        cost: priceEstimateAverage,
                        charges: [],
                        transitTime: transitTime,
                        priceEstimate: priceEstimate,
                        currency: "USD",
                        isCustomDestination: "",
                        isCustomOrigin: ""
                    }
                ]

                res.status(200).send(response)
            }
            else
                res.status(404).send({ error: "No estimates are available!" })
        } catch (e) {
            // console.log(e)
            res.status(404).send({ error: "No estimates are available!" })
        }
    }
    else {
        const user = res.locals.user
        let fromLocationName = "", toLocationName = "";

        const containerRates = {}
        const RateMasterModel = mongoose.models[`RateMasterModel`] || mongoose.model(`RateMasterModel`, Schema["ratemaster"], `ratemasters`);

        for (let i = 0; i < containers.length; i++) {
            const container = containers[i]

            await RateMasterModel.find({ orgId: user.orgId, 'fromLocationId': fromLocationId, 'toLocationId': toLocationId, "containerSize": container.containerSize }).then(async function (ratemasters) {

                if (ratemasters) {
                    for (let j = 0; j < ratemasters.length; j++) {
                        const ratemaster = ratemasters[j]

                        if (!(containerRates.hasOwnProperty(container.containerSize)))
                            containerRates[container.containerSize] = {}

                        if (!(containerRates[container.containerSize].hasOwnProperty(ratemaster.shippinglineId)))
                            containerRates[container.containerSize][ratemaster.shippinglineId] = 0

                        for (let c = 0; c < ratemaster.charges.length; c++) {
                            const charge = ratemaster.charges[c];

                            if (charge.basis === "Suppliers ")
                                containerRates[container.containerSize][ratemaster.shippinglineId] += charge.price
                            else if (charge.basis === "Container Charge")
                                containerRates[container.containerSize][ratemaster.shippinglineId] += charge.price * container.numberOfContainers
                        }
                    }
                }
            })


        }
        const commonIds = Object.keys(containerRates).reduce((common, key, index) => {
            const currentIds = Object.keys(containerRates[key]);
            if (index === 0) {
                return currentIds;
            } else {
                return common.filter(id => currentIds.includes(id));
            }
        }, []);

        // Getting the common IDs, their corresponding keys, and total values
        const commonIdsAndKeys = {};
        for (const key in containerRates) {
            for (const id of commonIds) {
                if (id in containerRates[key]) {
                    if (!commonIdsAndKeys[id]) {
                        commonIdsAndKeys[id] = {
                            keys: [key],
                            totalValue: containerRates[key][id]
                        };
                    } else {
                        commonIdsAndKeys[id].keys.push(key);
                        commonIdsAndKeys[id].totalValue += containerRates[key][id];
                    }
                }
            }
        }

        const dataToBeReturned = await Promise.all(
            Object.entries(commonIdsAndKeys).map(async ([id, value]) => {
                const containerWiseBreakDown = [];

                for (let c = 0; c < value.keys.length; c++) {
                    const conatiner = value.keys[c];
                    const rate = await RateMasterModel.findOne({ orgId: user.orgId, 'fromLocationId': fromLocationId, 'toLocationId': toLocationId, "containerSize": conatiner, shippinglineId: id })

                    containerWiseBreakDown.push({
                        "conatiner": conatiner, "rates": rate.charges.map((charge) => {
                            return {
                                "name": charge.costitemName,
                                "price": charge.basis === "Suppliers " ? charge.price : containers.find((ctf) => ctf.containerSize === conatiner).numberOfContainers * charge.price,
                                "qty": containers.find((ctf) => ctf.containerSize === conatiner).numberOfContainers,
                                "id": charge.chargeName
                            }
                        })
                    })
                }

                const ShippingLineModel = mongoose.models[`ShippingLineModel`] || mongoose.model(`ShippingLineModel`, Schema["shippingline"], `shippinglines`);

                const shippingLine = await ShippingLineModel.findOne({ shippinglineId: id });
                const rate = await RateMasterModel.findOne({ orgId: user.orgId, 'fromLocationId': fromLocationId, 'toLocationId': toLocationId, "containerSize": { "$in": value.keys }, shippinglineId: id })
                const CurrencyModel = mongoose.models[`CurrencyModel`] || mongoose.model(`CurrencyModel`, Schema["currency"], `currencys`);
                const currency = await CurrencyModel.findOne({ currencyId: rate.currencyId })

                let countTotal = 0;
                for (let xe = 0; xe < containerWiseBreakDown.length; xe++) {
                    countTotal += containerWiseBreakDown[xe].rates.map(re => re.price).reduce((partialSum, a) => partialSum + a, 0) || 0
                }

                return {
                    "shippingLineName": shippingLine.name || 'Unknown',
                    "shippingLineId": shippingLine.shippinglineId || 'Unknown',
                    "cost": countTotal,
                    "charges": containerWiseBreakDown,
                    "cargoType": rate?.cargoType,
                    "currency": currency?.currencyName || "INR",
                    "isCustomDestination": rate?.isCustomDestination,
                    "isCustomOrigin": rate?.isCustomOrigin
                };
            })
        );

        // const dataToBeReturned = await Promise.all(
        //     Object.entries(commonIdsAndKeys).map(async ([id, value]) => {

        //         return {
        //             "shippingLineName": shippingLine.name || 'Unknown',
        //             "cost": value.totalValue
        //         };
        //     })
        // );

        // const PortModel = mongoose.models[`PortModel`] || mongoose.model(`PortModel`, Schema["port"], `ports`);
        // await PortModel.findOne({ 'portId': fromLocationId }).then(async function (port) {
        //     fromLocationName = port?.portDetails.portName
        // })

        // await PortModel.findOne({ 'portId': toLocationId }).then(async function (port) {
        //     toLocationName = port?.portDetails.portName
        // })

        let originData;
        let destinationData;

        if (freightType === "Air") {
            await airportmasterModel.findOne({ 'airportmasterId': fromLocationId }).then(async function (foundAirPort) {
                if (foundAirPort)
                    originData = foundAirPort;
            })
            await airportmasterModel.findOne({ 'airportmasterId': toLocationId }).then(async function (foundAirPort) {
                if (foundAirPort)
                    destinationData = foundAirPort;
            });
        } else {
            await PortModel.findOne({ 'portId': fromLocationId }).then(async function (foundPort) {
                if (foundPort)
                    originData = foundPort;
            })
            await PortModel.findOne({ 'portId': toLocationId }).then(async function (foundPort) {
                if (foundPort)
                    destinationData = foundPort;
            });
        }

        fromLocationName = freightType === "Air" ? originData?.airPortname : originData?.portDetails?.portName
        toLocationName = freightType === "Air" ? destinationData?.airPortname : destinationData?.portDetails?.portName

        res.send({ fromLocationName: fromLocationName, toLocationName: toLocationName, fromLocationId: fromLocationId, toLocationId: toLocationId, rates: dataToBeReturned, })
    }
}

exports.findRateFreightos = async (req, res, next) => {
    const { fromLocationId, toLocationId, mode, load } = req.body

    const PortModel = mongoose.models[`PortModel`] || mongoose.model(`PortModel`, Schema["port"], `ports`);

    let originData;
    let destinationData;

    if (!(mode === "AIR" || mode === "OCEAN"))
        res.status(500).send({ error: "mode must be either 'AIR' or 'OCEAN'" })
    else if (load.length != 1) {
        res.status(500).send({ error: "load must only 1!" })
    } else {
        await PortModel.findOne({ 'portId': fromLocationId }).then(async function (port) {
            originData = port
        })
        await PortModel.findOne({ 'portId': toLocationId }).then(async function (port) {
            destinationData = port
        })


        let legs = [
            {
                "origin": {},
                "destination": {},
                "mode": mode
            }
        ]

        legs[0]["origin"][`${mode === "AIR" ? "airportCode" : "unLocationCode"}`] = originData?.portDetails?.locationCode
        legs[0]["destination"][`${mode === "AIR" ? "airportCode" : "unLocationCode"}`] = destinationData?.portDetails?.locationCode

        const payload = {
            "load": load,
            "legs": legs
        }

        try {
            let data = await axios.post(
                `https://sandbox.freightos.com/api/v1/freightEstimates`,
                payload,
                {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "x-apikey": "2HzuELiBAqHwiQAHRHqwztOzXANbct5y"
                    }
                }
            )

            if (data.status === 200) {
                res.status(200).send(data.data)
            } else {
                res.status(404).send({ error: "no estimates are available!" })
            }
        } catch (e) {
            res.status(404).send({ error: "no estimates are available!" })
        }
    }
}

exports.exchangeRate = async (req, res, next) => {
    try {
        const exchangerateModel = mongoose.models.exchangerateModel || mongoose.model('exchangerateModel', Schema["exchangerate"], 'exchangerates');
        let exchangerateData = await exchangerateModel.findOne({ date: new Date().toISOString().split('T')[0] })
        if (!exchangerateData) {
            let config = {
                method: 'get',
                url: `https://v6.exchangerate-api.com/v6/${process.env.CURRENCY_EXCHANGE_AUTHORIZATION}/latest/USD/`,
            };

            let exchangeRequest = await axios.request(config);
            if (exchangeRequest.status === 200) {
                let dataToAdd = {}
                dataToAdd["date"] = new Date().toISOString().split('T')[0]
                dataToAdd["conversionRates"] = exchangeRequest.data.conversion_rates
                dataToAdd["exchangerateId"] = uuid.v4()

                await exchangerateModel(dataToAdd).save().then((savedDocument) => {
                })
                exchangerateData = dataToAdd
            }
        }

        const rates = exchangerateData.conversionRates;

        const dataToBeReturned = {}
        dataToBeReturned[req.body.toCurrency] = 1 * rates[req.body.toCurrency] / rates[req.body.fromCurrency]

        res.status(200).send(dataToBeReturned)
    } catch (e) {
        res.status(500).send({ error: e })
    }
}

exports.milestoneWiseJobCount = async (req, res, next) => {
    const query = req.body.query;

    const milestonemasterModel = mongoose.models[`milestonemasterModel`] || mongoose.model(`milestonemasterModel`, Schema["milestonemaster"], `milestonemasters`);
    const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);

    if (!req.body.query.flowType) {
        return res.status(500).send({
            error: "Please add flowType in body!"
        })
    }

    const user = res.locals.user

    let milestones = await milestonemasterModel.find({
        flowType: {
            $in: [req.body.query.flowType.toLowerCase(), req.body.query.flowType]
        },
        loadType: req?.body?.query?.loadType,
        freightTypeName: req?.body?.query?.shipmentType,
        orgId: user.orgId
    })

    const condition = {
        orgId: user.orgId
    }

    if (query?.to && query?.from) {
        condition["createdOn"] = {
            "$lt": query?.to,
            "$gt": query?.from
        }
    }

    if (req?.body?.query?.loadType) {
        condition["enquiryDetails.basicDetails.loadType"] = req?.body?.query?.loadType
    }

    const result = await batchModel.aggregate([
        {
            $match: condition
        },
        {
            $group: {
                _id: "$statusOfBatch", // Group by statusOfBatch
                count: { $sum: 1 }     // Count each group
            }
        },
        {
            $sort: { count: -1 }     // Optional: Sort by count descending
        }
    ]);

    milestones = Array.from(
        new Map(milestones.map(e => [e.mileStoneName, e])).values()
    ).map((e) => {
        const { mileStoneName, jobCount, ...other } = e;

        return {
            mileStoneName: `${mileStoneName} Pending`,
            seq: e.seq,
            mileStoneId: e.milestonemasterId,
            jobCount: result?.find(r => r?._id === `${mileStoneName} Pending`)?.count || 0
        }
    }).sort((a, b) => a.seq - b.seq);


    res.status(200).send(milestones)
}

exports.locationWiseContainers = async (req, res, next) => {
    const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
    const containerModel = mongoose.models[`containerModel`] || mongoose.model(`containerModel`, Schema["container"], `containers`);
    const eventModel = mongoose.models.eventModel || mongoose.model('eventModel', Schema["event"], 'events');
    const containereventModel = mongoose.models.containereventModel || mongoose.model('containereventModel', Schema["containerevent"], 'containerevents');

    if (!req?.body?.query?.flowType) {
        return res.status(500).send({
            error: "Please add flowType in body!"
        })
    }

    const user = res.locals.user

    const batchDataFromEvent = await eventModel.aggregate([
        {
            $match: {
                orgId: user.orgId,
                eventName: "POD Arrival", // Match milestones with name "POD Arrival"
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
    const batchCondition = {
        batchId: {
            $in: batchIds
        },
        statusOfBatch: { $ne: "Job Closed" }
    }

    if (req?.body?.query?.partymasterId) {
        batchCondition["$or"] = [
            {
                "enquiryDetails.basicDetails.shipperId": req?.body?.query?.partymasterId
            },
            {
                "enquiryDetails.basicDetails.consigneeId": req?.body?.query?.partymasterId
            }
        ]
    }

    const batchData = await batchModel.find(batchCondition)

    const conatinersData = await containerModel.find(
        {
            batchId: {
                $in: batchData?.map(e => e.batchId)
            }
        }
    )

    const conatinerEventsData = await containereventModel.find(
        {
            batchId: {
                $in: batchData?.map(e => e.batchId)
            }
        }
    )

    const batchDataWithContainers = batchData.map(
        (e) => {
            return {
                batchNo: e.batchNo,
                batchId: e.batchId,
                containers: conatinersData.filter(b => b.batchId === e.batchId).map(c => {
                    return {
                        containerNumber: c.containerNumber,
                        events: conatinerEventsData.filter(ce => ce.containerNumber === c.containerNumber).map(ce => {
                            const { serialno, eventname, currentlocation, timestamptimezone, latitude, longitude, transportmode } = ce;
                            return {
                                serialno,
                                eventname,
                                currentlocation,
                                timestamptimezone,
                                latitude,
                                longitude,
                                transportmode
                            }
                        })
                    }
                })
            }
        }
    )

    res.status(200).send(batchDataWithContainers)
}

exports.fetchPortLocation = async (req, res, next) => {
    const user = res.locals.user

    const locationModel = mongoose.models[`locationModel`] || mongoose.model(`locationModel`, Schema['location'], `locations`);
    const portModel = mongoose.models[`portModel`] || mongoose.model(`portModel`, Schema['port'], `ports`);

    const sort = {};

    let locationQuery = {
        orgId: user.orgId,
        "status": true,
        "masterType": {
            "$in": [
                "YARD",
                "CFS",
                "ICD"
            ]
        }
    };
    let portQuery = {
        "status": true
    };

    if (req.body.query.locationName) {
        locationQuery["locationName"] = req.body.query.locationName
        portQuery["portDetails.portName"] = req.body.query.locationName
    }


    if (req.body.query.locationId) {
        locationQuery["locationId"] = req.body.query.locationId
        portQuery["portId"] = req.body.query.locationId
    }

    for (let i = 0; i < req.body?.sort?.asc?.length; i++) {
        sort[req.body.sort.asc[i]] = 1;
    }

    for (let i = 0; i < req.body?.sort?.desc?.length; i++) {
        sort[req.body.sort.desc[i]] = -1;
    }

    let locations = await locationModel.find(locationQuery, null, { "sort": sort, "skip": req.body?.from || 0, "limit": (req.body?.size || 100) / 2 })
    let ports = await portModel.find(portQuery, null, { "sort": sort, "skip": req.body?.from || 0, "limit": (req.body?.size || 100) / 2 })


    if (locations)
        locations = locations?.map(e => e?.toObject())?.map((e) => {
            return {
                locationName: e?.locationName,
                locationId: e?.locationId,
                locationType: e?.masterType
            }
        })

    if (ports)
        ports = ports?.map(e => e?.toObject())?.map((e) => {
            return {
                locationName: e?.portDetails.portName,
                locationId: e?.portId,
                locationType: "port"
            }
        })

    const allCombinedPlace = [...locations, ...ports];

    const locationCount = await locationModel.countDocuments(locationQuery);
    const portCount = await portModel.countDocuments(portQuery);

    const totalCount = locationCount + portCount;

    res.send({ "documents": allCombinedPlace, "totalCount": totalCount })
}

exports.containerLocationTrack = async (req, res, next) => {
    const user = res.locals.user
    const cNumber = req.params.number;

    if (!cNumber)
        return res.status(500).send({ error: "Please add container number!" })

    const payload = {
        route: true,
        number: cNumber,
        api_key: process.env.SEARATE_API_KEY
    }

    let data = await axios.get(
        `https://tracking.searates.com/tracking`,
        { params: payload },
        {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        }
    )

    if (data.status === 200) {
        res.status(200).send(data.data)
    } else {
        res.status(404).send({ error: "no estimates are available!" })
    }
}


async function extractData(modelName, jsonSchema, systemInstruction, file, text) {
    const modelUsage = {};
    try {
        const modelConfig = {}

        if (jsonSchema)
            modelConfig["generationConfig"] = {
                responseMimeType: "application/json",
                responseSchema: jsonSchema
            }

        modelUsage["modelConfig"] = modelConfig

        if (systemInstruction)
            modelUsage["systemInstruction"] = systemInstruction

        modelUsage["modelName"] = modelName

        if (systemInstruction)
            modelConfig["systemInstruction"] = systemInstruction

        const model = genAI.getGenerativeModel({
            model: modelName,
            ...modelConfig
        });

        const processed_input = [];

        processed_input.push({
            inlineData: {
                mimeType: file.mimetype,
                data: Buffer.from(file.buffer).toString('base64'),
            }
        })

        result = await model.generateContent([
            ...processed_input,
            {
                text: text
            }
        ]);

        modelUsage["modelInput"] = [
            ...processed_input,
            {
                text: text
            }
        ]

        const textResponse = result.response.text()
        const data = JSON.parse(textResponse)

        modelUsage["modelResponse"] = textResponse
        modelUsage["modelParsedResponse"] = data
        modelUsage["tokenUsage"] = result?.response?.usageMetadata

        return {
            usageMetadata: result?.response?.usageMetadata,
            jsonData: data,
            status: 200,
            modelUsage
        }
    } catch (error) {
        console.log(error);

        return {
            error: error,
            status: 500,
            modelUsage
        }
    }
}

const containerAndLoadDetails = {
    "type": "object",
    "properties": {
        "containers": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "containerNo": {
                        "type": "string",
                        "nullable": false
                    },
                    "containerType": {
                        "type": "string",
                        "enum": ["20 Flat Rack", "20 Open Top", "20 Reefer", "20 Standard Dry", "40 Flat Rack", "40 High Cube", "40 Reefer", "40 Standard Dry"],
                        "nullable": false
                    },
                    "sealNo": {
                        "type": "string",
                        "nullable": false
                    },
                    "grossWeight": {
                        "type": "number",
                        "nullable": false
                    },
                    "unitGrossWeight": {
                        "type": "string",
                        "enum": ["KG", "FT", "Ton", "mm", "MT", "CM", "LTR"],
                        "nullable": false
                    },
                    "netWeight": {
                        "type": "number",
                        "nullable": false
                    },
                    "unitNetWeight": {
                        "type": "string",
                        "enum": ["KG", "FT", "Ton", "mm", "MT", "CM", "LTR"],
                        "nullable": false
                    },
                    "noOfPackage": {
                        "type": "number",
                        "nullable": false
                    },
                    "packageType": {
                        "type": "string",
                        "enum": ["PALLETS", "BALES", "SETS", "BAGS", "ROLLS", "CARTONS", "PACKAGES", "Bulk Bag", "Bulk", "Bucket", "Bottle", "box"],
                        "nullable": false
                    },
                    "cbm": {
                        "type": "number",
                        "nullable": false
                    }
                },
                "required": ["containerNo", "containerType", "sealNo", "grossWeight", "unitGrossWeight", "netWeight", "unitNetWeight", "noOfPackage", "packageType", "cbm"]
            }
        },
        "loads": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "descriptionOfPackge": {
                        "type": "string",
                        "nullable": false
                    },
                    "hsCode": {
                        "type": "string",
                        "nullable": false
                    }
                },
                "required": ["descriptionOfPackge", "hsCode"]
            }
        }
    },
    "required": ["containers", "loads"]
}

let generalDetails = {
    "type": "object",
    "properties": {
        "blNo": {
            "type": "string",
            "nullable": false
        },
        "freightTerm": {
            "type": "string",
            "enum": ["Collect", "Prepaid"],
            "nullable": false
        },
        "blDate": {
            "type": "string",
            "nullable": false
        },
        "shipperName": {
            "type": "string",
            "nullable": false
        },
        "shipperAddress": {
            "type": "string",
            "nullable": false
        },
        "consigneeName": {
            "type": "string",
            "nullable": false
        },
        "consigneeAddress": {
            "type": "string",
            "nullable": false
        },
        "isNotifyPartySameAsCosignee": {
            "type": "boolean",
            "nullable": false
        },
        notifyPartyName: {
            "type": "string",
            "nullable": false
        },
        notifyPartyAddress: {
            "type": "string",
            "nullable": false
        },
        blType: {
            "type": "string",
            "enum": ["HBL", "MBL"],
            "nullable": false
        },
        portOfLoading: {
            "type": "string",
            "nullable": false
        },
        portOfDischarge: {
            "type": "string",
            "nullable": false
        },
        portOfLoadingCountry: {
            "type": "string",
            "nullable": false
        },
        portOfDischargeCountry: {
            "type": "string",
            "nullable": false
        },
        placeOfDelivery: {
            "type": "string",
            "nullable": false
        },
        placeOfDeliveryCountry: {
            "type": "string",
            "nullable": false
        },
        shippingLine: {
            "type": "string",
            "nullable": false,
            "enum": ["Collect", "Other"],
        },
        voyage: {
            "type": "string",
            "nullable": false
        },
        vessel: {
            "type": "string",
            "nullable": false,
            "enum": []
        },
    },
    "required": ["blNo", "freightTerm", "blDate", "shipperName", "shipperAddress", "consigneeName", "consigneeAddress", "isNotifyPartySameAsCosignee", "blType", "portOfLoading", "portOfDischarge", "portOfLoadingCountry", "portOfDischargeCountry", "placeOfDelivery", "placeOfDeliveryCountry", "shippingLine", "voyage", "vessel"]
}

const branchObject = {
    "type": "object",
    "properties": {
        "shipperBranch": {
            "type": "string",
        },
        "consigneeBranch": {
            "type": "string",
        }
    },
    "required": ["shipperBranch", "consigneeBranch"]
};

const docTypeSchema = {
    "type": "object",
    "properties": {
        "documentType": {
            "type": "string",
            "enum": ["BL", "Debit Note", "Invoice", "Packing List", "Other"]
        }
    },
    "required": ["documentType"]
};

async function detectDocumentType(file) {
    const result = await extractData(
        "gemini-1.5-flash",
        docTypeSchema,
        "Identify the type of this shipping document. If it is a Bill of Lading, return BL. If it's a Debit Note, Invoice, or Packing List, return that. Otherwise return Other.",
        file,
        "Classify this document type in JSON"
    );

    if (result.status === 200 && result.jsonData) {
        return result.jsonData.documentType;
    } else if (result.status === 429) {
        console.log("Token limit exceeded!");
    }
    return "Other";
}

async function findClosestParty(inputName, filter = {}, partymasterModel, threshold = 0.7) {
    if (!inputName) return null;

    const allParties = await partymasterModel.find(filter).lean();
    if (!allParties.length) return null;

    const names = allParties.map(p => p.name);
    const matches = stringSimilarity.findBestMatch(inputName, names);

    const best = matches.bestMatch;
    if (best.rating < threshold) return null; // no good match found

    return allParties.find(p => p.name === best.target) || null;
}

async function findClosestPort(inputName, filter = {}, portModel, threshold = 0.7) {
    if (!inputName) return null;

    const allPorts = await portModel.find(filter, { "portDetails.portName": 1, portId: 1 }).lean();
    if (!allPorts.length) return null;

    // Normalize input for case-insensitive comparison
    const inputLower = inputName.toLowerCase();

    // Create mapping for original names
    const nameMap = allPorts.map(p => ({
        portId: p.portId,
        portName: p.portDetails?.portName,
        nameLower: p.portDetails?.portName?.toLowerCase()
    })).filter(p => p.nameLower);

    // Compare using lowercase
    const matches = stringSimilarity.findBestMatch(inputLower, nameMap.map(p => p.nameLower));

    const best = matches.bestMatch;
    if (best.rating < threshold) return null;

    // Get the matched original port details
    const closestPort = nameMap.find(p => p.nameLower === best.target);
    if (!closestPort) return null;

    return {
        portId: closestPort.portId,
        portName: closestPort.portName,
        similarity: best.rating // optional, if you want confidence
    };
}

async function findClosestPlace(inputName, { locationModel, portModel, filterLocation = {}, filterPort = {}, threshold = 0.7 }) {
    if (!inputName) return null;

    // Fetch both locations & ports
    const [allLocations, allPorts] = await Promise.all([
        locationModel.find(filterLocation, { locationName: 1, locationId: 1, masterType: 1 }).lean(),
        portModel.find(filterPort, { "portDetails.portName": 1, portId: 1 }).lean()
    ]);

    if (!allLocations.length && !allPorts.length) return null;

    const inputLower = inputName.toLowerCase();

    // Normalize and merge locations
    const mappedLocations = allLocations.map(l => ({
        id: l.locationId,
        name: l.locationName,
        type: l.masterType,
        nameLower: l.locationName?.toLowerCase()
    })).filter(l => l.nameLower);

    // Normalize and merge ports
    const mappedPorts = allPorts.map(p => ({
        id: p.portId,
        name: p.portDetails?.portName,
        type: "port",
        nameLower: p.portDetails?.portName?.toLowerCase()
    })).filter(p => p.nameLower);

    // Merge both
    const allPlaces = [...mappedLocations, ...mappedPorts];
    if (!allPlaces.length) return null;

    // Compare using lowercase
    const matches = stringSimilarity.findBestMatch(inputLower, allPlaces.map(p => p.nameLower));
    const best = matches.bestMatch;
    if (best.rating < threshold) return null;

    // Get the matched original details
    const closest = allPlaces.find(p => p.nameLower === best.target);
    if (!closest) return null;

    return {
        locationId: closest.id,
        locationName: closest.name,
        locationType: closest.type,
        similarity: best.rating // optional
    };
}

async function findClosestSystemType(inputName, filter = {}, systemtypeModel, threshold = 0.7) {
    if (!inputName) return null;

    const allSystemTypes = await systemtypeModel.find(filter, { "typeName": 1, systemtypeId: 1 }).lean();
    if (!allSystemTypes.length) return null;

    // Normalize input for case-insensitive comparison
    const inputLower = inputName.toLowerCase();

    // Create mapping for original names
    const nameMap = allSystemTypes.map(p => ({
        systemtypeId: p.systemtypeId,
        typeName: p?.typeName,
        nameLower: p?.typeName?.toLowerCase()
    })).filter(p => p.nameLower);

    // Compare using lowercase
    const matches = stringSimilarity.findBestMatch(inputLower, nameMap.map(p => p.nameLower));

    const best = matches.bestMatch;
    if (best.rating < threshold) return null;

    // Get the matched original port details
    const closestSystemType = nameMap.find(p => p.nameLower === best.target);
    if (!closestSystemType) return null;

    return {
        systemtypeId: closestSystemType.systemtypeId,
        typeName: closestSystemType.typeName,
        similarity: best.rating // optional, if you want confidence
    };
}

async function findClosestShippingLine(inputName, filter = {}, shippingLineModel, threshold = 0.7) {
    if (!inputName) return null;

    const allShippingLine = await shippingLineModel.find(filter, { "name": 1, shippinglineId: 1 }).lean();
    if (!allShippingLine.length) return null;

    // Normalize input for case-insensitive comparison
    const inputLower = inputName.toLowerCase();

    // Create mapping for original names
    const nameMap = allShippingLine.map(p => ({
        shippinglineId: p.shippinglineId,
        name: p?.name,
        nameLower: p?.name?.toLowerCase()
    })).filter(p => p.nameLower);

    // Compare using lowercase
    const matches = stringSimilarity.findBestMatch(inputLower, nameMap.map(p => p.nameLower));

    const best = matches.bestMatch;
    if (best.rating < threshold) return null;

    // Get the matched original port details
    const closestShippingLine = nameMap.find(p => p.nameLower === best.target);
    if (!closestShippingLine) return null;

    return {
        shippinglineId: closestShippingLine.shippinglineId,
        name: closestShippingLine.name,
        similarity: best.rating // optional, if you want confidence
    };
}

async function findClosestVessel(inputName, filter = {}, vesselModel, threshold = 0.7) {
    if (!inputName) return null;

    const allVessel = await vesselModel.find(filter, { "vesselName": 1, vesselId: 1 }).lean();
    if (!allVessel.length) return null;

    // Normalize input for case-insensitive comparison
    const inputLower = inputName.toLowerCase();

    // Create mapping for original names
    const nameMap = allVessel.map(p => ({
        vesselId: p.vesselId,
        vesselName: p?.vesselName,
        nameLower: p?.vesselName?.toLowerCase()
    })).filter(p => p.nameLower);

    // Compare using lowercase
    const matches = stringSimilarity.findBestMatch(inputLower, nameMap.map(p => p.nameLower));

    const best = matches.bestMatch;
    if (best.rating < threshold) return null;

    // Get the matched original port details
    const closestVessel = nameMap.find(p => p.nameLower === best.target);
    if (!closestVessel) return null;

    return {
        vesselId: closestVessel.vesselId,
        vesselName: closestVessel.vesselName,
        similarity: best.rating // optional, if you want confidence
    };
}

async function findClosestCharge(inputName, filter = {}, costitemModel, threshold = 0.7) {
    if (!inputName) return null;

    const allCostItem = await costitemModel.find(filter).lean();
    if (!allCostItem.length) return null;

    // Normalize input for case-insensitive comparison
    const inputLower = inputName.toLowerCase();

    // Create mapping for original names
    const nameMap = allCostItem.map(p => ({
        costitemId: p.costitemId,
        costitemName: p?.costitemName,
        nameLower: p?.costitemName?.toLowerCase()
    })).filter(p => p.nameLower);

    // Compare using lowercase
    const matches = stringSimilarity.findBestMatch(inputLower, nameMap.map(p => p.nameLower));

    const best = matches.bestMatch;
    if (best.rating < threshold) return null;

    // Get the matched original port details
    const closestCostItem = nameMap.find(p => p.nameLower === best.target);
    if (!closestCostItem) return null;

    const foundCostItem = allCostItem.find(p => p.costitemId === closestCostItem.costitemId) || {}
    return {
        costitemId: closestCostItem.costitemId,
        costitemName: closestCostItem.costitemName,
        similarity: best.rating, // optional, if you want confidence
        ...foundCostItem
    };
}

exports.scanBl = async (req, res, next) => {
    const user = res.locals.user
    const agent = res.locals.agent;

    try {
        const modelUsage = [];

        const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema['batch'], `batchs`);
        const partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, Schema['partymaster'], `partymasters`);
        const blscanningModel = mongoose.models[`blscanningModel`] || mongoose.model(`blscanningModel`, Schema['blscanning'], `blscannings`);
        const portModel = mongoose.models[`portModel`] || mongoose.model(`portModel`, Schema['port'], `ports`);
        const locationModel = mongoose.models[`locationModel`] || mongoose.model(`locationModel`, Schema['location'], `locations`);
        const containerModel = mongoose.models[`containerModel`] || mongoose.model(`containerModel`, Schema['container'], `containers`);
        const systemtypeModel = mongoose.models[`systemtypeModel`] || mongoose.model(`systemtypeModel`, Schema['systemtype'], `systemtypes`);
        const shippinglineModel = mongoose.models[`shippinglineModel`] || mongoose.model(`shippinglineModel`, Schema['shippingline'], `shippinglines`);
        const vesselModel = mongoose.models[`vesselModel`] || mongoose.model(`vesselModel`, Schema['vessel'], `vessels`);
        const blModel = mongoose.models[`blModel`] || mongoose.model(`blModel`, Schema['bl'], `bls`);
        const agentModel = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, Schema['agent'], `agents`);



        if (agent?.blCredit > 0) {
            const errors = [];

            const fileData = {};
            const timing = {};

            timing["requestStartsOn"] = new Date().toISOString();

            const scanningId = uuid.v4()

            timing["fileUploadStartsOn"] = new Date().toISOString();

            fileData.documentType = req.file.mimetype
            fileData.fileName = `${scanningId}-${req.body?.name}`
            fileData.size = req.file.size
            fileData.documentName = req.body?.name
            fileData.uploadedOn = new Date().toISOString();

            const response = await azureStorage.uploadFile(fileData.fileName, req.file);
            if (response.status === 200) {
                fileData.uploadedBlobName = response?.name
                fileData.azureRequestId = response?.requestId
                fileData.uploadedStatus = response?.status
            } else {
                fileData.error = response?.error
                fileData.uploadedStatus = response?.status
            }

            timing["fileUploadEndsOn"] = new Date().toISOString();

            timing["fileTypeDetectionStartsOn"] = new Date().toISOString();
            const docType = await detectDocumentType(req.file);

            timing["fileTypeDetectionEndsOn"] = new Date().toISOString();

            if (docType !== "BL") {
                console.log("Detect type of file:", docType);

                return res.status(400).json({
                    status: "ignored",
                    message: `Attachment skipped because it's not a Bill of Lading (detected: ${docType})`
                });
            }
            const { batchId } = req.body;

            let batchData = await batchModel.findOne({ batchId: batchId });
            if (batchData) batchData = batchData?.toObject();
            let containersFromBatch = await containerModel.find({
                "$or": [
                    {
                        "batchId": batchId
                    },
                    {
                        "batchwiseGrouping.batchId": batchId
                    }
                ]
            })

            let vessels = await vesselModel.find({ orgId: user.orgId })
            if (vessels)
                vessels = vessels?.map(e => e?.toObject())

            let bls = await blModel.find({
                $or: [
                    { batchId: batchId },
                    { 'consolidatedJobs.batchId': batchId }
                ]
            })

            if (bls)
                bls = bls?.map(e => e?.toObject())

            let shippingLine = await shippinglineModel.find({ shippinglineId: batchData?.quotationDetails?.carrierId })
            if (shippingLine)
                shippingLine = shippingLine?.map(e => e?.toObject());

            let systemtypes = await systemtypeModel?.find({ typeCategory: "freightChargeTerm" })
            if (systemtypes)
                systemtypes = systemtypes?.map(e => e?.toObject());

            if (containersFromBatch)
                containersFromBatch = containersFromBatch?.map(e => e?.toObject());

            const blData = {};
            const usageData = {};

            timing["containerDetectionStartsOn"] = new Date().toISOString();
            // ---- Container & Load Data ----
            const containerData = await extractData(
                "gemini-1.5-flash",
                containerAndLoadDetails,
                "if net weight is not there in document then consider gross weight as net weight",
                req.file,
                "look this above bl and give me all data regarding container and load in json"
            );
            timing["containerDetectionEndsOn"] = new Date().toISOString();

            modelUsage.push({ ...containerData?.modelUsage, usedFor: "containerData" })

            if (containerData.status === 200 && containerData.jsonData) {
                blData["containerData"] = containerData.jsonData;
                usageData["containerData"] = containerData.usageMetadata;
            }

            if (blData?.containerData?.containers) {
                blData["containerData"]["containers"] = blData["containerData"]["containers"].map((e) => {
                    const matchedContainer = containersFromBatch?.find(c => c.containerNumber === e?.containerNo)

                    return {
                        containerId: matchedContainer?.containerId,
                        ...e,
                    }
                })
            } else {
                errors.push(
                    {
                        message: "No container has been detected!"
                    }
                )
            }

            // ---- General Data ----
            generalDetails["properties"]["shippingLine"]["enum"] = [...shippingLine?.map(e => e.name), "other"]
            generalDetails["properties"]["freightTerm"]["enum"] = systemtypes?.map(e => e?.typeName)
            generalDetails["properties"]["vessel"]["enum"] = vessels.map(e => e?.vesselName)
            timing["GeneralDataDetectionStartsOn"] = new Date().toISOString();
            const generalData = await extractData(
                "gemini-1.5-flash",
                generalDetails,
                null,
                req.file,
                `look this above bl and give me all general data in json, FileName : ${req.body?.name}`
            );
            timing["GeneralDataDetectionEndsOn"] = new Date().toISOString();

            modelUsage.push({ ...generalData?.modelUsage, usedFor: "generalData" })

            if (generalData.status === 200 && generalData.jsonData) {
                blData["generalData"] = generalData.jsonData;
                usageData["generalData"] = generalData.usageMetadata;
            } else {
                console.log(JSON.stringify(generalData));

            }

            // ---- Party Master Linking ----
            let shipperData, consigneeData, notifyPartyData;

            if (blData?.generalData?.shipperName) {
                const filter = { "customerType.item_text": "Shipper" }
                shipperData = await findClosestParty(blData.generalData.shipperName, filter, partymasterModel);
                if (shipperData) {
                    blData.generalData["shipperId"] = shipperData.partymasterId;
                }
            } else
                errors.push(
                    {
                        message: "No shipper has been detected!"
                    }
                )

            if (blData?.generalData?.consigneeName) {
                const filter = { "customerType.item_text": "Consignee" }
                consigneeData = await findClosestParty(blData.generalData.consigneeName, filter, partymasterModel);
                if (consigneeData) {
                    blData.generalData["consigneeId"] = consigneeData.partymasterId;
                }
            } else
                errors.push(
                    {
                        message: "No consignee has been detected!"
                    }
                )

            if ((!(blData?.generalData?.isNotifyPartySameAsCosignee)) && blData.generalData?.notifyPartyName) {
                const filter = {}
                notifyPartyData = await findClosestParty(blData.generalData.notifyPartyName, filter, partymasterModel);
                if (notifyPartyData) {
                    blData.generalData["notifyPartyId"] = notifyPartyData.partymasterId;
                }
            }

            if (blData?.generalData?.freightTerm) {
                const filter = { typeCategory: "freightChargeTerm" }
                let freightChargeTerm = await findClosestSystemType(blData?.generalData?.freightTerm, filter, systemtypeModel);
                if (freightChargeTerm) {
                    blData.generalData["freightTermId"] = freightChargeTerm?.systemtypeId;
                }
            } else
                errors.push(
                    {
                        message: "No freight term has been detected!"
                    }
                )

            if (blData?.generalData?.shippingLine) {
                const filter = { orgId: user?.orgId }
                let detectedShippingLine = await findClosestShippingLine(blData?.generalData?.shippingLine, filter, shippinglineModel);
                if (detectedShippingLine) {
                    blData.generalData["shippingLineId"] = detectedShippingLine?.shippinglineId;
                }
            } else
                errors.push(
                    {
                        message: "No shipping-line has been detected!"
                    }
                )

            if (blData?.generalData?.vessel) {
                const filter = { orgId: user?.orgId }
                let detectedVessel = await findClosestVessel(blData?.generalData?.vessel, filter, vesselModel);
                if (detectedVessel) {
                    blData.generalData["vesselId"] = detectedVessel?.vesselId;
                    blData.generalData["imoNo"] = vessels?.find(e => e.vesselId === detectedVessel?.vesselId)?.imoNo
                }
            } else
                errors.push(
                    {
                        message: "No vessel has been detected!"
                    }
                )

            // ---- Build Branch Object Dynamically ----
            const dynamicBranchObject = JSON.parse(JSON.stringify(branchObject)); // clone

            if (shipperData?.branch?.length > 0)
                dynamicBranchObject.properties.shipperBranch["enum"] = shipperData.branch.map(e => e.branch_name);

            if (consigneeData?.branch?.length > 0)
                dynamicBranchObject.properties.consigneeBranch["enum"] = consigneeData.branch.map(e => e.branch_name);

            if ((!(blData?.generalData?.isNotifyPartySameAsCosignee)) && notifyPartyData?.branch?.length > 0) {
                dynamicBranchObject.properties["notifyPartyBranch"] = {
                    "type": "string",
                    "enum": notifyPartyData.branch.map(e => e.branch_name)
                };
                dynamicBranchObject.required.push("notifyPartyBranch");
            }

            // ---- Branch Data ----
            timing["branchDataDetectionStartsOn"] = new Date().toISOString();
            const branchData = await extractData(
                "gemini-1.5-flash",
                dynamicBranchObject,
                null,
                req.file,
                "look this above bl and give me all branch data in json"
            );
            timing["branchDataDetectionEndsOn"] = new Date().toISOString();

            modelUsage.push({ ...branchData?.modelUsage, usedFor: "branchData" })

            if (branchData.status === 200 && branchData.jsonData) {
                blData["branchData"] = branchData.jsonData;
                usageData["branchData"] = branchData.usageMetadata;
            }

            // ---- Handle Notify Party = Consignee ----
            if (blData?.generalData?.isNotifyPartySameAsCosignee) {
                blData["branchData"]["notifyPartyBranch"] = blData?.branchData?.consigneeBranch;
                blData["generalData"]["notifyPartyName"] = blData?.generalData?.consigneeName;
                blData["generalData"]["notifyPartyAddress"] = blData?.generalData?.consigneeAddress;
                blData["generalData"]["notifyPartyId"] = blData?.generalData?.consigneeId;
            }

            if (blData?.generalData?.portOfLoading) {
                const extractedPol = await findClosestPort(blData?.generalData?.portOfLoading, {}, portModel)
                blData["generalData"]["portOfLoadingId"] = extractedPol?.portId
                blData["generalData"]["portOfLoadingName"] = extractedPol?.portName
                blData["generalData"]["portOfLoadingSimilarity"] = extractedPol?.similarity
            }

            if (blData?.generalData?.portOfDischarge) {
                const extractedPod = await findClosestPort(blData?.generalData?.portOfDischarge, {}, portModel)
                blData["generalData"]["portOfDischargeId"] = extractedPod?.portId
                blData["generalData"]["portOfDischargeName"] = extractedPod?.portName
                blData["generalData"]["portOfDischargeSimilarity"] = extractedPod?.similarity
            }

            if (blData?.generalData?.placeOfDelivery) {
                const extractedLocation = await findClosestPlace(blData?.generalData?.placeOfDelivery, {
                    locationModel,
                    portModel,
                    filterLocation: { status: true },
                    filterPort: { status: true }
                })
                blData["generalData"]["placeOfDeliveryId"] = extractedLocation?.locationId
                blData["generalData"]["placeOfDeliveryName"] = extractedLocation?.locationName
                blData["generalData"]["placeOfDeliveryType"] = extractedLocation?.locationType
                blData["generalData"]["placeOfDeliverySimilarity"] = extractedLocation?.similarity
            }

            timing["requestEndsOn"] = new Date().toISOString();

            let balanceContainerList = [];
            balanceContainerList = containersFromBatch?.filter(e => blData?.containerData?.containers?.find(c => c?.containerNo === e?.containerNumber))


            const balanceContainer = {}

            bls = bls?.filter((e) => blData?.generalData?.blType === e?.blType)
            const tempContainers = blData?.containerData?.containers?.map(c => c?.containerNo) || [];

            bls = bls?.filter(e => {
                const blContainerNumbers = e?.containers?.map(c => c.containerNumber) || [];
                return tempContainers.some(tc => blContainerNumbers.includes(tc));
            });

            for (let i = 0; i < bls?.length; i++) {
                const bl = bls[i];

                for (let j = 0; j < bl?.containers?.length; j++) {
                    const container = bl?.containers[j];
                    const containerMaster = containersFromBatch.find(ce => ce?.containerNumber === container?.containerNumber)

                    if (!balanceContainer[container?.containerNumber]) {
                        balanceContainer[container?.containerNumber] = {
                            cbm: 0,
                            grossWeight: 0,
                            netWeight: 0,
                            package: 0,
                            limitCbm: parseFloat(containerMaster?.cbm),
                            limitGrossWeight: parseFloat(containerMaster?.grossWeight),
                            limitNetWeight: parseFloat(containerMaster?.netWeight),
                            limitPackage: parseFloat(containerMaster?.package),
                        }
                    }

                    balanceContainer[container?.containerNumber]["cbm"] += parseFloat(container?.cbm)
                    balanceContainer[container?.containerNumber]["grossWeight"] += parseFloat(container?.grossWeight)
                    balanceContainer[container?.containerNumber]["netWeight"] += parseFloat(container?.netWeight)
                    balanceContainer[container?.containerNumber]["package"] += parseFloat(container?.package)
                }
            }

            if (bls?.length === 0) {
                for (let j = 0; j < blData?.containerData?.containers?.length; j++) {
                    const container = blData?.containerData?.containers[j];
                    const containerMaster = containersFromBatch.find(ce => ce?.containerNumber === container?.containerNo)

                    if (!balanceContainer[container?.containerNo]) {
                        balanceContainer[container?.containerNo] = {
                            cbm: 0,
                            grossWeight: 0,
                            netWeight: 0,
                            package: 0,
                            limitCbm: parseFloat(containerMaster?.cbm),
                            limitGrossWeight: parseFloat(containerMaster?.grossWeight),
                            limitNetWeight: parseFloat(containerMaster?.netWeight),
                            limitPackage: parseFloat(containerMaster?.package),
                        }
                    }
                }
            }

            balanceContainerList = balanceContainerList?.map((e) => {
                const extractedContainer = blData?.containerData?.containers?.find(c => c?.containerNo === e?.containerNumber)
                const bc = balanceContainer[e?.containerNumber]
                let hasError = false;
                let errorList = [];

                if (!(bc?.limitCbm >= (bc?.cbm + extractedContainer?.cbm))) {
                    errorList.push(
                        {
                            message: `Available CBM is ${bc?.limitCbm - bc?.cbm}, and analysized CBM from BL is ${extractedContainer?.cbm}`
                        }
                    )
                }

                if (!(bc?.limitGrossWeight >= (bc?.grossWeight + extractedContainer?.grossWeight))) {
                    errorList.push(
                        {
                            message: `Available Gross Weight is ${bc?.limitGrossWeight - bc?.grossWeight}, and analysized Gross Weight from BL is ${extractedContainer?.grossWeight}`
                        }
                    )
                }

                if (!(bc?.limitNetWeight >= (bc?.netWeight + extractedContainer?.netWeight))) {
                    errorList.push(
                        {
                            message: `Available Net Weight is ${bc?.limitNetWeight - bc?.netWeight}, and analysized Net Weight from BL is ${extractedContainer?.netWeight}`
                        }
                    )
                }

                if (!(bc?.limitPackage >= (bc?.package + extractedContainer?.noOfPackage))) {
                    errorList.push(
                        {
                            message: `Available Packages is ${bc?.limitPackage - bc?.package}, and analysized Packages from BL is ${extractedContainer?.noOfPackage}`
                        }
                    )
                }

                if (errorList?.length > 0)
                    hasError = true;

                return {
                    ...e,
                    cbm: String(extractedContainer?.cbm),
                    grossWeight: String(extractedContainer?.grossWeight),
                    netWeight: String(extractedContainer?.netWeight),
                    package: String(extractedContainer?.noOfPackage),
                    hasError,
                    errorList
                }
            })

            const blObject = {
                blscanningId: scanningId,
                batchId: batchId,
                isBlConsolidated: false,
                consolidatedJobs: [],
                freightTermName: blData?.generalData?.freightTerm,
                freightTerm: blData?.generalData?.freightTermId,
                finalShippingLineId: blData?.generalData?.shippingLineId,
                finalShippingLineName: blData?.generalData?.shippingLine,
                blType: blData?.generalData?.blType,
                blTypeName: blData?.generalData?.blType,
                blNumber: blData?.generalData?.blNo,

                shipperId: blData?.generalData?.shipperId,
                shipperName: blData?.generalData?.shipperName,
                consigneeId: blData?.generalData?.consigneeId,
                consigneeName: blData?.generalData?.consigneeName,
                notify_party1: blData?.generalData?.notifyPartyId,
                notify_party1Name: blData?.generalData?.notifyPartyName,
                address1: blData?.generalData?.notifyPartyAddress,
                shipperAddress: blData?.generalData?.shipperAddress,
                consigneeAddress: blData?.generalData?.consigneeAddress,

                voyageId: blData?.generalData?.voyage,
                voyageNumber: blData?.generalData?.voyageNumber,
                vessel: blData?.generalData?.vesselId,
                vesselName: blData?.generalData?.vessel,
                imoNo: blData?.generalData?.imoNo,
                status: true,

                shipperBranch: blData?.branchData?.shipperBranch,
                consigneeBranch: blData?.branchData?.consigneeBranch,
                notifyParty1Branch: blData?.branchData?.notifyPartyBranch,

                goodsDescription: blData?.containerData?.loads?.map((e) => {
                    return `${e?.descriptionOfPackge}\n${e?.hsCode}`
                }).join("\n"),

                placeOfDelivery: blData?.generalData?.placeOfDeliveryId,
                placeOfDeliveryName: blData?.generalData?.placeOfDeliveryName,

                subBltype: "ORIGINAL",

                polName: blData?.generalData?.portOfLoadingName,
                polId: blData?.generalData?.portOfLoadingId,

                entryPort: blData?.generalData?.portOfDischargeName,
                entryPortId: blData?.generalData?.portOfDischargeId,

                stoltAgentId: agent?.agentId,
                stoltAgentName: agent?.name,

                containers: balanceContainerList
            };

            new blscanningModel({
                blscanningId: scanningId,
                extractedData: blData,
                usageData: usageData,
                modelUsage,
                timeLine: timing,
                fileData: fileData,
                tenantId: user.tenantId,
                createdBy: `${user.name} ${user.userLastname}`,
                createdByUID: user.userId,
                updatedBy: `${user.name} ${user.userLastname}`,
                updatedByUID: user.userId,
                createdOn: new Date().toISOString(),
                updatedOn: new Date().toISOString(),
                orgId: user.orgId,
                batchId,
                blObject: blObject,
                errors: errors,
                status: 200
            }).save();

            if (agent?.agentId)
                await agentModel.findOneAndUpdate(
                    {
                        agentId: agent?.agentId
                    },
                    {
                        $inc: {
                            blCredit: -1
                        }
                    },
                    {
                        new: true
                    }
                )

            // ---- Final Response ----
            res.status(200).json({
                status: "success",
                // batchId,
                blData,
                blObject: blObject,
                usage: usageData
            });
        } else {
            res.status(500).json({
                status: "error",
                message: "You have not sufficient BL Credits to process BL"
            });
        }
    } catch (error) {
        console.error("scanBl error:", error);

        await blscanningModel.create({
            blscanningId: uuid.v4(),
            fileData: { fileName: req.body?.name },
            tenantId: user?.tenantId,
            orgId: user?.orgId,
            status: 500,
            createdBy: `${user?.name} ${user?.userLastname}`,
            createdByUID: user?.userId,
            errors: [{
                message: error.message,
                step: "scanBl main catch",
                stack: error.stack
            }]
        });

        res.status(500).json({
            status: "error",
            message: "Failed to process BL",
            error: error.message
        });
    }
};

let chargesPI = {
    "type": "object",
    "properties": {
        "charges": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "chargesName": {
                        "type": "string",
                        "nullable": true
                    },
                    "originalChargesName": {
                        "type": "string",
                        "nullable": false
                    },
                    "hsCode": {
                        "type": "string",
                        "nullable": false
                    },
                    "quantity": {
                        "type": "number",
                        "nullable": false
                    },

                    "taxes": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "taxType": {
                                    "type": "string",
                                    "enum": ["CGST", "SGST", "IGST", "Other"],
                                    "nullable": false
                                },
                                "taxPurcentage": {
                                    "type": "number",
                                    "nullable": false
                                },
                                "taxAmount": {
                                    "type": "number",
                                    "nullable": false
                                },
                                "taxAmountCurrencyCode": {
                                    "type": "string",
                                    "nullable": false
                                },
                            },
                            "required": ["taxType", "taxPurcentage", "taxAmount", "taxAmountCurrencyCode"]
                        }
                    },

                    "taxableAmount": {
                        "type": "number",
                        "nullable": false
                    },
                    "taxableAmountCurrencyCode": {
                        "type": "string",
                        "nullable": false
                    },

                    "unitAmount": {
                        "type": "number",
                        "nullable": false
                    },
                    "unitAmountCurrencyCode": {
                        "type": "string",
                        "nullable": false
                    },

                    "totalForThisCharge": {
                        "type": "number",
                        "nullable": false
                    },
                    "totalForThisChargeCurrencyCode": {
                        "type": "string",
                        "nullable": false
                    },
                    "exchangeRate": {
                        "type": "number",
                        "nullable": false
                    },
                    "exchangeRateCurrencyCode": {
                        "type": "string",
                        "nullable": false
                    },


                    "description": {
                        "type": "string",
                        "nullable": true
                    },
                    "remarks": {
                        "type": "string",
                        "nullable": true
                    },

                    "chargeType": {
                        "type": "string",
                        "nullable": false
                    }
                },
                "required": ["unitAmountCurrencyCode", "unitAmount", "originalChargesName", "hsCode", "quantity", "taxes", "chargeType"]
            }
        },

        "taxableAmount": {
            "type": "number",
            "nullable": false
        },
        "taxableAmountCurrencyCode": {
            "type": "string",
            "nullable": false
        },
        "taxAmount": {
            "type": "number",
            "nullable": false
        },
        "taxAmountCurrencyCode": {
            "type": "string",
            "nullable": false
        },
        "totalInvoiceAmount": {
            "type": "number",
            "nullable": false
        },
        "totalInvoiceAmountCurrencyCode": {
            "type": "string",
            "nullable": false
        },
    },
    "required": ["charges", "taxableAmount", "taxableAmountCurrencyCode", "taxAmount", "taxAmountCurrencyCode", "totalInvoiceAmount", "totalInvoiceAmountCurrencyCode"]
}

const banksPI = {
    "type": "object",
    "properties": {
        "banks": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "bankName": {
                        "type": "string",
                        "nullable": false
                    },
                    "bankBranch": {
                        "type": "string",
                        "nullable": false
                    },
                    "bankAccountName": {
                        "type": "string",
                        "nullable": false
                    },
                    "bankAccountNumber": {
                        "type": "string",
                        "nullable": false
                    },
                    "swift-isfc-Code": {
                        "type": "string",
                        "nullable": false
                    },
                    "bankAddress": {
                        "type": "string",
                        "nullable": false
                    }
                },
                "required": ["bankName", "bankBranch", "bankAccountName", "bankAccountNumber", "swift-isfc-Code", "bankAddress"]
            }
        }
    },
    "required": ["banks"]
}

const generalPI = {
    "type": "object",
    "properties": {
        "billFromName": {
            "type": "string",
            "nullable": false
        },
        "billFromBranch": {
            "type": "string",
            "nullable": false
        },
        "billFromEmail": {
            "type": "string",
            "nullable": true
        },
        "billFromAddress": {
            "type": "string",
            "nullable": false
        },
        "billToName": {
            "type": "string",
            "nullable": false
        },
        "billToBranch": {
            "type": "string",
            "nullable": false
        },
        "billToEmail": {
            "type": "string",
            "nullable": true
        },
        "billToAddress": {
            "type": "string",
            "nullable": false
        },
        "invoiceNumber": {
            "type": "string",
            "nullable": false
        },
        "invoiceReferenceNumber": {
            "type": "string",
            "nullable": true
        },
        "jobNumber": {
            "type": "string",
            "nullable": false
        },
        "vesselName": {
            "type": "string",
            "nullable": false
        },
        "voyage": {
            "type": "string",
            "nullable": false
        },
        "soNumber": {
            "type": "string",
            "nullable": false
        },


        "portOfLoadingName": {
            "type": "string",
            "nullable": false
        },
        "portOfLoadingCountry": {
            "type": "string",
            "nullable": false
        },
        "portOfDischargeName": {
            "type": "string",
            "nullable": false
        },
        "portOfDischargeCountry": {
            "type": "string",
            "nullable": false
        },

        "MBL-HBL-Numbers": {
            "type": "array",
            "items": {
                "type": "string",
            },
            "nullable": false
        },
        "containerNumbers": {
            "type": "array",
            "items": {
                "type": "string",
            },
            "nullable": false
        },

        "billDate": {
            "type": "string",
            "format": "date-time",
            "nullable": true
        },
        "billDueDate": {
            "type": "string",
            "format": "date-time",
            "nullable": true
        },

        "invoiceType": {
            "type": "string",
            "enum": [
                "STANDARD",
                "PROFORMA",
                "COMMERCIAL",
                "CREDIT_NOTE",
                "DEBIT_NOTE",
                "RECURRING",
                "TIMESHEET",
                "INTERIM",
                "FINAL",
                "MIXED",
                "EXPENSE",
                "SELF_BILLING",
                "TAX",
                "PROGRESSIVE"
            ],
            "nullable": false
        }
    },
    "required": ["invoiceType", "billFromName", "billFromBranch", "billFromAddress", "billToName", "billToBranch", "billToAddress", "invoiceNumber", "jobNumber", "vesselName", "voyage", "soNumber", "portOfLoadingName", "portOfLoadingCountry", "portOfDischargeName", "portOfDischargeCountry", "MBL-HBL-Numbers", "containerNumbers"]
}

const fullObject = {
    "type": "object",
    "properties": {
        "generalData": generalPI,
        "bankData": banksPI,
        "chargesData": chargesPI
    },
    "required": ["generalData", "bankData", "chargesData"]
}

exports.scanPurchaseInvoice = async (req, res, next) => {
    const user = res.locals.user
    const agent = res.locals.agent;

    try {
        const modelUsage = [];

        // const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema['batch'], `batchs`);
        const partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, Schema['partymaster'], `partymasters`);
        const invoicescanningModel = mongoose.models[`invoicescanningModel`] || mongoose.model(`invoicescanningModel`, Schema['invoicescanning'], `invoicescannings`);
        // const portModel = mongoose.models[`portModel`] || mongoose.model(`portModel`, Schema['port'], `ports`);
        // const locationModel = mongoose.models[`locationModel`] || mongoose.model(`locationModel`, Schema['location'], `locations`);
        // const containerModel = mongoose.models[`containerModel`] || mongoose.model(`containerModel`, Schema['container'], `containers`);
        const systemtypeModel = mongoose.models[`systemtypeModel`] || mongoose.model(`systemtypeModel`, Schema['systemtype'], `systemtypes`);
        // const shippinglineModel = mongoose.models[`shippinglineModel`] || mongoose.model(`shippinglineModel`, Schema['shippingline'], `shippinglines`);
        // const vesselModel = mongoose.models[`vesselModel`] || mongoose.model(`vesselModel`, Schema['vessel'], `vessels`);
        // const blModel = mongoose.models[`blModel`] || mongoose.model(`blModel`, Schema['bl'], `bls`);
        // const agentModel = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, Schema['agent'], `agents`);
        const costitemModel = mongoose.models[`costitemModel`] || mongoose.model(`costitemModel`, Schema['costitem'], `costitems`);
        const currencyModel = mongoose.models[`currencyModel`] || mongoose.model(`currencyModel`, Schema['currency'], `currencys`);

        if (agent?.invoiceCredit > 0) {
            const errors = [];

            const fileData = {};
            const timing = {};

            timing["requestStartsOn"] = new Date().toISOString();

            const scanningId = uuid.v4()

            timing["fileUploadStartsOn"] = new Date().toISOString();

            fileData.documentType = req.file.mimetype
            fileData.fileName = `${scanningId}-${req.body?.name}`
            fileData.size = req.file.size
            fileData.documentName = req.body?.name
            fileData.uploadedOn = new Date().toISOString();

            const response = await azureStorage.uploadFile(fileData.fileName, req.file);
            if (response.status === 200) {
                fileData.uploadedBlobName = response?.name
                fileData.azureRequestId = response?.requestId
                fileData.uploadedStatus = response?.status
            } else {
                fileData.error = response?.error
                fileData.uploadedStatus = response?.status
            }

            timing["fileUploadEndsOn"] = new Date().toISOString();

            // timing["fileTypeDetectionStartsOn"] = new Date().toISOString();
            // const docType = await detectDocumentType(req.file);

            // timing["fileTypeDetectionEndsOn"] = new Date().toISOString();

            let costItems = await costitemModel.find({
                orgId: user?.orgId
            })
            if (costItems)
                costItems = costItems?.map(e => e?.toObject())

            let costItemTypes = await systemtypeModel.find({
                orgId: user?.orgId,
                status: true,
                typeCategory: {
                    "$in": [
                        "shippingTerm",
                        "itemType",
                        "itemUnit",
                        "Charge Unit",
                        "chargeUnit",
                        "chargeHeader",
                        "taxApplicability",
                        "chargeType"
                    ]
                }
            })
            if (costItemTypes)
                costItemTypes = costItemTypes?.map(e => e?.toObject())

            const data = {};
            const usageData = {};

            const { batchId } = req.body;

            fullObject.properties.chargesData.properties.charges.items.properties.chargeType["enum"] = [...costItemTypes?.map(e => e?.typeName)]
            fullObject.properties.chargesData.properties.charges.items.properties.chargesName["enum"] = [...costItems?.map(e => e?.costitemName), "OTHER"]

            timing["fullDataDetectionStartsOn"] = new Date().toISOString();
            const fullData = await extractData(
                agent?.geminiModel?.blScanning || "gemini-2.5-flash-lite",
                fullObject,
                "cost item name must be meaningfully similar or else OTHER",
                req.file,
                "look this above purchase invoice from shipping line and give me all data"
            );

            let generalDetail, paymentDetail, chargesData;
            timing["fullDataDetectionEndsOn"] = new Date().toISOString();

            modelUsage.push({ ...fullData?.modelUsage, usedFor: "fullData" })

            if (fullData.status === 200 && fullData.jsonData) {
                data["generalDetail"] = fullData.jsonData?.generalData
                data["paymentDetail"] = fullData.jsonData?.bankData
                data["chargesData"] = fullData.jsonData?.chargesData

                generalDetail = fullData.jsonData?.generalData
                paymentDetail = fullData.jsonData?.bankData
                chargesData = fullData.jsonData?.chargesData

                usageData["fullData"] = fullData.usageMetadata;
            } else {
                console.log(JSON.stringify(fullData));
            }


            if (generalDetail?.billFromName) {
                const billFromName = await findClosestParty(generalDetail?.billFromName,
                    {
                        orgId: agent?.agentId,
                        "customerType.item_text": {
                            $in: [
                                "Shipping Line",
                                "Agent"
                            ]
                        }
                    }, partymasterModel);

                data["generalDetail"]["billFromPartyName"] = billFromName?.name
                data["generalDetail"]["billFromPartyId"] = billFromName?.partymasterId
            }

            if (generalDetail?.billToName) {
                const billToName = await findClosestParty(generalDetail?.billToName,
                    {
                        orgId: agent?.agentId
                    }, partymasterModel);

                data["generalDetail"]["billToPartyName"] = billToName?.name
                data["generalDetail"]["billToPartyId"] = billToName?.partymasterId
            }

            if (chargesData?.charges) {
                data.chargesData.charges = await Promise.all(chargesData?.charges.map(async (e) => {
                    if (e?.chargesName != "OTHER") {
                        let currencyData = await currencyModel?.findOne({ currencyShortName: e?.unitAmountCurrencyCode })
                        if (currencyData)
                            currencyData = currencyData?.toObject();

                        const costItem = await findClosestCharge(e?.chargesName,
                            {
                                orgId: agent?.agentId
                            },
                            costitemModel);


                        return {
                            ...e,
                            costItemCreated: false,
                            similarity: costItem?.similarity,
                            costItemId: costItem?.costitemId,
                            costItemName: costItem?.costitemName,
                            costItemTypeId: costItem?.chargeType,
                            costItemTypeName: costItem?.chargeTypeName,
                            currencyId: currencyData?.currencyId,
                            currency: e?.unitAmountCurrencyCode,
                        }
                    } else {
                        let currencyData = await currencyModel?.findOne({ currencyShortName: e?.unitAmountCurrencyCode })
                        if (currencyData)
                            currencyData = currencyData?.toObject();

                        const costType = await findClosestSystemType(
                            e?.chargeType,
                            {
                                orgId: user?.orgId,
                                status: true,
                                typeCategory: {
                                    "$in": [
                                        "shippingTerm",
                                        "itemType",
                                        "itemUnit",
                                        "Charge Unit",
                                        "chargeUnit",
                                        "chargeHeader",
                                        "taxApplicability",
                                        "chargeType"
                                    ]
                                }
                            },
                            systemtypeModel
                        );

                        const costItemToBeSave = {
                            tenantId: user?.tenantId,
                            aiGenerated: true,
                            orgId: user?.orgId,
                            createdOn: new Date().toISOString(),
                            createdBy: "SYSTEM-AI",
                            createdByUID: user?.userId,
                            updatedOn: new Date().toISOString(),
                            updatedBy: "SYSTEM-AI",
                            updatedByUID: user?.userId,
                            costitemName: e?.originalChargesName,
                            chargeApplicable: [
                                {
                                    type: "Import"
                                },
                                {
                                    type: "Export"
                                }
                            ],
                            chargeType: costType?.systemtypeId,
                            chargeTypeName: costType?.typeName,
                            currencyId: currencyData?.currencyId,
                            currency: e?.unitAmountCurrencyCode,
                            costitemId: uuid.v4(),
                            hsnCode: e?.hsCode,
                            status: true,
                            gst: String(e?.taxes.reduce((sum, tax) => sum + tax.taxPurcentage, 0) || 0),
                            taxRate: String(e?.taxes.reduce((sum, tax) => sum + tax.taxPurcentage, 0) || 0),
                        };

                        new costitemModel(costItemToBeSave).save();

                        return {
                            ...e,
                            currencyId: currencyData?.currencyId,
                            currency: e?.unitAmountCurrencyCode,
                            costItemCreated: true,
                            costItemTypeId: costItemToBeSave?.chargeType,
                            costItemTypeName: costItemToBeSave?.chargeTypeName,
                            costItemId: costItemToBeSave?.costitemId,
                            costItemName: costItemToBeSave?.costitemName,
                        };
                    }
                }))
            }

            const invoiceObject = {
                invoiceRefNo: generalDetail?.invoiceReferenceNumber,
                invoice_date: generalDetail?.billDate,
                invoiceDueDate: generalDetail?.billDueDate,
                invoiceNo: generalDetail?.invoiceNumber,
                invoiceToId: generalDetail?.billToPartyId,
                invoiceToName: generalDetail?.billToPartyName,
                invoiceToBranch: "",
                invoiceToBranchName: "",
                invoiceToBranchAddress: generalDetail?.billToAddress,

                invoiceFromId: generalDetail?.billFromPartyId,
                invoiceFromName: generalDetail?.billFromPartyName,
                invoiceFromBranch: "",
                invoiceFromBranchName: "",
                invoiceFromBranchAddress: generalDetail?.billFromAddress,

                paymentStatus: "Unpaid",
                bankDetails: paymentDetail?.banks?.map(
                    b => `Bank Name: ${b?.bankName}\nBank Branch: ${b?.bankBranch}\nAccount Number: ${b?.bankAccountNumber}\nAccount Name: ${b?.bankAccountName}\n`
                )?.join("\n"),

                supplier: generalDetail?.billFromPartyId,
                supplierName: generalDetail?.billFromPartyName,
                supplierAddress: generalDetail?.billFromAddress,

                containers: generalDetail?.containerNumbers.join(","),
                status: true,

                type: "buyerInvoice",
                invoiceTypeStatus: "buyerInvoice",

                batchId: batchId,

                costItems: chargesData?.charges?.map(e => {
                    const enquiryitem = {
                        enquiryitemId: uuid.v4(),


                        costItemId: e?.costItemId,


                        costItemName: e?.costItemName,

                        basic: e?.costItemTypeName,
                        basicId: e?.costItemTypeId,

                        isInvoiceCreated: true,
                        tenantMargin: e?.totalForThisCharge,
                        buyEstimates: {
                            currencyId: e?.currencyId,
                            currency: e?.currency,
                            exChangeRate: e?.exchangeRate || 1,
                            rate: e?.unitAmount,
                            amount: e?.unitAmount,
                            taxableAmount: e?.taxableAmount,
                            totalAmount: e?.totalForThisCharge,
                            terms: "",
                            supplier: generalDetail?.billFromPartyId,
                            igst: e?.taxes?.find(t => t?.taxType === "IGST")?.taxPurcentage,
                            cgst: e?.taxes?.find(t => t?.taxType === "CGST")?.taxPurcentage,
                            sgst: e?.taxes?.find(t => t?.taxType === "SGST")?.taxPurcentage,
                            invoiceNo: null,
                            invoiceId: null,
                            isInvoiceCreated: false,
                            buyerInvoice: true,
                            isReceiptCreated: true
                        },
                        selEstimates: {
                            currencyId: e?.currencyId,
                            currency: e?.currency,
                            exChangeRate: 0,
                            rate: 0,
                            amount: 0,
                            taxableAmount: 0,
                            totalAmount: 0,
                            terms: "",
                            remarks: "",
                            igst: 0,
                            cgst: 0,
                            sgst: 0,
                            invoiceNo: null,
                            invoiceId: null,
                            isInvoiceCreated: false,
                            sellerInvoice: false,
                            isReceiptCreated: false
                        },
                        tax: e?.taxes?.map(t => {
                            return {
                                taxRate: t?.taxPurcentage,
                                taxAmount: t?.taxAmount
                            }
                        }),
                        quantity: e?.quantity,
                        rate: e?.unitAmount,

                        gst: e?.taxes?.reduce((sum, tax) => sum + tax.taxPurcentage, 0) || 0,
                        gstType: "tax",
                        totalAmount: e?.totalForThisCharge,
                        hsnCode: e?.hsCode,
                        isEnquiryCharge: true
                    }

                    return {
                        ...enquiryitem
                    }
                })
            }

            new invoicescanningModel({
                invoicescanningId: scanningId,
                extractedData: data,
                usageData: usageData,
                modelUsage,
                timeLine: timing,
                fileData: fileData,
                tenantId: user.tenantId,
                createdBy: `${user.name} ${user.userLastname}`,
                createdByUID: user.userId,
                updatedBy: `${user.name} ${user.userLastname}`,
                updatedByUID: user.userId,
                createdOn: new Date().toISOString(),
                updatedOn: new Date().toISOString(),
                orgId: user.orgId,
                batchId,
                invoiceObject: invoiceObject,
                errors: errors,
                status: 200
            }).save();

            res.status(200).json({
                status: "success",
                batchId,
                data,
                invoiceObject: invoiceObject,
                usage: usageData
            });
        } else {
            res.status(500).json({
                status: "error",
                message: "You have not sufficient Invoice Credits to process Invoice"
            });
        }
    } catch (error) {
        console.error("scanBl error:", error);

        await invoicescanningModel.create({
            blscanningId: uuid.v4(),
            fileData: { fileName: req.body?.name },
            tenantId: user?.tenantId,
            orgId: user?.orgId,
            status: 500,
            createdBy: `${user?.name} ${user?.userLastname}`,
            createdByUID: user?.userId,
            errors: [{
                message: error.message,
                step: "scanBl main catch",
                stack: error.stack
            }]
        });

        res.status(500).json({
            status: "error",
            message: "Failed to process Invoice!",
            error: error.message
        });
    }
};

function checkUserExists(data, userId) {
    return data.departmentSettings.some(dept =>
        dept.tiers.some(tier =>
            tier.selectedUsers.some(user => user.userId === userId)
        )
    );
}