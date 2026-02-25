const { mongoose, Schema, invoiceSchema, uuid, jwt, crypto, axios, azureStorage, inAppNotificationService, querystring, nodemailer, pdfScanner, ediController, OpenAI, objecdiff, sendMessage, getTextMessageInput, fs, _, simpleParser, connect, imapConfig, transporter, getChangedFields, removeIdField, recordLogAudit, encryptObject, decryptObject, isSubset, createInAppNotification, replacePlaceholders, generateRandomPassword, triggerPointExecute, insertIntoTally, getTransporter, getChildCompany} = require('./helper.controller')

exports.createOrderReport = async (req, res, next) => {
    const user = res.locals.user

    let partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, Schema["partymaster"], `partymasters`);
    const partymasterData = await partymasterModel.findOne({partymasterId : req.body.partymasterId})

    if (partymasterData?.instafinancial?.isReportDownloaded === false){
        res.send({
            status : "failed",
            message : "Order Report already requested!"
        })
    } else {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://instafinancials.com/api/InstaDetailed/V1/json/CompanyCIN/${partymasterData?.companyCin}/OrderReport`,
            headers: { 
              'user-key': process.env.USER_KEY_INSTA_FINANCIALS, 
            }
        };

        await axios.request(config)
            .then(async (response) => {
                if (response.data?.Order?.OrderStatus === "Success") {
                    const orderId = response.data?.Order?.OrderID;

                    if (orderId) {
                        config.url = `https://instafinancials.com/api/InstaDetailed/v1/json/OrderID/${orderId}/Status`,
                
                        await axios.request(config).then(async (responseStatus) => {
                            if (responseStatus?.data?.Order?.Status) {
                                await partymasterModel.findOneAndUpdate({partymasterId : req.body.partymasterId}, {
                                    $set : {
                                        "instafinancial.orderId" : orderId,
                                        "instafinancial.isReportDownloaded" : false,
                                        "instafinancial.createdOn" : new Date().toISOString(),
                                        "instafinancial.orderStatus" : responseStatus?.data?.Order?.Status
                                    }
                                })

                                res.send({
                                    status : "success",
                                    message : `Order Report requested with orderId : ${orderId}!`
                                })
                            } else {
                                res.send({
                                    status : "failed",
                                    message : `Error raised while requesting order report!`
                                })
                            }
                        })
                    } else {
                        res.send({
                            status : "failed",
                            message : `Error raised while requesting order report!`
                        })
                    }
                } else {
                    res.send({
                        status : "failed",
                        message : response?.data?.Response?.Type
                    })
                }
        })
        .catch((error) => {
            console.error(JSON.stringify({
                traceId : req?.traceId,
                error: err,
                stack : err?.stack
            }))
            res.status(500).send({error : err?.message})
        }); 
    }
}

exports.checkOrderReport = async (req, res, next) => {
    const user = res.locals.user

    let partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, Schema["partymaster"], `partymasters`);
    const partymasterData = await partymasterModel.findOne({partymasterId : req.body.partymasterId})

    if (partymasterData?.instafinancial?.orderId) {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://instafinancials.com/api/InstaDetailed/v1/json/OrderID/${partymasterData?.instafinancial?.orderId}/Status`,
            headers: { 
                'user-key': process.env.USER_KEY_INSTA_FINANCIALS, 
            }
        };
    
        axios.request(config).then(async (responseStatus) => {
            if (responseStatus?.data?.Order?.Status) {
                await partymasterModel.findOneAndUpdate({partymasterId : req.body.partymasterId}, {
                    $set : {
                        "instafinancial.orderStatus" : responseStatus?.data?.Order?.Status
                    }
                })
    
                res.send({
                    status : responseStatus?.data?.Order?.Status,
                    isDownloadable : responseStatus?.data?.Order?.Status === "Order Delivered" || responseStatus?.data?.Order?.Status === "Order Completed"
                })
            } else {
                res.send({
                    status : "failed",
                    message : `Error raised while checking order report!`
                })
            }
        })   
    } else {
        res.send({
            status : "failed",
            message : `Error raised while checking order report!`
        })
    }
}

exports.downloadOrderReport = async (req, res, next) => {
    const user = res.locals.user

    let partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, Schema["partymaster"], `partymasters`);
    let instaFinDetail = mongoose.models[`instaFinDetail`] || mongoose.model(`instaFinDetail`, Schema["instafindetail"], `instafindetails`);
    const partymasterData = await partymasterModel.findOne({partymasterId : req.body.partymasterId})

    if (partymasterData?.instafinancial?.orderId) {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://instafinancials.com/api/InstaDetailed/v1/json/OrderID/${partymasterData?.instafinancial?.orderId}/DownloadReport`,
            headers: { 
                'user-key': process.env.USER_KEY_INSTA_FINANCIALS, 
            }
        };
    
        await axios.request(config).then(async (responseStatus) => {
            if (responseStatus?.data?.Order?.OrderRemark != "Order is under process, check after few hours") {
                await partymasterModel.findOneAndUpdate({partymasterId : req.body.partymasterId}, {
                    $set : {
                        "instafinancial.orderStatus" : responseStatus?.data?.Order?.Status,
                        "instafinancial.isReportDownloaded" : true,
                    }
                })
    
                const { CompanyMasterSummary, DirectorSignatoryMasterSummary, OwnershipDetails, StatementOfProfitAndLoss } = responseStatus?.data?.InstaDetailed

                const docDownloaded = await instaFinDetail.findOne({ orderId : partymasterData?.instafinancial?.orderId })
                if (!(docDownloaded)) {
                    const doc = instaFinDetail({
                        instafindetailId : uuid.v4(),
                        companyMasterSummary : CompanyMasterSummary,
                        directorSignatoryMasterSummary : DirectorSignatoryMasterSummary,
                        ownershipDetails : OwnershipDetails,
                        statementOfProfitAndLoss : StatementOfProfitAndLoss,
                        partymasterId : req.body.partymasterId,
                        orderId : partymasterData?.instafinancial?.orderId,
                        createdOn: new Date().toISOString(),
                        createdBy: `${user.shortName} ${user.userLastname}`,
                        createdByUID: user.userId
                    })
    
                    await doc.save().then((savedDocument) => {
                        recordLogAudit(req, "CREATE", "instafindetails", savedDocument[`containerId`], {}, savedDocument)
                    })
                }

                res.send({
                    status : "success",
                    ...responseStatus?.data
                })
            } else {
                res.send({
                    status : "failed",
                    message : responseStatus?.data?.Order?.OrderRemark
                })
            }
        })   
    } else {
        res.send({
            status : "failed",
            message : `Error raised while checking order report!`
        })
    }
}