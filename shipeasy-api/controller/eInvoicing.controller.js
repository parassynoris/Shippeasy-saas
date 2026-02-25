const { mongoose, Schema, invoiceSchema, uuid, jwt, crypto, axios, azureStorage, inAppNotificationService, querystring, nodemailer, pdfScanner, ediController, OpenAI, objecdiff, sendMessage, getTextMessageInput, fs, _, simpleParser, connect, imapConfig, transporter, getChangedFields, removeIdField, recordLogAudit, encryptObject, decryptObject, isSubset, createInAppNotification, replacePlaceholders, generateRandomPassword, triggerPointExecute, insertIntoTally, getTransporter, getChildCompany} = require('./helper.controller')


exports.pushToZircon = async (req, res, next) => {
    let authToken;
    const urlInvoice = process.env.ZIRCON_URL_INVOICE
    const urlLogin = process.env.ZIRCON_URL_LOGIN
    const clientId = process.env.ZIRCON_CLIENT_ID
    const clientSecret = process.env.ZIRCON_CLIENT_SECRET
    const gstIn = process.env.ZIRCON_GSTIN
    const username = process.env.ZIRCON_USERNAME
    const password = process.env.ZIRCON_PASSWORD


    try {
        await axios.request({
            method: 'post',
            maxBodyLength: Infinity,
            url: urlLogin,
            headers: {
                'Accept': 'application/json',
                'client-id' : clientId,
                'client-secret' : clientSecret,
                'gstin' : gstIn
            },
            data: {
                "UserName": username,
                "Password": password,
                "ForceRefreshAccessToken": true
            }
        }).then(async (response) => {
                if (response.status === 200) {
                    authToken = response.data.Data.AuthToken
                }
            }
        )
    
        if (authToken) {
            const { invoiceId } = req.params
        
            const invoiceModel = mongoose.models[`invoiceModel`] || mongoose.model(`invoiceModel`, Schema["invoice"], `invoices`);
            const partymasterModel = mongoose.models[`partymasterModel`] || mongoose.model(`partymasterModel`, Schema["partymaster"], `partymasters`);
            const branchModel = mongoose.models[`branchModel`] || mongoose.model(`branchModel`, Schema["branch"], `branchs`);
    
            const invoiceData = await invoiceModel.findOne({ invoiceId : invoiceId })
    
            let sellerData = await partymasterModel?.findOne({ partymasterId : invoiceData?.invoiceToId })
            if(sellerData)
                sellerData = sellerData?.toObject()
            sellerData = sellerData.branch.find(e => e.branch_name === invoiceData.invoiceToBranchName)
            
            const buyerData = await branchModel?.findOne({ branchId : invoiceData?.invoiceFromId })
            if(buyerData)
                buyerData = buyerData?.toObject()
            
            const invoiceObjectToBePushed = {
                "Version": "1.1",
                "TranDtls": {
                    "TaxSch": "GST",
                    "SupTyp": "B2B"
                },
                "DocDtls": {
                    "Typ": "INV",
                    "No": invoiceData?.invoiceNo,
                    "Dt": new Date(invoiceData?.invoice_date).toLocaleDateString('en-GB')
                },
                "SellerDtls": {
                    "Gstin": sellerData?.tax_number,
                    "LglNm": sellerData?.branch_name,
                    "TrdNm": sellerData?.branch_name,
                    "Addr1": sellerData?.branch_address,
                    "Loc": sellerData?.branch_stateName,
                    "Pin": sellerData?.pinCode,
                    "Stcd": sellerData?.tax_number.slice(0, 2),
                    "Ph": sellerData?.pic_phone.toString(),
                    "Em": sellerData?.pic_email || undefined
                },
                "BuyerDtls": {
                    "Gstin": buyerData?.taxId,
                    "LglNm": buyerData?.branchName,
                    "TrdNm": buyerData?.branchName,
                    "Pos": "12",
                    "Addr1": buyerData?.addressInfo?.address,
                    "Loc": buyerData?.addressInfo?.stateName,
                    "Pin": buyerData?.addressInfo?.postalCode,
                    "Stcd": buyerData?.taxId?.slice(0, 2),
                    "Ph": buyerData?.primaryNo?.primaryNo,
                    "Em": buyerData?.primaryMailId
                },
                // "DispDtls": {
                //     "Nm": "ABC company pvt ltd",
                //     "Addr1": "7th block, kuvempu layout",
                //     "Addr2": "kuvempu layout",
                //     "Loc": "Banagalore",
                //     "Pin": 580009,
                //     "Stcd": "29"
                // },
                // "ShipDtls": {
                //     "Gstin": "29AWGPV7107B1Z1",
                //     "LglNm": "CBE company pvt ltd",
                //     "TrdNm": "kuvempu layout",
                //     "Addr1": "7th block, kuvempu layout",
                //     "Addr2": "kuvempu layout",
                //     "Loc": "Banagalore",
                //     "Pin": 562160,
                //     "Stcd": "29"
                // },
                "ItemList": invoiceData?.costItems?.map((ct, index) => {
                    return {
                        "SlNo": `${index + 1}`,
                        "PrdDesc": ct?.costItemName,
                        "IsServc": "Y",
                        "HsnCd": ct?.hsnCode,
                        // "Barcde": "123456",
                        "Qty": ct?.quantity,
                        // "FreeQty": 10,
                        "Unit": "BAG",
                        "UnitPrice": ct?.selEstimates?.rate,
                        "TotAmt": ct?.selEstimates?.amount ,
                        // "Discount": 10,
                        "PreTaxVal": ct?.selEstimates?.amount,
                        "AssAmt": ct?.selEstimates?.amount,
                        "GstRt": ct?.tax[0]?.taxRate,
                        "IgstAmt": sellerData?.tax_number.slice(0, 2) != buyerData?.addressInfo?.stateCode ? ct?.selEstimates?.igst : 0,
                        "CgstAmt": sellerData?.tax_number.slice(0, 2) === buyerData?.addressInfo?.stateCode ? ct?.selEstimates?.cgst : 0,
                        "SgstAmt": sellerData?.tax_number.slice(0, 2) === buyerData?.addressInfo?.stateCode ? ct?.selEstimates?.sgst : 0,
                        // "CesRt": 5,
                        // "CesAmt": 498.94,
                        // "CesNonAdvlAmt": 10,
                        // "StateCesRt": 12,
                        // "StateCesAmt": 1197.46,
                        // "StateCesNonAdvlAmt": 5,
                        "OthChrg": 0,
                        "TotItemVal": ct?.selEstimates?.totalAmount,
                        // "OrdLineRef": "3256",
                        // "OrgCntry": "AG",
                        // "PrdSlNo": "12345",
                        // "AttribDtls": [
                        //     {
                        //         "Nm": "Rice",
                        //         "Val": "10000"
                        //     }
                        // ]
                    }
                }),
                "Location" : {}
            }
            
            invoiceObjectToBePushed["ValDtls"] = {
                "AssVal":  parseFloat((invoiceObjectToBePushed.ItemList.map(e => e.AssAmt).reduce((partialSum, a) => partialSum + a, 0) || 0).toFixed(2)),
                "CgstVal":  parseFloat((invoiceObjectToBePushed.ItemList.map(e => e.CgstAmt).reduce((partialSum, a) => partialSum + a, 0) || 0).toFixed(2)),
                "SgstVal":  parseFloat((invoiceObjectToBePushed.ItemList.map(e => e.SgstAmt).reduce((partialSum, a) => partialSum + a, 0) || 0).toFixed(2)),
                "IgstVal":  parseFloat((invoiceObjectToBePushed.ItemList.map(e => e.IgstAmt).reduce((partialSum, a) => partialSum + a, 0) || 0).toFixed(2)),
                // "CesVal": 508.94,
                // "StCesVal": 1202.46,
                "Discount": 0,
                "OthChrg": 0,
                // "RndOffAmt": 0.3,
                "TotInvVal": parseFloat((invoiceObjectToBePushed.ItemList.map(e => e.TotItemVal).reduce((partialSum, a) => partialSum + a, 0) || 0).toFixed(2)),
                // "TotInvValFc": 12897.7
            }
    
            await axios.request({
                method: 'post',
                maxBodyLength: Infinity,
                url: urlInvoice,
                headers: {
                    'Accept': 'application/json',
                    'client-id' : clientId,
                    'client-secret' : clientSecret,
                    'gstin' : gstIn,
                    'user_name' : username,
                    'AuthToken' : authToken
                },
                data: invoiceObjectToBePushed
            }).then(async (response) => {
                    if (response.data.Status === 1) {
                        const responseJsonWithIRN = JSON.parse(response.data.Data)
    
                        const updatedInvoice = await invoiceModel.findOneAndUpdate({
                            invoiceId : invoiceId
                        }, {
                            $set : {
                                ackNo : responseJsonWithIRN.AckNo,
                                irn : responseJsonWithIRN.Irn,
                                qrData : responseJsonWithIRN.SignedQRCode,
                                eInvoicePushedOn : new Date().toISOString(),
                                eInvoiceStatus : "created"
                            }
                        }, { returnDocument : "after" })
    
                        res.status(200).send({
                            invoiceData : updatedInvoice,
                            message : `Invoice is pushed to e-invoicing with acknowledgement no : ${responseJsonWithIRN.AckNo}`
                        })
                    } else 
                        res.status(500).send({
                            isMultipleError : true,
                            errorMessage : response.data.ErrorDetails.map(e => e.ErrorMessage),
                            invoiceObject : invoiceObjectToBePushed
                        })
                }
            )
        } else 
            res.status(500).send({
                isMultipleError : false,
                errorMessage : "Unexpected error while pushing invoice to e-invoicing!"
            })
    } catch (error) {
        console.error(JSON.stringify({
            traceId : req?.traceId,
            error: error,
            stack : error?.stack
        }))
        res.status(500).send({
            isMultipleError : false,
            errorMessage : "Unexpected error while pushing invoice to e-invoicing!"
        })
    }
}

