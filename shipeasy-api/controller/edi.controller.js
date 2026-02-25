const { mongoose, Schema, invoiceSchema, uuid, jwt, crypto, axios, azureStorage, inAppNotificationService, querystring, nodemailer, pdfScanner, ediController, OpenAI, objecdiff, sendMessage, getTextMessageInput, fs, _, simpleParser, connect, imapConfig, transporter, getChangedFields, removeIdField, recordLogAudit, encryptObject, decryptObject, isSubset, createInAppNotification, replacePlaceholders, generateRandomPassword, triggerPointExecute, insertIntoTally, getTransporter, getChildCompany} = require('./helper.controller')

exports.generateEDIFILE = async (req, res, next) => {
    const { ediName, documentId } = req.params;

    if (ediName === "invoice") {
        const invoiceModel = mongoose.models[`invoiceModel`] || mongoose.model(`invoiceModel`, Schema["invoice"], `invoices`);
        const partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, Schema["partymaster"], `partymasters`);
        const invoiceData = await invoiceModel.findOne({invoiceId : documentId})

        if(invoiceData){
            const consigneeData = await partymasterModel.findOne({partymasterId : invoiceData.consigneeId})
            const shipperData = await partymasterModel.findOne({partymasterId : invoiceData.shipperId})
        
            res.status(200).send(await ediController.generateEDI810(invoiceData, consigneeData, shipperData))
        } else 
            res.status(404).send({error : "no invoice found!"})
    } else if  (ediName === "shippinginstruction") {
        const instructionModel = mongoose.models[`instructionModel`] || mongoose.model(`instructionModel`, Schema["instruction"], `instructions`);
        const instructionData = await instructionModel.findOne({instructionId : documentId})
        
        if (instructionData)
            res.status(200).send(await ediController.generateEDI856(instructionData))
        else
            res.status(404).send({error : "no shipping instruction found!"})
    } else if  (ediName === "milestone") {
        const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
        const batchData = await batchModel.findOne({batchId : documentId})

        const eventModel = mongoose.models[`eventModel`] || mongoose.model(`eventModel`, Schema["event"], `events`);
        const milestoneData = await eventModel.find({entityId : documentId})

        const blModel = mongoose.models[`blModel`] || mongoose.model(`blModel`, Schema["bl"], `bls`);
        const blData = await blModel.findOne({batchId : documentId})

        const partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, Schema["partymaster"], `partymasters`);
        
        const shipperData = await partymasterModel.findOne({partymasterId : batchData.enquiryDetails.basicDetails.shipperId})
        const consigneeData = await partymasterModel.findOne({partymasterId : batchData.enquiryDetails.basicDetails.consigneeId})

        // batchData, milestoneData, blData, shipperData, consigneeData
        if (batchData)
            res.status(200).send(await ediController.generateEDI214(batchData, milestoneData, blData, shipperData, consigneeData))
        else
            res.status(404).send({error : "no shipping instruction found!"})
    } else if  (ediName === "bol") {
        const Model = mongoose.models[`blModel`] || mongoose.model(`blModel`, Schema["bl"], `bls`);
        const blData = await Model.findOne({blId : documentId});

        const userModel = mongoose.models[`userModel`] || mongoose.model(`userModel`, Schema["user"], `users`);
        const userData = await userModel.findOne({userId : blData.createdByUID});

        const partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, Schema["partymaster"], `partymasters`);
        const shipperData = await partymasterModel.findOne({partymasterId : blData.shipperId});
        const consigneeData = await partymasterModel.findOne({partymasterId : blData.consigneeId});
        
        if (blData)
            res.status(200).send(await ediController.generateEDI099B(blData, userData, shipperData, consigneeData))
        else
            res.status(404).send({error : "no shipping instruction found!"})
    } else if  (ediName === "vgm") {
        const instructionModel = mongoose.models[`instructionModel`] || mongoose.model(`instructionModel`, Schema["instruction"], `instructions`);
        const instructionData = await instructionModel.findOne({batchId : documentId});

        const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
        const batchData = await batchModel.findOne({batchId : documentId});

       
        if (instructionData)
            res.status(200).send(await ediController.generateVERMAS(instructionData, batchData))
        else
            res.status(404).send({error : "no shipping instruction found!"})
    } else if  (ediName === "bookingconfirmation") {
        const instructionModel = mongoose.models[`instructionModel`] || mongoose.model(`instructionModel`, Schema["instruction"], `instructions`);
        const instructionData = await instructionModel.findOne({batchId : documentId});

        const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
        const batchData = await batchModel.findOne({batchId : documentId});

        const partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, Schema["partymaster"], `partymasters`);
        
        const shipperData = await partymasterModel.findOne({partymasterId : batchData.enquiryDetails.basicDetails.shipperId})
        const consigneeData = await partymasterModel.findOne({partymasterId : batchData.enquiryDetails.basicDetails.consigneeId})

       
        if (batchData)
            res.status(200).send(await ediController.generateEDIBookingConfirmation(batchData, instructionData, shipperData, consigneeData))
        else
            res.status(404).send({error : "no booking confirmation found!"})
    } else if  (ediName === "bookingrequest") {
        const instructionModel = mongoose.models[`instructionModel`] || mongoose.model(`instructionModel`, Schema["instruction"], `instructions`);
        const instructionData = await instructionModel.findOne({batchId : documentId});

        const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
        const batchData = await batchModel.findOne({batchId : documentId});

        const partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, Schema["partymaster"], `partymasters`);
        
        const shipperData = await partymasterModel.findOne({partymasterId : batchData.enquiryDetails.basicDetails.shipperId})
        const consigneeData = await partymasterModel.findOne({partymasterId : batchData.enquiryDetails.basicDetails.consigneeId})

       
        if (batchData)
            res.status(200).send(await ediController.generateEDIBookingRequest(batchData, instructionData, shipperData, consigneeData))
        else
            res.status(404).send({error : "no booking confirmation found!"})
    } else if  (ediName === "shippingbill") {
        const Model = mongoose.models[`shippingbillModel`] || mongoose.model(`shippingbillModel`, Schema["shippingbill"], `shippingbills`);
        const sbData = await Model.findOne({shippingbillId : documentId});

        if (sbData)
            res.status(200).send(await ediController.generateEDIShippingBillConfirmation(sbData))
        else
            res.status(404).send({error : "no shipping bill found!"})
    } else
        res.status(404).send({error : "no edi format found!"})
}