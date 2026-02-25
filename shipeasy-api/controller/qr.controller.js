const { mongoose, Schema, invoiceSchema, uuid, jwt, crypto, axios, azureStorage, inAppNotificationService, querystring, nodemailer, pdfScanner, ediController, OpenAI, objecdiff, sendMessage, getTextMessageInput, fs, _, simpleParser, connect, imapConfig, transporter, getChangedFields, removeIdField, recordLogAudit, encryptObject, decryptObject, isSubset, createInAppNotification, replacePlaceholders, generateRandomPassword, triggerPointExecute, insertIntoTally, getTransporter, getChildCompany} = require('./helper.controller')

exports.downloadQrCode = async (req, res, next) => {
    const {grnId} = req.body;
    // const grnId = "dac210b1-18c5-11ef-8309-394d03b9c6f2"

    if (grnId){
        const grnModel = mongoose.models[`grnModel`] || mongoose.model(`grnModel`, Schema["grn"], `grns`);
        let grnData = await grnModel.findOne({ 'grnId': grnId });
        
        if (grnData){
            grnData = grnData?.toObject();
            const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
            let batchData = await batchModel.findOne({ 'batchId': grnData.batchId });
            if(batchData)
                batchData = batchData?.toObject();
            
            const UtilModel = mongoose.models[`UtilModel`] || mongoose.model(`UtilModel`, Schema["util"], `utils`);
            
            const options = {
                returnDocument: 'after',
                projection: { _id: 0, __v: 0 },
            };

            const data = [];
            const newItemData = [];

            for(let i = 0; i < grnData.items.length; i++){
                const item = grnData.items[i];
                
                const qrDataToBeStore = [];

                for (let j = 0; j < item.quantity; j++){
                    let qrCounter = 0;

                    await UtilModel.findOneAndUpdate({ "utilType": "GlobalCounter" }, { $inc: { qrCounter: 1 } }, options).then(async function (foundDocument) {
                        qrCounter = foundDocument.toObject().qrCounter || 0;
                    });
                    const uniqueRefNo = `${(qrCounter - 1).toString().padStart(8, '0')}${grnData.grnNo.replace("GRN-", "")}`
                    
                    const {qrData, _id, ...removeOtherFields} = item;

                    const qrDataToBeFill = {
                        ...removeOtherFields,
                        consigneeId : batchData.enquiryDetails.basicDetails.consigneeId,
                        consigneeName : batchData.enquiryDetails.basicDetails.consigneeName,
                        shipperId : batchData.enquiryDetails.basicDetails.shipperId,
                        shipperName : batchData.enquiryDetails.basicDetails.shipperName,
                        uniqueRefNo : uniqueRefNo,
                        qrId :  uuid.v1(),
                        grnId : grnData.grnId,
                        createdOn : new Date().toISOString(),
                        updatedOn : new Date().toISOString()
                    }
                    data.push(qrDataToBeFill)

                    qrDataToBeStore.push({itemNo : j + 1, qrData : qrDataToBeFill.uniqueRefNo, qrId : qrDataToBeFill.qrId})
                }

                newItemData.push({
                    ...item,
                    qrData : qrDataToBeStore
                })
            }
            
            const qrModel = mongoose.models[`qrModel`] || mongoose.model(`qrModel`, Schema["qr"], `qrs`);
            await qrModel.deleteMany({"grnId" : grnData.grnId})
            await qrModel.insertMany(data);

            await grnModel.findOneAndUpdate({ 'grnId': grnId }, {$set:{items : newItemData}});   

            const jasperUrl = process.env.JASPER_URL;
            const jasperheader = {
                "Authorization": `Basic ${process.env.JASPER_Auth}`,
                "Content-Type": "application/pdf",
            }

            try {
                let headers = { params: { grnId : grnId}, headers: jasperheader, responseType: "arraybuffer",  };
                let jasperdata = await axios.get(
                    `${jasperUrl}/jasperserver/rest_v2/reports/${process.env.JASPER_PATH}/qrShipping.pdf`,
                    headers
                );
            
                res.status(200).send(jasperdata.data)
            } catch (e) {
                res.status(500).json({ error: e.message});
            }
        } else 
            res.status(401).send({error : "not found any grn with this grnId!"})
    } else 
        res.status(500).send({error : "missing grnId!"})
}
exports.getQrData = async (req, res, next) => {
    const {voyageNumber, portId, carrierId, vesselId, flightNo, vehicleNo, loadType, freightType, batchId} = req.body;

    const user = res.locals.user

    let batchData;

    let condition = {}

    if (voyageNumber) {
        condition["quotationDetails.voyageNumber"] = voyageNumber
    }
    if (portId) {
        condition["quotationDetails.loadPortId"] = portId
    }
    if (carrierId) {
        condition["quotationDetails.carrierId"] = carrierId
    }
    if (vesselId) {
        condition["quotationDetails.vesselId"] = vesselId
    }
    if (flightNo) {
        condition["quotationDetails.flightNo"] = flightNo
    }
    if (vehicleNo) {
        condition["quotationDetails.vehicleNo"] = vehicleNo
    }
    if (loadType) {
        condition["enquiryDetails.basicDetails.loadType"] = loadType
    }
    if (freightType) {
        condition["enquiryDetails.basicDetails.ShipmentTypeId"] = freightType
    }
    if(batchId){
        condition["batchId"] = batchId
    }
    
    condition["orgId"] = user.orgId
    
    

    const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
    const grnModel = mongoose.models[`grnModel`] || mongoose.model(`grnModel`, Schema["grn"], `grns`);
    const qrModel = mongoose.models[`qrModel`] || mongoose.model(`qrModel`, Schema["qr"], `qrs`);

    batchData = await batchModel.find(condition)
    if(batchData)
        batchData = batchData?.map(e => e?.toObject())

    if(batchData){
        const qrsDataToReturn = []
        for (let b = 0; b < batchData.length; b++){
            let grnData = await grnModel.find({batchId : batchData[b].batchId})
            if(grnData)
                grnData = grnData?.map(e => e?.toObject())
            
            for (let i = 0; i < grnData.length; i++){
                let qrData = await qrModel.find({grnId : grnData[i]?.grnId})
                if(qrData)
                    qrData = qrData?.map(e => e?.toObject())

                for (let j = 0; j < qrData.length; j++){
                    qrsDataToReturn.push({...qrData[j], batchNo : batchData[b].batchNo, batchId : batchData[b].batchId})
                }
            }
        }

        res.status(200).send({"documents" : qrsDataToReturn, totalCount : qrsDataToReturn.length})
    } else {
        res.send({"error" : "please give voyageNumber and  portId"})
    }
}
exports.getWarehouseQrData = async (req, res, next) => {
    const {warehouseId} = req.body;

    if (warehouseId) {
        const grnModel = mongoose.models[`grnModel`] || mongoose.model(`grnModel`, Schema["grn"], `grns`);
        const qrModel = mongoose.models[`qrModel`] || mongoose.model(`qrModel`, Schema["qr"], `qrs`);
        const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
        const grnData = await grnModel.find({warehouseId: warehouseId})
        
        const qrsDataToReturn = []

        let batchsData = {};
        for (let i = 0; i < grnData.length; i++){
            const qrData = await qrModel.find({grnId : grnData[i]?.grnId})
            
            for (let j = 0; j < qrData.length; j++){
                if (!batchsData.hasOwnProperty(grnData[i]?.batchId)){
                    let batchData = await batchModel.findOne({batchId : grnData[i]?.batchId})
                    if(batchData)
                        batchData = batchData?.toObject();
                    
                    batchsData[grnData[i]?.grnId] = {}
                    batchsData[grnData[i]?.grnId]["batchId"] = batchData.batchId || ""
                    batchsData[grnData[i]?.grnId]["batchNo"] = batchData.batchNo || ""
                    batchsData[grnData[i]?.grnId]["loadPortName"] = batchData.quotationDetails.loadPortName || ""
                    batchsData[grnData[i]?.grnId]["dischargePortName"] = batchData.quotationDetails.dischargePortName || ""
                    batchsData[grnData[i]?.grnId]["frightType"] = batchData.enquiryDetails?.basicDetails?.ShipmentTypeName || ""
                }         

                qrsDataToReturn.push({...qrData[j].toObject(), ...batchsData[grnData[i]?.grnId]})
            }
        }

        res.status(200).send({"documents" : qrsDataToReturn, totalCount : qrsDataToReturn.length})
    } else {
        res.send({"error" : "please give warehouseId"})
    }
}