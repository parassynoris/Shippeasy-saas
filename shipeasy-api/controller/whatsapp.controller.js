const { mongoose, Schema, invoiceSchema, uuid, jwt, crypto, axios, azureStorage, inAppNotificationService, querystring, nodemailer, pdfScanner, ediController, OpenAI, objecdiff, sendMessage, getTextMessageInput, fs, _, simpleParser, connect, imapConfig, transporter, getChangedFields, removeIdField, recordLogAudit, encryptObject, decryptObject, isSubset, createInAppNotification, replacePlaceholders, generateRandomPassword, triggerPointExecute, insertIntoTally, getTransporter, getChildCompany} = require('./helper.controller')

let userStates = {}

const quotationRateForWP = async (wpData) => {
    const { fromLocationId, toLocationId, containers } = wpData

    let fromLocationName = "", toLocationName = "";

    const containerRates = {}
    const RateMasterModel = mongoose.models[`RateMasterModel`] || mongoose.model(`RateMasterModel`, Schema["ratemaster"], `ratemasters`);
        
    for (let i = 0; i < containers.length; i++) {
        const container = containers[i]

        await RateMasterModel.find({ 'fromLocationId': fromLocationId, 'toLocationId': toLocationId, "containerSize": container.containerSize }).then(async function (ratemasters) {

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
            
            for(let c = 0; c < value.keys.length; c++){
                const conatiner = value.keys[c];
                const rate = await RateMasterModel.findOne({ 'fromLocationId': fromLocationId, 'toLocationId': toLocationId, "containerSize": conatiner, shippinglineId : id })
                
                containerWiseBreakDown.push({"conatiner" : conatiner, "rates" : rate.charges.map((charge) => {
                    return {
                        "name" : charge.costitemName,
                        "price" : charge.basis === "Suppliers " ? charge.price : containers.find((ctf) => ctf.containerSize === conatiner).numberOfContainers * charge.price,
                        "qty" : containers.find((ctf) => ctf.containerSize === conatiner).numberOfContainers,
                        "id" : charge.chargeName
                    }
                })})
            }

            const ShippingLineModel = mongoose.models[`ShippingLineModel`] || mongoose.model(`ShippingLineModel`, Schema["shippingline"], `shippinglines`);

            const shippingLine = await ShippingLineModel.findOne({ shippinglineId: id });
            const rate = await RateMasterModel.findOne({ 'fromLocationId': fromLocationId, 'toLocationId': toLocationId, "containerSize": {"$in" : value.keys}, shippinglineId : id })
            const CurrencyModel = mongoose.models[`CurrencyModel`] || mongoose.model(`CurrencyModel`, Schema["currency"], `currencys`);
            const currency = await CurrencyModel.findOne({currencyId : rate.currencyId})
            
            let countTotal = 0;
            for (let xe = 0; xe < containerWiseBreakDown.length; xe++){
                countTotal += containerWiseBreakDown[xe].rates.map(re=>re.price).reduce((partialSum, a) => partialSum + a, 0) || 0
            }

            return {
                "shippingLineName": shippingLine.name || 'Unknown',
                "shippingLineId": shippingLine.shippinglineId || 'Unknown',
                "cost": countTotal,
                "charges" : containerWiseBreakDown,
                "currency" : currency?.currencyName || "INR"
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

    const PortModel = mongoose.models[`PortModel`] || mongoose.model(`PortModel`, Schema["port"], `ports`);
    await PortModel.findOne({ 'portId': fromLocationId }).then(async function (port) {
        fromLocationName = port?.portDetails.portName
    })

    await PortModel.findOne({ 'portId': toLocationId }).then(async function (port) {
        toLocationName = port?.portDetails.portName
    })
    



    return { fromLocationName: fromLocationName, toLocationName: toLocationName, fromLocationId: fromLocationId, toLocationId: toLocationId, rates: dataToBeReturned }
}


async function sendWMessage(to, text) {
    try {
        axios.post(`https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
            messaging_product: 'whatsapp',
            to: to,
            type: 'text',
            text: { body: text }
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        }).then(response => {
            console.log('Message sent:', response.data);
        }).catch(error => {
            console.error('Error sending message:', error.response.data);
        });
    } catch (err) {
        console.log(err)
    }
}
async function sendFilteredPortMessage(to, text, action, textPort) {
    // const headers = {
    //     'Authorization': `Bearer ${ACCESS_TOKEN}`,
    //     'Content-Type': 'application/json'
    // };
    const portModel = mongoose.models[`portModel`] || mongoose.model(`portModel`, Schema["port"], `ports`);
    const portData = await portModel.find({
        "status": true,
        "portDetails.portName": {
            "$regex": textPort,
            "$options": "i"
        }
    }, {}, {limit : 10})
    
    const wpPort = portData.map((e) => {
        return { id: `${action}_${e.portId}`, title: e.portDetails.portName, description: e.portDetails.description }
    })

    try {
        const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'interactive',
            interactive: {
                type: 'list',
                header: {
                    type: 'text',
                    text: text
                },
                body: {
                    text: 'Please choose an option from the list below.'
                },
                footer: {
                    text: 'Select the appropriate port.'
                },
                action: {
                    button: 'Select Port',
                    sections: [
                        {
                            title: 'Ports',
                            rows: wpPort
                        }
                    ]
                }
            }
        };
    
        await axios.post(`https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, payload, {headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }})
            .then(response => {
                console.log('Interactive message sent:', response.data);
            })
            .catch(error => {
                console.error('Error sending interactive message:', error.response.data);
            });
    } catch (err) {
        console.log(err)
    }
}
async function sendButtonMessage(to, text, buttons) {
    const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'interactive',
        interactive: {
            type: 'button',
            body: {
                text: text
            },
            action: {
                buttons: buttons
            }
        }
    };

    axios.post(`https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, payload, {
        headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    }).then(response => {
        console.log('Button message sent:', response.data);
    }).catch(error => {
        console.error('Error sending button message:', error);
    });
}
async function sendFilteredContainerMessage(to, text, action) {
    // const headers = {
    //     'Authorization': `Bearer ${ACCESS_TOKEN}`,
    //     'Content-Type': 'application/json'
    // };
    const systemtypeModel = mongoose.models[`systemtypeModel`] || mongoose.model(`systemtypeModel`, Schema["systemtype"], `systemtypes`);
    const systemTypeData = await systemtypeModel.find({typeCategory :"containerType", status : true}, {}, {limit : 10})
    
    const wpSystemTypes = systemTypeData.map((e) => {
        return { id: `${action}_${e.systemtypeId}`, title: e.typeName, description: e.typeDescription}
    })

    try {
        const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'interactive',
            interactive: {
                type: 'list',
                header: {
                    type: 'text',
                    text: text
                },
                body: {
                    text: 'Please choose an option from the list below.'
                },
                footer: {
                    text: 'Select the appropriate container type.'
                },
                action: {
                    button: 'Select Containers',
                    sections: [
                        {
                            title: 'Containers',
                            rows: wpSystemTypes
                        }
                    ]
                }
            }
        };
    
        axios.post(`https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, payload, {headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }})
            .then(response => {
                console.log('Interactive message sent:', response.data);
            })
            .catch(error => {
                console.error('Error sending interactive message:', error.response.data);
            });
    } catch (err) {
        console.log(err)
    }
}






exports.verificationWebhookWhatsapp = async (req, res, next) => {
    // Verification for Webhook
    const VERIFY_TOKEN = '2o213JAoHp0wHpxjgP6lBPamzlxXhlIRAJ1AKEW5Tjf1i5FXrkkFrVLIx1HIl9jQQA5rxBG96u93USrwRk46Wax7SMoLcppbLQoIzFi39OCJ2o4B53S7YUD9I1WpWGZMWqDlhquUDISycWeMdBDe8drCpiH9WuQCGDZdxmhPvaPzj2yPw76bxVKj0sdPxb0IpwSrC9UQFz35w5XUwJEcgy7uTBBWrWSL9Q55JzQGwxzlMr4ommbajvi05xj4If8S';

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
}
