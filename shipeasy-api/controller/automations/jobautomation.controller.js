const { mongoose, Schema, invoiceSchema, uuid, jwt, crypto, axios, azureStorage, inAppNotificationService, querystring, nodemailer, pdfScanner, ediController, OpenAI, objecdiff, sendMessage, getTextMessageInput, fs, _, simpleParser, connect, imapConfig, transporter, getChangedFields, removeIdField, recordLogAudit, encryptObject, decryptObject, isSubset, createInAppNotification, replacePlaceholders, generateRandomPassword, triggerPointExecute, insertIntoTally, getTransporter, getChildCompany, getSenderName} = require('../../controller/helper.controller')

const stringSimilarity = require("string-similarity");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

let jobSchema = {
  "type": "object",
  "properties": {
    "containerDetails": {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "containerType": {
                    "type": "string",
                    "nullable": false
                },
                "quantity": {
                    "type": "number",
                    "nullable": false
                },
                "grossWeight": {
                    "type": "number",
                    "nullable": false
                },
                "grossWeightUnit": {
                    "type": "string",
                    "nullable": false
                }
            },
            "required": ["containerType", "quantity", "grossWeight", "grossWeightUnit"]
        }
    },

    "looseCargoDetails": {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "packageType": {
                    "type": "string",
                    "nullable": false
                },
                "noOfPackage": {
                    "type": "number",
                    "nullable": false
                },
                "lengthInCM": {
                    "type": "number",
                    "nullable": false
                },
                "widthInCM": {
                    "type": "number",
                    "nullable": false
                },
                "heigthInCM": {
                    "type": "number",
                    "nullable": false
                },
                "cbm": {
                    "type": "number",
                    "nullable": false
                },
                "totalWeightInKG": {
                    "type": "number",
                    "nullable": false
                }
            },
            "required": ["packageType", "noOfPackage", "lengthInCM", "widthInCM", "heigthInCM", "cbm", "totalWeightInKG"]
        }
    },

    "freightType": {
        "type": "string",
        "nullable": false
    },
    "loadType": {
        "type": "string",
        "nullable": false
    },
    "shipmentType": {
        "type": "string",
        "nullable": false
    },

    "portOfLoadingName": {
        "type": "string",
        "nullable": true
    },
    "portOfLoadingCountry": {
        "type": "string",
        "nullable": true
    },
    "portOfDischargeName": {
        "type": "string",
        "nullable": true
    },
    "portOfDischargeCountry": {
        "type": "string",
        "nullable": true
    },
    "shippingLine": {
        "type": "string",
        "nullable": true
    },
    "consigneeName": {
        "type": "string",
        "nullable": false
    }
  },
  "required": ["containerDetails", "looseCargoDetails", "freightType", "loadType", "shipmentType", "portOfLoadingName", "portOfLoadingCountry", "portOfDischargeName", "portOfDischargeCountry", "shippingLine", "consigneeName"]
}

let emailClassificationSchema = {
  "type": "object",
  "properties": {
    "emailCategory": {
      "type": "string",
      "enum": [
        "job_request",         // Request to create a new freight job
        "quotation_request",   // Asking for freight rates
        "quotation_response",  // Reply with quotation
        "booking_request",     // Space/slot/container booking request
        "booking_confirmation",// Booking confirmation / MBL / HBL issued
        "shipping_instruction",// SI submission
        "bill_of_lading",      // Draft/Final BL
        "arrival_notice",      // Arrival notice / IGM
        "invoice",             // Invoice / Debit note / Credit note
        "general_communication"// Other non-operational mails
      ],
      "nullable": false
    },

    "isJobRequest": {
      "type": "boolean",
      "description": "True if the email is intended to create a freight job"
    },
    "isEnquiryRequest": {
      "type": "boolean",
      "description": "True if the email is intended for quotation request a freight job"
    }
  },
  "required": ["emailCategory", "isJobRequest"]
}


let emailSchema = {
  "type": "object",
  "properties": {

    "subject": {
        "type": "string",
        "nullable": false
    },
    "emailBody": {
        "type": "string",
        "nullable": false
    }
  },
  "required": ["subject", "emailBody"]
}

async function extractData(modelName, jsonSchema, systemInstruction, files = [], emailSubject, emailBody , text) {
    const modelUsage = {};
  try {
    const modelConfig = {}

    if(jsonSchema)
        modelConfig["generationConfig"] = {
        responseMimeType: "application/json",
        responseSchema: jsonSchema
        }

    modelUsage["modelConfig"] = modelConfig

    if(systemInstruction)
        modelUsage["systemInstruction"] = systemInstruction
    
    modelUsage["modelName"] = modelName

    if(systemInstruction)
        modelConfig["systemInstruction"] = systemInstruction
    
    const model = genAI.getGenerativeModel({
      model: modelName,
      ...modelConfig
    });

    const processed_input = [];

    files.map(file => {
        processed_input.push({
            inlineData: {
                mimeType: file.mimetype,
                data: Buffer.from(file.buffer).toString('base64'),
            }
        })
    })
        
    result = await model.generateContent([
      ...processed_input,
      {
        text: `This is subject : ${emailSubject}`
      },
      {
        text: `This is email body : ${emailBody}`
      },
      {
        text: text
      },
    ]);

    modelUsage["modelInput"] = [
      ...processed_input,
      {
        text: `This is subject : ${emailSubject}`
      },
      {
        text: `This is email body : ${emailBody}`
      },
      {
        text: text
      },
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

async function generateEmailContent(input, emailSubject, emailBody) {
    const modelUsage = {};

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig:  {
        responseMimeType: "application/json",
        responseSchema: emailSchema
      },
      systemInstruction: "You are proffesional email reply generator for the email which we received from our customer regarding request of freight-job, The 'emailBody' must be properly formatted in HTML with <p> and <br/> tags for line breaks."
    });

    result = await model.generateContent([
      {
        text: `This is subject we received from our client : ${emailSubject}`
      },
      {
        text: `This is email body we received from our client : ${emailBody}`
      },
      {
        text: `Now write email for : ${input}`
      },
    ]);

    modelUsage["modelInput"] = [
      {
        text: `This is subject we received from our client : ${emailSubject}`
      },
      {
        text: `This is email body we received from our client : ${emailBody}`
      },
      {
        text: `Now write email for : ${input}`
      },
    ]

    const textResponse = result.response.text()

    const data = JSON.parse(textResponse)

    modelUsage["modelResponse"] = textResponse
    modelUsage["modelParsedResponse"] = data
    modelUsage["tokenUsage"] = result?.response?.usageMetadata

    return {
        usageMetadata: result?.response?.usageMetadata,
        jsonData: data,
        ...data,
        status: 200,
        modelUsage
    }
}

async function sendEmail(parsed, agent, to, subject, textContent){
    let transporterAgent = await getTransporter({orgId : agent.agentId});

    const mailOptions = {
        from: getSenderName(agent),
        to: to,
        cc: [],
        subject: subject,
        text: '',
        html: textContent,

        inReplyTo: parsed?.messageId,  
        references: [
            ...(parsed.references || []), 
            parsed.messageId
        ].join(" ")
    };

    transporterAgent?.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error)
        }
        console.log("Email sent!!!"); 
    });
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

