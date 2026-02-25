const { toInteger, toNumber } = require('lodash');
const { mongoose, Schema, invoiceSchema, uuid, jwt, crypto, axios, azureStorage, inAppNotificationService, querystring, nodemailer, pdfScanner, ediController, OpenAI, objecdiff, sendMessage, getTextMessageInput, fs, _, simpleParser, connect, imapConfig, transporter, getChangedFields, removeIdField, recordLogAudit, encryptObject, decryptObject, isSubset, createInAppNotification, replacePlaceholders, generateRandomPassword, triggerPointExecute, insertIntoTally, getTransporter,diffInDays, getChildCompany } = require('./helper.controller')
const dayjs = require('dayjs');

exports.generateReport = async (reportName, body, orgId, traceId) => {
    const query = body.query || {};
    const projection = {};
    const sort = { createdOn: -1 };

    let status;
    let reportObject;

    for (let i = 0; i < body?.project?.length; i++) {
        projection[body.project[i]] = 1;
    }

    for (let i = 0; i < body?.sort?.asc?.length; i++) {
        sort[body.sort.asc[i]] = 1;
    }

    for (let i = 0; i < body?.sort?.desc?.length; i++) {
        sort[body.sort.desc[i]] = -1;
    }

    let cName;

    if (reportName === "containerAllocationDetailsReport") {
        cName = "carrierbooking";

        let SubModel = mongoose.models[`${cName}Model`] || mongoose.model(`${cName}Model`, Schema[cName], `${cName}s`);
        let batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
        let enquiryModel = mongoose.models[`enquiryModel`] || mongoose.model(`enquiryModel`, Schema["enquiry"], `enquirys`);

        const subQuery = {}

        if (body?.query?.shippingLineId)
            subQuery["basicDetails.Carrier"] = body.query.shippingLineId
        if (body?.query?.createdOn)
            subQuery["createdOn"] = body.query.createdOn

        await SubModel.find(subQuery, projection, { "sort": sort, "skip": body?.from || 0, "limit": body?.size || 100 }).then(async function (foundSubDocument) {
            const totalCount = await SubModel.countDocuments(subQuery);
            const finalizedDocument = []

            for (let i = 0; i < foundSubDocument.length; i++) {
                const e = foundSubDocument[i]

                for (let c = 0; c < e.containerDetails?.tableRows?.length; c++) {
                    let containerBooked = e.containerDetails.tableRows[c].Quantity

                    for (let j = 0; j < e.bookedContainer?.length; j++) {
                        const job = e.bookedContainer[j];

                        if (job.ContainerName === e.containerDetails.tableRows[c].ContainerName) {
                            const containerPending = containerBooked - e?.bookedContainer?.filter(bc => bc.ContainerName === e.containerDetails.tableRows[c].ContainerName).map(b => b.allocated).reduce((partialSum, a) => partialSum + a, 0) || 0

                            const batchData = await batchModel.findOne({ "batchId": job.batchId })
                            const enquiryData = await enquiryModel.findOne({ enquiryId: batchData?.enquiryDetails?.enquiryId })

                            finalizedDocument.push({
                                "shippinglineId": e?.basicDetails?.Carrier,
                                "shippinglineName": e?.basicDetails?.carrierName,
                                "vesselId": e?.vesselDetails?.Vessel,
                                "vesselName": e?.vesselDetails?.vesselName,
                                "voyageNumber": e?.vesselDetails?.voyageNumber,
                                "voyageId": e?.vesselDetails?.Voyagenumber,
                                "containerBooked": containerBooked,
                                "containerAllocated": job.allocated,
                                "containerPending": containerPending,
                                "ETD": e?.vesselDetails?.ETD,
                                "originPortName": e?.vesselDetails?.portName,
                                "originPortId": e?.vesselDetails?.Origin,
                                "bookingNumber": e?.basicDetails?.BookingNumber,
                                "customerId": e?.basicDetails?.BookingParty,
                                "customerName": e?.basicDetails?.bookingpartyName,
                                "enquiryNo": enquiryData?.enquiryNo,
                                "enquiryId": enquiryData?.enquiryId
                            })
                        }
                    }

                    const containerPending = containerBooked - e?.bookedContainer?.filter(bc => bc.ContainerName === e.containerDetails.tableRows[c].ContainerName).map(b => b.allocated).reduce((partialSum, a) => partialSum + a, 0) || 0

                    if (!e.bookedContainer) {
                        finalizedDocument.push({
                            "shippinglineId": e?.basicDetails?.Carrier,
                            "shippinglineName": e?.basicDetails?.carrierName,
                            "vesselId": e?.vesselDetails?.Vessel,
                            "vesselName": e?.vesselDetails?.vesselName,
                            "voyageNumber": e?.vesselDetails?.voyageNumber,
                            "voyageId": e?.vesselDetails?.Voyagenumber,
                            "containerBooked": containerBooked,
                            "containerAllocated": 0,
                            "containerPending": containerPending,
                            "ETD": e?.vesselDetails?.ETD,
                            "originPortName": e?.vesselDetails?.portName,
                            "originPortId": e?.vesselDetails?.Origin,
                            "bookingNumber": e?.basicDetails?.BookingNumber,
                            "customerId": e?.basicDetails?.BookingParty,
                            "customerName": e?.basicDetails?.bookingpartyName,
                            "enquiryNo": "",
                            "enquiryId": ""
                        })
                    } else if (containerPending === containerBooked) {
                        finalizedDocument.push({
                            "shippinglineId": e?.basicDetails?.Carrier,
                            "shippinglineName": e?.basicDetails?.carrierName,
                            "vesselId": e?.vesselDetails?.Vessel,
                            "vesselName": e?.vesselDetails?.vesselName,
                            "voyageNumber": e?.vesselDetails?.voyageNumber,
                            "voyageId": e?.vesselDetails?.Voyagenumber,
                            "containerBooked": containerBooked,
                            "containerAllocated": 0,
                            "containerPending": containerPending,
                            "ETD": e?.vesselDetails?.ETD,
                            "originPortName": e?.vesselDetails?.portName,
                            "originPortId": e?.vesselDetails?.Origin,
                            "bookingNumber": e?.basicDetails?.BookingNumber,
                            "customerId": e?.basicDetails?.BookingParty,
                            "customerName": e?.basicDetails?.bookingpartyName,
                            "enquiryNo": "",
                            "enquiryId": ""
                        })
                    }
                }
            }

            reportObject = { "documents": finalizedDocument, "totalCount": finalizedDocument.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "containerShippinglineReport") {
        cName = "carrierbooking";

        let SubModel = mongoose.models[`${cName}Model`] || mongoose.model(`${cName}Model`, Schema[cName], `${cName}s`);

        const subQuery = {}

        if (body?.query?.shippingLineId)
            subQuery["basicDetails.Carrier"] = body.query.shippingLineId
        if (body?.query?.createdOn)
            subQuery["createdOn"] = body.query.createdOn

        await SubModel.find(subQuery, projection, { "sort": sort, "skip": body?.from || 0, "limit": body?.size || 100 }).then(async function (foundSubDocument) {
            const totalCount = await SubModel.countDocuments(subQuery);
            const finalizedDocument = foundSubDocument.map(e => {
                const containerBooked = e?.bookedContainer?.map(b => b.total).reduce((partialSum, a) => partialSum + a, 0) || 0
                const containerAllocated = e?.bookedContainer?.map(b => b.allocated).reduce((partialSum, a) => partialSum + a, 0) || 0
                const containerPending = containerBooked - containerAllocated

                return {
                    "shippinglineId": e?.basicDetails?.Carrier,
                    "shippinglineName": e?.basicDetails?.carrierName,
                    "vesselId": e?.vesselDetails?.Vessel,
                    "vesselName": e?.vesselDetails?.vesselName,
                    "voyageNumber": e?.vesselDetails?.voyageNumber,
                    "voyageId": e?.vesselDetails?.Voyagenumber,
                    "containerBooked": containerBooked,
                    "containerAllocated": containerAllocated,
                    "containerPending": containerPending,
                    "ETD": e?.vesselDetails?.ETD,
                    "originPortName": e?.vesselDetails?.portName,
                    "originPortId": e?.vesselDetails?.Origin
                }
            })

            reportObject = { "documents": finalizedDocument, "totalCount": totalCount }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "paymentreport") {
        cName = "payment";

        let Model = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);

        let outerCondition = {}

        outerCondition["orgId"] = orgId

        if (body?.query?.branchId) {
            outerCondition["branchId"] = body?.query?.branchId
        }
        if (body?.query?.batchNo) {
            outerCondition["batchNo"] = body?.query?.batchNo
        }
        if (body?.query?.portId) {
            outerCondition["enquiryDetails.routeDetails.loadPortId"] = body?.query?.portId
        }
        if (body?.query?.partyMasterId) {
            outerCondition["enquiryDetails.basicDetails.shipperId"] = { $in: await getChildCompany(body?.query?.partyMasterId) }
        }
        await Model.find(outerCondition, null, { sort: sort }).then(async function (foundDocument) {
            let SubModel = mongoose.models[`${cName}Model`] || mongoose.model(`${cName}Model`, Schema["user"], `${cName}s`);

            const subQuery = [];
            for (let i = 0; i < foundDocument.length; i++)
                subQuery.push(foundDocument[i].batchId)

            await SubModel.find({ batchId: { "$in": subQuery } }, projection, { "sort": sort, "skip": body?.from || 0, "limit": body?.size || 100 }).then(async function (foundSubDocument) {
                const totalCount = await SubModel.countDocuments({ batchId: { "$in": subQuery } });

                const recordsToReturn = await Promise.all(
                    foundSubDocument.map(async (e) => {
                        let batchData = await Model.findOne({ batchId: e.batchId });

                        return {
                            customerName: e.invoice_party,
                            beneficiary_bankId: e.beneficiary_bankId,
                            beneficiary_bankName: e.beneficiary_bank || "",
                            jobNo: e.batchNo,
                            billNo: e.paymentNo,
                            amount: e.amount,
                            paymentStatus: e.payment_status,
                            payementNo: e.paymentNo,
                            paymentType: e.paymentType,
                            recieved_from: e.recieved_from,
                            remitance_bank: e.remitance_bank,
                            bankInstrumentDate: e.paymentDate,
                            shipper: batchData?.enquiryDetails?.basicDetails?.shipperName
                        };
                    })
                );

                reportObject = { "documents": recordsToReturn, "totalCount": totalCount }
                status = 200
            }).catch(function (err) {
                console.error(JSON.stringify({
                    traceId: traceId,
                    error: err,
                    stack: err?.stack
                }))
                reportObject = { error: err?.message }
                status = 500
            });
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "invoicereport") {
        cName = "invoice";

        let Model = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
        const outerCondition = {}

        outerCondition["orgId"] = orgId

        if (body?.query?.branchId) {
            outerCondition["branchId"] = body?.query?.branchId
        }
        if (body?.query?.batchNo) {
            outerCondition["batchNo"] = body?.query?.batchNo
        }
        if (body?.query?.portId) {
            outerCondition["enquiryDetails.routeDetails.loadPortId"] = body?.query?.portId
        }

        if (body.query?.partyMasterId) {
            const partyIds = await getChildCompany(body?.query?.partyMasterId)

            outerCondition["$or"] = [
                {
                    "enquiryDetails.basicDetails.consigneeId": { $in: partyIds }
                },
                {
                    "enquiryDetails.basicDetails.shipperId": { $in: partyIds }
                },
                {
                    "enquiryDetails.basicDetails.agentId": { $in: partyIds }
                },
                {
                    "customerId": { $in: partyIds }
                }
            ]
        }

        await Model.find(outerCondition, null, { sort: sort }).then(async function (foundDocument) {
            let SubModel = mongoose.models[`${cName}Model`] || mongoose.model(`${cName}Model`, Schema["user"], `${cName}s`);

            const subQuery = [];
            for (let i = 0; i < foundDocument.length; i++)
                subQuery.push(foundDocument[i].batchId)

            let subFilter = {}
            subFilter["batchId"] = { "$in": subQuery }

            if (body?.query?.paymentStatus) {
                subFilter["paymentStatus"] = body?.query?.paymentStatus
            }
            if (body?.query?.invoiceStatus) {
                subFilter["invoiceStatus"] = body?.query?.invoiceStatus
            }

            if (body?.query?.invoiceDate) {
                subFilter["invoice_date"] = {
                    $gt: body?.query?.invoiceDate.$gt,
                    $lt: body?.query?.invoiceDate.$lt
                };

            }

            if (body?.query?.dueDate) {
                subFilter["invoiceDueDate"] = {
                    $gte: body?.query?.dueDate.$gt,
                    $lt: body?.query?.dueDate.$lt
                };

            }


            await SubModel.find(subFilter, projection, { "sort": sort, "skip": body?.from || 0, "limit": body?.size || 100 }).then(async function (foundSubDocument) {
                foundSubDocument = foundSubDocument?.map(e => e?.toObject())
                let countFilter = [];
                if (subFilter["invoice_date"]) {
                    countFilter["invoice_date"] = subFilter["invoice_date"];
                }
                if (subFilter["invoiceDueDate"]) {
                    countFilter["invoiceDueDate"] = subFilter["invoiceDueDate"];
                }

                const totalCount = await SubModel.countDocuments({ batchId: { "$in": subQuery }, ...countFilter });
                const doucmentToReturned = await Promise.all(foundSubDocument.map(async e => {
                    const batchDataSingle = await Model.findOne({ "batchId": e.batchId })
                    return {
                        invoiceNo: e.invoiceNo,
                        invoiceFromId: e.invoiceFromId,
                        invoiceFromName: e.invoiceFromName,
                        invoiceToId: e.invoiceToId,
                        invoiceToName: e.invoiceToName,
                        bankId: e.bankId,
                        bankName: e.bankName,
                        bankType: e.bankType,
                        jobNo: e.batchNo,
                        invoiceStatus: e.invoiceStatus,
                        paymentStatus: e.paymentStatus,
                        amount: e.invoiceAmount,
                        invoiceDueDate: e.invoiceDueDate,
                        invoiceDate: e.invoice_date,
                        loadPortName: batchDataSingle?.enquiryDetails?.routeDetails?.loadPortName,
                        loadPortId: batchDataSingle?.enquiryDetails?.routeDetails?.loadPortId,
                        destPortName: batchDataSingle?.enquiryDetails?.routeDetails?.destPortName,
                        destPortId: batchDataSingle?.enquiryDetails?.routeDetails?.destPortId,
                    }
                }))

                const paymentStatus = await SubModel.distinct('paymentStatus');
                const invoiceStatus = await SubModel.distinct('invoiceStatus');

                reportObject = { "allPaymentStatus": paymentStatus, "allInvoiceStatus": invoiceStatus, "documents": doucmentToReturned, "totalCount": totalCount }
                status = 200
            }).catch(function (err) {
                console.error(JSON.stringify({
                    traceId: traceId,
                    error: err,
                    stack: err?.stack
                }))
                reportObject = { error: err?.message }
                status = 500
            });
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "p&lreport") {
        cName = "invoice";

        let Model = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
        const outerCondition = {}

        if (body?.query?.branchId) {
            outerCondition["branchId"] = body?.query?.branchId
        }
        if (body?.query?.batchNo) {
            outerCondition["batchNo"] = body?.query?.batchNo
        }
        if (body?.query?.portId) {
            outerCondition["enquiryDetails.routeDetails.loadPortId"] = body?.query?.portId
        }
        if (body?.query?.partyMasterId) {
            outerCondition["enquiryDetails.basicDetails.shipperId"] = { $in: await getChildCompany(body?.query?.partyMasterId) }
        }

        await Model.find(outerCondition, null, { sort: sort }).then(async function (foundDocument) {
            let SubModel = mongoose.models[`${cName}Model`] || mongoose.model(`${cName}Model`, Schema["user"], `${cName}s`);

            const subQuery = [];
            for (let i = 0; i < foundDocument.length; i++)
                subQuery.push(foundDocument[i].batchId)

            let subFilter = {}
            subFilter["batchId"] = { "$in": subQuery }
            subFilter["paymentStatus"] = "Paid"
            if (body?.query?.createdOn)
                subFilter["createdOn"] = body?.query?.createdOn;

            await SubModel.find(subFilter, projection, { "sort": sort, "skip": body?.from || 0, "limit": body?.size || 100 }).then(async function (foundSubDocument) {
                const totalCount = await SubModel.countDocuments(subFilter);
                const doucmentToReturned = await Promise.all(foundSubDocument.map(async e => {
                    // const batchDataSingle = await Model.findOne({"batchId" : e.batchId})

                    let buyEstimateAmount = e.costItems.map(c => c.buyEstimates?.totalAmount).reduce((partialSum, a) => partialSum + a, 0) || 0
                    let sellEstimateAmount = e.costItems.map(c => c.selEstimates?.totalAmount).reduce((partialSum, a) => partialSum + a, 0) || 0

                    return {
                        batchNo: e.batchNo,
                        invoiceNo: e.invoiceNo,
                        invoiceStatus: e.invoiceStatus,
                        paymentStatus: e.paymentStatus,
                        invoiceTaxAmount: e.invoiceTaxAmount,
                        invoiceAmount: e.invoiceAmount,
                        sellEstimateAmount: sellEstimateAmount,
                        buyEstimateAmount: buyEstimateAmount,
                        profitLoss: sellEstimateAmount - buyEstimateAmount
                    }
                }))
                reportObject = { "documents": doucmentToReturned, "totalCount": totalCount }
                status = 200
            }).catch(function (err) {
                console.error(JSON.stringify({
                    traceId: traceId,
                    error: err,
                    stack: err?.stack
                }))
                reportObject = { error: err?.message }
                status = 500
            });
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "profitLossreport") {
        cName = "enquiryitem";

        let Model = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
        const outerCondition = {}

        outerCondition["orgId"] = orgId

        if (body?.query?.batchNo) {
            outerCondition["batchNo"] = body?.query?.batchNo
        }

        if (body.query?.partyMasterId) {
            const partyIds = await getChildCompany(body?.query?.partyMasterId)

            outerCondition["$or"] = [
                {
                    "enquiryDetails.basicDetails.consigneeId": { $in: partyIds }
                },
                {
                    "enquiryDetails.basicDetails.shipperId": { $in: partyIds }
                },
                {
                    "enquiryDetails.basicDetails.agentId": { $in: partyIds }
                },
                {
                    "customerId": { $in: partyIds }
                }
            ]
        }

        if (body.query?.createdOn)
            outerCondition["createdOn"] = body.query.createdOn

        await Model.find(outerCondition, null, { sort: sort }).then(async function (foundDocument) {
            foundDocument = foundDocument?.map(e => e?.toObject() || e);

            let SubModel = mongoose.models[`${cName}Model`] || mongoose.model(`${cName}Model`, Schema["user"], `${cName}s`);

            const subQuery = [];
            for (let i = 0; i < foundDocument.length; i++)
                subQuery.push(foundDocument[i].batchId)

            let subFilter = {}
            subFilter["batchId"] = { "$in": subQuery }


            await SubModel.find(subFilter, projection, { "sort": sort, "skip": body?.from || 0, "limit": body?.size || 100 }).then(async function (foundSubDocument) {
                const totalCount = await SubModel.countDocuments(subFilter);

                foundSubDocument = foundSubDocument?.map(e => e?.toObject() || e)
                const doucmentToReturned = await Promise.all(foundDocument.map(async e => {
                    // const batchDataSingle = await Model.findOne({"batchId" : e.batchId})
                    const charges = foundSubDocument.filter(f => f.batchId === e.batchId);

                    let buyEstimateAmount = charges.map(c => c.buyEstimates?.taxableAmount).reduce((partialSum, a) => partialSum + a, 0) || 0
                    let sellEstimateAmount = charges.map(c => c.selEstimates?.taxableAmount).reduce((partialSum, a) => partialSum + a, 0) || 0

                    return {
                        batchNo: e?.batchNo,
                        batchId: e?.batchId,
                        shipperName: e?.enquiryDetails.basicDetails.shipperName,
                        consigneeName: e?.enquiryDetails.basicDetails.consigneeName,

                        sellEstimateAmount: sellEstimateAmount,
                        buyEstimateAmount: buyEstimateAmount,
                        profitLoss: sellEstimateAmount - buyEstimateAmount
                    }
                }))

                const totalPLSell = doucmentToReturned.map(c => c.sellEstimateAmount).reduce((partialSum, a) => partialSum + a, 0) || 0
                const totalPLBuy = doucmentToReturned.map(c => c.buyEstimateAmount).reduce((partialSum, a) => partialSum + a, 0) || 0

                reportObject = { "documents": doucmentToReturned, "totalCount": totalCount, "totalPL": totalPLSell - totalPLBuy, totalPLSell, totalPLBuy }
                status = 200
            }).catch(function (err) {
                console.error(JSON.stringify({
                    traceId: traceId,
                    error: err,
                    stack: err?.stack
                }))
                reportObject = { error: err?.message }
                status = 500
            });
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "bookingreport") {
        let Model = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
        const outerCondition = {}

        outerCondition["orgId"] = orgId

        if (body?.query?.branchId) {
            outerCondition["branchId"] = body?.query?.branchId
        }
        if (body?.query?.shipmentTypeId) {
            outerCondition["enquiryDetails.basicDetails.ShipmentTypeId"] = body?.query?.shipmentTypeId
        }
        if (body?.query?.batchNo) {
            outerCondition["batchNo"] = body?.query?.batchNo
        }
        if (body?.query?.voyageNumber) {
            outerCondition["quotationDetails.voyageNumber"] = body?.query?.voyageNumber
        }
        if (body?.query?.voyageId) {
            outerCondition["quotationDetails.voyageId"] = body?.query?.voyageId
        }
        if (body?.query?.vesselName) {
            outerCondition["quotationDetails.vesselName"] = body?.query?.vesselName
        }
        if (body?.query?.vesselId) {
            outerCondition["quotationDetails.vesselId"] = body?.query?.vesselId
        }
        if (body?.query?.shippingLineId) {
            outerCondition["enquiryDetails.routeDetails.shippingLineId"] = body?.query?.shippingLineId
        }
        if (body?.query?.portId) {
            outerCondition["enquiryDetails.routeDetails.loadPortId"] = body?.query?.portId
        }
        if (body?.query?.partyMasterId) {
            outerCondition["enquiryDetails.basicDetails.shipperId"] = { $in: await getChildCompany(body?.query?.partyMasterId) }
        }
        if (body?.query?.bookingStatus) {
            outerCondition["statusOfBatch"] = body?.query?.bookingStatus
        }

        await Model.find(outerCondition, {}, { sort: sort }).then(async function (foundDocument) {
            const dataToBeReturned = await Promise.all(foundDocument.map(e => {
                return {
                    jobNo: e.batchNo,
                    inquiryNo: e.enquiryDetails?.enquiryNo,
                    status: e.statusOfBatch,
                    createdOn: e.createdOn,
                    freightType: e.enquiryDetails.basicDetails?.ShipmentTypeName,
                    loadPortName: e.enquiryDetails.routeDetails?.loadPortName,
                    loadPortId: e.enquiryDetails.routeDetails?.loadPortId,
                    destPortName: e.enquiryDetails.routeDetails?.destPortName,
                    destPortId: e.enquiryDetails.routeDetails?.destPortId,
                    consigneeId: e.enquiryDetails.basicDetails?.consigneeId,
                    consigneeName: e.enquiryDetails.basicDetails?.consigneeName,
                    shippingLineName: e.enquiryDetails.routeDetails?.shippingLineName,
                    shippingLineId: e.enquiryDetails.routeDetails?.shippingLineId,
                    vesselName: e?.quotationDetails?.vesselName || "",
                    vesselId: e?.quotationDetails?.vesselId,
                    vesselName: e?.quotationDetails?.vesselName,
                    voyageNumber: e?.quotationDetails?.voyageNumber,
                    shipperName: e.enquiryDetails.basicDetails?.shipperName,
                    shipperId: e.enquiryDetails.basicDetails?.shipperId,
                    forwarderName: e.enquiryDetails.basicDetails?.forwarderName,
                    forwarderId: e.enquiryDetails.basicDetails?.forwarderId
                }
            }))

            const allBatchStatus = await Model.distinct('statusOfBatch');
            reportObject = { "allBatchStatus": allBatchStatus, "documents": dataToBeReturned, "totalCount": foundDocument.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "inquiryreport") {
        cName = "enquiry";

        let Model = mongoose.models[`enquiryModel`] || mongoose.model(`enquiryModel`, Schema["enquiry"], `enquirys`);

        const query = {};

        if (body.query?.partyMasterId)
            query["basicDetails.shipperId"] = { $in: await getChildCompany(body?.query?.partyMasterId) }

        if (body.query?.invoicingParty)
            query["basicDetails.invoicingPartyId"] = body.query.invoicingParty || ""

        if (body.query?.shipmentTypeId)
            query["basicDetails.ShipmentTypeId"] = body.query.shipmentTypeId || ""

        if (body.query?.consigneeId)
            query["basicDetails.consigneeId"] = body.query.consigneeId || ""

        if (body.query?.branchId) {
            let SubModel = mongoose.models[`branchModel`] || mongoose.model(`branchModel`, Schema["branch"], `branchs`);
            await SubModel.find({ batchId: body.query.branchName }).then(async function (foundSubDocument) {
                if (foundSubDocument) {
                    query["basicDetails.billingBranch"] = foundSubDocument.branchName
                }
            })
        }

        if (body.query?.portId)
            query["routeDetails.loadPortId"] = body.query.portId

        if (body.query?.createdOn)
            query["createdOn"] = body.query.createdOn

        if (body.query?.inquiryStatus)
            query["enquiryStatus"] = body.query.inquiryStatus

        if (body.query?.batchNo) {
            let SubModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
            await SubModel.findOne({ batchNo: body.query?.batchNo }).then(async function (foundSubDocument) {
                if (foundSubDocument) {
                    query["batchId"] = foundSubDocument.batchId
                }
            })
        }

        query["orgId"] = orgId

        await Model.find(query, projection, { "sort": sort, "skip": body?.from || 0, "limit": body?.size || 100 }).then(async function (foundDocument) {

            const totalCount = await Model.countDocuments(query);


            const inquiryStatus = await Model.distinct('inquiryStatus');

            reportObject = { "allInquiryStatus": inquiryStatus, "documents": foundDocument, "totalCount": totalCount }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "containerreport") {
        cName = "container";

        let Model = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
        const outerCondition = {}

        outerCondition["orgId"] = orgId

        if (body?.query?.branchId) {
            outerCondition["branchId"] = body?.query?.branchId
        }
        if (body?.query?.batchNo) {
            outerCondition["batchNo"] = body?.query?.batchNo
        }
        if (body?.query?.portId) {
            outerCondition["enquiryDetails.routeDetails.loadPortId"] = body?.query?.portId
        }
        if (body?.query?.partyMasterId) {
            outerCondition["enquiryDetails.basicDetails.shipperId"] = { $in: await getChildCompany(body?.query?.partyMasterId) }
        }

        await Model.find(outerCondition, null, { sort: sort }).then(async function (foundDocument) {
            let SubModel = mongoose.models[`${cName}Model`] || mongoose.model(`${cName}Model`, Schema["user"], `${cName}s`);
            let ContainerMasterModel = mongoose.models[`containerMasterModel`] || mongoose.model(`containerMasterModel`, Schema["containermaster"], `containermasters`);
            const subQuery = [];
            let batchIdToDetails = []

            for (let i = 0; i < foundDocument.length; i++) {
                subQuery.push(foundDocument[i].batchId)
                batchIdToDetails[foundDocument[i].batchId] = {
                    vesselName: foundDocument[i]?.quotationDetails?.vesselName,
                    voyageNumber: foundDocument[i]?.quotationDetails?.voyageNumber,
                    loadType: foundDocument[i]?.enquiryDetails?.basicDetails.loadType,
                }
            }

            let subFilter = {}
            subFilter["batchId"] = { "$in": subQuery }

            if (body?.query?.createdOn)
                subFilter["createdOn"] = body.query.createdOn

            await SubModel.find(subFilter, projection, { "sort": sort, "skip": body?.from || 0, "limit": body?.size || 100 }).then(async function (foundSubDocument) {
                const totalCount = await SubModel.countDocuments(subFilter);

                const doucmentToReturned = await Promise.all(foundSubDocument.map(async e => {

                    let ContainerMasterModelData = await ContainerMasterModel.findOne({ containermasterId: e.mastercontainerId })

                    return {
                        containerNumber: e.containerNumber,
                        containerTypeName: e.containerTypeName,
                        containerTypeId: e.containerTypeId,
                        tankStatus: e.statusFlag,
                        shippingLineName: e.shippingLineName,
                        batchNo: e.batchNo,
                        vesselName: batchIdToDetails[e.batchId]?.vesselName,
                        voyageNumber: batchIdToDetails[e.batchId]?.voyageNumber,
                        yardName: ContainerMasterModelData?.yardName,
                        loadType: batchIdToDetails[e.batchId]?.loadType,
                        containerStatus: ContainerMasterModelData?.containerStatus

                    }
                }))
                reportObject = { "documents": doucmentToReturned, "totalCount": totalCount }
                status = 200
            }).catch(function (err) {
                console.error(JSON.stringify({
                    traceId: traceId,
                    error: err,
                    stack: err?.stack
                }))
                reportObject = { error: err?.message }
                status = 500
            });
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "telexReport") {
        cName = "deliveryorder";

        let Model = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
        let blModel = mongoose.models[`blModel`] || mongoose.model(`blModel`, Schema["bl"], `bls`);
        const outerCondition = {}

        outerCondition["orgId"] = orgId

        if (body?.query?.batchNo) {
            outerCondition["batchNo"] = body?.query?.batchNo
        }

        await Model.find(outerCondition, null, { sort: { "routeDetails.etd": -1, ...sort } }).then(async function (foundDocument) {
            let SubModel = mongoose.models[`${cName}Model`] || mongoose.model(`${cName}Model`, Schema["user"], `${cName}s`);

            const subQuery = [];

            for (let i = 0; i < foundDocument.length; i++) {
                subQuery.push(foundDocument[i].batchId)
            }

            let subFilter = {}
            subFilter["batchId"] = { "$in": subQuery }

            if (body?.query?.createdOn)
                subFilter["createdOn"] = body.query.createdOn

            subFilter["releaseType"] = "DO Release without Telex"

            if (body?.query?.depoId)
                subFilter["depoId"] = body.query.depoId

            if (body?.query?.validTill)
                subFilter["validTill"] = body.query.validTill

            await SubModel.find(subFilter, projection, { "sort": sort, "skip": body?.from || 0, "limit": body?.size || 100 }).then(async function (foundSubDocument) {
                const totalCount = await SubModel.countDocuments(subFilter);

                let doucmentToReturned = await Promise.all(foundSubDocument.map(async e => {
                    return {
                        ...e.toObject(),
                        batchNo: foundDocument.find(b => b.batchId === e.batchId).batchNo
                    }
                }))
                let blData = {}
                await blModel.find({ blId: { $in: doucmentToReturned.map(e => e?.hblDetails?.blId) } }).then(async function (foundBlDocument) {
                    for (let bl = 0; bl < foundBlDocument.length; bl++) {
                        blData[foundBlDocument[bl].blId] = foundBlDocument[bl]
                    }
                })

                doucmentToReturned = doucmentToReturned.filter((e) => {
                    if (e?.hblDetails?.blId && blData[e?.hblDetails?.blId].releaseDate != "")
                        return false

                    return true
                })

                reportObject = { "documents": doucmentToReturned, "totalCount": totalCount }
                status = 200
            }).catch(function (err) {
                console.error(JSON.stringify({
                    traceId: traceId,
                    error: err,
                    stack: err?.stack
                }))
                reportObject = { error: err?.message }
                status = 500
            });
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "telexDateWiseReport") {
        cName = "bl";

        let Model = mongoose.models[`blModel`] || mongoose.model(`blModel`, Schema["bl"], `bls`);
        const outerCondition = {}

        outerCondition["orgId"] = orgId

        let consigneeArr = body.query?.consigneeId;
        if (consigneeArr) {
            consigneeArr = Array.isArray(consigneeArr) ? consigneeArr : [consigneeArr];
            if (consigneeArr.length > 0) {
                outerCondition["consigneeId"] = { $in: consigneeArr };
            }
        }

        if (body.query?.shipperId) {
            outerCondition["shipperId"] = body.query?.shipperId
        }

        if (body.query?.createdOn) {
            outerCondition["telexDate"] = body?.query?.createdOn
        } else {
            outerCondition["telexDate"] = {
                $ne: ""
            }
        }

        await Model.find(outerCondition, null, { sort: { "telexDate": -1, ...sort } }).then(async function (foundDocument) {
            let batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
            let batchData = await batchModel.find({
                batchId: {
                    $in: foundDocument?.map(e => e?.batchId)
                }
            })
            if (batchData)
                batchData = batchData?.map(e => e?.toObject())

            const foundDocumentMapped = foundDocument.map((e) => {
                return {
                    batchId: e?.batchId,
                    batchNo: batchData?.find(b => b?.batchId === e?.batchId)?.batchNo || e?.batchNo,
                    telexDate: e?.telexDate,
                    blType: e?.blType,
                    blNumber: e?.blNumber,
                    shipperName: e?.shipperName,
                    consigneeName: e?.consigneeName,
                    containers: e?.containers?.map(e => e?.containerNumber),
                    blStatus: e[`${e?.blType}Status`]
                }
            }
            )
            reportObject = { "documents": foundDocumentMapped, "totalCount": foundDocumentMapped?.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "tdsReport") {
        cName = "payment";

        let paymentModel = mongoose.models[`paymentModel`] || mongoose.model(`paymentModel`, Schema["payment"], `payments`);

        const outerCondition = {}

        if (body.query?.partyMasterId) {
            const partyIds = await getChildCompany(body?.query?.partyMasterId)

            outerCondition["$or"] = [
                {
                    "invoiceFromId": { $in: partyIds }
                },
                {
                    "invoiceToId": { $in: partyIds }
                }
            ]
        }

        outerCondition["orgId"] = orgId

        outerCondition["tdsApplicable"] = true

        if (body.query?.createdOn)
            outerCondition["createdOn"] = body.query.createdOn

        await paymentModel.find(outerCondition, null, { sort: sort }).then(async function (foundDocument) {
            const totalCount = await paymentModel.countDocuments(outerCondition);

            const doucmentToReturned = foundDocument.map((e) => {
                return {
                    bankName: e?.bankName,
                    bankName: e?.bankId,
                    partyName: e?.invoiceToName,
                    transactionId: e.paymentNo,
                    tdsAmount: e.tdsAmount,
                    tdsPercentage: e.tdsPer,
                    tdsStutus: e.tdsStatus || "Pending",
                    tdsType: e.amountType,
                    transactionType: e.transactionType,
                    netAmount: e.netAmount,
                    paidAmount: e.paidAmount,
                    createdOn: e.createdOn,
                    invoiceData: e.invoiceData
                }
            })
            reportObject = { "documents": doucmentToReturned, "totalCount": totalCount }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "bankStatement") {
        cName = "bank";

        let paymentModel = mongoose.models[`paymentModel`] || mongoose.model(`paymentModel`, Schema["payment"], `payments`);

        const outerCondition = {}

        outerCondition["orgId"] = orgId

        outerCondition["paymentType"] = "Bank"

        if (body.query?.createdOn)
            outerCondition["createdOn"] = body.query.createdOn

        if (body.query?.bankId)
            outerCondition["bankId"] = body.query.bankId

        await paymentModel.find(outerCondition, null, { sort: sort }).then(async function (foundDocument) {
            const totalCount = await paymentModel.countDocuments(outerCondition);

            const doucmentToReturned = foundDocument.map((e) => {
                return {
                    bankName: e?.bankName,
                    bankName: e?.bankId,
                    transactionType: e.transactionType,
                    createdOn: e.createdOn,
                    netAmount: e.netAmount,
                    partyName: e?.invoiceToName,
                    transactionId: e.paymentNo,
                    tdsType: e.amountType,
                    tdsAmount: e.tdsAmount,
                    tdsPercentage: e.tdsPer,
                    tdsStutus: e.tdsStatus || "Pending",
                    paidAmount: e.paidAmount,
                    invoiceData: e.invoiceData
                }
            })

            const creditTotal = await paymentModel.aggregate([
                {
                    $match: {
                        bankId: body.query.bankId,
                        orgId: orgId,
                        amountType: "Credit"
                    },
                },
                {
                    $group: {
                        _id: null, // Group all matching documents together
                        totalAmount: { $sum: "$netAmount" }, // Sum the "amount" field
                    },
                },
            ]);
            const debitTotal = await paymentModel.aggregate([
                {
                    $match: {
                        bankId: body.query.bankId,
                        orgId: orgId,
                        amountType: "Debit"
                    },
                },
                {
                    $group: {
                        _id: null, // Group all matching documents together
                        totalAmount: { $sum: "$netAmount" }, // Sum the "amount" field
                    },
                },
            ]);

            reportObject = { "debitTotal": debitTotal[0]?.totalAmount || 0, "creditTotal": creditTotal[0]?.totalAmount || 0, "documents": doucmentToReturned, "totalCount": totalCount }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "hsnReport") {
        let invoiceModel = mongoose.models[`invoiceModel`] || mongoose.model(`invoiceModel`, Schema["invoice"], `invoices`);

        const outerCondition = {}

        outerCondition["orgId"] = orgId

        outerCondition["type"] = "sellerInvoice"

        if (body.query?.createdOn)
            outerCondition["createdOn"] = body.query.createdOn

        await invoiceModel.find(outerCondition, null, { sort: sort }).then(async function (foundDocument) {
            let costItems = foundDocument.map(e => e.costItems).flat();
            costItems = costItems.map((e) => {
                return {
                    costItemId: e.costItemId,
                    costItemName: e.costItemName,
                    quantity: e.quantity,
                    hsnCode: e.hsnCode,
                    igst: e.buyEstimates.igst,
                    cgst: e.buyEstimates.cgst,
                    sgst: e.buyEstimates.sgst,
                    taxableAmount: e.buyEstimates.taxableAmount,
                    totalAmount: e.buyEstimates.totalAmount,
                }
            })
            let groupedByHsnCode = costItems.reduce((acc, item) => {
                const { hsnCode } = item;
                if (!acc[hsnCode]) {
                    acc[hsnCode] = [];
                }

                const indexOfHsn = acc[hsnCode].findIndex(e => e.costItemId === item.costItemId)

                if (hsnCode && item) {
                    if (indexOfHsn === -1)
                        acc[hsnCode].push(item);
                    else {
                        acc[hsnCode][indexOfHsn].quantity += item.quantity
                        acc[hsnCode][indexOfHsn].igst += item.igst
                        acc[hsnCode][indexOfHsn].cgst += item.cgst
                        acc[hsnCode][indexOfHsn].sgst += item.sgst
                        acc[hsnCode][indexOfHsn].taxableAmount += item.taxableAmount
                        acc[hsnCode][indexOfHsn].totalAmount += item.totalAmount
                    }
                }

                return acc;
            }, {});

            groupedByHsnCode = Object.values(groupedByHsnCode).flat()

            reportObject = { "documents": groupedByHsnCode, "totalCount": groupedByHsnCode?.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "dsrReport") {
        let batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);

        const outerCondition = {}

        outerCondition["orgId"] = orgId

        if (!(body?.query?.isJobClose)) {
            outerCondition["statusOfBatch"] = { $nin: ["Job Closed", "Job Cancelled"] }
        }

        if (body.query?.milestones) {
            outerCondition["statusOfBatch"] = { ...outerCondition["statusOfBatch"], $in: body.query?.milestones }
        }

        if (body.query?.partyMasterId) {
            const partyIds = await getChildCompany(body?.query?.partyMasterId)

            outerCondition["$or"] = [
                {
                    "enquiryDetails.basicDetails.multiShipper.partymasterId": { $in: partyIds },
                    "enquiryDetails.basicDetails.multiShipper": {
                        $exists: true,
                        $ne: []
                    }
                },
                {
                    "enquiryDetails.basicDetails.consigneeId": { $in: partyIds }
                },
                {
                    "enquiryDetails.basicDetails.shipperId": { $in: partyIds }
                },
                {
                    "enquiryDetails.basicDetails.multiConsignee.partymasterId": { $in: partyIds },
                    "enquiryDetails.basicDetails.multiConsignee": {
                        $exists: true,
                        $ne: []
                    }
                },
                {
                    "enquiryDetails.basicDetails.agentId": { $in: partyIds }
                },
                {
                    "customerId": { $in: partyIds }
                }
            ]
        } else {
            reportObject = { error: "Please add partyMasterId in query!" }
            status = 500
        }

        if (body.query?.createdOn)
            outerCondition["createdOn"] = body.query.createdOn

        if (body.query?.portId)
            outerCondition["$or"] = [
                {
                    "quotationDetails.loadPortId": body.query.portId
                },
                {
                    "quotationDetails.dischargePortId": body.query.portId
                }
            ]

        await batchModel.find(outerCondition, {
            batchNo: 1,
            batchId: 1,
            createdOn: 1,
            "enquiryDetails.basicDetails.multiShipper": 1,
            "enquiryDetails.basicDetails.multiConsignee": 1,
            "enquiryDetails.basicDetails.consigneeId": 1,
            "enquiryDetails.basicDetails.consigneeName": 1,
            "enquiryDetails.basicDetails.shipperId": 1,
            "enquiryDetails.basicDetails.shipperName": 1,
            hblNumber: 1,
            "enquiryDetails.routeDetails.shippingLineShortName": 1,
            "enquiryDetails.routeDetails.shippingLineName": 1,
            "statusOfBatch": 1,
            "containersName": 1,
            "remarks": 1,
            "mblNumber": 1,
            "enquiryDetails.routeDetails.locationName": 1,
            "enquiryDetails.routeDetails.destPortName": 1,
            "enquiryDetails.routeDetails.loadPortName": 1,
            "quotationDetails.vesselName": 1,
            "quotationDetails.voyageNumber": 1,
            "routeDetails.eta": 1,
            "routeDetails.etd": 1,
            "routeDetails.ata": 1,
            "routeDetails.atd": 1,
            "routeDetails.railETD": 1,
            "containerNos": 1,
            batchId: 1,
            "enquiryDetails.basicDetails.bookingRef": 1,
            "enquiryDetails.containersDetails": 1
        }, { sort: { ...sort, createdOn: 1 } }).then(async function (foundDocument) {
            let eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
            let blModel = mongoose.models[`blModel`] || mongoose.model(`blModel`, Schema["bl"], `bls`);
            let deliveryorderModel = mongoose.models[`deliveryorderModel`] || mongoose.model(`deliveryorderModel`, Schema["deliveryorder"], `deliveryorders`);
            let containerModel = mongoose.models[`containerModel`] || mongoose.model(`containerModel`, Schema["container"], `containers`);
            let igmcfsModel = mongoose.models[`igmcfsModel`] || mongoose.model(`igmcfsModel`, Schema["igmcfs"], `igmcfss`);

            const subQuery = [];
            for (let i = 0; i < foundDocument.length; i++)
                subQuery.push(foundDocument[i].batchId)

            let events = await eventModel.find({ entityId: { $in: subQuery } })
            if (events)
                events = events?.map(e => e.toObject())

            let bls = [];

            if (subQuery.length > 0) {
                const orConditions = subQuery.flatMap(id => [
                    { batchId: id },
                    { 'consolidatedJobs.batchId': id }
                ]);
                const blCondition = { $or: orConditions };

                blCondition["sblChecked"] = body?.query?.sblChecked || false

                bls = await blModel.find(blCondition);
            }


            if (bls)
                bls = bls?.map(e => e.toObject())

            let deliveryorders = await deliveryorderModel.find({ batchId: { $in: subQuery } })
            if (deliveryorders)
                deliveryorders = deliveryorders?.map(e => e.toObject())

            let containers = await containerModel.find({
                "$or": [
                    {
                        "batchId": {
                            $in: subQuery
                        }
                    },
                    {
                        "batchwiseGrouping.batchId": {
                            $in: subQuery
                        }
                    }
                ]
            })
            if (containers)
                containers = containers?.map(e => e.toObject())

            let igmcfss = await igmcfsModel.find({ batchId: { $in: subQuery } })
            if (igmcfss)
                igmcfss = igmcfss?.map(e => e.toObject())


            let newRecords = foundDocument.map((e) => {
                return {
                    multiShipper: e?.enquiryDetails?.basicDetails?.multiShipper,
                    multiShipperCS: [e.enquiryDetails?.basicDetails?.shipperName, ...e?.enquiryDetails?.basicDetails?.multiShipper?.map(cs => cs.name)]?.join(", "),
                    multiShipperCSBackup: [e.enquiryDetails?.basicDetails?.shipperName, ...e?.enquiryDetails?.basicDetails?.multiShipper?.map(cs => cs.name)]?.join(", "),
                    multiConsignee: e?.enquiryDetails?.basicDetails?.multiConsignee,
                    multiConsigneeCS: [e.enquiryDetails?.basicDetails?.consigneeName, ...e?.enquiryDetails?.basicDetails?.multiConsignee?.map(cs => cs.name)]?.join(", "),
                    multiConsigneeBackup: [e.enquiryDetails?.basicDetails?.consigneeName, ...e?.enquiryDetails?.basicDetails?.multiConsignee?.map(cs => cs.name)]?.join(", "),
                    batchContainersDetails: e?.enquiryDetails?.containersDetails,
                    bookingRef: e?.enquiryDetails?.basicDetails?.bookingRef,
                    batchId: e?.batchId,
                    railETD: e?.routeDetails.railETD || "",
                    statusOfBatch: e?.statusOfBatch || "",
                    // containerNos: containers.filter(c => (c?.batchId === e.batchId || c?.batchwiseGrouping?.some(bc => bc.batchId === e.batchId)))?.map(c => c.containerNumber).filter(e => e)?.join(", ") || "",
                    // containersName: e?.containersName || "",
                    remarks: e?.remarks || "",
                    eta: e?.routeDetails?.eta || "",
                    ata: e?.routeDetails?.ata || "",
                    atd: e?.routeDetails?.atd || "",
                    etd: e?.routeDetails?.etd || "",
                    containersName: e?.containersName || "",
                    // mblNumber : e?.mblNumber || "",
                    vesselName: e?.quotationDetails?.vesselName || "",
                    voyageNumber: e?.quotationDetails?.voyageNumber,
                    loadPortName: e.enquiryDetails?.routeDetails?.loadPortName || "",
                    destPortName: e.enquiryDetails?.routeDetails?.destPortName || "",
                    locationName: e.enquiryDetails?.routeDetails?.locationName || "",
                    consigneeId: e.enquiryDetails?.basicDetails?.consigneeId || "",
                    consigneeName: e.enquiryDetails?.basicDetails?.consigneeName || "",
                    shipperId: e.enquiryDetails?.basicDetails?.shipperId || "",
                    shipperName: e.enquiryDetails?.basicDetails?.shipperName || "",
                    createdOn: e.createdOn,
                    batchNo: e.batchNo,
                    hblNumber: bls?.filter(x => x.batchId === e.batchId || x.consolidatedJobs.find(ef => ef.batchId === e.batchId))?.filter(e => e?.blType === "HBL") || [],
                    mblNumber: bls?.filter(x => x.batchId === e.batchId || x.consolidatedJobs.find(ef => ef.batchId === e.batchId))?.find(e => e?.blType === "MBL")?.blNumber,
                    shippingLineName: e.enquiryDetails?.routeDetails?.shippingLineShortName || e?.enquiryDetails?.routeDetails?.shippingLineName,
                    milestones: events.filter(f => f.entityId === e.batchId)?.map((f) => {
                        return {
                            milestoneName: f.eventName,
                            milestoneSeq: f.eventSeq,
                            actualDate: f?.eventData?.eventState === "ActualDate" ? f?.eventData?.bookingDate : "N/A",
                            estimatedDate: f?.eventData?.eventState != "ActualDate" ? f?.eventData?.bookingDate : "N/A"
                        }
                    }) || []
                }
            })

            let transformedData = [];

            newRecords.map(e => {
                if (e?.hblNumber?.length > 0) {
                    e?.hblNumber?.map(x => {
                        transformedData.push({
                            ...e,
                            hblNumber: x
                        })

                        return x
                    })
                } else {
                    transformedData.push({
                        ...e
                    })
                }


                return e
            })

            transformedData = transformedData?.map((e) => {
                const stuffingMilestone = e.milestones?.find(m => m.milestoneName?.toLowerCase()?.includes("stuffing"))
                const foundBL = bls.find(b => b.blId === e?.hblNumber?.blId);
                let noc = foundBL?.containers?.length || 0;
                let containerNos = foundBL?.containers?.map(e => e.containerNumber)?.filter(e => e)?.join(", ") || "";
                let containersName = [...new Set(bls.find(b => b.blId === e?.hblNumber?.blId)?.containers?.map(e => e.containerTypeName)?.filter(e => e))].join(", ") || "";
                if (!(foundBL)) {
                    containerNos = containers.filter(c => (c?.batchId === e.batchId || c?.batchwiseGrouping?.some(bc => bc.batchId === e.batchId)))?.map(c => c.containerNumber).filter(e => e)?.join(", ") || "",
                        noc = containers.filter(c => (c?.batchId === e.batchId || c?.batchwiseGrouping?.some(bc => bc.batchId === e.batchId)))?.length
                }

                if (noc === 0) {
                    noc = e?.batchContainersDetails?.reduce((sum, item) => sum + (item.noOfContainer || 0), 0);
                    containersName = [...new Set(e?.batchContainersDetails?.map(item => item.containerType))].join(', ');
                }


                return {
                    ...e,
                    // noc: igmcfss.filter(i => i.movementType === "NOC" && i.batchId === e.batchId)?.length || 0,
                    noc: noc,
                    containerNos: containerNos,
                    containersName: containersName,
                    doDate: deliveryorders?.find(d => d?.hblDetails?.blId === e?.hblNumber?.blId && d.batchId === e.batchId)?.deliveryDate || "",
                    hblNumber: e?.hblNumber?.blNumber,
                    multiShipperCSBackupHBL: e?.hblNumber?.shipperName,
                    multiConsigneeBackupHBL: e?.hblNumber?.consigneeName,
                    packageHBL: e?.hblNumber?.containers?.map(phbl => {
                        return {
                            cbm: phbl?.cbm,
                            package: Number(phbl?.package || '0'),
                            packageType: phbl?.packageType,
                            packageTypeName: phbl?.packageTypeName
                        }
                    }),
                    stuffingDate: stuffingMilestone?.actualDate === "N/A" ? stuffingMilestone?.estimatedDate : stuffingMilestone?.actualDate
                }
            })

            transformedData = transformedData?.map((e) => {

                return {
                    ...e,
                    multiShipperCS: e?.hblNumber ? e?.multiShipperCSBackupHBL : e?.multiShipperCSBackup,
                    multiConsigneeCS: e?.hblNumber ? e?.multiConsigneeBackupHBL : e?.multiConsigneeBackup,
                }
            })


            reportObject = { "documents": transformedData, "totalCount": transformedData?.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "customerDsrReport") {
        let batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);

        const outerCondition = {}

        outerCondition["orgId"] = orgId
        outerCondition["statusOfBatch"] = { $ne: "Job Closed" }


        if (body.query?.partyMasterId) {
            const partyIds = await getChildCompany(body?.query?.partyMasterId)

            outerCondition["$or"] = [
                {
                    "enquiryDetails.basicDetails.consigneeId": { $in: partyIds }
                },
                {
                    "enquiryDetails.basicDetails.shipperId": { $in: partyIds }
                },
                {
                    "enquiryDetails.basicDetails.agentId": { $in: partyIds }
                },
                {
                    "customerId": { $in: partyIds }
                }
            ]
        } else {
            reportObject = { error: "Please add partyMasterId in query!" }
            status = 500
        }

        if (body.query?.createdOn)
            outerCondition["createdOn"] = body.query.createdOn

        await batchModel.find(outerCondition, {
            batchNo: 1,
            batchId: 1,
            createdOn: 1,
            "enquiryDetails.basicDetails.consigneeId": 1,
            "enquiryDetails.basicDetails.consigneeName": 1,
            "enquiryDetails.basicDetails.shipperId": 1,
            "enquiryDetails.basicDetails.shipperName": 1,
            hblNumber: 1,
            "enquiryDetails.routeDetails.shippingLineShortName": 1,
            "enquiryDetails.routeDetails.shippingLineName": 1,
            "statusOfBatch": 1,
            "containersName": 1,
            "remarks": 1,
            "mblNumber": 1,
            "enquiryDetails.routeDetails.locationName": 1,
            "enquiryDetails.routeDetails.destPortName": 1,
            "enquiryDetails.routeDetails.loadPortName": 1,
            "quotationDetails.vesselName": 1,
            "quotationDetails.voyageNumber": 1,
            "routeDetails.eta": 1,
            "routeDetails.etd": 1,
            "routeDetails.ata": 1,
            "routeDetails.atd": 1,
            "routeDetails.railETD": 1,
            "containerNos": 1,
            batchId: 1
        }, { sort: sort }).then(async function (foundDocument) {
            let eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
            let blModel = mongoose.models[`blModel`] || mongoose.model(`blModel`, Schema["bl"], `bls`);
            let deliveryorderModel = mongoose.models[`deliveryorderModel`] || mongoose.model(`deliveryorderModel`, Schema["deliveryorder"], `deliveryorders`);
            let containerModel = mongoose.models[`containerModel`] || mongoose.model(`containerModel`, Schema["container"], `containers`);
            let igmcfsModel = mongoose.models[`igmcfsModel`] || mongoose.model(`igmcfsModel`, Schema["igmcfs"], `igmcfss`);

            const subQuery = [];
            for (let i = 0; i < foundDocument.length; i++)
                subQuery.push(foundDocument[i].batchId)

            const events = await eventModel.find({ entityId: { $in: subQuery } })
            const bls = await blModel.find({ batchId: { $in: subQuery } })
            const deliveryorders = await deliveryorderModel.find({ batchId: { $in: subQuery } })
            const containers = await containerModel.find({ batchId: { $in: subQuery } })
            const igmcfss = await igmcfsModel.find({ batchId: { $in: subQuery } })


            let newRecords = foundDocument.map((e) => {
                return {
                    batchId: e?.batchId,
                    railETD: e?.routeDetails.railETD || "",
                    statusOfBatch: e?.statusOfBatch || "",
                    containerNos: containers?.filter(c => c.batchId === e.batchId)?.map(c => c.containerNumber)?.join(", ") || "",
                    containersName: e?.containersName || "",
                    remarks: e?.remarks || "",
                    eta: e?.routeDetails?.eta || "",
                    ata: e?.routeDetails?.ata || "",
                    atd: e?.routeDetails?.atd || "",
                    etd: e?.routeDetails?.etd || "",
                    containersName: e?.containersName || "",
                    // mblNumber : e?.mblNumber || "",
                    vesselName: e?.quotationDetails?.vesselName || "",
                    voyageNumber: e?.quotationDetails?.voyageNumber,
                    loadPortName: e.enquiryDetails?.routeDetails?.loadPortName || "",
                    destPortName: e.enquiryDetails?.routeDetails?.destPortName || "",
                    locationName: e.enquiryDetails?.routeDetails?.locationName || "",
                    consigneeId: e.enquiryDetails?.basicDetails?.consigneeId || "",
                    consigneeName: e.enquiryDetails?.basicDetails?.consigneeName || "",
                    shipperId: e.enquiryDetails?.basicDetails?.shipperId || "",
                    shipperName: e.enquiryDetails?.basicDetails?.shipperName || "",
                    createdOn: e.createdOn,
                    batchNo: e.batchNo,
                    hblNumber: bls?.filter(x => x.batchId === e.batchId)?.filter(e => e?.blType === "HBL") || [],
                    mblNumber: bls?.filter(x => x.batchId === e.batchId)?.find(e => e?.blType === "MBL")?.blNumber,
                    shippingLineName: e.enquiryDetails?.routeDetails?.shippingLineShortName || e?.enquiryDetails?.routeDetails?.shippingLineName,
                    milestones: events.filter(f => f.entityId === e.batchId)?.map((f) => {
                        return {
                            milestoneName: f.eventName,
                            milestoneSeq: f.eventSeq,
                            actualDate: f?.eventData?.eventState === "ActualDate" ? f?.eventData?.bookingDate : "N/A",
                            estimatedDate: f?.eventData?.eventState != "ActualDate" ? f?.eventData?.bookingDate : "N/A"
                        }
                    }) || []
                }
            })

            let transformedData = [];

            newRecords.map(e => {
                if (e?.hblNumber?.length > 0) {
                    e?.hblNumber?.map(x => {
                        transformedData.push({
                            ...e,
                            hblNumber: x
                        })

                        return x
                    })
                } else {
                    transformedData.push({
                        ...e
                    })
                }


                return e
            })

            transformedData = transformedData?.map((e) => {
                const stuffingMilestone = e.milestones?.find(m => m.milestoneName?.toLowerCase()?.includes("stuffing"))
                return {
                    ...e,
                    noc: igmcfss.filter(i => i.movementType === "NOC" && i.batchId === e.batchId)?.length || 0,
                    doDate: deliveryorders?.find(d => d?.hblDetails?.blId === e?.hblNumber?.blId && d.batchId === e.batchId)?.deliveryDate || "",
                    hblNumber: e?.hblNumber?.blNumber,
                    stuffingDate: stuffingMilestone?.actualDate === "N/A" ? stuffingMilestone?.estimatedDate : stuffingMilestone?.actualDate
                }
            })

            reportObject = { "documents": transformedData, "totalCount": transformedData?.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "jobReport") {
        let batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);

        const outerCondition = {}

        outerCondition["orgId"] = orgId

        if (!(body?.query?.isJobClose)) {
            outerCondition["statusOfBatch"] = { $nin: ["Job Closed", "Job Cancelled"] }
        }
        if (body.query?.statusOfJob) {
            outerCondition["statusOfBatch"] = {
                "$ne": "Job Closed",
                "$eq": body.query?.statusOfJob
            }
        }

        if (body.query?.partyMasterId) {
            const partyIds = await getChildCompany(body?.query?.partyMasterId)

            outerCondition["$or"] = [
                {
                    "enquiryDetails.basicDetails.consigneeId": { $in: partyIds }
                },
                {
                    "enquiryDetails.basicDetails.shipperId": { $in: partyIds }
                },
                {
                    "enquiryDetails.basicDetails.agentId": { $in: partyIds }
                },
                {
                    "customerId": { $in: partyIds }
                }
            ]
        }

        if (body.query?.createdOn)
            outerCondition["createdOn"] = body.query.createdOn

        await batchModel.find(outerCondition, {
            batchNo: 1,
            batchId: 1,
            createdOn: 1,
            "enquiryDetails.basicDetails.consigneeId": 1,
            "enquiryDetails.basicDetails.consigneeName": 1,
            "enquiryDetails.basicDetails.shipperId": 1,
            "enquiryDetails.basicDetails.shipperName": 1,
            hblNumber: 1,
            mblNumber: 1,
            statusOfBatch: 1,
            routeDetails: 1
        }, { sort: sort }).then(async function (foundDocument) {
            const newRecords = foundDocument.map((e) => {
                return {
                    consigneeId: e.enquiryDetails?.basicDetails?.consigneeId,
                    consigneeName: e.enquiryDetails?.basicDetails?.consigneeName,
                    shipperId: e.enquiryDetails?.basicDetails?.shipperId,
                    shipperName: e.enquiryDetails?.basicDetails?.shipperName,
                    batchNo: e.batchNo,
                    hblNumber: e.hblNumber,
                    mblNumber: e.mblNumber,
                    statusOfBatch: e.statusOfBatch,
                    arrivalTime: e.routeDetails.ata || e.routeDetails.eta,
                    departureTime: e.routeDetails.atd || e.routeDetails.etd
                }
            })

            reportObject = { "documents": newRecords, "totalCount": newRecords?.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "gstReport") {
        let paymentModel = mongoose.models[`paymentModel`] || mongoose.model(`paymentModel`, Schema["payment"], `payments`);

        const outerCondition = {}

        outerCondition["orgId"] = orgId

        if (body.query?.partyMasterId)
            outerCondition["invoiceToId"] = body.query?.partyMasterId

        if (body.query?.createdOn)
            outerCondition["createdOn"] = body.query.createdOn

        await paymentModel.find(outerCondition, null, { sort: sort }).then(async function (foundDocument) {
            let groupedByParty = foundDocument.reduce((acc, item) => {
                const { invoiceToId } = item;
                if (!acc[invoiceToId]) {
                    acc[invoiceToId] = {
                        data: [],
                        purchaseTax: 0,
                        sellTax: 0,
                    };
                }

                acc[invoiceToId]["data"].push(item);

                acc[invoiceToId]["invoiceToId"] = item.invoiceToId
                acc[invoiceToId]["invoiceToName"] = item.invoiceToName

                if (item.type === "buyerInvoice")
                    acc[invoiceToId]["purchaseTax"] += item?.invoiceTaxAmount || 0
                else
                    acc[invoiceToId]["sellTax"] += item?.invoiceTaxAmount || 0

                return acc;
            }, {});

            groupedByParty = Object.values(groupedByParty).flat()?.map((e) => {
                const { data, ...other } = e
                return other
            })

            reportObject = { "documents": groupedByParty, "totalCount": groupedByParty?.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "partyReport") {
        let partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, Schema["partymaster"], `partymasters`);
        let invoiceModel = mongoose.models[`invoiceModel`] || mongoose.model(`invoiceModel`, Schema["invoice"], `invoices`);

        const outerCondition = {}

        outerCondition["orgId"] = orgId

        if (body.query?.partyMasterId)
            outerCondition["partymasterId"] = body.query?.partyMasterId

        if (body.query?.createdOn)
            outerCondition["createdOn"] = body.query.createdOn

        await partymasterModel.find(outerCondition, null, { sort: sort }).then(async function (foundDocument) {
            let dataToBeReturned = []
            const invoiceIds = []

            for (let i = 0; i < foundDocument?.length; i++) {
                const party = foundDocument[i];

                if (!party)
                    continue;

                for (let j = 0; j < party?.branch?.length; j++) {
                    const branch = party.branch[j];

                    if (!branch)
                        continue;

                    dataToBeReturned.push({
                        partymasterId: party.partymasterId,
                        partyName: party.name,
                        branchName: branch.branch_name,
                        taxNumber: branch.tax_number,
                        receivable: 0,
                        payable: 0
                    })

                    invoiceIds.push(party.partymasterId)
                }
            }

            const invoices = await invoiceModel.find({ invoiceFromId: { $in: invoiceIds } })
            for (let i = 0; i < invoices.length; i++) {
                const invoice = invoices[i].toObject()

                if (!invoice)
                    continue;

                dataToBeReturned = dataToBeReturned.filter(e => e).map((e) => {
                    if (e?.partymasterId === invoice?.invoiceFromId && e.branchName === invoice.invoiceFromBranchName) {
                        if (invoice.type === "sellerInvoice") {
                            return {
                                ...e,
                                receivable: e?.receivable + parseFloat(invoice.invoiceAmount || 0)
                            }
                        } else if (invoice.type === "buyerInvoice") {
                            return {
                                ...e,
                                payable: e?.payable + parseFloat(invoice.invoiceAmount || 0)
                            }
                        }
                    } else {
                        return e
                    }
                })
            }

            const receivableTotal = dataToBeReturned.reduce((sum, item) => sum + item?.receivable, 0);
            const payableTotal = dataToBeReturned.reduce((sum, item) => sum + item.payable, 0);

            reportObject = { receivableTotal: receivableTotal, payableTotal: payableTotal, "documents": dataToBeReturned, "totalCount": dataToBeReturned?.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "expenseReport") {
        let invoiceModel = mongoose.models[`invoiceModel`] || mongoose.model(`invoiceModel`, Schema["invoice"], `invoices`);

        const outerCondition = {}

        outerCondition["orgId"] = orgId
        outerCondition["type"] = "buyerInvoice"

        if (body.query?.partyMasterId) {
            outerCondition["invoiceFromId"] = body.query.partyMasterId
        }

        if (body.query?.createdOn)
            outerCondition["createdOn"] = body.query.createdOn

        if (body.query?.jobNo)
            outerCondition["batchNo"] = body.query.jobNo

        await invoiceModel.find(outerCondition, {
            invoiceNo: 1,
            invoiceFromName: 1,
            invoiceFromId: 1,
            createdOn: 1,
            paymentMode: 1,
            invoiceAmount: 1,
            paidAmount: 1,
            balanceAmount: 1,
            mbl: 1,
            hbl: 1,
            packagesNo: 1,
            remarks: 1,
            batchNo: 1,
            category: 1
        }, { sort: sort }).then(async function (foundDocument) {
            reportObject = { totalAmount: foundDocument?.reduce((sum, item) => sum + parseFloat(item?.invoiceAmount || 0), 0), "documents": foundDocument, "totalCount": foundDocument?.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "gstr1Report" || reportName === "gstr2Report") {
        let invoiceModel = mongoose.models[`invoiceModel`] || mongoose.model(`invoiceModel`, Schema["invoice"], `invoices`);
        let partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, Schema["partymaster"], `partymasters`);

        const outerCondition = {}

        outerCondition["orgId"] = orgId

        if (reportName === "gstr1Report")
            outerCondition["type"] = "sellerInvoice"
        else if (reportName === "gstr2Report")
            outerCondition["type"] = "buyerInvoice"


        if (body.query?.createdOn)
            outerCondition["createdOn"] = body.query.createdOn

        await invoiceModel.find(outerCondition, {
            invoiceFromId: 1,
            invoiceNo: 1,
            createdOn: 1,
            invoiceAmount: 1,
            invoiceTaxAmount: 1,
            gstType: 1,
            stateOfSupplyName: 1,
            invoiceFromBranchName: 1
        }, { sort: sort }).then(async function (foundDocument) {
            const invoiceFromIds = foundDocument.map(e => e.invoiceFromId)
            const partyData = await partymasterModel.find({ partymasterId: { $in: invoiceFromIds } })


            const processedData = foundDocument.map((e) => {
                const party = partyData.find(p => p.partymasterId === e.invoiceFromId)

                return {
                    invoiceNo: e.invoiceNo,
                    createdOn: e.createdOn,
                    invoiceAmount: e.invoiceAmount,
                    taxableValue: parseFloat(e.invoiceAmount) - parseFloat(e.invoiceTaxAmount),
                    invoiceTaxAmount: e.invoiceTaxAmount,
                    gstType: e.gstType,
                    stateOfSupplyName: e.stateOfSupplyName,
                    gstNumber: party?.branch?.find(b => b.branch_name === e.invoiceFromBranchName)?.tax_number
                }
            })

            reportObject = { "documents": processedData, "totalCount": processedData?.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "gstr3bReport") {
        let invoiceModel = mongoose.models[`invoiceModel`] || mongoose.model(`invoiceModel`, Schema["invoice"], `invoices`);

        const condition = {
            orgId: orgId
        }

        if (body?.query?.month) {
            const startOfMonth = dayjs(body?.query?.month).startOf('month').toISOString();
            const endOfMonth = dayjs(body?.query?.month).endOf('month').toISOString();

            condition["createdOn"] = {
                "$gt": startOfMonth,
                "$lte": endOfMonth
            }
        }


        let invoices = await invoiceModel.find(condition)

        invoices = invoices?.map(e => e.toObject())

        const sellerInvoices = invoices.filter(e => e.type === "sellerInvoice")
        const buyerInvoices = invoices.filter(e => e.type === "buyerInvoice")

        const totalTax = sellerInvoices.reduce((partialSum, a) => partialSum + toNumber(a.invoiceTaxAmount), 0) || 0
        const sellerCostitems = sellerInvoices.flatMap(invoice => invoice.costItems)
        let igst = 0, cgst = 0, sgst = 0, nonGstAmount = 0, totalTaxableAmount = 0, nonGstTotalTaxableAmount = 0;

        for (let i = 0; i < sellerCostitems?.length; i++) {
            const costitem = sellerCostitems[i];

            if (costitem.gstType === "igst") {
                totalTaxableAmount += costitem?.selEstimates?.taxableAmount
                igst += costitem?.selEstimates?.igst
            } else if (costitem.gstType === "cgst") {
                totalTaxableAmount += costitem?.selEstimates?.taxableAmount
                cgst += costitem?.selEstimates?.cgst
                sgst += costitem?.selEstimates?.sgst
            } else if (costitem.gstType === "tax") {
                nonGstTotalTaxableAmount += costitem?.selEstimates?.taxableAmount
                nonGstAmount += costitem?.selEstimates?.igst
            }
        }

        let reverseChargeIgst = 0, reverseChargeCgst = 0, reverseChargeSgst = 0, reverseChargeNonGstAmount = 0, reverseTotalTaxableAmount = 0, reverseNonGstTotalTaxableAmount = 0;
        const reverseCharge = invoices.filter(e => (e.type === "Credit Note" || e.type === "Debit Note") && e.category === "sellerInvoice")
        const reverseCostItems = reverseCharge.flatMap(invoice => invoice.costItems)
        for (let i = 0; i < reverseCostItems.length; i++) {
            const ci = reverseCostItems[i];

            if (ci.gstType === "igst") {
                reverseTotalTaxableAmount += ci?.selEstimates?.taxableAmount
                reverseChargeIgst += ci?.selEstimates?.igst
            } else if (ci.gstType === "cgst") {
                reverseTotalTaxableAmount += ci?.selEstimates?.taxableAmount
                reverseChargeCgst += ci?.selEstimates?.cgst
                reverseChargeSgst += ci?.selEstimates?.sgst
            } else if (ci.gstType === "tax") {
                reverseNonGstTotalTaxableAmount += ci?.selEstimates?.taxableAmount
                reverseChargeNonGstAmount += ci?.selEstimates?.igst
            }
        }

        let groupedPlaceData = sellerInvoices.filter(e => e?.stateOfSupplyName && e.stateOfSupplyName != "" && e.gstType === "igst").reduce((acc, item) => {
            const { stateOfSupplyName, ...other } = item;

            // If category does not exist, initialize it
            if (!acc[stateOfSupplyName]) {
                acc[stateOfSupplyName] = { stateOfSupplyName, regiTaxAmount: 0, unRegiTaxAmount: 0, regiTaxableAmount: 0, unRegiTaxableAmount: 0 };
            }

            // Sum up the amount
            if (other?.invoiceToGst && other?.invoiceToGst != "") {
                acc[stateOfSupplyName].regiTaxAmount += toNumber(other.invoiceTaxAmount);
                acc[stateOfSupplyName].regiTaxableAmount += toNumber(other.invoiceAmount) - toNumber(other.invoiceTaxAmount);
            } else {
                acc[stateOfSupplyName].unRegiTaxAmount += toNumber(other.invoiceTaxAmount);
                acc[stateOfSupplyName].unRegiTaxableAmount += toNumber(other.invoiceAmount) - toNumber(other.invoiceTaxAmount);
            }

            return acc;
        }, {});
        groupedPlaceData = Object.values(groupedPlaceData);

        let itcIgst = 0, itcCgst = 0, itcSgst = 0, itcNonGstAmount = 0;

        const buyerCostitems = buyerInvoices.flatMap(invoice => invoice.costItems)

        for (let i = 0; i < buyerCostitems?.length; i++) {
            const costitem = buyerCostitems[i];

            if (costitem.gstType === "igst")
                itcIgst += costitem?.buyEstimates?.igst
            else if (costitem.gstType === "cgst") {
                itcCgst += costitem?.buyEstimates?.cgst
                itcSgst += costitem?.buyEstimates?.sgst
            } else if (costitem.gstType === "tax") {
                itcNonGstAmount += costitem?.buyEstimates?.igst
            }
        }

        const invoiceNonGst = invoices.filter(e => !(e.invoiceToGst) || e.invoiceToGst === "")
        const invoiceNonGstCostItems = invoiceNonGst.flatMap(invoice => invoice.costItems)

        let interState = 0, intraStateCgst = 0, intraStateSgst = 0;

        for (let i = 0; i < invoiceNonGstCostItems.length; i++) {
            const ci = invoiceNonGstCostItems[i];

            if (ci.gstType === "igst")
                interState += ci?.selEstimates?.igst
            else if (ci.gstType === "cgst") {
                intraStateCgst += ci?.selEstimates?.cgst
                intraStateSgst += ci?.selEstimates?.sgst
            }
        }

        reportObject = { reverseTotalTaxableAmount, reverseNonGstTotalTaxableAmount, totalTaxableAmount, nonGstTotalTaxableAmount, interState, intraStateCgst, intraStateSgst, itcIgst, itcCgst, itcSgst, itcNonGstAmount, groupedPlaceData, totalTax, igst, cgst, sgst, nonGstAmount, reverseChargeIgst, reverseChargeCgst, reverseChargeSgst, reverseChargeNonGstAmount }
        status = 200
    } else if (reportName === "gstr9Report") {
        let invoiceModel = mongoose.models[`invoiceModel`] || mongoose.model(`invoiceModel`, Schema["invoice"], `invoices`);

        const condition = {
            orgId: orgId
        }

        if (body?.query?.startYear && body?.query?.endYear) {
            const startOfMonth = dayjs(`${body?.query?.startYear}-04-01`).startOf('day').toISOString();
            const endOfMonth = dayjs(`${body?.query?.endYear}-03-01`).endOf('day').toISOString();

            condition["createdOn"] = {
                "$gt": startOfMonth,
                "$lte": endOfMonth
            }
        }

        dayjs(2).startOf('month').toISOString()

        let invoices = await invoiceModel.find(condition)

        invoices = invoices?.map(e => e.toObject())

        const sellerInvoices = invoices.filter(e => e.type === "sellerInvoice")
        const buyerInvoices = invoices.filter(e => e.type === "buyerInvoice")

        const sellerCostItems = sellerInvoices.flatMap(invoice =>
            invoice.costItems.map(x => {
                return {
                    ...x,
                    invoiceDataPayload: invoice
                }
            })
        )
        const sellerICostItems = sellerInvoices.filter(e => (e.type === "Credit Note") && e.category === "sellerInvoice").flatMap(invoice => invoice.costItems)
        const sellerJCostItems = sellerInvoices.filter(e => (e.type === "Debit Note") && e.category === "sellerInvoice").flatMap(invoice => invoice.costItems)
        const buyerCostItems = buyerInvoices.flatMap(invoice => invoice.costItems)


        const table1Data = {
            aIgst: 0,
            aCgst: 0,
            aSgst: 0,
            aNonGstAmount: 0,
            aTotal: 0,
            bIgst: 0,
            bCgst: 0,
            bSgst: 0,
            bNonGstamount: 0,
            bTotal: 0,
            cIgst: 0,
            cCgst: 0,
            cSgst: 0,
            cNonGstamount: 0,
            cTotal: 0,
            hIgst: 0,
            hCgst: 0,
            hSgst: 0,
            hNonGstamount: 0,
            hTotal: 0,
            iIgst: 0,
            iCgst: 0,
            iSgst: 0,
            iNonGstamount: 0,
            iTotal: 0,
            jIgst: 0,
            jCgst: 0,
            jSgst: 0,
            jNonGstamount: 0,
            jTotal: 0,
            mIgst: 0,
            mCgst: 0,
            mSgst: 0,
            mNonGstamount: 0,
            mTotal: 0,
            nIgst: 0,
            nCgst: 0,
            nSgst: 0,
            nNonGstamount: 0,
            nTotal: 0,
        }

        sellerCostItems.reduce((table1DataTemp, costitem) => {
            if (costitem.gstType != "tax" && costitem.invoiceToGst === "") {
                if (costitem.gstType === "igst")
                    table1DataTemp.aIgst += costitem?.selEstimates?.igst
                else if (costitem.gstType === "cgst") {
                    table1DataTemp.aCgst += costitem?.selEstimates?.cgst
                    table1DataTemp.aSgst += costitem?.selEstimates?.sgst
                } else if (costitem.gstType === "tax") {
                    table1DataTemp.aNonGstAmount += costitem?.selEstimates?.igst
                }

                table1DataTemp.aTotal += costitem.selEstimates.taxableAmount
            } else if (costitem.gstType != "tax" && costitem.invoiceToGst != "") {
                if (costitem.gstType === "igst")
                    table1DataTemp.bIgst += costitem?.selEstimates?.igst
                else if (costitem.gstType === "cgst") {
                    table1DataTemp.bCgst += costitem?.selEstimates?.cgst
                    table1DataTemp.bSgst += costitem?.selEstimates?.sgst
                } else if (costitem.gstType === "tax") {
                    table1DataTemp.bNonGstamount += costitem?.selEstimates?.igst
                }

                table1DataTemp.bTotal += costitem.selEstimates.taxableAmount
            } else if (e => e.gstType === "tax") {
                if (costitem.gstType === "igst")
                    table1DataTemp.cIgst += costitem?.selEstimates?.igst
                else if (costitem.gstType === "cgst") {
                    table1DataTemp.cCgst += costitem?.selEstimates?.cgst
                    table1DataTemp.cSgst += costitem?.selEstimates?.sgst
                } else if (costitem.gstType === "tax") {
                    table1DataTemp.cNonGstamount += costitem?.selEstimates?.igst
                }

                table1DataTemp.cTotal += costitem.selEstimates.taxableAmount
            }

            return table1DataTemp
        }, table1Data)

        table1Data.hIgst = table1Data.aIgst + table1Data.bIgst + table1Data.cIgst;
        table1Data.hCgst = table1Data.aCgst + table1Data.bCgst + table1Data.cCgst;
        table1Data.hSgst = table1Data.aSgst + table1Data.bSgst + table1Data.bSgst;
        table1Data.hNonGstamount = table1Data.aNonGstAmount + table1Data.bNonGstamount + table1Data.cNonGstamount;
        table1Data.hTotal = table1Data.aTotal + table1Data.bTotal + table1Data.cTotal;


        sellerICostItems.reduce((table1DataTemp, costitem) => {
            if (costitem.gstType === "igst")
                table1DataTemp.iIgst += costitem?.selEstimates?.igst
            else if (costitem.gstType === "cgst") {
                table1DataTemp.iCgst += costitem?.selEstimates?.cgst
                table1DataTemp.iSgst += costitem?.selEstimates?.sgst
            } else if (costitem.gstType === "tax") {
                table1DataTemp.iNonGstAmount += costitem?.selEstimates?.igst
            }

            table1DataTemp.iTotal += costitem.selEstimates.taxableAmount

            return table1DataTemp
        }, table1Data)

        sellerJCostItems.reduce((table1DataTemp, costitem) => {
            if (costitem.gstType === "igst")
                table1DataTemp.jIgst += costitem?.selEstimates?.igst
            else if (costitem.gstType === "cgst") {
                table1DataTemp.jCgst += costitem?.selEstimates?.cgst
                table1DataTemp.jSgst += costitem?.selEstimates?.sgst
            } else if (costitem.gstType === "tax") {
                table1DataTemp.jNonGstAmount += costitem?.selEstimates?.igst
            }

            table1DataTemp.jTotal += costitem.selEstimates.taxableAmount

            return table1DataTemp
        }, table1Data)

        table1Data.mIgst = table1Data.jIgst - table1Data.iIgst;
        table1Data.mCgst = table1Data.jCgst - table1Data.iCgst;
        table1Data.mSgst = table1Data.jSgst - table1Data.iSgst;
        table1Data.mNonGstamount = table1Data.jNonGstamount - table1Data.iNonGstamount;
        table1Data.mTotal = table1Data.jTotal - table1Data.iTotal;

        table1Data.nIgst = table1Data.hIgst + table1Data.mIgst;
        table1Data.nCgst = table1Data.hCgst + table1Data.mCgst;
        table1Data.nSgst = table1Data.hSgst + table1Data.mSgst;
        table1Data.nNonGstamount = table1Data.hNonGstamount + table1Data.mNonGstamount;
        table1Data.nTotal = table1Data.hTotal + table1Data.mTotal;

        const supplies = [
            { code: "A", description: "Supplies made to un-registered persons (B2C)", taxableValue: table1Data.aTotal, centralTax: table1Data.aCgst, stateTax: table1Data.aSgst, integratedTax: table1Data.aIgst, cess: table1Data.aNonGstAmount },
            { code: "B", description: "Supplies made to registered persons (B2B)", taxableValue: table1Data.bTotal, centralTax: table1Data.cCgst, stateTax: table1Data.bSgst, integratedTax: table1Data.bIgst, cess: table1Data.bNonGstamount },
            { code: "C", description: "Zero rated supply (Export) on payment of tax (except SEZs)", taxableValue: table1Data.cTotal, centralTax: table1Data.cCgst, stateTax: table1Data.cSgst, integratedTax: table1Data.cIgst, cess: table1Data.cNonGstamount },
            { code: "D", description: "Supplies to SEZs on payment of tax", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
            { code: "E", description: "Deemed Exports", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
            { code: "F", description: "Advances on which tax has been paid but invoice not issued", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
            { code: "G", description: "Inward supplies on which tax is to be paid on reverse charge basis", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
            { code: "H", description: "Sub-total (A to G above)", taxableValue: table1Data.hTotal, centralTax: table1Data.hCgst, stateTax: table1Data.hSgst, integratedTax: table1Data.hIgst, cess: table1Data.hNonGstamount },
            { code: "I", description: "Credit Notes (-)", taxableValue: table1Data.iTotal, centralTax: table1Data.iCgst, stateTax: table1Data.iSgst, integratedTax: table1Data.iIgst, cess: table1Data.iNonGstamount },
            { code: "J", description: "Debit Notes (+)", taxableValue: table1Data.jTotal, centralTax: table1Data.jCgst, stateTax: table1Data.jSgst, integratedTax: table1Data.jIgst, cess: table1Data.jNonGstamount },
            { code: "K", description: "Supplies/tax declared through Amendments (+)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
            { code: "L", description: "Supplies/tax reduced through Amendments (-)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
            { code: "M", description: "Sub-total (I to L above)", taxableValue: table1Data.mTotal, centralTax: table1Data.mCgst, stateTax: table1Data.mSgst, integratedTax: table1Data.mIgst, cess: table1Data.mNonGstamount },
            { code: "N", description: "Supplies and advances on which tax is to be paid (H+M above)", taxableValue: table1Data.nTotal, centralTax: table1Data.nCgst, stateTax: table1Data.nSgst, integratedTax: table1Data.nIgst, cess: table1Data.nNonGstamount }
        ];

        const table9Data = {
            aIgst: 0,
            bCgst: 0,
            cSgst: 0,
            dNonGstAmount: 0,
        }

        sellerCostItems.reduce((table9DataTemp, costitem) => {
            if (costitem.gstType === "igst")
                table9DataTemp.aIgst += costitem?.selEstimates?.igst
            else if (costitem.gstType === "cgst") {
                table9DataTemp.bCgst += costitem?.selEstimates?.cgst
                table9DataTemp.cSgst += costitem?.selEstimates?.sgst
            } else if (costitem.gstType === "tax") {
                table9DataTemp.dNonGstAmount += costitem?.selEstimates?.igst
            }

            return table9DataTemp
        }, table9Data)

        const taxPaidDetails = [
            { code: 'A', description: "Integrated Tax", taxPayable: table9Data.aIgst, paidCash: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
            { code: 'B', description: "Central Tax", taxPayable: table9Data.bCgst, paidCash: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
            { code: 'C', description: "State/ UT tax", taxPayable: table9Data.cSgst, paidCash: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
            { code: 'D', description: "Cess", taxPayable: table9Data.dNonGstAmount, paidCash: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
            { code: 'E', description: "Interest", taxPayable: 0, paidCash: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
            { code: 'F', description: "Late fee", taxPayable: 0, paidCash: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
            { code: 'G', description: "Penalty", taxPayable: 0, paidCash: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
            { code: 'H', description: "Other", taxPayable: 0, paidCash: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 }
        ];

        const table14Data = {
            igstPaid: 0,
            igstPayable: 0,
            cgstPaid: 0,
            cgstPayable: 0,
            sgstPaid: 0,
            sgstPayable: 0,
            nonGstAmountPaid: 0,
            nonGstAmountPayable: 0
        }

        sellerCostItems.reduce((table14DataTemp, costitem) => {
            if (costitem.invoiceDataPayload.paymentStatus === "Paid") {
                if (costitem.gstType === "igst")
                    table14DataTemp.igstPaid += costitem?.selEstimates?.igst
                else if (costitem.gstType === "cgst") {
                    table14DataTemp.cgstPaid += costitem?.selEstimates?.cgst
                    table14DataTemp.sgstPaid += costitem?.selEstimates?.sgst
                } else if (costitem.gstType === "tax") {
                    table14DataTemp.nonGstAmountPaid += costitem?.selEstimates?.igst
                }
            } else {
                if (costitem.gstType === "igst")
                    table14DataTemp.igstPayable += costitem?.selEstimates?.igst
                else if (costitem.gstType === "cgst") {
                    table14DataTemp.cgstPayable += costitem?.selEstimates?.cgst
                    table14DataTemp.sgstPayable += costitem?.selEstimates?.sgst
                } else if (costitem.gstType === "tax") {
                    table14DataTemp.nonGstAmountPayable += costitem?.selEstimates?.igst
                }
            }

            return table14DataTemp
        }, table14Data)

        const differentialTax = [
            { description: "Integrated Tax", payable: table14Data.igstPayable, paid: table14Data.igstPaid },
            { description: "Central Tax", payable: table14Data.cgstPayable, paid: table14Data.cgstPaid },
            { description: "State/ UT Tax", payable: table14Data.sgstPayable, paid: table14Data.sgstPaid },
            { description: "Cess", payable: table14Data.nonGstAmountPayable, paid: table14Data.nonGstAmountPaid },
            { description: "Interest", payable: 0, paid: 0 }
        ];

        let hsnGroupsSeller = Object.entries(
            // What you have done
            sellerCostItems.reduce((acc, value) => {
                // Group initialization
                if (!acc[value.hsnCode]) {
                    acc[value.hsnCode] = [];
                }

                // value.hsnCode
                // FIX: only pushing the object that contains id and value
                acc[value.hsnCode].push(value);

                return acc;
            }, {})
        ).map(([label, options]) => ({ hsnCode: label, costItems: options }));

        let hsnGroupsBuyer = Object.entries(
            // What you have done
            buyerCostItems.reduce((acc, value) => {
                // Group initialization
                if (!acc[value.hsnCode]) {
                    acc[value.hsnCode] = [];
                }

                // value.hsnCode
                // FIX: only pushing the object that contains id and value
                acc[value.hsnCode].push(value);

                return acc;
            }, {})
        ).map(([label, options]) => ({ hsnCode: label, costItems: options }));

        const section17Data = hsnGroupsSeller?.map(e => {

            let rateOfTax = 0, centralTax = 0, stateUTTax = 0, integratedTax = 0, cess = 0;

            for (let i = 0; i < e?.costItems?.length; i++) {
                const costitem = e?.costItems[i];

                if (costitem.gstType === "igst")
                    integratedTax += costitem?.selEstimates?.igst
                else if (costitem.gstType === "cgst") {
                    centralTax += costitem?.selEstimates?.cgst
                    stateUTTax += costitem?.selEstimates?.sgst
                } else if (costitem.gstType === "tax") {
                    cess += costitem?.selEstimates?.igst
                }

                rateOfTax += costitem?.gst || 0
            }

            if (rateOfTax > 0)
                rateOfTax = rateOfTax / e?.costItems?.length

            return {
                hsnCode: e.hsnCode,
                totalQuantity: e?.costItems?.length,
                uqc: '',
                taxableValue: e?.costItems.map(x => x?.selEstimates?.taxableAmount).reduce((prevValue, currentValue) => prevValue + currentValue),
                rateOfTax, centralTax, stateUTTax, integratedTax, cess
            }
        })

        const section18Data = hsnGroupsBuyer?.map(e => {

            let rateOfTax = 0, centralTax = 0, stateUTTax = 0, integratedTax = 0, cess = 0;

            for (let i = 0; i < e?.costItems?.length; i++) {
                const costitem = e?.costItems[i];

                if (costitem.gstType === "igst")
                    integratedTax += costitem?.buyEstimates?.igst
                else if (costitem.gstType === "cgst") {
                    centralTax += costitem?.buyEstimates?.cgst
                    stateUTTax += costitem?.buyEstimates?.sgst
                } else if (costitem.gstType === "tax") {
                    cess += costitem?.buyEstimates?.igst
                }

                rateOfTax += costitem?.gst || 0
            }

            if (rateOfTax > 0)
                rateOfTax = rateOfTax / e?.costItems?.length

            return {
                hsnCode: e?.hsnCode,
                totalQuantity: e?.costItems?.length,
                uqc: '',
                taxableValue: e?.costItems.map(x => x?.buyEstimates?.taxableAmount).reduce((prevValue, currentValue) => prevValue + currentValue),
                rateOfTax, centralTax, stateUTTax, integratedTax, cess
            }
        })

        reportObject = { supplies, taxPaidDetails, differentialTax, section17Data, section18Data }
        status = 200
    } else if (reportName === "ledgerReport") {
        let paymentModel = mongoose.models[`paymentModel`] || mongoose.model(`paymentModel`, Schema["payment"], `payments`);
        let invoiceModel = mongoose.models[`invoiceModel`] || mongoose.model(`invoiceModel`, Schema["invoice"], `invoices`);

        const outerCondition = {}

        outerCondition["orgId"] = orgId
        // outerCondition["type"] = { $in : ["buyerInvoice", "sellerInvoice"] }

        if (body.query?.partyMasterId)
            outerCondition["invoiceFromId"] = body.query?.partyMasterId

        let initialAmount = 0;

        const partyDataInd = await paymentModel.findOne({ partymasterId: body.query?.partyMasterId })
        initialAmount = partyDataInd?.openingBalance || 0;

        let innerCondition = {};

        if (body.query?.createdOn) {
            const { createdOn, ...other } = outerCondition

            outerCondition["createdOn"] = body.query.createdOn
            innerCondition["createdOn"] = {
                $lt: body.query.createdOn["$gt"]
            }
            innerCondition = {
                ...innerCondition,
                ...other
            }
        }

        await paymentModel.find(outerCondition, null, { sort: sort }).then(async function (foundDocument) {
            if (body.query?.createdOn) {
                const paymentsTillDate = await paymentModel.aggregate([
                    {
                        $match: {
                            ...innerCondition,
                            type: {
                                $in: ['buyerInvoice', 'sellerInvoice']
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '$type', // Group by the `type` field
                            totalPaidAmount: { $sum: '$paidAmount' } // Sum the `paidAmount` field for each type
                        }
                    }
                ])

                const creditDebitData = paymentsTillDate.reduce((acc, item) => {
                    acc[item._id] = item.totalPaidAmount;
                    return acc;
                }, {});

                initialAmount = initialAmount + creditDebitData.buyerInvoice - creditDebitData.sellerInvoice
            }

            const invoiceIds = foundDocument?.flatMap(item => item?.invoiceData?.map(invoice => invoice?.invoiceId));

            const invoiceData = await invoiceModel.find({ invoiceId: { $in: invoiceIds } })

            let newDataToReturn = foundDocument.map((e) => {
                return {
                    ...e?.toObject(),
                    invoiceData: e.invoiceData.map((i) => {
                        const invoice = invoiceData?.find(inv => inv?.invoiceId === i.invoiceId);

                        return {
                            ...i?.toObject(),
                            mblName: invoice?.mblName,
                            mbl: invoice?.mbl,
                            hbl: invoice?.hbl,
                            hblName: invoice?.hblName,
                            containers: invoice?.containers,
                        }
                    })
                }
            })

            const initialAmountCopy = initialAmount;
            newDataToReturn.forEach(transaction => {
                if (transaction.type === "buyerInvoice")
                    initialAmount += transaction.paidAmount;
                else if (transaction.type === "sellerInvoice")
                    initialAmount -= transaction.paidAmount;

                transaction.runningBalance = initialAmount;
            });

            reportObject = { initialAmount: initialAmountCopy, "documents": newDataToReturn, "totalCount": newDataToReturn?.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "pendingHBLTelex") {
        let batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
        let blModel = mongoose.models[`blModel`] || mongoose.model(`blModel`, Schema["bl"], `bls`);
        let partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, Schema["partymaster"], `partymasters`);
        let deliveryorderModel = mongoose.models[`deliveryorderModel`] || mongoose.model(`deliveryorderModel`, Schema["deliveryorder"], `deliveryorders`);

        const outerCondition = {}

        outerCondition["orgId"] = orgId

        const doCondition = {};
        if (body.query?.createdOn)
            doCondition["deliveryDate"] = body?.query?.createdOn

        doCondition["orgId"] = orgId

        let deliveryorders = await deliveryorderModel.find(doCondition)
        if (deliveryorders) {
            deliveryorders = deliveryorders?.map(e => e?.toObject())

            let blData = await blModel.find({ blId: { $in: deliveryorders.map(e => e?.hblDetails?.blId) } })
            if (blData)
                blData = blData?.map(e => e?.toObject())

            deliveryorders = deliveryorders.map(e => {
                return {
                    ...e,
                    currentBLStatus: blData.find(b => b.blId === e?.hblDetails?.blId)?.HBLStatus
                }
            }).filter(e =>
                e?.currentBLStatus !== "TELEX/SWB" &&
                e?.currentBLStatus !== "Original"
            )


            outerCondition["batchId"] = {
                $in: deliveryorders?.map(e => e?.batchId)
            }
        }

        if (body.query?.partyMasterId) {
            const partyIds = await getChildCompany(body?.query?.partyMasterId)

            outerCondition["$or"] = [
                {
                    "enquiryDetails.basicDetails.consigneeId": { $in: partyIds }
                },
                {
                    "enquiryDetails.basicDetails.shipperId": { $in: partyIds }
                },
                {
                    "customerId": { $in: partyIds }
                }
            ]
        }

        // outerCondition["HBLStatus"] = "PENDING"

        await batchModel.find(outerCondition, null, { sort: sort }).then(async function (foundDocument) {
            let partymasterData = await partymasterModel.find({ partymasterId: { $in: foundDocument.map(b => b?.enquiryDetails?.basicDetails?.agentId) } })
            if (partymasterData)
                partymasterData = partymasterData.map(e => e.toObject())

            const newDataToReturn = deliveryorders?.filter(e => foundDocument.find(be => be?.batchId === e?.batchId)).map((dos) => {
                const e = foundDocument.find(be => be.batchId === dos.batchId);

                const partymaster = partymasterData?.find(ag => ag.partymasterId === e?.enquiryDetails?.basicDetails?.agentId)

                const diffTime = Math.abs(new Date(dos.deliveryDate) - new Date());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                return {
                    "doDate": dos?.deliveryDate,
                    "loadPortName": e?.enquiryDetails?.routeDetails?.loadPortName || "",
                    "destPortName": e?.enquiryDetails?.routeDetails?.destPortName || "",
                    "locationName": e?.enquiryDetails?.routeDetails?.locationName || "",
                    "batchNo": e.batchNo,
                    "shipperName": e?.enquiryDetails?.basicDetails?.shipperName,
                    "consigneeName": e?.enquiryDetails?.basicDetails?.consigneeName,
                    "agentName": partymaster?.partyShortcode,
                    "hblNumber": dos?.hblDetails?.blNumber,
                    "mblNumber": e?.mblNumber,
                    "containerNos": dos?.containerNos?.join(", "),
                    "vesselName": e?.routeDetails?.finalVesselName,
                    "departureTime": e?.routeDetails?.atd,
                    "arrivalTime": e?.routeDetails?.ata,
                    "totalDays": diffDays
                }
            })


            reportObject = { "documents": newDataToReturn, "totalCount": newDataToReturn?.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "dailyReportWH") {
        let Model = mongoose.models[`warehousedataentryModel`] || mongoose.model(`warehousedataentryModel`, Schema["warehousedataentry"], `warehousedataentrys`);
        const outerCondition = {}

        outerCondition["orgId"] = orgId

        if (body.query?.createdOn)
            outerCondition["createdOn"] = body.query.createdOn

        await Model.find(outerCondition, {}, { sort: { ...sort, createdOn: 1 } }).then(async function (foundDocument) {
            let warehousebillofentryModel = mongoose.models[`warehousebillofentryModel`] || mongoose.model(`warehousebillofentryModel`, Schema["warehousebillofentry"], `warehousebillofentrys`);
            let warehouseinwardModel = mongoose.models[`warehouseinwardModel`] || mongoose.model(`warehouseinwardModel`, Schema["warehouseinward"], `warehouseinwards`);
            let exbondbillentryModel = mongoose.models[`exbondbillentryModel`] || mongoose.model(`exbondbillentryModel`, Schema["exbondbillentry"], `exbondbillentrys`);
            let warehousecontainerModel = mongoose.models[`warehousecontainerModel`] || mongoose.model(`warehousecontainerModel`, Schema["warehousecontainer"], `warehousecontainers`);
            let warehousegateoutentryModel = mongoose.models[`warehousegateoutentryModel`] || mongoose.model(`warehousegateoutentryModel`, Schema["warehousegateoutentry"], `warehousegateoutentrys`);
            let warehousedispatchModel = mongoose.models[`warehousedispatchModel`] || mongoose.model(`warehousedispatchModel`, Schema["warehousedispatch"], `warehousedispatchs`);
            let warehouseModel = mongoose.models[`warehouseModel`] || mongoose.model(`warehouseModel`, Schema["warehouse"], `warehouses`);

            const subQuery = [];
            for (let i = 0; i < foundDocument.length; i++)
                subQuery.push(foundDocument[i].warehousedataentryId)

            let warehousebillofentryData = await warehousebillofentryModel.find({ warehousedataentryId: { $in: subQuery } })
            if (warehousebillofentryData)
                warehousebillofentryData = warehousebillofentryData?.map(e => e.toObject())

            let locationData = await warehouseModel.find({ orgId: orgId })
            if (locationData)
                locationData = locationData?.map(e => e.toObject())


            let warehousegateoutentryData = await warehousegateoutentryModel.find({ warehousedataentryId: { $in: subQuery } })
            if (warehousegateoutentryData)
                warehousegateoutentryData = warehousegateoutentryData?.map(e => e.toObject())


            let warehouseinwardData = await warehouseinwardModel.find({ warehousedataentryId: { $in: subQuery } })
            if (warehouseinwardData)
                warehouseinwardData = warehouseinwardData?.map(e => e.toObject())

            let exbondbillentryData = await exbondbillentryModel.find({ warehousedataentryId: { $in: subQuery } })
            if (exbondbillentryData)
                exbondbillentryData = exbondbillentryData?.map(e => e.toObject())

            let warehousecontainerData = await warehousecontainerModel.find({ warehousedataentryId: { $in: subQuery } })
            if (warehousecontainerData)
                warehousecontainerData = warehousecontainerData?.map(e => e.toObject())


            let warehousedispatchData = await warehousedispatchModel.find({ warehousedataentryId: { $in: subQuery } })
            if (warehousedispatchData)
                warehousedispatchData = warehousedispatchData?.map(e => e.toObject())


            let transformedData = [];

            for (const job of foundDocument) {

                const warehousebillofentry = warehousebillofentryData.find(
                    e => e?.warehousedataentryId === job.warehousedataentryId
                );

                // Get all containers related to this job
                const containers = warehousecontainerData.filter(
                    e => e?.warehousedataentryId === job.warehousedataentryId
                );

                const exbond = exbondbillentryData.filter(
                    e => e.warehousedataentryId === job.warehousedataentryId
                );

                // For NOC date
                const noc = new Date(job.jobDate);
                noc.setDate(noc.getDate() + 15);
                const nocDate = noc.toISOString();

                // For each container → one row
                for (const container of containers) {

                    const inward = warehouseinwardData.find(
                        e => e.warehousecontainerId === container.warehousecontainerId
                    );

                    const gateout = warehousegateoutentryData.find(
                        e => e.warehousecontainerId === container.warehousecontainerId
                    );

                    let dispatch;
                    if (gateout) {
                        dispatch = warehousedispatchData.find(
                            e => gateout?.gatePassNumber && e.gateOutPassNo === gateout?.gatePassNumber
                        );
                    }

                    let inWardLocation;
                    if (inward?.location) {
                        inWardLocation = locationData.find(
                            e => e.warehouseId === inward?.location
                        );
                    }

                    transformedData.push({
                        // Common job data
                        jobNo: job.jobNo,
                        partyName: job.invoiceLedgerName,
                        chaName: job.chaLedgerName,
                        nocDate: nocDate,
                        section: warehousebillofentry?.warehousingSection,
                        bondNo: warehousebillofentry?.bondNo,
                        boe: job.blofEN,
                        blNo: job.blNo,
                        receivedDate: new Date(inward?.receiptDateTime),  // sending receiptDateTime as ReceivedDate
                        inDutyAmt: Number(job?.customDuty),
                        dutyPaid: exbond?.map(e => e?.dutyAmount)?.reduce((partialSum, a) => partialSum + a, 0) || 0, // for Duty Paid
                        
                        // Container wise (unique per row)
                        dutyStatus: warehousegateoutentryData.some(e => e.warehousecontainerId === container.warehousecontainerId) ? "Done" : "Pending",// GateOut status DONE OR PENDING
                        containerNo: container.containerNo,
                        containerSize: container.containerTypeName,
                        type: container.type,
                        containerInWardCount: warehouseinwardData.filter(
                            e => e.warehousedataentryId === container.warehousedataentryId
                        )?.length || 0,
                        inwardDateTime: inward?.receiptDateTime,
                        inPackages: inward?.packages,
                        outPackages: dispatch?.qty || 0,
                        inWarehouse: (inward?.packages || 0) - (dispatch?.qty || 0),
                        inwardLocation: inWardLocation?.wareHouseName,
                        dispatchRemarks: dispatch?.labourDetails?.map(l => l.type).join(", ") || "",
                    });
                }
            }

            transformedData = transformedData?.map(e => {
                return {
                    ...e,
                    balanceDuty: e?.inDutyAmt - e?.dutyPaid
                }
            })

            reportObject = { "documents": transformedData, "totalCount": transformedData?.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "inwardReportWH") {
        let Model = mongoose.models[`warehouseinwardModel`] || mongoose.model(`warehouseinwardModel`, Schema["warehouseinward"], `warehouseinwards`);
        const outerCondition = {}

        outerCondition["orgId"] = orgId

        if (body.query?.createdOn)
            outerCondition["createdOn"] = body.query.createdOn

        await Model.find(outerCondition, {}, { sort: { ...sort, createdOn: 1 } }).then(async function (foundDocument) {
            const subQuery = [];
            for (let i = 0; i < foundDocument.length; i++)
                subQuery.push(foundDocument[i].warehousedataentryId)

            let systemtypeModel = mongoose.models[`systemtypeModel`] || mongoose.model(`systemtypeModel`, Schema["systemtype"], `systemtypes`);
            let userModel = mongoose.models[`userModel`] || mongoose.model(`userModel`, Schema["user"], `users`);
            let userData = await userModel.find({ orgId: orgId })
            if (userData)
                userData = userData?.map(e => e.toObject())


            let warehouseModel = mongoose.models[`warehouseModel`] || mongoose.model(`warehouseModel`, Schema["warehouse"], `warehouses`);
            let locationData = await warehouseModel.find({ orgId: orgId })
            if (locationData)
                locationData = locationData?.map(e => e.toObject())

            let warehousedataentryModel = mongoose.models[`warehousedataentryModel`] || mongoose.model(`warehousedataentryModel`, Schema["warehousedataentry"], `warehousedataentrys`);
            let warehousedataentryData = await warehousedataentryModel.find({ warehousedataentryId: { $in: subQuery } })
            if (warehousedataentryData)
                warehousedataentryData = warehousedataentryData?.map(e => e.toObject())


            let containerTypes = await systemtypeModel.find(
                {
                    systemtypeId: {
                        $in: foundDocument?.map(e => e?.containerTypeName)
                    }
                }
            )


            let transformedData = [];
            transformedData = foundDocument.map((e) => {
                const warehousedataentry = warehousedataentryData.find(w => w?.warehousedataentryId === e?.warehousedataentryId)
                return {
                    jobNo: warehousedataentry?.jobNo,
                    inWardDate: e?.date,
                    boe: warehousedataentry?.blofEN,
                    blNo: e?.blNo,
                    chaName: warehousedataentry?.chaLedgerName,
                    partyName: warehousedataentry?.importerLedgerName,
                    vehicleNumber: e?.vehicleNo,
                    containerNo: e?.bofeContainerNo,
                    containerSize: containerTypes.find(c => c?.systemtypeId === e?.containerTypeName)?.typeName,
                    qty: e?.packages,
                    packageType: e?.unitName,
                    cargo: e?.productDescription,
                    locationInward: e.locationName,//locationData.find(w => w?.warehouseId === e?.locationData)?.wareHouseName,
                    // Filter all matching types, map to their names, and join with a comma
                    labour: e?.labourDetails
                        ?.filter(v => v?.type === "labour" || v?.type === "vendor")
                        ?.map(v => v.name)
                        ?.join(", "),

                    equipment: e?.labourDetails
                        ?.filter(v => v?.type === "machine")
                        ?.map(v => v.name)
                        ?.join(", "),
                    supervisor: userData.find(u => u.userId === e?.surveyorName)?.name
                }
            })


            reportObject = { "documents": transformedData, "totalCount": transformedData?.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "dispatchReportWH") {
    let Model = mongoose.models[`warehousedispatchModel`] ||
        mongoose.model(`warehousedispatchModel`, Schema["warehousedispatch"], `warehousedispatchs`);
    const outerCondition = {};
    outerCondition["orgId"] = orgId;
    if (body.query?.createdOn)
        outerCondition["createdOn"] = body.query.createdOn;
    await Model.find(outerCondition, {}, { sort: { ...sort, createdOn: 1 } })
        .then(async function (foundDocument) {
            const subQuery = [];
            for (let i = 0; i < foundDocument.length; i++)
                subQuery.push(foundDocument[i].warehousedataentryId);
            // ================= USERS =================
            let uomModel = mongoose.models[`uomModel`] ||
                mongoose.model(`uomModel`, Schema["uom"], `uoms`);

            let userModel = mongoose.models[`userModel`] ||
                mongoose.model(`userModel`, Schema["user"], `users`);

            let userData = await userModel.find({ orgId: orgId });

            if (userData)
                userData = userData.map(e => e.toObject());
            // ================= WAREHOUSE =================
            let warehouseModel = mongoose.models[`warehouseModel`] ||
                mongoose.model(`warehouseModel`, Schema["warehouse"], `warehouses`);

            let locationData = await warehouseModel.find({ orgId: orgId });

            if (locationData)
                locationData = locationData.map(e => e.toObject());
            // ================= WAREHOUSE ENTRY =================
            let warehousedataentryModel = mongoose.models[`warehousedataentryModel`] ||
                mongoose.model(`warehousedataentryModel`, Schema["warehousedataentry"], `warehousedataentrys`);
            let warehousedataentryData = await warehousedataentryModel.find({
                warehousedataentryId: { $in: subQuery }
            });
            if (warehousedataentryData)
                warehousedataentryData = warehousedataentryData.map(e => e.toObject());
            // ================= GATE OUT =================
            let warehousegateoutentryModel = mongoose.models[`warehousegateoutentryModel`] ||
                mongoose.model(`warehousegateoutentryModel`, Schema["warehousegateoutentry"], `warehousegateoutentrys`);

            let warehousegateoutentryData = await warehousegateoutentryModel.find({
                gatePassNumber: { $in: foundDocument?.map(wh => wh.gateOutPassNo) }
            });
            if (warehousegateoutentryData)
                warehousegateoutentryData = warehousegateoutentryData.map(e => e.toObject());
            // ================= CONTAINER =================
            let warehousecontainerModel = mongoose.models[`warehousecontainerModel`] ||
                mongoose.model(`warehousecontainerModel`, Schema["warehousecontainer"], `warehousecontainers`);

            let warehousecontainerData = await warehousecontainerModel.find({
                warehousedataentryId: { $in: subQuery }
            });

            if (warehousecontainerData)
                warehousecontainerData = warehousecontainerData.map(e => e.toObject());
            // ================= INWARD =================
            let warehouseinwardModel = mongoose.models[`warehouseinwardModel`] ||
                mongoose.model(`warehouseinwardModel`, Schema["warehouseinward"], `warehouseinwards`);

            let warehouseinwardData = await warehouseinwardModel.find({
                warehousedataentryId: { $in: subQuery }
            });

            if (warehouseinwardData)
                warehouseinwardData = warehouseinwardData.map(e => e.toObject());


            // ================= EXBOND =================
            let exbondbillentryModel = mongoose.models[`exbondbillentryModel`] ||
                mongoose.model(`exbondbillentryModel`, Schema["exbondbillentry"], `exbondbillentrys`);

            let exbondbillentryData = await exbondbillentryModel.find({
                warehousedataentryId: { $in: subQuery }
            });

            if (exbondbillentryData)
                exbondbillentryData = exbondbillentryData.map(e => e.toObject());


            // ================= EXBE MAP =================
            const exBeNoMap = {};

            exbondbillentryData.forEach(e => {
                exBeNoMap[e.warehousedataentryId] = e.exBeNo;
            });


            // ================= PACKAGE TYPES =================
            let packageTypes = await uomModel.find({
                uomId: {
                    $in: foundDocument?.map(e => e?.packageType)
                }
            });

            if (packageTypes)
                packageTypes = packageTypes.map(e => e.toObject());


            // ================= TRANSFORM =================
            let transformedData = [];
            transformedData = foundDocument.map((e) => {
                const warehousedataentry = warehousedataentryData.find(
                    w => w?.warehousedataentryId === e?.warehousedataentryId
                );
                const gateout = warehousegateoutentryData.find(
                    g => g?.gatePassNumber === e?.gateOutPassNo
                );
                const inward = warehouseinwardData.find(
                    i => i?.warehousecontainerId === gateout?.warehousecontainerId
                );
                const container = warehousecontainerData.find(
                    c => c?.warehousedataentryId === e?.warehousedataentryId
                );
                return {
                    jobNo: warehousedataentry?.jobNo,
                    dispatchDate: e?.dispatchDate,
                    inbondBoe: warehousedataentry?.blofEN,
                    exBoe: exBeNoMap[e?.warehousedataentryId],
                    blNoInWard: warehousedataentry?.blNo,
                    chaName: warehousedataentry?.chaLedgerName,
                    partyName: warehousedataentry?.invoiceLedgerName,
                    vehicleNumber: e?.vehicleNo,
                    containerNo: container?.containerNo,
                    containerSize: container?.containerTypeName,
                    cargo:warehousedataentry?.productDescription,
                    qty: e?.qty,
                     packageType:e?.packageTypeName,// packageTypes.find(
                    //     s => s?.uomId === inward?.unitName
                    // )?.uomName,
                    location: e?.toLocation,
                    labour: e?.labourDetails
                        ?.filter(v => v?.type === "labour" || v?.type === "vendor")
                        ?.map(v => v.name)
                        ?.join(", "),
                    equipment: e?.labourDetails
                        ?.filter(v => v?.type === "machine")
                        ?.map(v => v.name)
                        ?.join(", "),

                    supervisor: e?.surveyorName
                };
            });


            // ================= RESPONSE =================
            reportObject = {
                documents: transformedData,
                totalCount: transformedData?.length
            };

            status = 200;

        })
        .catch(function (err) {

            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }));

            reportObject = { error: err?.message };

            status = 500;
        });
    } else if (reportName === "trackStockReportWH") {
        let Model = mongoose.models[`warehousedataentryModel`] || mongoose.model(`warehousedataentryModel`, Schema["warehousedataentry"], `warehousedataentrys`);
        const outerCondition = {}

        outerCondition["orgId"] = orgId

        if (body.query?.createdOn)
            outerCondition["createdOn"] = body.query.createdOn

        await Model.find(outerCondition, {}, { sort: { ...sort, createdOn: 1 } }).then(async function (foundDocument) {
            const subQuery = [];
            for (let i = 0; i < foundDocument.length; i++)
                subQuery.push(foundDocument[i].warehousedataentryId)

            let exbondbillentryModel = mongoose.models[`exbondbillentryModel`] || mongoose.model(`exbondbillentryModel`, Schema["exbondbillentry"], `exbondbillentrys`);
            let exbondbillentryData = await exbondbillentryModel.find({ warehousedataentryId: { $in: subQuery } })
            if (exbondbillentryData)
                exbondbillentryData = exbondbillentryData?.map(e => e.toObject())

            let warehousecontainerModel = mongoose.models[`warehousecontainerModel`] || mongoose.model(`warehousecontainerModel`, Schema["warehousecontainer"], `warehousecontainers`);
            let warehousecontainerData = await warehousecontainerModel.find({ warehousedataentryId: { $in: subQuery } })
            if (warehousecontainerData)
                warehousecontainerData = warehousecontainerData?.map(e => e.toObject())

            let transformedDataTemp = [], transformedData = [];
            transformedDataTemp = foundDocument.map((e) => {
                const container = warehousecontainerData.filter(c => c?.warehousedataentryId === e?.warehousedataentryId)

                return {
                    jobNo: e?.jobNo,
                    warehousedataentryId: e?.warehousedataentryId,
                    partyName: e?.invoiceLedgerName,
                    chaName: e?.chaLedgerName,
                    inBondBoe: e?.blofEN,
                    numOfContainer: container?.length || 0,
                    inBondPackage: Number(e?.packagesUnit)
                }
            })

            for (let i = 0; i < transformedDataTemp?.length; i++) {
                let data = transformedDataTemp[i];
                let exbondbillentrys = exbondbillentryData.filter(e => e?.warehousedataentryId === data?.warehousedataentryId)

                if (exbondbillentrys.length === 0) {

                    transformedData.push(
                        {
                            ...data,
                            exBondBoe: null,
                            exBondPackage: 0
                        }
                    )
                } else {
                    for (let j = 0; j < exbondbillentrys?.length; j++) {
                        let exbondbillentry = exbondbillentrys[j];

                        transformedData.push(
                            {
                                ...data,
                                exBondBoe: exbondbillentry?.exBeNo,
                                exBondPackage: Number(exbondbillentry?.pkgs),
                                remarks: exbondbillentry?.remarks
                            }
                        )
                    }
                }
            }


            transformedData = transformedData.map(e => {
                return {
                    ...e,
                    balanceInWarehouse: (e?.inBondPackage) - (e?.exBondPackage || 0),
                    status: ((e?.inBondPackage) - (e?.exBondPackage || 0)) > 0 ? "PENDING" : "COMPLETED"
                }
            })




            reportObject = { "documents": transformedData, "totalCount": transformedData?.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "warehouseProductivityWH") {
        let Model = mongoose.models[`warehouseModel`] || mongoose.model(`warehouseModel`, Schema["warehouse"], `warehouses`);
        const outerCondition = {}

        outerCondition["orgId"] = orgId

        if (body.query?.createdOn)
            outerCondition["createdOn"] = body.query.createdOn

        await Model.find(outerCondition, {}, { sort: { ...sort, createdOn: 1 } }).then(async function (foundDocument) {
            const subQuery = [];
            for (let i = 0; i < foundDocument.length; i++)
                subQuery.push(foundDocument[i].warehouseId)

            let warehousedataentryModel = mongoose.models[`warehousedataentryModel`] || mongoose.model(`warehousedataentryModel`, Schema["warehousedataentry"], `warehousedataentrys`);
            let warehousedataentryData = await warehousedataentryModel.find({ warehouseId: { $in: subQuery } })
            if (warehousedataentryData)
                warehousedataentryData = warehousedataentryData?.map(e => e.toObject())

            let warehousecontainerModel = mongoose.models[`warehousecontainerModel`] || mongoose.model(`warehousecontainerModel`, Schema["warehousecontainer"], `warehousecontainers`);
            let warehousecontainerData = await warehousecontainerModel.find({ warehousedataentryId: { $in: warehousedataentryData?.map(e => e?.warehousedataentryId) } })
            if (warehousecontainerData)
                warehousecontainerData = warehousecontainerData?.map(e => e.toObject())

            let transformedData = [], transformedDataFinal = [];
            transformedData = foundDocument.map((e) => {
                return {
                    warehouseId: e?.warehouseId,
                    warehouseName: e?.wareHouseName,
                    location: e?.location,
                    code: e?.bondCode,
                    totalCapacity: e?.totalCapacity,
                    occupiedCapacity: e?.occupiedCapacity || 0,
                }
            })

            for (let i = 0; i < transformedData.length; i++) {
                const warehouse = transformedData[i];
                const jobs = warehousedataentryData.filter(e => e?.warehouseId === warehouse.warehouseId)

                for (let j = 0; j < jobs.length; j++) {
                    const job = jobs[j];

                    const containers = warehousecontainerData?.filter(e => e?.warehousedataentryId === job?.warehousedataentryId)
                    transformedDataFinal.push(
                        {
                            ...warehouse,
                            jobNo: job?.jobNo,
                            partyName: job?.invoiceLedgerName,
                            chaName: job?.chaLedgerName,
                            itemDesciption: job?.productDescription,
                            containers: containers?.length,
                            containerSize: [...new Set(containers.map(item => item.containerTypeName))]?.join(", "),
                            qtyStored:job.packagesUnit,
                            storageType: job?.packageUnitName,
                            occupiedCapacity: job?.spaceRequired
                        }
                    )
                }
            }

            transformedDataFinal = transformedDataFinal?.map(e => {
                return {
                    ...e,
                    availableCapacity: (e?.totalCapacity || 0) - (e?.occupiedCapacity || 0)
                }
            })

            reportObject = { "documents": transformedDataFinal, "totalCount": transformedDataFinal?.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "trackRepackingReportWH") {
        let Model = mongoose.models[`warehousedataentryModel`] || mongoose.model(`warehousedataentryModel`, Schema["warehousedataentry"], `warehousedataentrys`);
        const outerCondition = {}

        outerCondition["orgId"] = orgId

        if (body.query?.createdOn)
            outerCondition["createdOn"] = body.query.createdOn

        await Model.find(outerCondition, {}, { sort: { ...sort, createdOn: 1 } }).then(async function (foundDocument) {
            const subQuery = [];
            for (let i = 0; i < foundDocument.length; i++)
                subQuery.push(foundDocument[i].warehouseId)

            let warehouseModel = mongoose.models[`warehouseModel`] || mongoose.model(`warehouseModel`, Schema["warehouse"], `warehouses`);
            let warehouseData = await warehouseModel.find({ warehouseId: { $in: foundDocument?.map(e => e?.warehouseId) } })
            if (warehouseData)
                warehouseData = warehouseData?.map(e => e.toObject())

            let warehousepackingModel = mongoose.models[`warehousepackingModel`] || mongoose.model(`warehousepackingModel`, Schema["warehousepacking"], `warehousepackings`);
            let warehousepackingData = await warehousepackingModel.find({ warehousedataentryId: { $in: foundDocument?.map(e => e?.warehousedataentryId) } })
            if (warehousepackingData)
                warehousepackingData = warehousepackingData?.map(e => e.toObject())

            let userModel = mongoose.models[`userModel`] || mongoose.model(`userModel`, Schema["user"], `users`);
            let userData = await userModel.find({ userId: { $in: warehousepackingData?.map(e => e?.surveyors) } })
            if (userData)
                userData = userData?.map(e => e.toObject())

            let transformedData = [], transformedDataFinal = [];
            transformedData = foundDocument.map((job) => {
                return {
                    warehousedataentryId: job?.warehousedataentryId,
                    jobNo: job?.jobNo,
                    jobDate: job?.jobDate,
                    partyName: job?.invoiceLedgerName,
                    chaName: job?.chaLedgerName,
                    boe: job?.blofEN,
                    cargo: job?.productDescription,
                }
            })

            for (let i = 0; i < transformedData.length; i++) {
                const job = transformedData[i];
                const packings = warehousepackingData.filter(e => e?.warehousedataentryId === job.warehousedataentryId)

                for (let j = 0; j < packings.length; j++) {
                    const packing = packings[j];
                    const supervisor = userData.find(e => e?.userId === packing?.surveyors)
                    transformedDataFinal.push(
                        {
                            ...job,
                            qty: packing?.qtyPackedFromStock,
                            packageType: packing?.packingType,
                            location: packing?.location,
                            packedBy: packing?.vendorsLabours,
                            supervisor: supervisor?.name
                        }
                    )
                }
            }

            reportObject = { "documents": transformedDataFinal, "totalCount": transformedDataFinal?.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "monthlyAuditReportWH") { 
        let Model = mongoose.models[`warehousedataentryModel`] || mongoose.model(`warehousedataentryModel`, Schema["warehousedataentry"], `warehousedataentrys`);
        const outerCondition = {}

        outerCondition["orgId"] = orgId

        if (body.query?.createdOn)
            outerCondition["createdOn"] = body.query.createdOn

        await Model.find(outerCondition, {}, { sort: { ...sort, createdOn: 1 } }).then(async function (foundDocument) {
            const subQuery = [];
            for (let i = 0; i < foundDocument.length; i++)
                subQuery.push(foundDocument[i].warehousedataentryId)

            let warehousebillofentryModel = mongoose.models[`warehousebillofentryModel`] || mongoose.model(`warehousebillofentryModel`, Schema["warehousebillofentry"], `warehousebillofentrys`);
            let warehousebillofentryData = await warehousebillofentryModel.find({ warehousedataentryId: { $in: subQuery } })
            if (warehousebillofentryData)
                warehousebillofentryData = warehousebillofentryData?.map(e => e.toObject())

            let transformedData = [];
            transformedData = foundDocument.map((job) => {
                const bol = warehousebillofentryData.find(e => e?.warehousedataentryId === job?.warehousedataentryId)
                
                return {
                    warehousedataentryId: job?.warehousedataentryId,
                    jobNo: job?.jobNo,
                    partyName: job?.invoiceLedgerName,
                    chaName: job?.chaLedgerName,
                    boe: job?.blofEN,
                    boeDate: job?.blofEDate,
                    bondNo: bol?.bondNo,
                    bondDate: bol?.date,
                    section: bol?.warehousingSection,
                    goods: job?.productDescription,
                    qty: Number(job?.packagesUnit),
                    dateofexpiryofinitialbondingPeriod: bol?.bondExpiry,
                    remarks: bol?.remarks,
                    detailsofExtensions:bol?.dateofextension
                }
            })

            reportObject = { "documents": transformedData, "totalCount": transformedData?.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else if (reportName === "clientsMonthlyReportWH") {

    try {
        const Model =
            mongoose.models.warehousedataentryModel ||
            mongoose.model(
                "warehousedataentryModel",
                Schema.warehousedataentry,
                "warehousedataentrys"
            );

        const outerCondition = {
            orgId
        };

        if (body.query?.createdOn) {
            outerCondition.createdOn = body.query.createdOn;
        }

        const foundDocument = await Model.find(
            outerCondition,
            {},
            { sort: { ...sort, createdOn: 1 } }
        ).lean();

        if (!foundDocument.length) {
            reportObject = { documents: [], totalCount: 0 };
            status = 200;
            return;
        }

        const dataEntryIds = foundDocument.map(d => d.warehousedataentryId);

        /** ================= FETCH ALL RELATED DATA ================= */

        const warehousecontainerModel =
            mongoose.models.warehousecontainerModel ||
            mongoose.model(
                "warehousecontainerModel",
                Schema.warehousecontainer,
                "warehousecontainers"
            );

        const warehousebillofentryModel =
            mongoose.models.warehousebillofentryModel ||
            mongoose.model(
                "warehousebillofentryModel",
                Schema.warehousebillofentry,
                "warehousebillofentrys"
            );

        const warehousedispatchModel =
            mongoose.models.warehousedispatchModel ||
            mongoose.model(
                "warehousedispatchModel",
                Schema.warehousedispatch,
                "warehousedispatchs"
            );

        const warehousegateoutentryModel =
            mongoose.models.warehousegateoutentryModel ||
            mongoose.model(
                "warehousegateoutentryModel",
                Schema.warehousegateoutentry,
                "warehousegateoutentrys"
            );

        const warehouseinwardModel =
            mongoose.models.warehouseinwardModel ||
            mongoose.model(
                "warehouseinwardModel",
                Schema.warehouseinward,
                "warehouseinwards"
            );

        const [
            containers,
            dispatches,
            inwards
        ] = await Promise.all([
            warehousecontainerModel.find({ warehousedataentryId: { $in: dataEntryIds } }).lean(),
            warehousedispatchModel.find({ warehousedataentryId: { $in: dataEntryIds } }).lean(),
            warehouseinwardModel.find({ warehousedataentryId: { $in: dataEntryIds } }).lean()
        ]);

        const gatePassNos = dispatches.map(d => d.gateOutPassNo).filter(Boolean);

        const gateouts = gatePassNos.length
            ? await warehousegateoutentryModel
                  .find({ gatePassNumber: { $in: gatePassNos } })
                  .lean()
            : [];

        /** ================= BUILD FAST LOOKUPS ================= */

        const containersByEntry = new Map();
        containers.forEach(c => {
            if (!containersByEntry.has(c.warehousedataentryId)) {
                containersByEntry.set(c.warehousedataentryId, []);
            }
            containersByEntry.get(c.warehousedataentryId).push(c);
        });

        const inwardByContainer = new Map();
        inwards.forEach(i => {
            inwardByContainer.set(i.warehousecontainerId, i);
        });

        const gateoutByContainer = new Map();
        gateouts.forEach(g => {
            gateoutByContainer.set(g.warehousecontainerId, g);
        });

        const dispatchByGatePass = new Map();
        dispatches.forEach(d => {
            dispatchByGatePass.set(d.gateOutPassNo, d);
        });

        /** ================= TRANSFORM DATA ================= */

        const finalData = [];

        for (const job of foundDocument) {
            const jobContainers = containersByEntry.get(job.warehousedataentryId) || [];

            for (const container of jobContainers) {
                const inward = inwardByContainer.get(container.warehousecontainerId);
                const gateout = gateoutByContainer.get(container.warehousecontainerId);
                const dispatch = gateout
                    ? dispatchByGatePass.get(gateout.gatePassNumber)
                    : null;
                const pkg = Number(job.packagesUnit) || 0;
                const dispatchQty =Number(dispatch?.qty) || 0;
                finalData.push({
                    warehousedataentryId: job.warehousedataentryId,
                    jobNo: job.jobNo,
                    partyName: job.invoiceLedgerName,
                    chaName: job.chaLedgerName,
                    boe: job.blofEN,
                    inwardDate: inward?.date,
                    itemDesciption: job.productDescription,
                    pkg,
                    containerNumber: container.containerNo,
                    dispatchDate: dispatch?.dispatchDate,
                    dispatchQty,
                    balanceQty: pkg - dispatchQty,
                    storageDuration: diffInDays(inward?.date, dispatch?.dispatchDate)
                });
            }
        }

        reportObject = {
            documents: finalData,
            totalCount: finalData.length
        };
        status = 200;

    } catch (err) {
        console.error({
            traceId,
            error: err,
            stack: err?.stack
        });
        reportObject = { error: err.message };
        status = 500;
    }
    } else if (reportName === "giveTrackReportWH") {
        let Model = mongoose.models[`warehousedataentryModel`] || mongoose.model(`warehousedataentryModel`, Schema["warehousedataentry"], `warehousedataentrys`);
        const outerCondition = {}

        outerCondition["orgId"] = orgId

        if (body.query?.createdOn)
            outerCondition["createdOn"] = body.query.createdOn

        await Model.find(outerCondition, {}, { sort: { ...sort, createdOn: 1 } }).then(async function (foundDocument) {
            const subQuery = [];
            for (let i = 0; i < foundDocument.length; i++)
                subQuery.push(foundDocument[i].warehousedataentryId)

            let warehousecontainerModel = mongoose.models[`warehousecontainerModel`] || mongoose.model(`warehousecontainerModel`, Schema["warehousecontainer"], `warehousecontainers`);
            let warehousecontainerData = await warehousecontainerModel.find({ warehousedataentryId: { $in: subQuery } })
            if (warehousecontainerData)
                warehousecontainerData = warehousecontainerData?.map(e => e.toObject())

            let documentModel = mongoose.models[`documentModel`] || mongoose.model(`documentModel`, Schema["document"], `documents`);
            let documentData = await documentModel.find({ refId: { $in: subQuery } })
            if (documentData)
                documentData = documentData?.map(e => e.toObject())


            let transformedData = [];
            transformedData = foundDocument.map((job) => {
                const containers = warehousecontainerData.filter(e => e?.warehousedataentryId === job.warehousedataentryId)

                return {
                    warehousedataentryId: job?.warehousedataentryId,
                    nocNo: job?.jobNo,
                    jobNo: job?.jobNo,
                    partyName: job?.invoiceLedgerName,
                    chaName: job?.chaLedgerName,
                    boe: job?.blofEN,
                    numOfContainer: containers?.length,
                    nocDate: job?.jobDate
                }
            })

            const checkDocumentExist = (docType, docs) => {
                const docObj = {
                    packingList: "PACKING LIST",
                    billOfLanding: "BILL OF LADING",
                    commercialInvoice: "COMMERCAIL INVOICE",
                    billOfEntry: "BOE",
                    outOfCharge: "OUT OF CHARGE",
                    gatepass: "GATEPASS OOC",
                    bond: "CONSIGNMENT BOND",
                    permission: "WAREHOUSE PERMISSION",
                    deliveryOrder: "DELIVERY ORDER",
                    sealIntact: "SEAL INTACT",
                    form6: "FORM-6",
                    exBillOfEntry: "EX-BILL OF ENTRY",
                    exOutOfCharge: "EX-OUT OF CHARGE",
                    exGatepass: "EX-GATEPASS OOC",
                    dutyChallan: "DUTY CHALLAN",
                    gateInReqLetter: "GATE IN TRUCK REQUEST (CHA LETTER)"
                }
                return docs?.find(e => e?.documentType === docObj[docType]) ? "Y" : "N";
            }

            transformedData = transformedData?.map((e) => {
                const docs = documentData?.filter(d => d?.refId === e?.warehousedataentryId);

                return {
                    ...e,
                    packingList: checkDocumentExist("packingList", docs),
                    billOfLanding: checkDocumentExist("billOfLanding", docs),
                    commercialInvoice: checkDocumentExist("commercialInvoice", docs),
                    billOfEntry: checkDocumentExist("billOfEntry", docs),
                    outOfCharge: checkDocumentExist("outOfCharge", docs),
                    gatepass: checkDocumentExist("gatepass", docs),
                    bond: checkDocumentExist("bond", docs),
                    permission: checkDocumentExist("permission", docs),
                    deliveryOrder: checkDocumentExist("deliveryOrder", docs),
                    sealIntact: checkDocumentExist("sealIntact", docs),
                    form6: checkDocumentExist("form6", docs),
                    exBillOfEntry: checkDocumentExist("exBillOfEntry", docs),
                    exOutOfCharge: checkDocumentExist("exOutOfCharge", docs),
                    exGatepass: checkDocumentExist("exGatepass", docs),
                    dutyChallan: checkDocumentExist("dutyChallan", docs),
                    gateInReqLetter: checkDocumentExist("gateInReqLetter", docs)
                }
            })

            reportObject = { "documents": transformedData, "totalCount": transformedData?.length }
            status = 200
        }).catch(function (err) {
            console.error(JSON.stringify({
                traceId: traceId,
                error: err,
                stack: err?.stack
            }))
            reportObject = { error: err?.message }
            status = 500
        });
    } else {
        reportObject = { "error": `no report found named : ${reportName}` }
        status = 404
    }

    return {
        status,
        reportObject
    }
}

exports.reports = async (req, res, next) => {
    const user = res.locals.user;

    const { status, reportObject } = await this.generateReport(req.params.reportName, req.body, user.orgId, req.traceId);

    res.status(status).send(reportObject)
}

exports.dashboardReport = async (req, res, next) => {
    let data = [];
    const from = req?.body?.query?.from || "";
    const to = req?.body?.query?.to || "";

    const condition = {};

    const user = res.locals.user

    if (from !== "")
        condition["$gte"] = from

    if (to !== "")
        condition["$lte"] = to


    let Model;

    if (req?.body?.query?.flowType === "Export") {
        Model = mongoose.models[`enquiryModel`] || mongoose.model(`enquiryModel`, Schema["enquiry"], `enquirys`);

        let totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { enquiryStatus: { $in: ["Pending", "Inquiry Draft", "Draft"] }, orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } } : { enquiryStatus: "Pending", createdOn: condition, orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } });
        data.push({ name: "Inquiry Draft", count: totalCount })

        totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { enquiryStatus: "Inquiry Created", orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } } : { enquiryStatus: "Inquiry Created", createdOn: condition, orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } });
        data.push({ name: "Inquiry Created", count: totalCount })

        totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { enquiryStatus: "Inquiry Submitted", orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } } : { enquiryStatus: "Inquiry Submitted", createdOn: condition, orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } });
        data.push({ name: "Inquiry Submitted", count: totalCount })

        totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { enquiryStatus: "Job Created", orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } } : { enquiryStatus: "Job Created", createdOn: condition, orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } });
        data.push({ name: "Inquiry Accepted", count: totalCount })

        totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { enquiryStatus: { $in: ["Rejected", "Inquiry Rejected"] }, orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } } : { enquiryStatus: "Rejected", createdOn: condition, orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } });
        data.push({ name: "Inquiry Rejected", count: totalCount })
    } else if (req?.body?.query?.flowType === "Import") {
        Model = mongoose.models[`agentadviceModel`] || mongoose.model(`agentadviceModel`, Schema["agentadvice"], `agentadvices`);

        let totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { agentAdviseStatus: { $in: ["Pending", "Inquiry Draft", "Draft"] }, orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } } : { agentAdviseStatus: "Pending", createdOn: condition, orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } });
        data.push({ name: "Inquiry Draft", count: totalCount })

        totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { agentAdviseStatus: "Inquiry Created", orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } } : { agentAdviseStatus: "Inquiry Created", createdOn: condition, orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } });
        data.push({ name: "Inquiry Created", count: totalCount })

        totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { agentAdviseStatus: "Inquiry Submitted", orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } } : { agentAdviseStatus: "Inquiry Submitted", createdOn: condition, orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } });
        data.push({ name: "Inquiry Submitted", count: totalCount })

        totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { agentAdviseStatus: "Job Created", orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } } : { agentAdviseStatus: "Job Created", createdOn: condition, orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } });
        data.push({ name: "Inquiry Accepted", count: totalCount })

        totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { agentAdviseStatus: "Rejected", orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } } : { agentAdviseStatus: "Rejected", createdOn: condition, orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': { $ne: 'Land' } });
        data.push({ name: "Active Inquiry", count: totalCount })
    } else if (req?.body?.query?.flowType === "Transport") {
        Model = mongoose.models[`enquiryModel`] || mongoose.model(`enquiryModel`, Schema["enquiry"], `enquirys`);

        let totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { enquiryStatus: { $in: ["Pending", "Inquiry Draft", "Draft"] }, orgId: user.orgId, 'basicDetails.ShipmentTypeName': 'Land' } : { enquiryStatus: "Pending", createdOn: condition, orgId: user.orgId, 'basicDetails.ShipmentTypeName': 'Land' });
        data.push({ name: "Inquiry Draft", count: totalCount })

        totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { enquiryStatus: "Inquiry Created", orgId: user.orgId, 'basicDetails.ShipmentTypeName': 'Land' } : { enquiryStatus: "Inquiry Created", createdOn: condition, orgId: user.orgId, 'basicDetails.ShipmentTypeName': 'Land' });
        data.push({ name: "Inquiry Created", count: totalCount })

        totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { enquiryStatus: "Inquiry Submitted", orgId: user.orgId, 'basicDetails.ShipmentTypeName': 'Land' } : { enquiryStatus: "Inquiry Submitted", createdOn: condition, orgId: user.orgId, 'basicDetails.ShipmentTypeName': 'Land' });
        data.push({ name: "Inquiry Submitted", count: totalCount })

        totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { enquiryStatus: "Job Created", orgId: user.orgId, 'basicDetails.ShipmentTypeName': 'Land' } : { enquiryStatus: "Job Created", createdOn: condition, orgId: user.orgId, 'basicDetails.ShipmentTypeName': 'Land' });
        data.push({ name: "Inquiry Accepted", count: totalCount })

        totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { enquiryStatus: "Rejected", orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': 'Land' } : { enquiryStatus: "Rejected", createdOn: condition, orgId: user.orgId, "basicDetails.enquiryTypeName": req.body?.query?.flowType, 'basicDetails.ShipmentTypeName': 'Land' });
        data.push({ name: "Active Inquiry", count: totalCount })
    } else if (req?.body?.query?.flowType === "Transporter") {

        Model = mongoose.models[`transportinquiryModel`] || mongoose.model(`transportinquiryModel`, Schema["transportinquiry"], `transportinquirys`);


        const transporterStatuses = ["Pending", "Requested", "Submitted", "Rejected", "Job Created"];
        const statusQueries = {
            Pending: { adminStatus: { "$nin": ['Accepted', 'Job Created', 'Rejected', 'Requested'] } },
            Requested: { adminStatus: "Requested" },
            Submitted: { adminStatus: "Submitted" },
            Rejected: { adminStatus: "Rejected" },
            JobCreated: { adminStatus: "Job Created" }
        };


        for (const status of transporterStatuses) {
            let query = {
                ...statusQueries[status],
                orgId: user.orgId,
                shippinglineId: req?.body?.query?.shippinglineId
            };

            if ("$gte" in condition || "$lte" in condition) {
                query.createdOn = condition;
            }

            const totalCount = await Model.countDocuments(query);
            data.push({ name: status, count: totalCount });
        }

    }
    // Model = mongoose.models[`quotationModel`] || mongoose.model(`quotationModel`,Schema["quotation"], `quotations`);
    // totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { quoteStatus: "Quotation Created", orgId : user.orgId } : { quoteStatus: "Quotation Created", createdOn: condition, orgId : user.orgId });
    // data.push({ name: "Pending Quotation", count: totalCount })

    // totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { quoteStatus: {"$in" : ["Quotation Accepted", "Job Created"]}, orgId : user.orgId } : { quoteStatus: "Quotation Submitted", createdOn: condition, orgId : user.orgId });
    // data.push({ name: "Accepted Quotation", count: totalCount })

    // totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { quoteStatus: "Quotation Rejected", orgId : user.orgId } : { quoteStatus: "Quotation Rejected", createdOn: condition, orgId : user.orgId });
    // data.push({ name: "Rejected Quotation", count: totalCount })

    Model = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);

    totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { statusOfBatch: "Job Created", orgId: user.orgId, "enquiryDetails.basicDetails.enquiryTypeName": req.body?.query?.flowType } : { statusOfBatch: "Job Created", createdOn: condition, orgId: user.orgId, "enquiryDetails.basicDetails.enquiryTypeName": req.body?.query?.flowType });
    data.push({ name: "Job Created", count: totalCount })

    totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { statusOfBatch: "Booking Confirmed", orgId: user.orgId, "enquiryDetails.basicDetails.enquiryTypeName": req.body?.query?.flowType } : { statusOfBatch: "Booking Confirmed", createdOn: condition, orgId: user.orgId, "enquiryDetails.basicDetails.enquiryTypeName": req.body?.query?.flowType });
    data.push({ name: "Booking Confirmed", count: totalCount })

    totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { statusOfBatch: { "$nin": ["Job Closed", "Booking Confirmed", "Job Created", "Job Cancelled"] }, orgId: user.orgId, "enquiryDetails.basicDetails.enquiryTypeName": req.body?.query?.flowType } : { statusOfBatch: { "$nin": ["Job Closed", "Booking Confirmed", "Job Created", "Job Cancelled"] }, createdOn: condition, orgId: user.orgId, "enquiryDetails.basicDetails.enquiryTypeName": req.body?.query?.flowType });
    data.push({ name: "Booking Active", count: totalCount })

    totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { statusOfBatch: "Job Closed", orgId: user.orgId, "enquiryDetails.basicDetails.enquiryTypeName": req.body?.query?.flowType } : { statusOfBatch: "Job Closed", createdOn: condition, orgId: user.orgId, "enquiryDetails.basicDetails.enquiryTypeName": req.body?.query?.flowType });
    data.push({ name: "Booking Closed", count: totalCount })

    totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { statusOfBatch: "Job Cancelled", orgId: user.orgId, "enquiryDetails.basicDetails.enquiryTypeName": req.body?.query?.flowType } : { statusOfBatch: "Job Cancelled", createdOn: condition, orgId: user.orgId, "enquiryDetails.basicDetails.enquiryTypeName": req.body?.query?.flowType });
    data.push({ name: "Booking Cancelled", count: totalCount })

    const batchData = await Model.find({ orgId: user.orgId, "enquiryDetails.basicDetails.enquiryTypeName": req.body?.query?.flowType });
    const batchIds = { "$in": batchData.map(e => e.batchId) };

    Model = mongoose.models[`invoiceModel`] || mongoose.model(`invoiceModel`, Schema["user"], `invoices`);
    totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { paymentStatus: "Unpaid", orgId: user.orgId, batchId: batchIds } : { statusOfinvoice: "Pending", createdOn: condition, orgId: user.orgId, batchId: batchIds });

    data.push({ name: "Unpaid Invoice", count: totalCount })

    totalCount = await Model.countDocuments((!("$gte" in condition || "$lte" in condition)) ? { paymentStatus: "Paid", orgId: user.orgId, batchId: batchIds } : { statusOfinvoice: "Completed", createdOn: condition, orgId: user.orgId, batchId: batchIds });
    data.push({ name: "Paid Invoice", count: totalCount })

    res.status(200).send(data)
}