exports.cancelFromZircon = async (req, res, next) => {
    let authToken;
    const urlInvoiceCancel = process.env.ZIRCON_URL_INVOICE_CANCEL
    const urlLogin = process.env.ZIRCON_URL_LOGIN
    const clientId = process.env.ZIRCON_CLIENT_ID
    const clientSecret = process.env.ZIRCON_CLIENT_SECRET
    const gstIn = process.env.ZIRCON_GSTIN
    const username = process.env.ZIRCON_USERNAME
    const password = process.env.ZIRCON_PASSWORD


    try {
        await axios.request({
            method: 'post',
            maxBodyLength: Infinity,
            url: urlLogin,
            headers: {
                'Accept': 'application/json',
                'client-id' : clientId,
                'client-secret' : clientSecret,
                'gstin' : gstIn
            },
            data: {
                "UserName": username,
                "Password": password,
                "ForceRefreshAccessToken": true
            }
        }).then(async (response) => {
                if (response.status === 200) {
                    authToken = response.data.Data.AuthToken
                }
            }
        )
    
        if (authToken) {
            const { invoiceId } = req.params
        
            const invoiceModel = mongoose.models[`invoiceModel`] || mongoose.model(`invoiceModel`, Schema["invoice"], `invoices`);
           
            const invoiceData = await invoiceModel.findOne({ invoiceId : invoiceId })

            if (invoiceData?.eInvoiceStatus === "cancelled") {
                return res.status(500).send({
                    isMultipleError : false,
                    errorMessage : "This e-invoice is already cancelled!"
                })
            } else if (invoiceData?.eInvoiceStatus === "created") {
                const diffInMs = new Date() - new Date(invoiceData.eInvoicePushedOn);
                const diffInHours = diffInMs / (1000 * 60 * 60);

                // Check if the time difference is within 24 hours
                if (!(diffInHours <= 24)) 
                    return res.status(500).send({
                        isMultipleError : false,
                        errorMessage : "24 hours have passed from time when you have pushed e-invoice!"
                    })

                await axios.request({
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: urlInvoiceCancel,
                    headers: {
                        'Accept': 'application/json',
                        'client-id' : clientId,
                        'client-secret' : clientSecret,
                        'gstin' : gstIn,
                        'user_name' : username,
                        'AuthToken' : authToken
                    },
                    data: {
                        "Irn": invoiceData.irn,
                        "CnlRsn":"1",
                        "CnlRem":"Wrong entry"
                    }
                }).then(async (response) => {
                        if (response.data.Status === 1) {
                            
                            const updatedInvoice = await invoiceModel.findOneAndUpdate({
                                invoiceId : invoiceId
                            }, {
                                $set : {
                                    eInvoiceStatus : "cancelled",
                                    eInvoiceCancelledOn : new Date().toISOString()
                                }
                            }, { returnDocument : "after" })
        
                            res.status(200).send({
                                invoiceData : updatedInvoice,
                                message : `Invoice is cancelled from e-invoicing`
                            })
                        } else 
                            res.status(500).send({
                                isMultipleError : true,
                                errorMessage : response.data.ErrorDetails.map(e => e.ErrorMessage)
                            })
                    }
                )
            } else 
                return res.status(500).send({
                    isMultipleError : false,
                    errorMessage : "E-Invoice is not created!"
                })
        } else 
            res.status(500).send({
                isMultipleError : false,
                errorMessage : "Unexpected error while cancelling invoice from e-invoicing!"
            })
    } catch (error) {
        console.error(JSON.stringify({
            traceId : req?.traceId,
            error: error,
            stack : error?.stack
        }))
        res.status(500).send({
            isMultipleError : false,
            errorMessage : "Unexpected error while cancelling invoice from e-invoicing!"
        })
    }
}
