const { mongoose, Schema, invoiceSchema, uuid, jwt, crypto, axios, azureStorage, inAppNotificationService, querystring, nodemailer, pdfScanner, ediController, OpenAI, objecdiff, sendMessage, getTextMessageInput, fs, _, simpleParser, connect, imapConfig, transporter, getChangedFields, removeIdField, recordLogAudit, encryptObject, decryptObject, isSubset, createInAppNotification, replacePlaceholders, generateRandomPassword, triggerPointExecute, insertIntoTally, getTransporter, getChildCompany, getSenderName} = require('./helper.controller');
const { generateReport } = require('./reports.controller');
const bcrypt = require('bcrypt');

const ExcelJS = require('exceljs');

function formatToISTDT(isoDateString) {
    const date = new Date(isoDateString);

    // Convert to IST (UTC +5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const istDate = new Date(date.getTime() + istOffset);

    // Extract day, month, year, hours, minutes, and seconds
    const day = String(istDate.getDate()).padStart(2, '0');
    const month = String(istDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = istDate.getFullYear();

    // Format to dd/mm/yyyy hh:mm:ss AM/PM
    return `${day}/${month}/${year}`;
}
function replaceISODateStrings(input) {
    const isoDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;
  
    if (typeof input === "string" && isoDateRegex.test(input)) {
      return formatToISTDT(input);
    } else if (typeof input === "object" && input !== null) {
      for (const key in input) {
        input[key] = replaceISODateStrings(input[key]);
      }
    }
    return input;
}
exports.sendSchedulMail = async (savedDocument, traceId = "from_schedule_report_function") => {
    const bodyReport = {
        
    }

    if(savedDocument?.customer?.length > 0) {
        bodyReport["partyMasterId"] = savedDocument?.customer?.map(e => e.partymasterId)
    }

    const {status, reportObject} = await generateReport(savedDocument?.reportType, {query : bodyReport}, savedDocument?.orgId, traceId)

    if (status === 200 && reportObject && reportObject.documents) {
        const reportRows = reportObject.documents?.map((e) => {
            return replaceISODateStrings(e)
        });
        
        const reportconfigModel = mongoose.models[`reportconfigModel`] || mongoose.model(`reportconfigModel`, Schema["reportconfig"], `reportconfigs`);
        let reportConfiData = await reportconfigModel.findOne({reportName : savedDocument?.reportType})
        if (reportConfiData) {
            reportConfiData = reportConfiData?.toObject();

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(reportObject.reportLabel);

            worksheet.columns = reportConfiData.columns?.map(e => {
                return {
                    header: e.label,
                    key: e.key
                }
            })

            reportRows.forEach((row, index) => {
                const newRow = worksheet.addRow(row);
        
                // Apply text wrapping for each cell
                newRow.eachCell((cell) => {
                    cell.alignment = { wrapText: true, vertical: 'middle' };
                });
        
                // Auto-adjust row height based on content
                // newRow.height = row.email.split('\n').length * 15; // Adjust multiplier based on text size
            });

            worksheet.columns.forEach((column) => {
                let maxLength = column.header.length; // Start with header length
        
                column.eachCell({ includeEmpty: true }, (cell) => {
                    if (cell.value) {
                        const cellText = cell.value.toString(); // Convert value to string
                        maxLength = Math.max(maxLength, cellText.length); // Find max length
                    }
                });
        
                column.width = maxLength + 2; // Extra padding for better readability
            });

            const buffer = await workbook.xlsx.writeBuffer();

            const agentModel = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, Schema["agent"], `agents`);
            let agentData = await agentModel.findOne({agentId : savedDocument?.orgId})
            if (agentData)
                agentData = agentData?.toObject();

            const senderText = getSenderName(agentData);
            let transporterAgent = await getTransporter({ orgId : agentData?.agentId });
            if (transporterAgent){
                const mailOptions = {
                    from: senderText,
                    to: savedDocument?.toEmail,
                    cc: savedDocument?.ccEmail,
                    subject: savedDocument?.subject,
                    text: '',
                    html: savedDocument?.message,
                    attachments: [
                        {
                            filename: `${reportConfiData?.reportLabel}.xlsx`,
                            content: buffer,
                            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        }
                    ]
                };

                transporterAgent?.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(JSON.stringify({
                            traceId : traceId,
                            message : `Email not sent to ${savedDocument?.toEmail}, cc : ${savedDocument?.ccEmail} from schedule mail, Error : ${error}, traceId : ${traceId}`
                        }))
                        return error
                    }
        
                    console.log(JSON.stringify({
                        traceId : traceId,
                        message : `Emails sent to ${savedDocument?.toEmail}, cc : ${savedDocument?.ccEmail} from schedule mail, traceId : ${traceId}`
                    }))
                    return `Message sent: ${info.messageId}`
                });
            }
        }
    }
}
exports.insert = async (req, res, next) => {
    const indexName = req.params.indexName;
    const data = new Object(req.body);

    data.referenceId = uuid.v1();

    if (indexName === "user") {
        const plainPassword = generateRandomPassword(8);
        data.password = await bcrypt.hash(plainPassword, 12);
        data._plainPassword = plainPassword;
    }

    if(indexName === "schedulereport")
        data.lastSentOn = new Date().toISOString();


    data[`${indexName}Id`] = uuid.v1();
    data.createdOn = new Date().toISOString();
    data.updatedOn = new Date().toISOString();

    const user = res.locals.user
    const agent = res.locals.agent
    
    let transporterAgent = await getTransporter(user);
    
    if (user) {
        data.tenantId = user.tenantId
        data.createdBy = `${user.name} ${user.userLastname}`
        data.createdByUID = user.userId

        data.updatedBy = `${user.name} ${user.userLastname}`
        data.updatedByUID = user.userId

        if (!(user?.userType === "superAdmin"))
            data.orgId = user.orgId
    } else {
        data.tenantId = '1'
    }

    if(indexName === "user" && agent && agent?.userCount) {
        const userModel = mongoose.models[`userModel`] || mongoose.model(`userModel`, Schema['user'], `users`);

        const userCount = await userModel.countDocuments({orgId : user.orgId});
        
        if(userCount >= agent?.userCount)
            return res.status(500).send({error : { message : "Your company has not sufficient user credits!"}})
    }

    try {
        const Model = mongoose.models[`${indexName}Model`] || mongoose.model(`${indexName}Model`, Schema[indexName], `${indexName}s`);

        const restoreCondition = {};

        if (indexName === "enquiry") {
            let enquiryCounter = 0;
            const options = {
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };
            const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
            await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: { enquiryCounter: 1 } }, options).then(async function (foundDocument) {
                enquiryCounter = foundDocument.toObject().enquiryCounter || 0;
                restoreCondition["$inc"] = { "enquiryCounter": -1 }
            });

            enquiryCounter -= 1;
            data.enquiryNo = `INQ-${enquiryCounter.toString().padStart(6, '0')}`
        } else if (indexName === "transportinquiry") {
            let transportinquiryCounter = 0;
            const options = {
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };
            const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
            await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: { transportinquiryCounter: 1 } }, options).then(async function (foundDocument) {
                transportinquiryCounter = foundDocument.toObject().transportinquiryCounter || foundDocument?.toObject().transportinquiryCounter || 0;
                restoreCondition["$inc"] = { "transportinquiryCounter": -1 }
            });

            transportinquiryCounter -= 1;
            data.transportinquiryNo = `T-INQ-${transportinquiryCounter.toString().padStart(6, '0')}`
        } else if (indexName === "agentadvice") {
            let agentadviceCounter = 0;
            const options = {
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };
            const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
            await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: { agentadviceCounter: 1 } }, options).then(async function (foundDocument) {
                agentadviceCounter = foundDocument.toObject().agentadviceCounter || 0;
                restoreCondition["$inc"] = { "agentadviceCounter": -1 }
            });

            agentadviceCounter -= 1;
            data.agentadviceNo = `INQ-I-${agentadviceCounter.toString().padStart(4, '0')}`
        } else if (indexName === "batch") {
            let batchCounter = 0;

            const options = {
                upsert: true,
                new: true,
                returnDocument: "after",
                projection: { _id: 0, __v: 0 },
            };

            const BranchModel =
                mongoose.models.BranchModel ||
                mongoose.model("BranchModel", Schema["branch"], "branchs");

            const hasType = data?.jobCode?.includes("{{type}}");
            const hasDate = data?.jobCode?.includes("{{date}}");

            const agent = res.locals.agent;
            const shouldUseUnifiedCounter = agent?.useUnifiedCounter ? true : false;

            if (hasType) {
                const shipmentTypeName =
                    data?.ShipmentTypeName ||
                    data?.enquiryDetails?.basicDetails?.ShipmentTypeName;

                let typeCode = "";

                if (shipmentTypeName) {
                    const t = shipmentTypeName.toLowerCase();
                    if (t === "ocean") typeCode = data.isExport ? "OE" : "OI";
                    else if (t === "air") typeCode = data.isExport ? "AE" : "AI";
                }

                data.jobCode = data.jobCode.replace("{{type}}", typeCode);
            }

            if (hasDate) {
                const d = new Date();
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                data.jobCode = data.jobCode.replace(
                    "{{date}}",
                    `${day}${month}${year}`
                );
            }

            let foundDocument;

            if (shouldUseUnifiedCounter) {
                foundDocument = await BranchModel.findOneAndUpdate(
                    { branchId: data.branchId },
                    { $inc: { useUnifiedCounter: 1 } },
                    options
                );

                // Get counter AFTER increment (since new: true)
                batchCounter = foundDocument.useUnifiedCounter || 1;

            } else {
                // Use separate counters for export and import
                foundDocument = await BranchModel.findOneAndUpdate(
                    { branchId: data.branchId },
                    {
                        $inc: data.isExport
                            ? { exportBatchCounter: 1 }
                            : { batchCounter: 1 },
                    },
                    options
                );

                // Get counter AFTER increment (since new: true)
                batchCounter = data.isExport
                    ? (foundDocument.exportBatchCounter || 1)
                    : (foundDocument.batchCounter || 1);

            }

            const formattedCounter = batchCounter.toString().padStart(5, "0");

            // ================= GET FINANCIAL YEAR FOR DISPLAY =================
            const { getCurrentFinancialYear } = require("../utils/fyHelper");
            const currentFY = getCurrentFinancialYear(); // 25-26

            // ================= FORMAT BATCH NUMBER =================
            if (data.jobCode) {
                if (hasType && hasDate) {
                    // No FY in output
                    data.batchNo = `${data.jobCode}/${formattedCounter}`;
                } else if (hasType || hasDate) {
                    // Include FY in output
                    data.batchNo = `${data.jobCode}/${currentFY}/${formattedCounter}`;
                    data.financialYear = currentFY;
                } else {
                    // No templates - standard format
                    data.batchNo = `${data.jobCode}/${formattedCounter}`;
                }
            } else {
                data.batchNo = `${formattedCounter}`;
            }

        } else if (indexName === "invoice" && data?.type !== "buyerInvoice") {

            const BranchModel =
                mongoose.models.BranchModel ||
                mongoose.model("BranchModel", Schema.branch, "branchs");

            function getFinancialYear(date) {
                const d = new Date(date);
                const year = d.getFullYear();
                const month = d.getMonth() + 1;

                if (month >= 4) {
                    return {
                        start: year % 100,
                        end: (year + 1) % 100,
                        key: `${year}-${year + 1}`
                    };
                } else {
                    return {
                        start: (year - 1) % 100,
                        end: year % 100,
                        key: `${year - 1}-${year}`
                    };
                }
            }

            const { start, end, key } = getFinancialYear(data.invoice_date);

            // 2️⃣ Atomic counter update (FY safe)
            const branch = await BranchModel.findOneAndUpdate(
                {
                    branchId: data.branchId
                },
                [
                    {
                        $set: {
                            invoiceFY: {
                                $cond: [
                                    { $eq: ["$invoiceFY", key] },
                                    "$invoiceFY",
                                    key
                                ]
                            },
                            invoiceCounter: {
                                $cond: [
                                    { $eq: ["$invoiceFY", key] },
                                    { $add: ["$invoiceCounter", 1] },
                                    1
                                ]
                            }
                        }
                    }
                ],
                {
                    upsert: true,
                    new: true
                }
            );

            const invoiceCounter = branch.invoiceCounter;

            // 3️⃣ Invoice number generation
            if (agent?.invoiceFormat === "COMPACT") {
                // HDC26270001
                data.invoiceNo =
                    `${agent.companyShortCode}` +
                    `${String(start).padStart(2, "0")}` +
                    `${String(end).padStart(2, "0")}` +
                    `${String(invoiceCounter).padStart(4, "0")}`;

            } else {
                // MWZ/25-26/0342
                data.invoiceNo =
                    `${agent.companyShortCode}` +
                    `/${String(start).padStart(2, "0")}-${String(end).padStart(2, "0")}` +
                    `/${String(invoiceCounter).padStart(4, "0")}`;
            }
            // let invoiceCounter = 0;
            // const options = {
            //     returnDocument: 'after',
            //     projection: { _id: 0, __v: 0 },
            // };
            // const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
            // await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: { invoiceCounter: 1 } }, options).then(async function (foundDocument) {
            //     invoiceCounter = foundDocument.toObject().invoiceCounter || 0;
            //     restoreCondition["$inc"] = { "invoiceCounter": -1 }
            // });
 
            // invoiceCounter -= 1;
            // const currentYear = new Date().getFullYear() % 100;
            // const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
            // if(["Credit Note", "Debit Note"].includes(data?.type))
            //     data.invoiceNo = `${data?.category === "buyerInvoice" ? "PUR" : "SAL"}-${currentYear}${currentMonth}${invoiceCounter.toString().padStart(6, '0')}`
            // else
            //     data.invoiceNo = `${data?.type === "buyerInvoice" ? "PUR" : "SAL"}-${currentYear}${currentMonth}${invoiceCounter.toString().padStart(6, '0')}`
        } else if (indexName === "deliveryorder") {
            let deliveryOrderCounter = 0;
            const options = {
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };
            const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
            await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: { deliveryOrderCounter: 1 } }, options).then(async function (foundDocument) {
                deliveryOrderCounter = foundDocument.toObject().deliveryOrderCounter || foundDocument?.toObject().deliveryOrderCounter || 0;
                restoreCondition["$inc"] = { "deliveryOrderCounter": -1 }
            });

            deliveryOrderCounter -= 1;
            data.deliveryOrderNo = `DO${deliveryOrderCounter.toString().padStart(4, '0')}`
        } else if (indexName === "shippingbill") {
            let shippingbillCounter = 0;
            const options = {
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };
            const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
            await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: { shippingbillCounter: 1 } }, options).then(async function (foundDocument) {
                shippingbillCounter = foundDocument.toObject().shippingbillCounter || foundDocument?.toObject().shippingbillCounter || 0;
                restoreCondition["$inc"] = { "shippingbillCounter": -1 }
            });

            shippingbillCounter -= 1;
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
            data.shippingbillNo = `SHB-${currentYear}-${currentMonth}-${shippingbillCounter.toString().padStart(4, '0')}`
        } else if (indexName === "entrybill") {
            let entrybillCounter = 0;
            const options = {
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };
            const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
            await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: { entrybillCounter: 1 } }, options).then(async function (foundDocument) {
                entrybillCounter = foundDocument.toObject().entrybillCounter || 0;
                restoreCondition["$inc"] = { "entrybillCounter": -1 }
            });

            entrybillCounter -= 1;
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
            data.entrybillNo = `EB-${currentYear}-${currentMonth}-${entrybillCounter.toString().padStart(4, '0')}`
        } else if (indexName === "bl" && data.blType === "HBL" && (!data.blNumber)) {
            const shippinglineModel = mongoose.models[`shippinglineModel`] || mongoose.model(`shippinglineModel`, Schema["shippingline"], `shippinglines`);
            let shippinglineData = await shippinglineModel.findOne({shippinglineId : data?.finalShippingLineId})
            if(shippinglineData)
                shippinglineData = shippinglineData?.toObject();

            let blCounter = 0;
            const options = {
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };
            const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
            await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: { blCounter: 1 } }, options).then(async function (foundDocument) {
                blCounter = foundDocument.toObject().blCounter || 0;
                restoreCondition["$inc"] = { "blCounter": -1 }
            });

            blCounter -= 1;
            
            data.blNumber = `${shippinglineData?.scacCode || shippinglineData?.shortName?.replace(" ", "")?.substring(0,3)}${blCounter.toString().padStart(8, '0')}`
        } else if (indexName === "creditdebitnote") {
            let creditNoteCounter = 0;
            const options = {
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };
            const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
            await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: { creditNoteCounter: 1 } }, options).then(async function (foundDocument) {
                creditNoteCounter = foundDocument.toObject().creditNoteCounter || 0;
                restoreCondition["$inc"] = { "creditNoteCounter": -1 }
            });

            creditNoteCounter -= 1;
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
            data.creditNoteNo = `${currentYear}${currentMonth}${creditNoteCounter.toString().padStart(6, '0')}`
        } else if (indexName === "quotation") {
            let quotationNo = 0;
            const options = {
                upsert: true, new: true,
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };
            const EnquiryModel = mongoose.models[`EnquiryModel`] || mongoose.model(`EnquiryModel`, Schema["enquiry"], `enquirys`);
            await EnquiryModel.findOneAndUpdate({ "enquiryId": data.enquiryId }, { $inc: { quotationCounter: 1 } }, options).then(async function (foundDocument) {
                quotationNo = foundDocument.toObject().quotationCounter || 0;
            });

            data.quotationNo = `QUOT${quotationNo.toString().padStart(6, '0')}`
        } else if (indexName === "consolidationbooking") {
            let consolidationbookingCounter = 0;
            const options = {
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };
            const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
            await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: { consolidationbookingCounter: 1 } }, options).then(async function (foundDocument) {
                consolidationbookingCounter = foundDocument.toObject().consolidationbookingCounter || 0;
                restoreCondition["$inc"] = { "consolidationbookingCounter": -1 }
            });

            consolidationbookingCounter -= 1;
            const currentYear = new Date().getFullYear() % 100;
            data.consolidationbookingNo = `COB-${currentYear}${consolidationbookingCounter.toString().padStart(4, '0')}`
        } else if (indexName === "warehouse") {
            let warehouseCounter = 0;
            const options = {
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };
            const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
            await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: { warehouseCounter: 1 } }, options).then(async function (foundDocument) {
                warehouseCounter = foundDocument.toObject().warehouseCounter || 0;
                restoreCondition["$inc"] = { "warehouseCounter": -1 }
            });

            warehouseCounter -= 1;
            const currentYear = new Date().getFullYear() % 100;
            data.warehouseCode = `WH-${currentYear}${warehouseCounter.toString().padStart(6, '0')}`
        } else if (indexName === "warehousegateinentry") {
            let gateInPassNumberCounter = 0;
            const options = {
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };
            const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
            await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: { gateInPassNumberCounter: 1 } }, options).then(async function (foundDocument) {
                gateInPassNumberCounter = foundDocument.toObject().gateInPassNumberCounter || 0;
                restoreCondition["$inc"] = { "gateInPassNumberCounter": -1 }
            });

            gateInPassNumberCounter -= 1;
            const currentYear = new Date().getFullYear() % 100;
            data.gatePassNumber = `GPI/${gateInPassNumberCounter.toString().padStart(6, '0')}/${currentYear}-${currentYear + 1}`
        } else if (indexName === "warehousegateoutentry") {
            let gateOutPassNumberCounter = 0;
            const options = {
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };
            const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
            await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: { gateOutPassNumberCounter: 1 } }, options).then(async function (foundDocument) {
                gateOutPassNumberCounter = foundDocument.toObject().gateOutPassNumberCounter || 0;
                restoreCondition["$inc"] = { "gateOutPassNumberCounter": -1 }
            });

            gateOutPassNumberCounter -= 1;
            const currentYear = new Date().getFullYear() % 100;
            data.gatePassNumber = `GPO/${gateOutPassNumberCounter.toString().padStart(6, '0')}/${currentYear}-${currentYear + 1}`
        } else if (indexName === "warehousedataentry") {
            let warehouseJobCounter = 0;
            let branchData;

            const options = {
                upsert: true, new: true,
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };

            let countExp = {};
            if(data.type === "Non Bonded")
                countExp["warehouseCounterNB"] = 1
            else
                countExp["warehouseCounter"] = 1


            const BranchModel = mongoose.models[`BranchModel`] || mongoose.model(`BranchModel`, Schema["branch"], `branchs`);
            await BranchModel.findOneAndUpdate({ "branchId": data.branchId }, { $inc: countExp }, options).then(async function (foundDocument) {
                foundDocument = foundDocument.toObject();

                if(data.type === "Non Bonded")
                    warehouseJobCounter = foundDocument?.warehouseCounterNB || 0; 
                else
                    warehouseJobCounter = foundDocument?.warehouseCounter || 0;   
                
                branchData = foundDocument
            });
            const currentYear = new Date().getFullYear() ;

            if(data.type === "Non Bonded")
                data.jobNo = `${branchData?.jobCodeNB}/N${agent?.companyShortCode}/${warehouseJobCounter?.toString().padStart(4, '0')}/${currentYear}-${(currentYear + 1) % 100}`
            else
                data.jobNo = `${branchData?.jobCode}/${agent?.companyShortCode}/${warehouseJobCounter?.toString().padStart(4, '0')}/${currentYear}-${(currentYear + 1) % 100}`
        } else if (indexName === "grn") {
            let grnCounter = 0;
            const options = {
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };
            const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
            await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: { grnCounter: 1 } }, options).then(async function (foundDocument) {
                grnCounter = foundDocument.toObject().grnCounter || 0;
                restoreCondition["$inc"] = { "grnCounter": -1 }
            });

            grnCounter -= 1;
            const currentYear = new Date().getFullYear() % 100;
            data.grnNo = `GRN-${currentYear}${grnCounter.toString().padStart(6, '0')}`

            
            if (data.items && Array.isArray(data.items)) {
                data.items.forEach((item, index) => {
                    const itemCounter = grnCounter + index + 1; 
                    item.ref = `PKG-${currentYear}${itemCounter.toString().padStart(6, '0')}`;
                });
            }
        } else if (indexName === "payment") {
            let paymentCounter = 0;
            const options = {
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };
            const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
            await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: { paymentCounter: 1 } }, options).then(async function (foundDocument) {
                paymentCounter = foundDocument.toObject().paymentCounter || 0;
                restoreCondition["$inc"] = { "paymentCounter": -1 }
            });

            paymentCounter -= 1;
            const currentYear = new Date().getFullYear() % 100;
            data.paymentNo = `PAY-${currentYear}${paymentCounter.toString().padStart(6, '0')}`
        } else if (indexName === "ticket") {
            let ticketCounter = 0;
            const options = {
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };
            const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
            await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: { ticketCounter: 1 } }, options).then(async function (foundDocument) {
                ticketCounter = foundDocument.toObject().ticketCounter || 0;
                restoreCondition["$inc"] = { "ticketCounter": -1 }
            });

            ticketCounter -= 1;
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
            data.ticketNo = `${currentYear}${currentMonth}${ticketCounter.toString().padStart(6, '0')}`
        } 

        const document = Model(data);

        document.save()
            .then(async savedDocument => {
                savedDocument = savedDocument?.toObject();

                triggerPointExecute(req, savedDocument, indexName)

                if (indexName === "user") {
                    const emailPassword = data._plainPassword || savedDocument.password;
                    const mailOptions = {
                        from: getSenderName(agent),
                        to: savedDocument.userEmail,
                        subject: "Your credentials for ship-easy web login",
                        html: `Hello ${savedDocument.name} ${savedDocument.userLastname},<br> <br>Welcome To ShipEasy <br><br>&ensp;To Login Please use below Credentials.<br>&ensp;Username : ${savedDocument.userLogin}<br>&ensp;Password : ${emailPassword}<br>&ensp;<p style="text-decoration:underline;"><a href=${process.env.WEB_URL}>Click here to login</a></p><br> Best Regards, <br> Team SHIPEASY<br>`
                    };
        
                    transporterAgent?.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error(JSON.stringify({
                                traceId : req?.traceId,
                                error: error,
                                stack : error?.stack
                            }))
                        }
                    });

                } else if (indexName === "custom") {
                    let events = [
                        {
                            name: "Docs Sent to CHA",
                            tag: "docs_sent_to_cha",
                            locationId: data.locationId,
                            locationName: data.locationName,
                            referenceType: "Port of Destination"
                        },
                        {
                            name: "Checklist Created/Receieved",
                            tag: "checklist_created_receieved",
                            locationId: data.locationId,
                            locationName: data.locationName,
                            referenceType: "Port of Destination"
                        },
                        {
                            name: "Checklist Shared with Customer",
                            tag: "checklist_shared_with_customer",
                            locationId: data.locationId,
                            locationName: data.locationName,
                            referenceType: "Port of Destination"
                        },
                        {
                            name: "Checklist Approved",
                            tag: "checklist_approved",
                            locationId: data.locationId,
                            locationName: data.locationName,
                            referenceType: "Port of Destination"
                        },
                        {
                            name: "Shipping Bill Filled",
                            tag: "shipping_bill_filled",
                            locationId: data.locationId,
                            locationName: data.locationName,
                            referenceType: "Port of Destination"
                        },
                        {
                            name: "Assessment Done",
                            tag: "assessment_done",
                            locationId: data.locationId,
                            locationName: data.locationName,
                            referenceType: "Port of Destination"
                        },
                        {
                            name: "Examination Done",
                            tag: "examination_one",
                            locationId: data.locationId,
                            locationName: data.locationName,
                            referenceType: "Port of Destination"
                        },
                        {
                            name: "LEO Done",
                            tag: "leo_done",
                            locationId: data.locationId,
                            locationName: data.locationName,
                            referenceType: "Port of Destination"
                        },
                        {
                            name: "Stuffing Order Released",
                            tag: "stuffing_order_released",
                            locationId: data.locationId,
                            locationName: data.locationName,
                            referenceType: "Port of Destination"
                        },
                        {
                            name: "LEO Copy Received",
                            tag: "leo_copy_received",
                            locationId: data.locationId,
                            locationName: data.locationName,
                            referenceType: "Port of Destination"
                        },
                        {
                            name: "LEO Copy Sent",
                            tag: "leo_copy_sent",
                            locationId: data.locationId,
                            locationName: data.locationName,
                            referenceType: "Port of Destination"
                        },
                        {
                            name: "Export Docs Submitted in Bank",
                            tag: "export_docs_submitted_in_bank",
                            locationId: data.locationId,
                            locationName: data.locationName,
                            referenceType: "Port of Destination"
                        },
                        {
                            name: "EGM Filled",
                            tag: "egm_filled",
                            locationId: data.locationId,
                            locationName: data.locationName,
                            referenceType: "Port of Destination"
                        },
                        {
                            name: "Drawback Processed",
                            tag: "drawback_processed",
                            locationId: data.locationId,
                            locationName: data.locationName,
                            referenceType: "Port of Destination"
                        },
                        {
                            name: "IGST Refund Processed",
                            tag: "igst_refund_processed",
                            locationId: data.locationId,
                            locationName: data.locationName,
                            referenceType: "Port of Destination"
                        },
                        {
                            name: "BRC Closed",
                            tag: "brc_closed",
                            locationId: data.locationId,
                            locationName: data.locationName,
                            referenceType: "Port of Destination"
                        }
                    ];

                    const milestones = [];

                    for (let i = 0; i < events.length; i++) {
                        const milestoneData = {
                            referenceType: events[i].referenceType,
                            eventModule: "Custom",
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
                            createdBy: data.createdBy,
                            createdByUID: data.createdByUID,
                            tenantId: data.tenantId,
                            eventId: uuid.v1(),
                            entityId: savedDocument.customId,
                            entitysubId: savedDocument.batchId,
                            event_payload: {}
                        }

                        milestones.push(milestoneData)
                    }
                    const MilestoneExportModel = mongoose.models[`MilestoneExportModel`] || mongoose.model(`MilestoneExportModel`, Schema["event"], `events`);
                    await MilestoneExportModel.insertMany(milestones);
                } else if (indexName === "batch") {
                    let customDetails;
                    const enquiryModel = mongoose.models[`enquiryModel`] || mongoose.model(`enquiryModel`, Schema['enquiry'], `enquirys`);
                    const agentadviceModel = mongoose.models[`agentadviceModel`] || mongoose.model(`agentadviceModel`, Schema['agentadvice'], `agentadvices`);
                    
                    if (data?.enquiryDetails?.basicDetails?.ShipmentTypeName === "Ocean" && data?.isExport){
                        await enquiryModel.findOne({ enquiryId: data.enquiryId }).then(async function (foundEnquiry) {
                            customDetails = foundEnquiry?.customDetails
                        })
                    } else if (data?.enquiryDetails?.basicDetails?.ShipmentTypeName === "Ocean" && data?.isExport === false) {
                        await agentadviceModel.findOne({ agentadviceId: data.agentadviceId }).then(async function (foundEnquiry) {
                            customDetails = foundEnquiry?.customDetails
                        })
                    } else {
                        await enquiryModel.findOne({ enquiryId: data.enquiryId }).then(async function (foundEnquiry) {
                            customDetails = foundEnquiry?.customDetails
                        })
                    }
                    

                    const milestoneMasterModel = mongoose.models[`milestoneMasterModel`] || mongoose.model(`milestoneMasterModel`, Schema["milestonemaster"], `milestonemasters`);
                    let conditionMMEvents = {};

                    conditionMMEvents["orgId"] = data.orgId
                    conditionMMEvents["flowType"] = data.isExport ? "export" : (data.isExport === false && data?.enquiryDetails?.basicDetails?.ShipmentTypeName != "Land") ? "import" : "transporter"
                    
                    if (customDetails?.customOrigin) {
                        conditionMMEvents["customOrigin"] = { $in: [true, false, null] };
                    } else 
                        conditionMMEvents["customOrigin"] = { $in: [null, false] };
                    
                    if (customDetails?.customDestination) {
                        conditionMMEvents["customDestination"] = { $in: [true, false, null] };
                    } else 
                        conditionMMEvents["customDestination"] = { $in: [null, false] };

                    conditionMMEvents["status"] = true
                    conditionMMEvents["loadType"] = data?.enquiryDetails?.basicDetails?.loadType
                    conditionMMEvents["locationType"] = {$ne : "transhipment"}
                    conditionMMEvents["shipmentType.item_id"] = data?.enquiryDetails?.basicDetails?.importShipmentTypeId
                    
                    let mmEvents = await milestoneMasterModel.find(conditionMMEvents)

                    mmEvents.sort((a, b) => a.seq - b.seq);

                    for (i = 0; i < mmEvents.length; i++){
                        mmEvents[i]["name"] = mmEvents[i]["mileStoneName"]
                        mmEvents[i]["tag"] = mmEvents[i]["mileStoneName"].replace(" ", "_")

                        if (mmEvents[i]["locationType"] === "load") {
                            mmEvents[i]["locationId"] = data.quotationDetails.loadPortId
                            mmEvents[i]["locationName"] = data.quotationDetails.loadPortName
                            mmEvents[i]["referenceType"] = "Port of Loading"
                        } else if (mmEvents[i]["locationType"] === "transhipment") {
                            mmEvents[i]["locationId"] = data?.routeDetails?.portOfTranshipmentId || ''
                            mmEvents[i]["locationName"] = data?.routeDetails?.portOfTranshipmentName || ''
                            mmEvents[i]["referenceType"] = "Port of Transhipment"
                        } else if (mmEvents[i]["locationType"] === "discharge") {
                            mmEvents[i]["locationId"] = data.enquiryDetails.routeDetails.destPortId
                            mmEvents[i]["locationName"] = data.enquiryDetails.routeDetails.destPortName
                            mmEvents[i]["referenceType"] = "Port of Discharge"
                        }
                    }

                    const events = mmEvents;

                    const milestones = [];

                    for (let i = 0; i < events.length; i++) {
                        const milestoneData = {
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
                            createdBy: data.createdBy,
                            createdByUID: data.createdByUID,
                            tenantId: data.tenantId,
                            eventId: uuid.v1(),
                            milestonemasterId: events[i].milestonemasterId,
                            entityId: savedDocument.batchId,
                            entitysubId: data.enquiryId,
                            event_payload: {},
                            orgId: data?.orgId
                        }

                        milestones.push(milestoneData)
                    }
                    const MilestoneExportModel = mongoose.models[`MilestoneExportModel`] || mongoose.model(`MilestoneExportModel`, Schema["event"], `events`);
                    await MilestoneExportModel.insertMany(milestones);
                } else if (indexName === "container") {
                    const BatchSchema = Schema['batch']
                    const BatchModel = mongoose.models.BatchModel || mongoose.model('BatchModel', BatchSchema, 'batchs');

                    let batchData;
                    await BatchModel.findOne({ 'batchId': data.batchId }).then(async function (batchFound) {
                        if (batchFound) {
                            batchData = batchFound;
                        }
                    });

                    const events = [
                        {
                            name: "Empty Picked Up",
                            tag: "empty_picked_up",
                            locationId: "",
                            locationName: ""
                        },
                        {
                            name: "Stuffing Done",
                            tag: "stuffing_done",
                            locationId: batchData.quotationDetails.loadPortId,
                            locationName: batchData.quotationDetails.loadPortName,
                            referenceType: "Port of Loading"
                        },
                        {
                            name: "Gated Out From Origin CFS",
                            tag: "gated_out_from_origin_cfs",
                            locationId: batchData.quotationDetails.loadPortId,
                            locationName: batchData.quotationDetails.loadPortName,
                            referenceType: "Port of Loading"
                        },
                        {
                            name: "PoL Gated Pass Confirmed",
                            tag: "pol_gated_pass_confirmed",
                            locationId: batchData.quotationDetails.loadPortId,
                            locationName: batchData.quotationDetails.loadPortName,
                            referenceType: "Port of Loading"
                        },
                        {
                            name: "Gated In at PoL",
                            tag: "gated_in_at_pol",
                            locationId: batchData.quotationDetails.loadPortId,
                            locationName: batchData.quotationDetails.loadPortName,
                            referenceType: "Port of Loading"
                        },
                        {
                            name: "Handed Over To Carrier",
                            tag: "handed_over_to_carrier",
                            locationId: batchData.quotationDetails.loadPortId,
                            locationName: batchData.quotationDetails.loadPortName,
                            referenceType: "Port of Loading"
                        },
                        {
                            name: "Loaded on Vessel",
                            tag: "loaded_on_vessel",
                            locationId: batchData.quotationDetails.loadPortId,
                            locationName: batchData.quotationDetails.loadPortName,
                            referenceType: "Port of Loading"
                        },
                        {
                            name: "Vessel Departed From Origin Port",
                            tag: "vessel_departed_from_origin_port",
                            locationId: batchData.quotationDetails.loadPortId,
                            locationName: batchData.quotationDetails.loadPortName,
                            referenceType: "Port of Loading"
                        },
                        {
                            name: "Vessel Arrived At Destination Port",
                            tag: "vessel_arrived_at_destination_port",
                            locationId: batchData.quotationDetails.dischargePortId,
                            locationName: batchData.quotationDetails.dischargePortName,
                            referenceType: "Port of Destination"
                        },
                        {
                            name: "Discharged at PoD",
                            tag: "discharged_at_pod",
                            locationId: batchData.quotationDetails.dischargePortId,
                            locationName: batchData.quotationDetails.dischargePortName,
                            referenceType: "Port of Destination"
                        },
                        {
                            name: "Pickup Appointment Confirmed",
                            tag: "pickup_appointment_confirmed",
                            locationId: batchData.quotationDetails.dischargePortId,
                            locationName: batchData.quotationDetails.dischargePortName,
                            referenceType: "Port of Destination"
                        },
                        {
                            name: "Gated Out From PoD",
                            tag: "gated_out_from_pod",
                            locationId: "",
                            locationName: ""
                        },
                        {
                            name: "Empty Returned To Carrier",
                            tag: "empty_returned_to_carrier",
                            locationId: "",
                            locationName: ""
                        }
                    ];

                    const milestones = [];

                    for (let i = 0; i < events.length; i++) {
                        const milestoneData = {
                            eventModule: "Container",
                            eventType: "Milestone",
                            eventTag: events[i].tag,
                            eventName: events[i].name,
                            eventSeq: i + 1,
                            eventActualDate: "",
                            eventEstimatedDate: "",
                            referenceType: events[i].referenceType,
                            locationTag: events[i].locationName,
                            location: {
                                locationId: events[i].locationId,
                                locationName: events[i].locationName
                            },
                            createdOn: new Date().toISOString(),
                            createdBy: data.createdBy,
                            createdByUID: data.createdByUID,
                            tenantId: data.tenantId,
                            milestoneId: uuid.v1(),
                            entityId: savedDocument.containerId,
                            entitysubId: data.batchId,
                            event_payload: {}
                        }

                        milestones.push(milestoneData)
                    }
                    const MilestoneExportModel = mongoose.models[`MilestoneExportModel`] || mongoose.model(`MilestoneExportModel`, Schema["event"], `events`);
                    await MilestoneExportModel.insertMany(milestones);
                } else if (indexName === "instruction") {
                    if (data?.si?.bookingConfirmed) {
                        const MilestoneExportModel = mongoose.models[`MilestoneExportModel`] || mongoose.model(`MilestoneExportModel`, Schema["event"], `events`);

                        await MilestoneExportModel.updateMany(
                            { entityId: data.batchId },
                            { $inc: { eventSeq: 1 } })

                        const updatedDocuments = await MilestoneExportModel.find(
                            { entityId: data.batchId },
                            { _id: 0, __v: 0 }
                        ).sort({ eventSeq: 1 });

                        const milestoneData = {
                            eventModule: "Booking",
                            eventType: "Milestone",
                            eventTag: "booking_confirmed",
                            eventName: "Booking Confirmed",
                            eventSeq: 1,
                            eventActualDate: "",
                            eventEstimatedDate: "",
                            referenceType: updatedDocuments[0]?.referenceType,
                            locationTag: updatedDocuments[0]?.locationTag,
                            location: updatedDocuments[0]?.location,
                            createdOn: new Date().toISOString(),
                            createdBy: data.createdBy,
                            createdByUID: data.createdByUID,
                            updatedOn: new Date().toISOString(),
                            updatedBy: data.createdBy,
                            updatedByUID: data.createdByUID,
                            tenantId: data.tenantId,
                            milestoneId: uuid.v1(),
                            entityId: updatedDocuments[0]?.entityId,
                            entitysubId: updatedDocuments[0]?.entitysubId,
                            eventData: {
                                eventState: "ActualDate",
                                bookingDate: new Date().toISOString(),
                                bookingNo: data.si.bookingNo,
                                siCutoff: data.si.siCutOffDate,
                                gateCutoff: data.si.gateCutOff,
                                docCutoff: data.si.docCutOff,
                                Remarks: data.si.siRemark
                            },
                            isUpdated: true
                        }

                        const documentMileStone = MilestoneExportModel(milestoneData);
                        await documentMileStone.save().then((savedDocument) => {
                        });

                        const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema['batch'], `batchs`);
                        await batchModel.findOneAndUpdate(
                            { batchId: data.batchId },
                            { $set: { statusOfBatch: "Booking Confirmed" } },
                            {
                                new: true, // Return the modified document rather than the original
                                upsert: true // If no document matches, insert a new one
                            }
                        );
                        

                        triggerPointExecute(req, await batchModel.findOne({batchId: data.batchId}), "batch")


                    }
                } else if (indexName === "egm") {
                    for (let i = 0; i < savedDocument.egmcont.length; i++){
                        const egnCont = savedDocument.egmcont[i];

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
                } else if (indexName === "invoice") {
                    try {
                        const invoiceapprovalModel = mongoose.models[`invoiceapprovalModel`] || mongoose.model(`invoiceapprovalModel`, Schema['invoiceapproval'], `invoiceapprovals`);
                        const userModel = mongoose.models[`userModel`] || mongoose.model(`userModel`, Schema['user'], `users`);
                        let orgInvoiceSetting = await invoiceapprovalModel.findOne({orgId: agent?.agentId})
                        if(orgInvoiceSetting){
                            orgInvoiceSetting = orgInvoiceSetting?.toObject();


                            const firstDepartment = orgInvoiceSetting?.departmentSettings?.find(e => e?.position === 1)
                            const users = firstDepartment?.tiers?.flatMap(tier => tier.selectedUsers.map(user => user.userId))
                            if(users?.length > 0) {
                                await Model.findOneAndUpdate(
                                    {
                                        invoiceId: savedDocument?.invoiceId
                                    },
                                    {
                                        $set: {
                                            invoiceApprovalEnabled: true
                                        }
                                    }
                                );
                                
                                let usersList = await userModel.find({userId: {$in: users}});
                                if(usersList)
                                    usersList = usersList?.map(e => e?.toObject());
                                
                                const approvUrl = `${process.env.FRONTEND_URL}/batch/list/add/${savedDocument?.batchId}/invoice/approve/${savedDocument?.invoiceId}`
                                const rejectUrl = `${process.env.FRONTEND_URL}/batch/list/add/${savedDocument?.batchId}/invoice/reject/${savedDocument?.invoiceId}`
                                const detailUrl = `${process.env.FRONTEND_URL}/batch/list/add/${savedDocument?.batchId}/invoice/${savedDocument?.invoiceId}/show`

                                const transporterAgent = await getTransporter({orgId : agent?.agentId});
                                
                                for(let i = 0; i < users?.length; i++) {
                                    let user = usersList.find(u => u.userId === users[i]);

                                    if(user){
                                        let emailHtml = `
                                            <!DOCTYPE html>
                                                <html lang="en">
                                                <head>
                                                    <meta charset="UTF-8">
                                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                                    <title>Invoice Approval Required</title>
                                                </head>
                                                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                                                        <tr>
                                                            <td align="center">
                                                                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                                                    
                                                                    <!-- Header -->
                                                                    <tr>
                                                                        <td style="background-color: #2563eb; padding: 30px; text-align: center;">
                                                                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Invoice Approval Required</h1>
                                                                        </td>
                                                                    </tr>
                                                                    
                                                                    <!-- Body Content -->
                                                                    <tr>
                                                                        <td style="padding: 40px 30px;">
                                                                            <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                                                                                Hello <strong>${user?.name}</strong>,
                                                                            </p>
                                                                            
                                                                            <p style="margin: 0 0 25px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                                                                                A new invoice requires your approval. Please review the details below and take action:
                                                                            </p>
                                                                            
                                                                            <!-- Invoice Details Box -->
                                                                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 30px;">
                                                                                <tr>
                                                                                    <td style="padding: 20px;">
                                                                                        <table width="100%" cellpadding="0" cellspacing="0">
                                                                                            <tr>
                                                                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Invoice Number:</td>
                                                                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${savedDocument?.invoiceNo}</td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Vendor:</td>
                                                                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${savedDocument?.invoiceToName}</td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount:</td>
                                                                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${savedDocument?.invoiceAmount} ${savedDocument?.currency}</td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date:</td>
                                                                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${new Date(savedDocument?.invoice_date).toLocaleDateString("en-US")}</td>
                                                                                            </tr>
                                                                                        </table>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            
                                                                            <!-- Action Buttons -->
                                                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                                                <tr>
                                                                                    <td align="center" style="padding: 20px 0;">
                                                                                        <table cellpadding="0" cellspacing="0">
                                                                                            <tr>
                                                                                                <!-- Approve Button -->
                                                                                                <td style="padding-right: 10px;">
                                                                                                    <a href="${approvUrl}" 
                                                                                                    style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                                                                                                        ✓ Approve
                                                                                                    </a>
                                                                                                </td>
                                                                                                
                                                                                                <!-- Reject Button -->
                                                                                                <td style="padding-left: 10px;">
                                                                                                    <a href="${rejectUrl}" 
                                                                                                    style="display: inline-block; padding: 14px 32px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);">
                                                                                                        ✕ Reject
                                                                                                    </a>
                                                                                                </td>
                                                                                            </tr>
                                                                                        </table>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            
                                                                            <p style="margin: 25px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5; text-align: center;">
                                                                                or view full details in the system
                                                                            </p>
                                                                            <p style="margin: 10px 0 0 0; text-align: center;">
                                                                                <a href="${detailUrl}" 
                                                                                style="color: #2563eb; text-decoration: none; font-size: 14px;">
                                                                                    View Invoice Details →
                                                                                </a>
                                                                            </p>
                                                                        </td>
                                                                    </tr>
                                                                    
                                                                    <!-- Footer -->
                                                                    <tr>
                                                                        <td style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
                                                                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                                                                                This is an automated message from the Invoice Management System. Please do not reply to this email.
                                                                            </p>
                                                                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                                                                © 2025 Shippeasy. All rights reserved.
                                                                            </p>
                                                                        </td>
                                                                    </tr>
                                                                    
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </body>
                                            </html>
                                        `
                                        let subject = `Action Required: Invoice Approval - ${savedDocument?.invoiceNo}`;
                                        const senderText = getSenderName(agent);

                                        const mailOptions = {
                                            from: senderText,
                                            to: user.userEmail,
                                            subject: subject,
                                            text: '',
                                            html: emailHtml
                                        };

                                        transporterAgent?.sendMail(mailOptions, (error, info) => {
                                            if (error) {
                                                console.log("error in sending email")
                                                // console.log(JSON.stringify({
                                                //     traceId : req.traceId,
                                                //     message : `Email not sent to ${to.map((e) => e.email)}, cc : ${cc.map((c) => c.email)} with email parameter ${JSON.stringify(params)} with templateId : ${templateId} for triggerId : ${triggerId}, Error : ${error}`
                                                // }))
                                                return error
                                            }

                                            console.log("email sent!!!!")
                            
                                            // console.log(JSON.stringify({
                                            //     traceId : req.traceId,
                                            //     message : `Emails sent to ${to.map((e) => e.email)}, cc : ${cc.map((c) => c.email)} with email parameter ${JSON.stringify(params)} with templateId : ${templateId} for triggerId : ${triggerId}`
                                            // }))
                                            return `Message sent: ${info.messageId}`
                                        });  
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        console.error("error in invoice saving : ", error);
                    }

                    // insertIntoTally(req, savedDocument);
                } else if (indexName === "consolidationbooking") {
                    let batchWiseGrouping = {}
                    const containerModel = mongoose.models[`containerModel`] || mongoose.model(`containerModel`, Schema["container"], `containers`);
                    for (let i = 0; i < savedDocument.items.length; i++){
                        const item = savedDocument.items[i];

                        if (!(batchWiseGrouping.hasOwnProperty(item.batchId)))
                            batchWiseGrouping[item.batchId] = { batchNo : item.batchNo, "containers" : []}
                            
                        if (!batchWiseGrouping[item.batchId].containers.includes(item.assignContainer.containermasterId))
                            batchWiseGrouping[item.batchId].containers.push(item.assignContainer.containermasterId)
                    }

                    const newDataToReturn = []
                    for (const id in batchWiseGrouping) {
                        if (batchWiseGrouping.hasOwnProperty(id)) {
                            const batchId = id;
                            
                            for (let c = 0; c < batchWiseGrouping[id].containers.length; c++){
                                const containerData = savedDocument.containerList.find(e => e.containermasterId === batchWiseGrouping[id].containers[c])
                                
                                let containerDataToAdd = {}

                                containerDataToAdd.batchId = batchId
                                containerDataToAdd.batchNo = batchWiseGrouping[id].batchNo
                                containerDataToAdd.containerId = uuid.v1();
                                containerDataToAdd.createdOn = new Date().toISOString();
                                containerDataToAdd.updatedOn = new Date().toISOString();

                                const dataModel = containerModel(containerDataToAdd)
                                await dataModel.save().then((savedDocument) => {
                                })
                            }

                            newDataToReturn.push({
                                batchId : batchId,
                                batchNo : batchWiseGrouping[id].batchNo,
                                items : savedDocument.items.filter(e => e.batchId === batchId)
                            })
                        }
                    }
                } else if (indexName === "transportinquiry") {
                    const userModel = mongoose.models[`userModel`] || mongoose.model(`userModel`, Schema['user'], `users`);
                
                    const userData = await userModel.findOne({
                        driverId : savedDocument.shippinglineId
                    })

                    if(userData) {
                        let notificationData = {};

                        notificationData.createdOn = new Date().toISOString();
                        notificationData.email = userData.userEmail
                        notificationData.inappnotificationId = uuid.v1();
                        
                        notificationData.notificationName = `Inquiry bidding ${savedDocument?.adminStatus}` || "";
                        notificationData.description = `Your bidding request no. ${savedDocument?.transportinquiryNo} of inquiry no. ${savedDocument?.enquiryNo} has been ${savedDocument?.adminStatus}` || "";

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
                } else if (indexName === "schedulereport") {
                    if(savedDocument.type === "oneTime") {
                        await this.sendSchedulMail(savedDocument, req?.traceId)
                    }
                } else if (indexName === "igmcfs") {
                    if(savedDocument?.blId) {
                        const blModel = mongoose.models[`blModel`] || mongoose.model(`blModel`, Schema['bl'], `bls`);

                        await blModel.findOneAndUpdate(
                            {
                                blId : savedDocument?.blId
                            },
                            {
                                $set : {
                                    igmcfsId : savedDocument.igmcfsId,
                                    isMovement : true
                                }
                            }
                        )
                    }
                } else if (indexName === "invoiceaction") {
                    try {
                        const invoiceapprovalModel = mongoose.models[`invoiceapprovalModel`] || mongoose.model(`invoiceapprovalModel`, Schema['invoiceapproval'], `invoiceapprovals`);
                        const invoiceModel = mongoose.models[`invoiceModel`] || mongoose.model(`invoiceModel`, Schema['invoice'], `invoices`);
                        const invoiceactionModel = mongoose.models[`invoiceactionModel`] || mongoose.model(`invoiceactionModel`, Schema['invoiceaction'], `invoiceactions`);
                        const userModel = mongoose.models[`userModel`] || mongoose.model(`userModel`, Schema['user'], `users`);
                        let orgInvoiceSetting = await invoiceapprovalModel.findOne({orgId: agent?.agentId})

                        let invoiceData = await invoiceModel.findOne({invoiceId: savedDocument?.invoiceId});
                        if(invoiceData)
                            invoiceData = invoiceData?.toObject();
                        
                        if(orgInvoiceSetting){
                            orgInvoiceSetting = orgInvoiceSetting?.toObject();

                            const currentDept =  orgInvoiceSetting?.departmentSettings?.find(e => e?.departmentId === savedDocument?.departmentId);
                            const currentUser = currentDept?.tiers?.flatMap(tier => tier.selectedUsers.map(user => user.userId));
                            let currentInvoiceAction = await invoiceactionModel.find({invoiceId: savedDocument?.invoiceId, departmentId: savedDocument?.departmentId})
                            currentInvoiceAction = currentInvoiceAction?.map(e => e?.toObject())
                            
                            if(currentUser.every(id => currentInvoiceAction.map(e => e?.createdByUID).includes(id))){

                                const firstDepartment = getNextDepartmentWithUsers(orgInvoiceSetting?.departmentSettings, savedDocument?.departmentId)
                                if(firstDepartment){
                                    const users = firstDepartment?.tiers?.flatMap(tier => tier.selectedUsers.map(user => user.userId))
                                    if(users?.length > 0) {
                                        let usersList = await userModel.find({userId: {$in: users}});
                                        if(usersList)
                                            usersList = usersList?.map(e => e?.toObject());
                                        
                                        const approvUrl = `${process.env.FRONTEND_URL}/batch/list/add/${invoiceData?.batchId}/invoice/approve/${invoiceData?.invoiceId}`
                                        const rejectUrl = `${process.env.FRONTEND_URL}/batch/list/add/${invoiceData?.batchId}/invoice/reject/${invoiceData?.invoiceId}`
                                        const detailUrl = `${process.env.FRONTEND_URL}/batch/list/add/${invoiceData?.batchId}/invoice/${invoiceData?.invoiceId}/show`

                                        const transporterAgent = await getTransporter({orgId : agent?.agentId});
                                        
                                        for(let i = 0; i < users?.length; i++) {
                                            let user = usersList.find(u => u.userId === users[i]);

                                            if(user){
                                                let emailHtml = `
                                                    <!DOCTYPE html>
                                                        <html lang="en">
                                                        <head>
                                                            <meta charset="UTF-8">
                                                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                                            <title>Invoice Approval Required</title>
                                                        </head>
                                                        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                                                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                                                                <tr>
                                                                    <td align="center">
                                                                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                                                            
                                                                            <!-- Header -->
                                                                            <tr>
                                                                                <td style="background-color: #2563eb; padding: 30px; text-align: center;">
                                                                                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Invoice Approval Required</h1>
                                                                                </td>
                                                                            </tr>
                                                                            
                                                                            <!-- Body Content -->
                                                                            <tr>
                                                                                <td style="padding: 40px 30px;">
                                                                                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                                                                                        Hello <strong>${user?.name}</strong>,
                                                                                    </p>
                                                                                    
                                                                                    <p style="margin: 0 0 25px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                                                                                        A new invoice requires your approval. Please review the details below and take action:
                                                                                    </p>
                                                                                    
                                                                                    <!-- Invoice Details Box -->
                                                                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 30px;">
                                                                                        <tr>
                                                                                            <td style="padding: 20px;">
                                                                                                <table width="100%" cellpadding="0" cellspacing="0">
                                                                                                    <tr>
                                                                                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Invoice Number:</td>
                                                                                                        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${invoiceData?.invoiceNo}</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Vendor:</td>
                                                                                                        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${invoiceData?.invoiceToName}</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount:</td>
                                                                                                        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${invoiceData?.invoiceAmount} ${invoiceData?.currency}</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date:</td>
                                                                                                        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${new Date(invoiceData?.invoice_date).toLocaleDateString("en-US")}</td>
                                                                                                    </tr>
                                                                                                </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </table>
                                                                                    
                                                                                    <!-- Action Buttons -->
                                                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                                                        <tr>
                                                                                            <td align="center" style="padding: 20px 0;">
                                                                                                <table cellpadding="0" cellspacing="0">
                                                                                                    <tr>
                                                                                                        <!-- Approve Button -->
                                                                                                        <td style="padding-right: 10px;">
                                                                                                            <a href="${approvUrl}" 
                                                                                                            style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                                                                                                                ✓ Approve
                                                                                                            </a>
                                                                                                        </td>
                                                                                                        
                                                                                                        <!-- Reject Button -->
                                                                                                        <td style="padding-left: 10px;">
                                                                                                            <a href="${rejectUrl}" 
                                                                                                            style="display: inline-block; padding: 14px 32px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);">
                                                                                                                ✕ Reject
                                                                                                            </a>
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </table>
                                                                                    
                                                                                    <p style="margin: 25px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5; text-align: center;">
                                                                                        or view full details in the system
                                                                                    </p>
                                                                                    <p style="margin: 10px 0 0 0; text-align: center;">
                                                                                        <a href="${detailUrl}" 
                                                                                        style="color: #2563eb; text-decoration: none; font-size: 14px;">
                                                                                            View Invoice Details →
                                                                                        </a>
                                                                                    </p>
                                                                                </td>
                                                                            </tr>
                                                                            
                                                                            <!-- Footer -->
                                                                            <tr>
                                                                                <td style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
                                                                                    <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                                                                                        This is an automated message from the Invoice Management System. Please do not reply to this email.
                                                                                    </p>
                                                                                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                                                                        © 2025 Shippeasy. All rights reserved.
                                                                                    </p>
                                                                                </td>
                                                                            </tr>
                                                                            
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </body>
                                                    </html>
                                                `
                                                let subject = `Action Required: Invoice Approval - ${invoiceData?.invoiceNo}`;
                                                const senderText = getSenderName(agent);

                                                const mailOptions = {
                                                    from: senderText,
                                                    to: user.userEmail,
                                                    subject: subject,
                                                    text: '',
                                                    html: emailHtml
                                                };

                                                transporterAgent?.sendMail(mailOptions, (error, info) => {
                                                    if (error) {
                                                        console.log("error in sending email")
                                                        // console.log(JSON.stringify({
                                                        //     traceId : req.traceId,
                                                        //     message : `Email not sent to ${to.map((e) => e.email)}, cc : ${cc.map((c) => c.email)} with email parameter ${JSON.stringify(params)} with templateId : ${templateId} for triggerId : ${triggerId}, Error : ${error}`
                                                        // }))
                                                        return error
                                                    }

                                                    console.log("email sent!!!!")
                                    
                                                    // console.log(JSON.stringify({
                                                    //     traceId : req.traceId,
                                                    //     message : `Emails sent to ${to.map((e) => e.email)}, cc : ${cc.map((c) => c.email)} with email parameter ${JSON.stringify(params)} with templateId : ${templateId} for triggerId : ${triggerId}`
                                                    // }))
                                                    return `Message sent: ${info.messageId}`
                                                });  
                                            }
                                        }
                                    }
                                } else {
                                    // there is no department is rest
                                    let allInvoiceUser = await invoiceactionModel.find({invoiceId: savedDocument?.invoiceId})
                                    if(allInvoiceUser)
                                        allInvoiceUser = allInvoiceUser?.map(e => e?.toObject() || e);

                                    if(allInvoiceUser.every(e => e?.action === "approve")) {
                                        // invoice approved by all dept all user

                                        await invoiceModel.findOneAndUpdate(
                                            {
                                                invoiceId: savedDocument?.invoiceId
                                            }, 
                                            {
                                                $set: {
                                                    invoiceApprovalStatus : "approved"
                                                }
                                            }
                                        )
                                        console.log(`invoice approved : ${savedDocument?.invoiceId}`);
                                    } else {
                                        await invoiceModel.findOneAndUpdate(
                                            {
                                                invoiceId: savedDocument?.invoiceId
                                            }, 
                                            {
                                                $set: {
                                                    invoiceApprovalStatus : "rejected"
                                                }
                                            }
                                        )
                                        console.log(`invoice rejected : ${savedDocument?.invoiceId}`);
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        console.error("error in invoice action : ", error);
                    }
                }

                if (indexName === "batch") {
                    const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema[indexName], `events`);

                    let nextEvent = await eventModel.findOne({
                        locationTag : { $ne : "" },
                        "location.locationId" : { $ne : "" },
                        "location.locationName" : { $ne : "" },
                        entityId : savedDocument.batchId
                    }, null, { sort: { updatedOn: 1 } })

                    nextEvent = nextEvent?.toObject();
                
                    if (nextEvent && nextEvent.entityId && nextEvent.eventName) {
                        const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
                    
                        const savedNewBatch = await batchModel.findOneAndUpdate({
                            batchId : nextEvent.entityId
                        }, {
                            statusOfBatch : `${nextEvent.eventName} Pending`
                        })

                        if (savedNewBatch) 
                            savedDocument = savedNewBatch
                    }
                } 

                // this is for milestone automation
                if(indexName === "deliveryorder") {
                    const numOfDeliveryorder = await Model.countDocuments({
                        batchId : savedDocument?.batchId
                    })
        
                    if(numOfDeliveryorder === 1) {
                        const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
                        
                        const options = {
                            returnDocument: 'after',
                            projection: { _id: 0, __v: 0 },
                        };

                        let updatedStuffingEvent = await eventModel.findOneAndUpdate({
                            eventName : "DO",
                            entityId : savedDocument?.batchId
                        }, {
                            "eventData.eventState" : "ActualDate",
                            "eventData.bookingDate" : new Date().toISOString(),
                            "isUpdated" : true,
                            updatedBy : `${user.name} ${user.userLastname}`,
                            referenceUpdatedFrom : "By Adding House DO",
                            updatedOn : new Date().toISOString(),
                        }, options);
            
                        if(updatedStuffingEvent){
                            updatedStuffingEvent = updatedStuffingEvent?.toObject()
                            triggerPointExecute(req, updatedStuffingEvent, "event")
            
                            const nextEvent = await eventModel.findOne({
                                locationTag : { $ne : "" },
                                "location.locationId" : { $ne : "" },
                                "location.locationName" : { $ne : "" },
                                entityId : updatedStuffingEvent.entityId, 
                                eventSeq : { $gt : updatedStuffingEvent.eventSeq }
                            })

                            const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
                            let batchData = await batchModel.findOne({batchId : updatedStuffingEvent.entityId})

                            batchData = batchData?.toObject() || batchData;

                            let currentBatchEventMilestone = await eventModel.findOne({
                                eventName : batchData?.statusOfBatch?.replace(" Pending", ""),
                                entityId : batchData.batchId
                            })

                            if(currentBatchEventMilestone)
                                currentBatchEventMilestone = currentBatchEventMilestone?.toObject();
                        
                            if (currentBatchEventMilestone?.eventSeq <= nextEvent?.eventSeq && nextEvent && nextEvent.entityId && nextEvent.eventName) {
                                const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
                            
                                await batchModel.findOneAndUpdate({
                                    batchId : nextEvent.entityId
                                }, {
                                    statusOfBatch : `${nextEvent.eventName} Pending`
                                })
                            }
                        }
                    }

                    // deliveryDate logic for auto update in container on DO creation
                    const containersIds = savedDocument?.containers?.map(e => e?.containerId)?.filter(Boolean);
                    if(containersIds && containersIds?.length > 0) {
                        const containerModel = mongoose.models[`containerModel`] || mongoose.model(`containerModel`, Schema['container'], `containers`);
                        
                        await containerModel.updateMany(
                            {
                                containerId : {$in : containersIds},
                                batchId: savedDocument?.batchId
                            }, 
                            {
                                deliveryDate : savedDocument?.deliveryDate,
                                updatedBy: `deliveryDate changes from DO creation (DO : ${savedDocument?.deliveryOrderNo})`
                            }
                        )
                    }
                }

                // this is for container empty return valid till date auto filling
                if(indexName === "deliveryorder") {
                    const containerModel = mongoose.models[`containerModel`] || mongoose.model(`containerModel`, Schema['container'], `containers`);

                    for(let i = 0; i < savedDocument?.containers?.length; i++) {
                        const container = savedDocument.containers[i];

                        if(container?.containerId && container.containerId != ""){
                            await containerModel.findOneAndUpdate(
                                {
                                    containerId : container.containerId,
                                    mtyValidity : ""
                                }, 
                                {
                                    mtyValidity : container.validTill
                                }
                            )
                        }
                    }
                }

                res.status(200).send(savedDocument)
            }).catch(async function (err) {
                const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
                await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, restoreCondition);

                if (indexName == "batch") {
                    const BranchModel = mongoose.models[`BranchModel`] || mongoose.model(`BranchModel`, Schema["branch"], `branchs`);
                    await BranchModel.findOneAndUpdate({ "branchId": data.branchId }, { $inc: data?.isExport ? { exportBatchCounter: -1 } : { batchCounter: -1 } });
                } else if (indexName == "quotation") {
                    const EnquiryModel = mongoose.models[`EnquiryModel`] || mongoose.model(`EnquiryModel`, Schema["enquiry"], `enquirys`);
                    await EnquiryModel.findOneAndUpdate({ "enquiryId": data.enquiryId }, { $inc: { quotationCounter: -1 } });
                } else if (indexName == "invoice") {
                    const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
                    const batchData = await batchModel.findOne({batchId : data.batchId})
        
                    const BranchModel = mongoose.models[`BranchModel`] || mongoose.model(`BranchModel`, Schema["branch"], `branchs`);
                    if(batchData?.enquiryDetails?.basicDetails?.userBranch){
                        await BranchModel.findOneAndUpdate({ "branchId": batchData?.enquiryDetails?.basicDetails?.userBranch }, { $inc: { invoiceCounter: -1 } })
                    }
                }

                console.error(JSON.stringify({
                    traceId : req?.traceId,
                    error: err,
                    stack : err?.stack
                }))
                res.status(500).json({ error: err });
            });
    } catch (err) {
        console.error(JSON.stringify({
            traceId : req?.traceId,
            error: err,
            stack : err?.stack
        }))
        res.status(500).send({error : err?.message})
    }
}
exports.insertBatch = async (req, res, next) => {
    const indexName = `${req.params.indexName}`
    let data = req.body;
    const user = res.locals.user

    let referenceId = uuid.v1();

    const options = {
        returnDocument: 'after',
        projection: { _id: 0, __v: 0 },
    };
    const conditionCounter = {}
    if (indexName === "deliveryorder")
        conditionCounter[`deliveryOrderCounter`] = data.length;
    else
        conditionCounter[`${indexName}Counter`] = data.length;

    let counterData = {}

    const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
    await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: conditionCounter }, options).then(async function (foundDocument) {
        counterData = foundDocument || {};
    });

    for (let i = 0; i < data.length; i++) {
        data[i].referenceId = referenceId
        data[i].createdOn = new Date().toISOString();

        data[i][`${indexName}Id`] = uuid.v1();
        data[i].createdOn = new Date().toISOString();
        data[i].updatedOn = new Date().toISOString();

        if (indexName === "enquiry") {
            const enquiryCounter = counterData.enquiryCounter - data.length + i
            data[i].enquiryNo = `INQ-${enquiryCounter.toString().padStart(6, '0')}`
        } else if (indexName === "transportinquiry") {
            const transportinquiryCounter = counterData.transportinquiryCounter - data.length + i
            data[i].transportinquiryNo = `T-INQ-${transportinquiryCounter.toString().padStart(6, '0')}`
        } else if (indexName === "agentadvice") {
            const agentadviceCounter = counterData.agentadviceCounter - data.length + i
            data[i].agentadviceNo = `INQ-I-${agentadviceCounter.toString().padStart(4, '0')}`
        } else if (indexName === "batch") {
            let batchCounter = 0;
            const options = {
                upsert: true, new: true,
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };
            const BranchModel = mongoose.models[`BranchModel`] || mongoose.model(`BranchModel`, Schema["branch"], `branchs`);
            await BranchModel.findOneAndUpdate({ "branchId": data[i].branchId }, { $inc: { batchCounter: 1 } }, options).then(async function (foundDocument) {
                batchCounter = foundDocument.toObject().batchCounter || 0;
            });

            const currentYear = new Date().getFullYear() % 100;

            if(data[i].jobCode)
                data[i].batchNo = `${data[i].jobCode}-${batchCounter.toString()}`
            else
                data[i].batchNo = `${batchCounter.toString()}`
        } else if (indexName === "shippingbill") {
            const shippingbillCounter = counterData.shippingbillCounter - data.length + i
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
            data[i].shippingbillNo = `SHB-${currentYear}-${currentMonth}-${shippingbillCounter.toString().padStart(4, '0')}`
        }  else if (indexName === "entrybill") {
            const entrybillCounter = counterData.entrybillCounter - data.length + i
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
            data[i].entrybillNo = `EB-${currentYear}-${currentMonth}-${entrybillCounter.toString().padStart(4, '0')}`
        } else if (indexName === "invoice") {
            const invoiceCounter = counterData.invoiceCounter - data.length + i
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');

            if(["Credit Note", "Debit Note"].includes(data[i]?.type))
                data[i].invoiceNo = `${data[i]?.category === "buyerInvoice" ? "PUR" : "SAL"}-${currentYear}${currentMonth}${invoiceCounter.toString().padStart(6, '0')}`
            else
                data[i].invoiceNo = `${data[i]?.type === "buyerInvoice" ? "PUR" : "SAL"}-${currentYear}${currentMonth}${invoiceCounter.toString().padStart(6, '0')}`
        } else if (indexName === "deliveryorder") {
            const deliveryOrderCounter = counterData.deliveryOrderCounter || 0;
            data[i].deliveryOrderNo = `DO${deliveryOrderCounter.toString().padStart(4, '0')}`
        } else if (indexName === "creditdebitnote") {
            const creditNoteCounter = counterData.creditNoteCounter || 0;
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
            data[i].creditNoteNo = `${currentYear}${currentMonth}${creditNoteCounter.toString().padStart(6, '0')}`
        } else if (indexName === "quotation") {
            let quotationNo = 0;
            const options = {
                upsert: true, new: true,
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };
            const EnquiryModel = mongoose.models[`EnquiryModel`] || mongoose.model(`EnquiryModel`, Schema["enquiry"], `enquirys`);
            await EnquiryModel.findOneAndUpdate({ "enquiryId": data[i].enquiryId }, { $inc: { quotationCounter: 1 } }, options).then(async function (foundDocument) {
                quotationNo = foundDocument.toObject().quotationCounter || 0;
            });

            data[i].quotationNo = `QUOT${quotationNo.toString().padStart(6, '0')}`
        } else if (indexName === "consolidationbooking") {
            const consolidationbookingCounter = counterData.consolidationbookingCounter - data.length + i
            const currentYear = new Date().getFullYear() % 100;
            data[i].consolidationbookingNo = `COB-${currentYear}${consolidationbookingCounter.toString().padStart(4, '0')}`
        } else if (indexName === "warehouse") {
            const warehouseCounter = counterData.warehouseCounter - data.length + i
            const currentYear = new Date().getFullYear() % 100;
            data[i].warehouseCode = `WH-${currentYear}${warehouseCounter.toString().padStart(6, '0')}`
        } else if (indexName === "grn") {
            const grnCounter = counterData.grnCounter - data.length + i
            const currentYear = new Date().getFullYear() % 100;
            data[i].grnNo = `GRN-${currentYear}${grnCounter.toString().padStart(6, '0')}`
            if (data[i].items && Array.isArray(data[i].items)) {
                data[i].items.forEach((item, index) => {
                    const itemCounter = grnCounter + index + 1; // Unique per package
                    item.ref = `PKG-${currentYear}${itemCounter.toString().padStart(6, '0')}`;
                });
            }
        } else if (indexName === "payment") {
            const paymentCounter = counterData.paymentCounter - data.length + i
            const currentYear = new Date().getFullYear() % 100;
            data[i].paymentNo = `PAY-${currentYear}${paymentCounter.toString().padStart(6, '0')}`
        }

        if (user) {
            data[i].tenantId = user.tenantId
            data[i].createdBy = `${user.name} ${user.userLastname}`
            data[i].createdByUID = user.userId

            if (!(user?.userType === "superAdmin"))
                data[i].orgId = user.orgId

            data[i].updatedBy = `${user.name} ${user.userLastname}`
            data[i].updatedByUID = user.userId
        } else {
            data.tenantId = '1'
        }
    }

    try {
        const containerMasterModel = mongoose.models.containerMasterModel || mongoose.model('containerMasterModel', Schema['containermaster'], 'containermasters');
        const Model = mongoose.models[`${indexName}Model`] || mongoose.model(`${indexName}Model`, Schema[indexName], `${indexName}s`);
        const insertedItems = await Model.insertMany(data);

        const AuditLogModel = mongoose.models[`AuditLogModel`] || mongoose.model(`AuditLogModel`, Schema['auditlog'], `auditlogmodels`);
        for (let i = 0; i < insertedItems.length; i++) {
            triggerPointExecute(req, insertedItems[i], indexName)

            if (indexName === "container" && insertedItems[i]?.mastercontainerId) {
                const containerMasterData = await containerMasterModel.findOne({containermasterId :  insertedItems[i]?.mastercontainerId})

                if(containerMasterData?.containerNo){
                    // const tId = await createTransportOceanIO(containerMasterData?.containerNo, insertedItems[i]?.shippingLineId)
                    // if(tId != 0){
                    //     let condTemp = {}

                    //     condTemp["containerId"] = insertedItems[i]["containerId"]
                    //     await Model.findOneAndUpdate(condTemp, {$set : {transportId : tId}})
                    // }
                }
            } else if (indexName === "transportinquiry") {
                const userModel = mongoose.models[`userModel`] || mongoose.model(`userModel`, Schema['user'], `users`);
            
                const userData = await userModel.findOne({
                    driverId : insertedItems[i].shippinglineId
                })

                if(userData) {
                    let notificationData = {};

                    notificationData.createdOn = new Date().toISOString();
                    notificationData.email = userData.userEmail
                    notificationData.inappnotificationId = uuid.v1();
                    
                    notificationData.notificationName = `Inquiry bidding ${insertedItems[i]?.adminStatus}` || "";
                    notificationData.description = `Your bidding request no. ${insertedItems[i]?.transportinquiryNo} of inquiry no. ${insertedItems[i]?.enquiryNo} has been ${insertedItems[i]?.adminStatus}` || "";

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

        if(indexName === "container") {
            const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
            let batchData = await batchModel.findOne({batchId : data[0]?.batchId})

            batchData = batchData?.toObject() || batchData;

            if (batchData){
                const numOfContainersBatch = batchData.enquiryDetails.containersDetails.map(e => e.noOfContainer).reduce((prevValue, currentValue) => prevValue + currentValue)
                const numOfContainersAdded = await Model.countDocuments({$or : [{batchId : data[0]?.batchId}, {"batchwiseGrouping.batchId" : data[0]?.batchId}]})
                if (numOfContainersAdded >= numOfContainersBatch){
                    const options = {
                        returnDocument: 'after',
                        projection: { _id: 0, __v: 0 },
                    };
                    const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
                    let updatedStuffingEvent = await eventModel.findOneAndUpdate({
                        eventName : "Stuffing",
                        entityId : data[0]?.batchId
                    }, {
                        "eventData.eventState" : "ActualDate",
                        "eventData.bookingDate" : new Date().toISOString(),
                        "isUpdated" : true,
                        updatedBy : `${user.name} ${user.userLastname}`,
                        referenceUpdatedFrom : "By Adding Container",
                        updatedOn : new Date().toISOString(),
                    }, options);
        
                    if(updatedStuffingEvent){
                        updatedStuffingEvent = updatedStuffingEvent?.toObject()
                        triggerPointExecute(req, updatedStuffingEvent, "event")
                    }
        
                    if (updatedStuffingEvent?.eventData?.bookingDate  && updatedStuffingEvent?.eventData?.eventState === "ActualDate"){
                        const nextEvent = await eventModel.findOne({
                            locationTag : { $ne : "" },
                            "location.locationId" : { $ne : "" },
                            "location.locationName" : { $ne : "" },
                            entityId : updatedStuffingEvent.entityId, 
                            eventSeq : { $gt : updatedStuffingEvent.eventSeq }
                        })

                        let currentBatchEventMilestone = await eventModel.findOne({
                            eventName : batchData?.statusOfBatch?.replace(" Pending", ""),
                            entityId : batchData.batchId
                        })
                        if(currentBatchEventMilestone)
                            currentBatchEventMilestone = currentBatchEventMilestone?.toObject();
                    
                        if (currentBatchEventMilestone?.eventSeq <= nextEvent?.eventSeq && nextEvent && nextEvent.entityId && nextEvent.eventName) {
                            const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
                        
                            await batchModel.findOneAndUpdate({
                                batchId : nextEvent.entityId
                            }, {
                                statusOfBatch : `${nextEvent.eventName} Pending`
                            })
                        }
        
                        if(updatedStuffingEvent.eventName === "Stuffing"){
                            const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
                        
                            let batchData = await batchModel.findOne({batchId : nextEvent.entityId});
                            if(batchData){
                                batchData = batchData?.toObject();
        
                                if(batchData?.routeDetails?.etd)
                                    await eventModel.updateMany(
                                        { entityId : batchData.batchId, eventSeq : {$gt : updatedStuffingEvent?.eventSeq}, referenceType : "Port of Loading"},
                                        { 
                                            $set : {
                                                isUpdated : true,
                                                "eventData.eventState" : "EstimatedDate",
                                                "eventData.bookingDateEst" : batchData?.routeDetails?.etd
                                            }
                                        }
                                    )
                                    
                                if(batchData?.routeDetails?.eta)
                                    await eventModel.updateMany(
                                        { entityId : batchData.batchId, eventSeq : {$gt : updatedStuffingEvent?.eventSeq}, referenceType : "Port of Discharge"},
                                        { 
                                            $set : {
                                                isUpdated : true,
                                                "eventData.eventState" : "EstimatedDate",
                                                "eventData.bookingDateEst" : batchData?.routeDetails?.eta
                                            }
                                        }
                                    )
        
                                if(batchData?.routeDetails?.transhipment){
                                    if(batchData?.routeDetails?.transhipmentETD)
                                        await eventModel.updateMany(
                                            { entityId : batchData.batchId, eventName : RegExp("ETD"), eventSeq : {$gt : updatedStuffingEvent?.eventSeq}, referenceType : "Port of Transhipment", },
                                            { 
                                                $set : {
                                                    isUpdated : true,
                                                    "eventData.eventState" : "EstimatedDate",
                                                    "eventData.bookingDateEst" : batchData?.routeDetails?.transhipmentETD
                                                }
                                            }
                                        )
                                    if(batchData?.routeDetails?.transhipmentETA)
                                        await eventModel.updateMany(
                                            { entityId : batchData.batchId, eventName : RegExp("ETA"), eventSeq : {$gt : updatedStuffingEvent?.eventSeq}, referenceType : "Port of Transhipment", },
                                            { 
                                                $set : {
                                                    isUpdated : true,
                                                    "eventData.eventState" : "EstimatedDate",
                                                    "eventData.bookingDateEst" : batchData?.routeDetails?.transhipmentETA
                                                }
                                            }
                                        )
                                }
        
        
                                let nextEventForEstimate = await eventModel.findOne({
                                    locationTag : { $ne : "" },
                                    "location.locationId" : { $ne : "" },
                                    "location.locationName" : { $ne : "" },
                                    entityId : updatedStuffingEvent.entityId, 
                                    eventSeq : { $gt : updatedStuffingEvent.eventSeq }
                                })
        
                                if(nextEventForEstimate){
                                    nextEventForEstimate = nextEventForEstimate?.toObject();
                                
                                    await batchModel.findOneAndUpdate(
                                        {
                                            batchId : updatedStuffingEvent?.entityId
                                        },
                                        {
                                            $set : {
                                                milestoneEstiDate : nextEventForEstimate?.eventData?.bookingDateEst
                                            }
                                        }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        if(indexName === "enquiryitem") {
            const numOfCharges = await Model.countDocuments({
                batchId : data[0]?.batchId
            })

            if(numOfCharges === insertedItems.length) {
                const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
                        
                if(insertedItems.some(e => e.costItemName.toLowerCase().includes("freight"))) {
                    const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
                
                    let batchData = await batchModel.findOne({batchId : data[0]?.batchId})
                    if(batchData)
                        batchData = batchData?.toObject();

                    let currentBatchEventMilestone = await eventModel.findOne({
                        eventName : batchData?.statusOfBatch?.replace(" Pending", ""),
                        entityId : batchData.batchId
                    })
                    if(currentBatchEventMilestone)
                        currentBatchEventMilestone = currentBatchEventMilestone?.toObject();


                    let updatedStuffingEvent = await eventModel.findOneAndUpdate({
                        eventName : "Rate",
                        entityId : data[0]?.batchId
                    }, {
                        "eventData.eventState" : "ActualDate",
                        "eventData.bookingDate" : new Date().toISOString(),
                        "isUpdated" : true,
                        updatedBy : `${user.name} ${user.userLastname}`,
                        referenceUpdatedFrom : "By Adding Freight Charges in Charge Tab",
                        updatedOn : new Date().toISOString(),
                    }, options);
        
                    if(updatedStuffingEvent){
                        updatedStuffingEvent = updatedStuffingEvent?.toObject()
                        triggerPointExecute(req, updatedStuffingEvent, "event")

                        let nextEvent = await eventModel.findOne({
                            locationTag : { $ne : "" },
                            "location.locationId" : { $ne : "" },
                            "location.locationName" : { $ne : "" },
                            entityId : updatedStuffingEvent.entityId, 
                            eventSeq : { $gt : updatedStuffingEvent.eventSeq }
                        })
                    
                        if(nextEvent)
                            nextEvent = nextEvent?.toObject();

                        if (currentBatchEventMilestone?.eventSeq <= nextEvent?.eventSeq && nextEvent && nextEvent.entityId && nextEvent.eventName) {
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

        res.status(200).send(insertedItems)
    } catch (error) {
        res.status(500).json({ error: error.message });

        const restoreCondition = {}

        if (indexName == "deliveryorder")
            restoreCondition[`deliveryOrderCounter`] = data.length * -1;
        else if (indexName == "creditdebitnote")
            restoreCondition[`creditNoteCounter`] = data.length * -1;
        else
            restoreCondition[`${indexName}Counter`] = data.length * -1;

        const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
        await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: restoreCondition });

        if (indexName == "batch") {
            const BranchModel = mongoose.models[`BranchModel`] || mongoose.model(`BranchModel`, Schema["branch"], `branchs`);
            for (let i = 0; i < data.length; i++) {
                await BranchModel.findOneAndUpdate({ "branchId": data[i].branchId }, { $inc: { batchCounter: -1 } });
            }
        } else if (indexName == "quotation") {
            const EnquiryModel = mongoose.models[`EnquiryModel`] || mongoose.model(`EnquiryModel`, Schema["enquiry"], `enquirys`);
            for (let i = 0; i < data.length; i++) {
                await EnquiryModel.findOneAndUpdate({ "enquiryId": data[i].enquiryId }, { $inc: { quotationCounter: -1 } });
            }
        }
    }
}

function getNextDepartmentWithUsers(departmentSettings, currentDepartmentId) {
  // Find current department
  const currentDept = departmentSettings.find(
    d => d.departmentId === currentDepartmentId
  );
  if (!currentDept) return null;

  // Filter only departments that:
  // 1. have higher position
  // 2. have at least one selected user in any tier
  const validDepartments = departmentSettings.filter(d => {
    const hasUsers = d.tiers?.some(tier => tier.selectedUsers?.length > 0);
    return d.position > currentDept.position && hasUsers;
  });

  if (validDepartments.length === 0) return null;

  // Pick department with next minimum position
  const nextDept = validDepartments.reduce((min, d) =>
    d.position < min.position ? d : min
  );

  return nextDept;
}