async function findClosestParty(inputName, filter = {},  partymasterModel, threshold = 0.7) {
  if (!inputName) return null;

  const allParties = await partymasterModel.find(filter).lean();
  if (!allParties.length) return null;

  const names = allParties.map(p => p.name);
  const matches = stringSimilarity.findBestMatch(inputName, names);

  const best = matches.bestMatch;
  if (best.rating < threshold) return null; // no good match found

  return allParties.find(p => p.name === best.target) || null;
}

exports.scanEmailToCreateJob = async (emailBody = {}) => {
    const email = emailBody?.from?.value[0].address || "mayur.koladiya@synoris.co.in"
    const toEmail = email;

    const jobemailModel = mongoose.models[`jobemailModel`] || mongoose.model(`jobemailModel`, Schema["jobemail"], `jobemails`);
    const jobemail = await new jobemailModel({
        jobemailId: uuid.v4(),
        createdOn: new Date().toISOString(),
        updatedOn: new Date().toISOString(),
        createdBy: "SYSTEM-AI",
        updatedBy: "SYSTEM-AI",
        emailData: emailBody
    }).save();

    const files = emailBody?.attachments?.map(att => ({
        name: att.filename,
        mimeType: att.contentType,
        data: att.content.toString("base64")
    }));

    const subject = emailBody?.subject

    const content = emailBody?.text

    const modelUsage = [];
    let jobautomationObject = {
        jobautomationId: uuid.v4(),
        status: 500
    };

    const systemtypeModel = mongoose.models[`systemtypeModel`] || mongoose.model(`systemtypeModel`, Schema['systemtype'], `systemtypes`);
    const partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, Schema['partymaster'], `partymasters`);
    const branchModel = mongoose.models[`branchModel`] || mongoose.model(`branchModel`, Schema['branch'], `branchs`);
    const portModel = mongoose.models[`portModel`] || mongoose.model(`portModel`, Schema['port'], `ports`);
    const agentModel = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, Schema['agent'], `agents`);
    const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema['batch'], `batchs`);
    const agentadviceModel = mongoose.models[`agentadviceModel`] || mongoose.model(`agentadviceModel`, Schema['agentadvice'], `agentadvices`);
    const jobautomationModel = mongoose.models[`jobautomationModel`] || mongoose.model(`jobautomationModel`, Schema['jobautomation'], `jobautomations`);
        
    try {
        let partymaster = await partymasterModel.findOne({
            $or: [
                {
                    primaryMailId: email,
                },
                {
                    "branch.pic_email": {
                        $regex: new RegExp(`(^|,)\\s*${email}\\s*(,|$)`, "i"),
                    },
                },
            ],
        });

        if(partymaster){
            partymaster = partymaster?.toObject();

            let agent = await agentModel.findOne( 
                {
                    agentId : partymaster?.orgId
                }
            )
            if(agent)
                agent = agent?.toObject()

            let branch = await branchModel?.findOne(
                {
                    orgId: agent?.agentId
                }
            )
            if(branch)
                branch = branch?.toObject()

            if(partymaster?.status) {
                const emailClassification = await extractData(
                    agent?.geminiModel?.blScanning || "gemini-1.5-pro",
                    emailClassificationSchema,
                    "You are an email classifier for freight forwarding domain. Read the email subject, content and attachments. Classify the email into the correct category (job_request, quotation_request, invoice, arrival_notice, etc.). Also set isJobRequest = true only if this email is clearly requesting to create a freight job. Do not extract job details here.",
                    files,
                    subject,
                    content,
                    "Classify this email and return structured classification data as per schema"
                );

                modelUsage.push({...emailClassification?.modelUsage, usedFor: "emailClassification"})

                let emailClassificationData = emailClassification?.jsonData;
                if(emailClassificationData?.isJobRequest) {
                    // email is intendent to create job
                    let systemTypes = await systemtypeModel.find( 
                        {
                            "status": true,
                            "typeCategory": {
                                "$in": [
                                    "ShipmentTypeLand",
                                    "ExportShipmentTypeAir",
                                    "ExportShipmentType",
                                    "ImportShipmentTypeAir",
                                    "ImportShipmentType",
                                    "carrierType",
                                    "packageType",
                                    "ULDcontainerType",
                                    "tankStatus",
                                    "chargeBasis",
                                    "freightChargeTerm",
                                    "cargoType",
                                    "batchType",
                                    "contract",
                                    "customer",
                                    "imcoClass",
                                    "preCarriage",
                                    "onCarriage",
                                    "containerType",
                                    "containerSize",
                                    "enquiryType",
                                    "shippingTerm",
                                    "tankType",
                                    "shipmentTerm",
                                    "moveType",
                                    "incoTerm",
                                    "location",
                                    "icd",
                                    "packingGroup",
                                    "haulageType",
                                    "chargeTerm",
                                    "shipmentType",
                                    "processPoint",
                                    "dimensionUnit",
                                    "palletType",
                                    "status"
                                ]
                            }
                        }
                    )
                    if(systemTypes){
                        systemTypes = systemTypes?.map(e => e?.toObject())

                        const friegthType = systemTypes?.filter(e => e?.typeCategory === "carrierType")
                        const loadType = systemTypes?.filter(e => e?.typeCategory === "shipmentType")
                        const shipmentType = systemTypes?.filter(e => e?.typeCategory === "ImportShipmentType" || e?.typeCategory === "ExportShipmentType")
                        const containerType = systemTypes?.filter(e => e?.typeCategory === "containerType")
                        const packageType = systemTypes?.filter(e => e?.typeCategory === "packageType")

                        jobSchema.properties.freightType["enum"] = friegthType?.map(e => e?.typeName)
                        jobSchema.properties.loadType["enum"] = loadType?.map(e => e?.typeName)
                        jobSchema.properties.shipmentType["enum"] = shipmentType?.map(e => e?.typeName)
                        jobSchema.properties.containerDetails.items.properties.containerType["enum"] = [...containerType?.map(e => e?.typeName), "NOT_MENTIONED"]
                        jobSchema.properties.looseCargoDetails.items.properties.packageType["enum"] = packageType?.map(e => e?.typeName)

                        const fullData = await extractData(
                            agent?.geminiModel?.blScanning || "gemini-1.5-pro",
                            jobSchema,
                            "You are friegth-job creator which reads email and based on give data for friegth job, Load Type FCL Means Full Container Load, and LCL Means Less than Container Load",
                            files,
                            subject,
                            content,
                            "look this above email content and attachments and give me all data to create friegth job"
                        );

                        modelUsage.push({...fullData?.modelUsage, usedFor: "fullData"})

                        let batchData = fullData?.jsonData;
                        
                        let emailReply; 

                        if(batchData) {
                            if(!(batchData?.freightType)) {
                                emailReply = await generateEmailContent(
                                    `Freight Type Missing`,
                                    subject, 
                                    content
                                )

                                modelUsage.push({...emailReply?.modelUsage, usedFor: "freightTypeMissing"})

                                if(emailReply?.subject && emailReply?.emailBody)
                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                            } else if(!(batchData?.loadType)) {
                                emailReply = await generateEmailContent(
                                    `Load Type Missing`,
                                    subject, 
                                    content
                                )

                                modelUsage.push({...emailReply?.modelUsage, usedFor: "loadTypeMissing"})

                                if(emailReply?.subject && emailReply?.emailBody)
                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                            } else if(!(batchData?.shipmentType)) {
                                emailReply = await generateEmailContent(
                                    `Shipment Type Missing`,
                                    subject, 
                                    content
                                )

                                modelUsage.push({...emailReply?.modelUsage, usedFor: "shipmentTypeMissing"})

                                if(emailReply?.subject && emailReply?.emailBody)
                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                            } else if(!(batchData?.portOfLoadingName)) {
                                emailReply = await generateEmailContent(
                                    `Port Of Loading Missing`,
                                    subject, 
                                    content
                                )

                                modelUsage.push({...emailReply?.modelUsage, usedFor: "portOfLoadingMissing"})

                                if(emailReply?.subject && emailReply?.emailBody)
                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                            } else if(!(batchData?.portOfDischargeName)) {
                                emailReply = await generateEmailContent(
                                    `Port Of Discharge Missing`,
                                    subject, 
                                    content
                                )

                                modelUsage.push({...emailReply?.modelUsage, usedFor: "portOfDischargeMissing"})

                                if(emailReply?.subject && emailReply?.emailBody)
                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                            } else if(!(batchData?.consigneeName)) {
                                emailReply = await generateEmailContent(
                                    `Consignee Missing`,
                                    subject, 
                                    content
                                )

                                modelUsage.push({...emailReply?.modelUsage, usedFor: "consigneeMissing"})

                                if(emailReply?.subject && emailReply?.emailBody)
                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                            } else if(batchData?.containerDetails?.length === 0 && batchData?.loadType === "FCL") {
                                emailReply = await generateEmailContent(
                                    `Container Details Missing For FCL Load Type`,
                                    subject, 
                                    content
                                )

                                modelUsage.push({...emailReply?.modelUsage, usedFor: "containerDetailsMissing"})

                                if(emailReply?.subject && emailReply?.emailBody)
                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                            } else if(batchData?.looseCargoDetails?.length === 0 && batchData?.loadType === "LCL") {
                                emailReply = await generateEmailContent(
                                    `Loose Cargo Details Missing For LCL Load Type`,
                                    subject, 
                                    content
                                )

                                modelUsage.push({...emailReply?.modelUsage, usedFor: "looseCargoDetailsMissing"})

                                if(emailReply?.subject && emailReply?.emailBody)
                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                            }

                            if(!emailReply) {
                                const consignee = await findClosestParty(batchData?.consigneeName, {}, partymasterModel)

                                if(!(consignee?.partymasterId)) {
                                    emailReply = await generateEmailContent(
                                        `Consignee Mismatch, Not in added in shipeasy's addressbook`,
                                        subject, 
                                        content
                                    )

                                    modelUsage.push({...emailReply?.modelUsage, usedFor: "consigneeMismatch"})

                                    if(emailReply?.subject && emailReply?.emailBody)
                                        sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                                } else {
                                    const pol = await findClosestPort(batchData?.portOfLoadingName, {}, portModel)
                                    const pod = await findClosestPort(batchData?.portOfDischargeName, {}, portModel)
                                    const friegthTypeId = friegthType.find(e => e?.typeName === batchData?.freightType)?.systemtypeId
                                    const loadTypeId = loadType.find(e => e?.typeName === batchData?.loadType)?.systemtypeId
                                    const shipmentTypeId = shipmentType.find(e => e?.typeName === batchData?.shipmentType)?.systemtypeId
                                    
                                    // const containerTypeId = containerType.find(e => e?.typeName === batchData?.containerType)?.systemtypeId
                                    // const packageTypeId = packageType.find(e => e?.typeName === batchData?.packageType)?.systemtypeId

                                    if(!pol) {
                                        emailReply = await generateEmailContent(
                                            `Port of loading not matched`,
                                            subject, 
                                            content
                                        )

                                        modelUsage.push({...emailReply?.modelUsage, usedFor: "portOfLoadingNotMatched"})

                                        if(emailReply?.subject && emailReply?.emailBody)
                                            sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                                    } else if(!pod) {
                                        emailReply = await generateEmailContent(
                                            `Port of destination not matched`,
                                            subject, 
                                            content
                                        )

                                        modelUsage.push({...emailReply?.modelUsage, usedFor: "portOfDestinationNotMatched"})

                                        if(emailReply?.subject && emailReply?.emailBody)
                                            sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                                    } else if(!friegthTypeId) {
                                        emailReply = await generateEmailContent(
                                            `Freight Type not matched`,
                                            subject, 
                                            content
                                        )

                                        modelUsage.push({...emailReply?.modelUsage, usedFor: "freightTypeNotMatched"})

                                        if(emailReply?.subject && emailReply?.emailBody)
                                            sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                                    } else if(!loadTypeId) {
                                        emailReply = await generateEmailContent(
                                            `Load Type not matched`,
                                            subject, 
                                            content
                                        )

                                        modelUsage.push({...emailReply?.modelUsage, usedFor: "loadTypeNotMatched"})

                                        if(emailReply?.subject && emailReply?.emailBody)
                                            sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                                    } else if(!shipmentTypeId) {
                                        emailReply = await generateEmailContent(
                                            `Shipment Type not matched`,
                                            subject, 
                                            content
                                        )

                                        modelUsage.push({...emailReply?.modelUsage, usedFor: "shipmentTypeNotMatched"})

                                        if(emailReply?.subject && emailReply?.emailBody)
                                            sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                                    } else {
                                        batchData["polId"] = pol?.portId
                                        batchData["polName"] = pol?.portName
                                        batchData["podId"] = pod?.portId
                                        batchData["podName"] = pod?.portName

                                        batchData["friegthTypeId"] = friegthTypeId
                                        batchData["loadTypeId"] = loadTypeId
                                        batchData["shipmentTypeId"] = shipmentTypeId

                                        batchData["shipperName"] = partymaster?.name
                                        batchData["shipperId"] = partymaster?.partymasterId

                                        batchData["consigneeName"] = consignee?.name
                                        batchData["consigneeId"] = consignee?.partymasterId

                                        let batchObject;

                                        // batch object creations
                                        batchObject = {
                                            aiGenerated: true,
                                            createdBy : "SYSTEM-AI",
                                            createdByUID : partymaster.partymasterId,
                                            createdOn: new Date().toISOString(),
                                            updatedBy : "SYSTEM-AI",
                                            updatedByUID : partymaster.partymasterId,
                                            updatedOn: new Date().toISOString(),

                                            batchId: uuid.v4(),
                                            tenantId: agent?.tenantId,
                                            customerId: batchData?.shipperId,
                                            orgId: agent?.agentId,
                                            isExport: false,
                                            batchDate: new Date().toISOString(),
                                            isGRNRequired: false,
                                            isCustomsOnly: false,
                                            isCfsRequired: false,
                                            isAccessAssigned: false,
                                            accessUser: [],
                                            status: true,
                                            branchId: branch?.branchId,
                                            branchName: branch?.branchName,
                                            jobCode: branch?.draftJobCode,
                                            statusOfBatch: "Draft",
                                            quickJob: true,
                                            MBLStatus: "PENDING",
                                            HBLStatus: "PENDING",
                                            enquiryDetails: {
                                                basicDetails: {
                                                    consigneeId: batchData?.consigneeId,
                                                    consigneeName: batchData?.consigneeName,
                                                    shipperId: batchData?.shipperId,
                                                    shipperName: batchData?.shipperName,
                                                    multiShipper: [],
                                                    multiConsignee: [],
                                                    ShipmentTypeId : friegthTypeId,
                                                    ShipmentTypeName: batchData?.freightType,
                                                    loadTypeId: loadTypeId,
                                                    loadType: batchData?.loadType,
                                                    importShipmentTypeId: shipmentTypeId,
                                                    importShipmentTypeName: batchData?.shipmentType,
                                                    userBranch: branch?.branchId, 
                                                    userBranchName: branch?.branchName,
                                                    userJobCode: branch?.draftJobCode
                                                },
                                                containersDetails: [],
                                                cargoDetail: [],
                                                routeDetails: {
                                                    loadPortId: batchData?.polId,
                                                    loadPortName: batchData?.polName,
                                                    destPortId: batchData?.podId,
                                                    destPortName: batchData?.podName,
                                                },
                                                looseCargoDetails: {
                                                    cargos: [],
                                                    grossWeight: '0',
                                                    grossVolume: '0'
                                                }
                                            },
                                            quotationDetails: {
                                                shipperName: batchData?.shipperName,
                                                loadPortId: batchData?.polId,
                                                loadPortName: batchData?.polName,
                                                dischargePortId: batchData?.podId,
                                                dischargePortName: batchData?.podName,
                                                isExport: false,
                                                currency: partymaster?.partyCurrency?.currencyId,
                                                currencyShortName: partymaster?.partyCurrency?.currencyName,
                                                quoteStatus: "Quotation Created",
                                                status: true,
                                                branchId: branch?.branchId,
                                                branchName: branch?.branchName,
                                                jobCode: branch?.draftJobCode
                                            },
                                            routeDetails: {
                                                samePOD: false,
                                                loadPortId: batchData?.polId,
                                                loadPortName: batchData?.polName,
                                                destPortId: batchData?.podId,
                                                destPortName: batchData?.podName,
                                            }
                                        }
                                        
                                        if(batchData?.loadType === "FCL") {
                                            if(batchData?.containerDetails?.every(e => containerType?.map(e => e?.typeName)?.includes(e?.containerType))){
                                                // containerType exists
                                                batchData.containerDetails = batchData.containerDetails.map(e => {
                                                    return {
                                                        ...e,
                                                        containerTypeId: containerType.find(ec => ec.typeName === e?.containerType)?.systemtypeId
                                                    }
                                                })

                                                batchObject["enquiryDetails"]["containersDetails"] = batchData.containerDetails?.map(e => {
                                                    return {
                                                        typeOfWay: "Container",
                                                        containerType: e?.containerType,
                                                        noOfContainer: 1,
                                                        grossWeightContainer: String(e?.grossWeight)
                                                    }
                                                })

                                                
                                            } else {
                                                // containerType not exist

                                                emailReply = await generateEmailContent(
                                                    `Container Type Missing`,
                                                    subject, 
                                                    content
                                                )

                                                modelUsage.push({...emailReply?.modelUsage, usedFor: "containerTypeMissing"})

                                                if(emailReply?.subject && emailReply?.emailBody)
                                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                                            }
                                        } else if(batchData?.loadType === "LCL") {
                                            if(batchData?.looseCargoDetails?.every(e => packageType?.map(e => e?.typeName)?.includes(e?.packageType))){

                                                // packageType exists
                                                batchObject["enquiryDetails"]["looseCargoDetails"]["cargos"] = batchData?.looseCargoDetails?.map(e => {
                                                    return {
                                                        cbm : String(e?.cbm),
                                                        pkgname: e?.packageType,
                                                        units: e?.noOfPackage,
                                                        weightpsCalculatedother: String(e?.totalWeightInKG),
                                                        Weightselected: String(e?.totalWeightInKG),
                                                        selectedw: "KG",
                                                        volumeselect: e?.cbm,
                                                        volumebselecteds: "CBM",
                                                        lengthp: e?.lengthInCM,
                                                        Weightp: e?.widthInCM,
                                                        heightselected: e?.heigthInCM,
                                                        selectedh: "CM"
                                                    }
                                                })

                                                batchObject["enquiryDetails"]["looseCargoDetails"]["grossWeight"] = String(batchObject["enquiryDetails"]["looseCargoDetails"]["cargos"]?.map(e => Number(e?.weightpsCalculatedother) || 0)?.reduce((partialSum, a) => partialSum + a, 0) || 0)
                                                batchObject["enquiryDetails"]["looseCargoDetails"]["grossVolume"] = String(batchObject["enquiryDetails"]["looseCargoDetails"]["cargos"]?.map(e => Number(e?.volumeselect) || 0)?.reduce((partialSum, a) => partialSum + a, 0) || 0)

                                                // containerType also exists
                                                if(batchData.containerDetails > 0) {
                                                    batchData.containerDetails = batchData.containerDetails.map(e => {
                                                        return {
                                                            ...e,
                                                            containerTypeId: containerType.find(ec => ec.typeName === e?.containerType)?.systemtypeId
                                                        }
                                                    })

                                                    batchObject["enquiryDetails"]["containersDetails"] = batchData.containerDetails?.map(e => {
                                                        return {
                                                            typeOfWay: "Container",
                                                            containerType: e?.containerType,
                                                            noOfContainer: 1,
                                                            grossWeightContainer: String(e?.grossWeight)
                                                        }
                                                    })
                                                }
                                            } else {
                                                // packageType not exist

                                                emailReply = await generateEmailContent(
                                                    `Package Type Missing`,
                                                    subject, 
                                                    content
                                                )

                                                modelUsage.push({...emailReply?.modelUsage, usedFor: "packageTypeMissing"})

                                                if(emailReply?.subject && emailReply?.emailBody)
                                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                                            }
                                        }

                                        if(!emailReply) {
                                            // jobno creation logic starts
                                            if (branch) {
                                                let batchCounter = 0;
                                                const options = {
                                                    upsert: true, new: true,
                                                    returnDocument: 'after',
                                                    projection: { _id: 0, __v: 0 },
                                                };
                                                const BranchModel = mongoose.models[`BranchModel`] || mongoose.model(`BranchModel`, Schema["branch"], `branchs`);
                                                await BranchModel.findOneAndUpdate({ "branchId": batchObject.branchId }, { $inc: batchObject?.isExport ? { draftExportBatchCounter: 1 } : { draftImportbatchCounter: 1 } }, options).then(async function (foundDocument) {
                                                    if (batchObject?.isExport)
                                                        batchCounter = foundDocument.toObject().draftExportBatchCounter || 0;
                                                    else 
                                                        batchCounter = foundDocument.toObject().draftImportbatchCounter || 0;    
                                                });
                                                
                                                if (batchObject.jobCode)
                                                    batchObject.batchNo = `${batchObject.jobCode}-${batchCounter.toString()}`
                                                else 
                                                    batchObject.batchNo = `${batchCounter}`
                                            }
                                            // jobno creation logic ends

                                            const document = batchModel(batchObject);

                                            document.save()
                                                .then(async savedDocument => {
                                                    savedDocument = savedDocument?.toObject();
                                                    // milestone creation logic starts

                                                    if(savedDocument) {
                                                        jobautomationObject["orgId"] = savedDocument?.orgId
                                                        jobautomationObject["batchId"] = savedDocument?.batchId
                                                        jobautomationObject["batchNo"] = savedDocument?.batchNo
                                                        jobautomationObject["batchObject"] = savedDocument
                                                        jobautomationObject["extractedData"] = batchData
                                                        jobautomationObject["status"] = 200

                                                        console.log(`Job Created : ${savedDocument?.batchNo}`);

                                                        emailReply = await generateEmailContent(
                                                            `Draft Job Created With Job Number : ${savedDocument?.batchNo}`,
                                                            subject, 
                                                            content
                                                        )

                                                        modelUsage.push({...emailReply?.modelUsage, usedFor: "draftJobCreation"})

                                                        if(emailReply?.subject && emailReply?.emailBody)
                                                            sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                                                        
                                                        if(batchObject?.enquiryDetails?.basicDetails?.loadType){
                                                            let customDetails;
                                                            const enquiryModel = mongoose.models[`enquiryModel`] || mongoose.model(`enquiryModel`, Schema['enquiry'], `enquirys`);
                                                            const agentadviceModel = mongoose.models[`agentadviceModel`] || mongoose.model(`agentadviceModel`, Schema['agentadvice'], `agentadvices`);
                                                            
                                                            if (batchObject?.enquiryDetails?.basicDetails?.ShipmentTypeName === "Ocean" && batchObject?.isExport){
                                                                await enquiryModel.findOne({ enquiryId: batchObject.enquiryId }).then(async function (foundEnquiry) {
                                                                    customDetails = foundEnquiry?.customDetails
                                                                })
                                                            } else if (batchObject?.enquiryDetails?.basicDetails?.ShipmentTypeName === "Ocean" && batchObject?.isExport === false) {
                                                                await agentadviceModel.findOne({ agentadviceId: batchObject.agentadviceId }).then(async function (foundEnquiry) {
                                                                    customDetails = foundEnquiry?.customDetails
                                                                })
                                                            } else {
                                                                await enquiryModel.findOne({ enquiryId: batchObject.enquiryId }).then(async function (foundEnquiry) {
                                                                    customDetails = foundEnquiry?.customDetails
                                                                })
                                                            }
                                                            

                                                            const milestoneMasterModel = mongoose.models[`milestoneMasterModel`] || mongoose.model(`milestoneMasterModel`, Schema["milestonemaster"], `milestonemasters`);
                                                            let conditionMMEvents = {};

                                                            conditionMMEvents["orgId"] = batchObject.orgId
                                                            conditionMMEvents["flowType"] = batchObject.isExport ? "export" : (batchObject.isExport === false && batchObject?.enquiryDetails?.basicDetails?.ShipmentTypeName != "Land") ? "import" : "transporter"
                                                            
                                                            if (customDetails?.customOrigin) {
                                                                conditionMMEvents["customOrigin"] = { $in: [true, false, null] };
                                                            } else 
                                                                conditionMMEvents["customOrigin"] = { $in: [null, false] };
                                                            
                                                            if (customDetails?.customDestination) {
                                                                conditionMMEvents["customDestination"] = { $in: [true, false, null] };
                                                            } else 
                                                                conditionMMEvents["customDestination"] = { $in: [null, false] };

                                                            conditionMMEvents["status"] = true
                                                            conditionMMEvents["loadType"] = batchObject?.enquiryDetails?.basicDetails?.loadType
                                                            conditionMMEvents["locationType"] = {$ne : "transhipment"}
                                                            conditionMMEvents["shipmentType.item_id"] = batchObject?.enquiryDetails?.basicDetails?.importShipmentTypeId
                                                            
                                                            let mmEvents = await milestoneMasterModel.find(conditionMMEvents)

                                                            mmEvents.sort((a, b) => a.seq - b.seq);

                                                            for (i = 0; i < mmEvents.length; i++){
                                                                mmEvents[i]["name"] = mmEvents[i]["mileStoneName"]
                                                                mmEvents[i]["tag"] = mmEvents[i]["mileStoneName"].replace(" ", "_")

                                                                if (mmEvents[i]["locationType"] === "load") {
                                                                    mmEvents[i]["locationId"] = batchObject.quotationDetails.loadPortId
                                                                    mmEvents[i]["locationName"] = batchObject.quotationDetails.loadPortName
                                                                    mmEvents[i]["referenceType"] = "Port of Loading"
                                                                } else if (mmEvents[i]["locationType"] === "transhipment") {
                                                                    mmEvents[i]["locationId"] = batchObject?.routeDetails?.portOfTranshipmentId || ''
                                                                    mmEvents[i]["locationName"] = batchObject?.routeDetails?.portOfTranshipmentName || ''
                                                                    mmEvents[i]["referenceType"] = "Port of Transhipment"
                                                                } else if (mmEvents[i]["locationType"] === "discharge") {
                                                                    mmEvents[i]["locationId"] = batchObject.enquiryDetails.routeDetails.destPortId
                                                                    mmEvents[i]["locationName"] = batchObject.enquiryDetails.routeDetails.destPortName
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
                                                                    createdBy: batchObject.createdBy,
                                                                    createdByUID: batchObject.createdByUID,
                                                                    tenantId: batchObject.tenantId,
                                                                    eventId: uuid.v1(),
                                                                    entityId: savedDocument.batchId,
                                                                    entitysubId: batchObject.enquiryId,
                                                                    event_payload: {}
                                                                }

                                                                milestones.push(milestoneData)
                                                            }
                                                            const MilestoneExportModel = mongoose.models[`MilestoneExportModel`] || mongoose.model(`MilestoneExportModel`, Schema["event"], `events`);
                                                            await MilestoneExportModel.insertMany(milestones);  
                                                        }
                                                    }
                                                    // milestone creation logic ends
                                                })
                                        }
                                    }                            
                                }
                            }
                        }
                    }
                }else if(emailClassificationData?.isEnquiryRequest) {                    
                    // email is intendent to create job
                    let systemTypes = await systemtypeModel.find( 
                        {
                            "status": true,
                            "typeCategory": {
                                "$in": [
                                    "ShipmentTypeLand",
                                    "ExportShipmentTypeAir",
                                    "ExportShipmentType",
                                    "ImportShipmentTypeAir",
                                    "ImportShipmentType",
                                    "carrierType",
                                    "packageType",
                                    "ULDcontainerType",
                                    "tankStatus",
                                    "chargeBasis",
                                    "freightChargeTerm",
                                    "cargoType",
                                    "batchType",
                                    "contract",
                                    "customer",
                                    "imcoClass",
                                    "preCarriage",
                                    "onCarriage",
                                    "containerType",
                                    "containerSize",
                                    "enquiryType",
                                    "shippingTerm",
                                    "tankType",
                                    "shipmentTerm",
                                    "moveType",
                                    "incoTerm",
                                    "location",
                                    "icd",
                                    "packingGroup",
                                    "haulageType",
                                    "chargeTerm",
                                    "shipmentType",
                                    "processPoint",
                                    "dimensionUnit",
                                    "palletType",
                                    "status"
                                ]
                            }
                        }
                    )

                    if(systemTypes){
                        systemTypes = systemTypes?.map(e => e?.toObject())

                        const friegthType = systemTypes?.filter(e => e?.typeCategory === "carrierType")
                        const loadType = systemTypes?.filter(e => e?.typeCategory === "shipmentType")
                        const shipmentType = systemTypes?.filter(e => e?.typeCategory === "ImportShipmentType" || e?.typeCategory === "ExportShipmentType")
                        const containerType = systemTypes?.filter(e => e?.typeCategory === "containerType")
                        const packageType = systemTypes?.filter(e => e?.typeCategory === "packageType")

                        jobSchema.properties.freightType["enum"] = friegthType?.map(e => e?.typeName)
                        jobSchema.properties.loadType["enum"] = loadType?.map(e => e?.typeName)
                        jobSchema.properties.shipmentType["enum"] = shipmentType?.map(e => e?.typeName)
                        jobSchema.properties.containerDetails.items.properties.containerType["enum"] = [...containerType?.map(e => e?.typeName), "NOT_MENTIONED"]
                        jobSchema.properties.looseCargoDetails.items.properties.packageType["enum"] = packageType?.map(e => e?.typeName)

                        const fullData = await extractData(
                            agent?.geminiModel?.blScanning || "gemini-1.5-pro",
                            jobSchema,
                            "You are friegth-enquiry creator which reads email and based on give data for friegth job, Load Type FCL Means Full Container Load, and LCL Means Less than Container Load",
                            files,
                            subject,
                            content,
                            "look this above email content and attachments and give me all data to create friegth job"
                        );

                        modelUsage.push({...fullData?.modelUsage, usedFor: "fullData"})

                        let enquiryData = fullData?.jsonData;
                        
                        let emailReply; 

                        if(enquiryData) {
                            if(!(enquiryData?.freightType)) {
                                emailReply = await generateEmailContent(
                                    `Freight Type Missing`,
                                    subject, 
                                    content
                                )

                                modelUsage.push({...emailReply?.modelUsage, usedFor: "freightTypeMissing"})

                                if(emailReply?.subject && emailReply?.emailBody)
                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                            } else if(!(enquiryData?.loadType)) {
                                emailReply = await generateEmailContent(
                                    `Load Type Missing`,
                                    subject, 
                                    content
                                )

                                modelUsage.push({...emailReply?.modelUsage, usedFor: "loadTypeMissing"})

                                if(emailReply?.subject && emailReply?.emailBody)
                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                            } else if(!(enquiryData?.shipmentType)) {
                                emailReply = await generateEmailContent(
                                    `Shipment Type Missing`,
                                    subject, 
                                    content
                                )

                                modelUsage.push({...emailReply?.modelUsage, usedFor: "shipmentTypeMissing"})

                                if(emailReply?.subject && emailReply?.emailBody)
                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                            } else if(!(enquiryData?.portOfLoadingName)) {
                                emailReply = await generateEmailContent(
                                    `Port Of Loading Missing`,
                                    subject, 
                                    content
                                )

                                modelUsage.push({...emailReply?.modelUsage, usedFor: "portOfLoadingMissing"})

                                if(emailReply?.subject && emailReply?.emailBody)
                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                            } else if(!(enquiryData?.portOfDischargeName)) {
                                emailReply = await generateEmailContent(
                                    `Port Of Discharge Missing`,
                                    subject, 
                                    content
                                )

                                modelUsage.push({...emailReply?.modelUsage, usedFor: "portOfDischargeMissing"})

                                if(emailReply?.subject && emailReply?.emailBody)
                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                            } else if(!(enquiryData?.consigneeName)) {
                                emailReply = await generateEmailContent(
                                    `Consignee Missing`,
                                    subject, 
                                    content
                                )

                                modelUsage.push({...emailReply?.modelUsage, usedFor: "consigneeMissing"})

                                if(emailReply?.subject && emailReply?.emailBody)
                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                            } else if(enquiryData?.containerDetails?.length === 0 && enquiryData?.loadType === "FCL") {
                                emailReply = await generateEmailContent(
                                    `Container Details Missing For FCL Load Type`,
                                    subject, 
                                    content
                                )

                                modelUsage.push({...emailReply?.modelUsage, usedFor: "containerDetailsMissing"})

                                if(emailReply?.subject && emailReply?.emailBody)
                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                            } else if(enquiryData?.looseCargoDetails?.length === 0 && enquiryData?.loadType === "LCL") {
                                emailReply = await generateEmailContent(
                                    `Loose Cargo Details Missing For LCL Load Type`,
                                    subject, 
                                    content
                                )

                                modelUsage.push({...emailReply?.modelUsage, usedFor: "looseCargoDetailsMissing"})

                                if(emailReply?.subject && emailReply?.emailBody)
                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                            }

                            if(!emailReply) {
                                const consignee = await findClosestParty(enquiryData?.consigneeName, {}, partymasterModel)

                                if(!(consignee?.partymasterId)) {
                                    emailReply = await generateEmailContent(
                                        `Consignee Mismatch, Not in added in shipeasy's addressbook`,
                                        subject, 
                                        content
                                    )

                                    modelUsage.push({...emailReply?.modelUsage, usedFor: "consigneeMismatch"})

                                    if(emailReply?.subject && emailReply?.emailBody)
                                        sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                                } else {
                                    const pol = await findClosestPort(enquiryData?.portOfLoadingName, {}, portModel)
                                    const pod = await findClosestPort(enquiryData?.portOfDischargeName, {}, portModel)
                                    const friegthTypeId = friegthType.find(e => e?.typeName === enquiryData?.freightType)?.systemtypeId
                                    const loadTypeId = loadType.find(e => e?.typeName === enquiryData?.loadType)?.systemtypeId
                                    const shipmentTypeId = shipmentType.find(e => e?.typeName === enquiryData?.shipmentType)?.systemtypeId
                                    
                                    // const containerTypeId = containerType.find(e => e?.typeName === enquiryData?.containerType)?.systemtypeId
                                    // const packageTypeId = packageType.find(e => e?.typeName === enquiryData?.packageType)?.systemtypeId

                                    if(!pol) {
                                        emailReply = await generateEmailContent(
                                            `Port of loading not matched`,
                                            subject, 
                                            content
                                        )

                                        modelUsage.push({...emailReply?.modelUsage, usedFor: "portOfLoadingNotMatched"})

                                        if(emailReply?.subject && emailReply?.emailBody)
                                            sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                                    } else if(!pod) {
                                        emailReply = await generateEmailContent(
                                            `Port of destination not matched`,
                                            subject, 
                                            content
                                        )

                                        modelUsage.push({...emailReply?.modelUsage, usedFor: "portOfDestinationNotMatched"})

                                        if(emailReply?.subject && emailReply?.emailBody)
                                            sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                                    } else if(!friegthTypeId) {
                                        emailReply = await generateEmailContent(
                                            `Freight Type not matched`,
                                            subject, 
                                            content
                                        )

                                        modelUsage.push({...emailReply?.modelUsage, usedFor: "freightTypeNotMatched"})

                                        if(emailReply?.subject && emailReply?.emailBody)
                                            sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                                    } else if(!loadTypeId) {
                                        emailReply = await generateEmailContent(
                                            `Load Type not matched`,
                                            subject, 
                                            content
                                        )

                                        modelUsage.push({...emailReply?.modelUsage, usedFor: "loadTypeNotMatched"})

                                        if(emailReply?.subject && emailReply?.emailBody)
                                            sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                                    } else if(!shipmentTypeId) {
                                        emailReply = await generateEmailContent(
                                            `Shipment Type not matched`,
                                            subject, 
                                            content
                                        )

                                        modelUsage.push({...emailReply?.modelUsage, usedFor: "shipmentTypeNotMatched"})

                                        if(emailReply?.subject && emailReply?.emailBody)
                                            sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                                    } else {
                                        enquiryData["polId"] = pol?.portId
                                        enquiryData["polName"] = pol?.portName
                                        enquiryData["podId"] = pod?.portId
                                        enquiryData["podName"] = pod?.portName

                                        enquiryData["friegthTypeId"] = friegthTypeId
                                        enquiryData["loadTypeId"] = loadTypeId
                                        enquiryData["shipmentTypeId"] = shipmentTypeId

                                        enquiryData["shipperName"] = partymaster?.name
                                        enquiryData["shipperId"] = partymaster?.partymasterId

                                        enquiryData["consigneeName"] = consignee?.name
                                        enquiryData["consigneeId"] = consignee?.partymasterId

                                        let enquiryObject;

                                        // batch object creations
                                        enquiryObject = {
                                            aiGenerated: true,
                                            createdBy : "SYSTEM-AI",
                                            createdByUID : partymaster.partymasterId,
                                            createdOn: new Date().toISOString(),
                                            updatedBy : "SYSTEM-AI",
                                            updatedByUID : partymaster.partymasterId,
                                            updatedOn: new Date().toISOString(),
                                            agentAdviseStatus: "Inquiry Created",
                                            enquiryStatus: "Inquiry Created",
                                            bookingDate: new Date().toISOString(),
                                            shippingTermName: enquiryData?.loadType,
                                            shippingTermId: loadTypeId,
                                            orgId: agent?.agentId,
                                            tenantId: agent?.tenantId,
                                            status: true,
                                            agentadviceId: uuid.v4(),
                                            agentAdviceType: "Import",
                                            routeDetails: {
                                                samePOD: false,
                                                loadPortId: enquiryData?.polId,
                                                loadPortName: enquiryData?.polName,
                                                destPortId: enquiryData?.podId,
                                                destPortName: enquiryData?.podName,
                                            },
                                            containersDetails: [],
                                            customerId: enquiryData?.shipperId,
                                            isExport: false,
                                            batchDate: new Date().toISOString(),
                                            isGRNRequired: false,
                                            isCustomsOnly: false,
                                            isCfsRequired: false,
                                            isAccessAssigned: false,
                                            accessUser: [],
                                            branchId: branch?.branchId,
                                            branchName: branch?.branchName,
                                            jobCode: branch?.draftJobCode,
                                            statusOfBatch: "Draft",
                                            quickJob: true,
                                            MBLStatus: "PENDING",
                                            HBLStatus: "PENDING",
                                            basicDetails: {
                                                consigneeId: enquiryData?.consigneeId,
                                                consigneeName: enquiryData?.consigneeName,
                                                shipperId: enquiryData?.shipperId,
                                                shipperName: enquiryData?.shipperName,
                                                multiShipper: [],
                                                multiConsignee: [],
                                                ShipmentTypeId : friegthTypeId,
                                                ShipmentTypeName: enquiryData?.freightType,
                                                loadTypeId: loadTypeId,
                                                loadType: enquiryData?.loadType,
                                                importShipmentTypeId: shipmentTypeId,
                                                importShipmentTypeName: enquiryData?.shipmentType,
                                                userBranch: branch?.branchId, 
                                                userBranchName: branch?.branchName,
                                                userJobCode: branch?.draftJobCode
                                            },
                                            quotationDetails: {
                                                shipperName: enquiryData?.shipperName,
                                                loadPortId: enquiryData?.polId,
                                                loadPortName: enquiryData?.polName,
                                                dischargePortId: enquiryData?.podId,
                                                dischargePortName: enquiryData?.podName,
                                                isExport: false,
                                                currency: partymaster?.partyCurrency?.currencyId,
                                                currencyShortName: partymaster?.partyCurrency?.currencyName,
                                                quoteStatus: "Quotation Created",
                                                status: true,
                                                branchId: branch?.branchId,
                                                branchName: branch?.branchName,
                                                jobCode: branch?.draftJobCode
                                            }
                                        }
                                        
                                        if(enquiryData?.loadType === "FCL") {
                                            if(enquiryData?.containerDetails?.every(e => containerType?.map(e => e?.typeName)?.includes(e?.containerType))){
                                                // containerType exists
                                                enquiryData.containerDetails = enquiryData.containerDetails.map(e => {
                                                    return {
                                                        ...e,
                                                        containerTypeId: containerType.find(ec => ec.typeName === e?.containerType)?.systemtypeId
                                                    }
                                                })

                                                enquiryObject["containersDetails"] = enquiryData.containerDetails?.map(e => {
                                                    return {
                                                        typeOfWay: "Container",
                                                        containerType: e?.containerType,
                                                        noOfContainer: 1,
                                                        grossWeightContainer: String(e?.grossWeight)
                                                    }
                                                })

                                                
                                            } else {
                                                // containerType not exist

                                                emailReply = await generateEmailContent(
                                                    `Container Type Missing`,
                                                    subject, 
                                                    content
                                                )

                                                modelUsage.push({...emailReply?.modelUsage, usedFor: "containerTypeMissing"})

                                                if(emailReply?.subject && emailReply?.emailBody)
                                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                                            }
                                        } else if(enquiryData?.loadType === "LCL") {
                                            if(enquiryData?.looseCargoDetails?.every(e => packageType?.map(e => e?.typeName)?.includes(e?.packageType))){

                                                // packageType exists
                                                enquiryObject["looseCargoDetails"]["cargos"] = enquiryData?.looseCargoDetails?.map(e => {
                                                    return {
                                                        cbm : String(e?.cbm),
                                                        pkgname: e?.packageType,
                                                        units: e?.noOfPackage,
                                                        weightpsCalculatedother: String(e?.totalWeightInKG),
                                                        Weightselected: String(e?.totalWeightInKG),
                                                        selectedw: "KG",
                                                        volumeselect: e?.cbm,
                                                        volumebselecteds: "CBM",
                                                        lengthp: e?.lengthInCM,
                                                        Weightp: e?.widthInCM,
                                                        heightselected: e?.heigthInCM,
                                                        selectedh: "CM"
                                                    }
                                                })

                                                enquiryObject["enquiryDetails"]["looseCargoDetails"]["grossWeight"] = String(enquiryObject["enquiryDetails"]["looseCargoDetails"]["cargos"]?.map(e => Number(e?.weightpsCalculatedother) || 0)?.reduce((partialSum, a) => partialSum + a, 0) || 0)
                                                enquiryObject["enquiryDetails"]["looseCargoDetails"]["grossVolume"] = String(enquiryObject["enquiryDetails"]["looseCargoDetails"]["cargos"]?.map(e => Number(e?.volumeselect) || 0)?.reduce((partialSum, a) => partialSum + a, 0) || 0)

                                                // containerType also exists
                                                if(enquiryData.containerDetails > 0) {
                                                    enquiryData.containerDetails = enquiryData.containerDetails.map(e => {
                                                        return {
                                                            ...e,
                                                            containerTypeId: containerType.find(ec => ec.typeName === e?.containerType)?.systemtypeId
                                                        }
                                                    })

                                                    enquiryObject["enquiryDetails"]["containersDetails"] = enquiryData.containerDetails?.map(e => {
                                                        return {
                                                            typeOfWay: "Container",
                                                            containerType: e?.containerType,
                                                            noOfContainer: 1,
                                                            grossWeightContainer: String(e?.grossWeight)
                                                        }
                                                    })
                                                }
                                            } else {
                                                // packageType not exist

                                                emailReply = await generateEmailContent(
                                                    `Package Type Missing`,
                                                    subject, 
                                                    content
                                                )

                                                modelUsage.push({...emailReply?.modelUsage, usedFor: "packageTypeMissing"})

                                                if(emailReply?.subject && emailReply?.emailBody)
                                                    sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                                            }
                                        }

                                        if(!emailReply) {
                                            // jobno creation logic starts
                                                
                                            let agentadviceCounter = 0;
                                            const options = {
                                                returnDocument: 'after',
                                                projection: { _id: 0, __v: 0 },
                                            };
                                            const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
                                            await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: { agentadviceCounter: 1 } }, options).then(async function (foundDocument) {
                                                agentadviceCounter = foundDocument.toObject().agentadviceCounter || 0;
                                            });

                                            agentadviceCounter -= 1;
                                            enquiryObject["agentadviceNo"] = `INQ-I-${agentadviceCounter.toString().padStart(4, '0')}`
                                            
                                            // jobno creation logic ends

                                            const document = agentadviceModel(enquiryObject);

                                            await document.save()
                                                .then(async savedDocument => {
                                                    savedDocument = savedDocument?.toObject();
                                                    // milestone creation logic starts

                                                    if(savedDocument) {
                                                        jobautomationObject["orgId"] = savedDocument?.orgId
                                                        jobautomationObject["agentadviceId"] = savedDocument?.agentadviceId
                                                        jobautomationObject["agentadviceNo"] = savedDocument?.agentadviceNo
                                                        jobautomationObject["enquiryObject"] = savedDocument
                                                        jobautomationObject["extractedData"] = enquiryData
                                                        jobautomationObject["status"] = 200

                                                        console.log(`Enquiry Created : ${savedDocument?.agentadviceNo}`);

                                                        emailReply = await generateEmailContent(
                                                            `Draft Enquiry Created With Enquiry Number : ${savedDocument?.agentadviceNo}`,
                                                            subject, 
                                                            content
                                                        )

                                                        modelUsage.push({...emailReply?.modelUsage, usedFor: "draftJobCreation"})

                                                        if(emailReply?.subject && emailReply?.emailBody)
                                                            sendEmail(emailBody, agent, toEmail, emailReply?.subject, emailReply?.emailBody)
                                                    }
                                                    // milestone creation logic ends
                                                })
                                        }
                                    }                            
                                }
                            }
                        }
                    }
                }
            } else {
                
            }
        }
    } catch (error) {
        jobautomationObject["error"] = [
            {
                message: error
            }
        ]
    } finally {
        jobautomationObject = {
            updatedOn : new Date().toISOString(),
            ...jobautomationObject,
            status: 200,
            documentId: jobemail?.jobemailId,
            modelUsage: modelUsage,
            fileData: jobemail?.jobemailId,
        }
    }

    await new jobautomationModel(jobautomationObject).save();
}