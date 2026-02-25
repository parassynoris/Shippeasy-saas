const { mongoose, Schema, invoiceSchema, uuid, jwt, crypto, axios, azureStorage, inAppNotificationService, querystring, nodemailer, pdfScanner, ediController, OpenAI, objecdiff, sendMessage, getTextMessageInput, fs, _, simpleParser, connect, imapConfig, transporter, getChangedFields, removeIdField, recordLogAudit, encryptObject, decryptObject, isSubset, createInAppNotification, replacePlaceholders, generateRandomPassword, triggerPointExecute, insertIntoTally, getTransporter, getChildCompany} = require('./helper.controller')

exports.oceanIOWebhook = async (req, res, next) => {
    const containereventModel = mongoose.models[`containereventModel`] || mongoose.model(`containereventModel`, Schema["containerevent"], `containerevents`);

    const events = req?.body?.events;
	              
    for(let i = 0; i < events?.length; i++){
        const tempModel = containereventModel({
            ...events[i],
            addedByWebhook : true
        })
        await tempModel.save()
    }

    res.send(req.body)
}

exports.webhookWhatsapp = async (req, res, next) => {
    const currencySymbols = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        INR: '₹',
        JPY: '¥',
        CNY: '¥',
        AUD: 'A$',
        CAD: 'C$',
    };

    try {
        const data = req.body;
        const whatsappModel = mongoose.models[`whatsappModel`] || mongoose.model(`whatsappModel`, Schema["whatsapp"], `whatsapps`);
        await whatsappModel({...data, createdOn : new Date().toISOString()}).save();

        if (data.entry && data.entry[0] && data.entry[0].changes && data.entry[0].changes[0]) {
            const change = data.entry[0].changes[0];
            if (change.value.statuses) {
                const status = change.value.statuses[0];
                res.sendStatus(200);
                return;
            }

            if (change.value.messages && change.value.messages[0]) {
                const message = change.value.messages[0];
                const fromNumber = message.from;

                if (message.interactive && message.interactive.list_reply) {
                    const selectedId = message.interactive.list_reply.id;
                    const userState = userStates[fromNumber];

                    if (!userStates[fromNumber]) {
                        userStates[fromNumber] = { stage: '' };
                    }

                    if (selectedId.startsWith('load_port')) {
                        userState.fromLocation = message.interactive.list_reply.title;
                        userState.fromLocationId = message.interactive.list_reply.id.replace("load_port_", "");
                        
                        sendWMessage(fromNumber, 'Please enter the first few letters of the Dest Port');
                        userState.stage = 'awaiting_dest_port_filter';
                    } else if (selectedId.startsWith('dest_port')) {
                        userState.toLocation = message.interactive.list_reply.title;
                        userState.toLocationId = message.interactive.list_reply.id.replace("dest_port_", "");
                        

                        sendFilteredContainerMessage(fromNumber, 'Please select the Container Type', 'container_type');
                        
                        // sendWMessage(fromNumber, `Quote request received. Load Port: ${loadPort}, Destination Port: ${destPort}`);
                        userState.stage = 'awaiting_container_type';
                    } else if (selectedId.startsWith('container_type')) {
                        if(userState.containers) {
                            userState.containers.push({
                                containerSize : message.interactive.list_reply.title,
                                numberOfContainers : 0
                            })
                        } else {
                            userState["containers"] = [{
                                containerSize : message.interactive.list_reply.title,
                                numberOfContainers : 0
                            }]
                        }

                        sendWMessage(fromNumber, 'Please enter number of container');
                        
                        // sendWMessage(fromNumber, `Quote request received. Load Port: ${loadPort}, Destination Port: ${destPort}`);
                        userState.stage = 'awaiting_container_count';
                    }
                } else if (message.interactive && message.interactive.button_reply) {
                    const buttonId = message.interactive.button_reply.id;
                    const userState = userStates[fromNumber];

                    if (buttonId === 'get_a_quote') {
                        // userStates[fromNumber] = { stage: '' };
                        sendWMessage(fromNumber, 'Please enter the first few letters of the Load Port');
                        userState.stage = 'awaiting_load_port_filter';
                    } else if (buttonId === 'track_a_booking') {
                        sendWMessage(fromNumber, 'Please enter your booking number');
                        userState.stage = 'awaiting_booking_number';
                    } else if (buttonId === 'no_need_more_container') {
                        
                        // sendWMessage(fromNumber, JSON.stringify(await quotationRateForWP(userState)));
                        const quotationData = await quotationRateForWP(userState)

                        if (quotationData?.rates?.length > 0){
                            for(let r = 0; r < quotationData?.rates.length; r++){
                                const buttonId = uuid.v1();
                                const rates =  quotationData?.rates[r];
                                if(!(userState.rates)){
                                    userState.rates = []
                                }
                                userState.rates.push({
                                    rateId : buttonId,
                                    ...rates
                                })
                                const buttons = [
                                    {
                                        type: 'reply',
                                        reply: {
                                            id: `see_detail_${buttonId}`,
                                            title: 'See Details'
                                        }
                                    }
                                ];

                                let textMessage = "";
                                textMessage += "*Shipping Line* : " + rates.shippingLineName + "\n"
                                textMessage += `*Total Cost* : ${rates.cost}${currencySymbols[rates.currency]}  \n`
                                
                                sendButtonMessage(fromNumber, textMessage, buttons);      
                            }
                        } else {
                            sendWMessage(fromNumber, 'No quick quotes available for selected route.');

                            const buttons = [
                                {
                                    type: 'reply',
                                    reply: {
                                        id: 'get_a_quote',
                                        title: 'Get a Quote'
                                    }
                                },
                                {
                                    type: 'reply',
                                    reply: {
                                        id: 'track_a_booking',
                                        title: 'Track a Booking'
                                    }
                                },
                                {
                                    type: 'reply',
                                    reply: {
                                        id: 'track_container',
                                        title: 'Track Container'
                                    }
                                }
                            ];
                            
                            sendButtonMessage(fromNumber, 'Welcome! Please choose an option:', buttons);
                        
                            userState.stage = "welcome"
                        }

                                                

                        userState.stage = 'awaiting_confirmation';
                    } else if (buttonId === 'need_more_container') {
                        sendFilteredContainerMessage(fromNumber, 'Please select the Container Type', 'container_type');
                        
                        userState.stage = 'awaiting_container_type';
                    } else if (buttonId.startsWith("see_detail")){
                        const rateId = buttonId.replace("see_detail_", "")

                        const rateDetails = userState.rates.find(e => e.rateId === rateId)

                        const buttons = [
                            {
                                type: 'reply',
                                reply: {
                                    id: `request_now_${rateId}`,
                                    title: 'Request Now'
                                }
                            }
                        ];

                        
                        let textMessage = "";

                        for (let c = 0; c < rateDetails.charges.length; c++){
                            textMessage += `${c+1}). *${rateDetails.charges[c].conatiner}*\n\n`

                            for (let r = 0; r < rateDetails.charges[c].rates.length; r++){
                                textMessage += `${rateDetails.charges[c].rates[r].name} of ${rateDetails.charges[c].rates[r].price}${currencySymbols[rateDetails.currency]}\n`    
                            }

                            textMessage += "\n\n"
                        }

                        sendButtonMessage(fromNumber, textMessage, buttons);  
                        userState.stage  = "welcome"
                    } else if (buttonId.startsWith("request_now")){   
                        const rateId = buttonId.replace("request_now_", "")
                        let textToBeReturned = "";
                        
                        textToBeReturned += `From : ${userState.fromLocation}</br></br>`
                        textToBeReturned += `To : ${userState.toLocation}</br></br>`
                        textToBeReturned += `For this containers</br></br>`

                        for (let i = 0; i < userState.containers.length; i++){
                            textToBeReturned += `&nbsp;&nbsp;&nbsp;${i+1}). <b>${userState.containers[i].numberOfContainers}</b> * <b>${userState.containers[i].containerSize}</b>\n`
                        }

                        textToBeReturned += `</br><h3>Displayed Rates</h3></br>`

                        for (let i = 0; i < userState.rates.length; i++){
                            textToBeReturned += `&nbsp;&nbsp;&nbsp;${i+1}). Shipping Line : <b>${userState.rates[i].shippingLineName}</b></br>`
                            textToBeReturned += `&nbsp;&nbsp;&nbsp;${i+1}). Cost : <b>${userState.rates[i].cost}</b></br></br>`
                        }

                        textToBeReturned += `<h3>Selected Rate</h3></br>`

                        textToBeReturned += `&nbsp;&nbsp;&nbsp;Shipping Line : <b>${userState.rates.find(e => e.rateId === rateId).shippingLineName}</b></br>`
                        textToBeReturned += `&nbsp;&nbsp;&nbsp;Cost : <b>${userState.rates.find(e => e.rateId === rateId).cost}</b></br></br>`
                        
                        const mailOptions = {
                            from: '"Shipeasy" <shipeasy.in@gmail.com>',
                            to: ["shipeasy.in@gmail.com"],
                            cc: [],
                            subject: `Enquiry created from whatsapp no ${fromNumber}`,
                            text: '',
                            html: textToBeReturned
                        };
    
                        userStates[fromNumber] = { stage: 'welcome' };
                        
                        textToBeReturned="";
                        
                        for (let i = 0; i < userState.containers.length; i++){
                            textToBeReturned += `${userState.containers[i].numberOfContainers} * ${userState.containers[i].containerSize} container`
                            if(!(i === userState.containers.length-1))
                                textToBeReturned +=`,\n`
                        }
                        
                        sendWMessage(fromNumber, `Congratulations! Your Inquiry request for  ${textToBeReturned} from ${userState.fromLocation} to ${userState.toLocation} has been generated. \n\nOur Sale Agent will reach you shortly.`);
                        
                        
                        
                        const buttons = [
                            {
                                type: 'reply',
                                reply: {
                                    id: 'get_a_quote',
                                    title: 'Get a Quote'
                                }
                            },
                            {
                                type: 'reply',
                                reply: {
                                    id: 'track_a_booking',
                                    title: 'Track a Booking'
                                }
                            },
                            {
                                type: 'reply',
                                reply: {
                                    id: 'track_container',
                                    title: 'Track Container'
                                }
                            }
                        ];
                        sendButtonMessage(fromNumber, 'How may I help you again?\nPlease choose an option:', buttons);
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return error
                            }
                            return `Message sent: ${info.messageId}`
                        });
                    } else if (buttonId === 'track_container') {
                        sendWMessage(fromNumber, 'Please enter your container number');
                        userState.stage = 'awaiting_container_number';
                    }
                } else {
                    const messageBody = message.text.body;

                    if (!userStates[fromNumber]) {
                        userStates[fromNumber] = { stage: 'welcome' };
                    }

                    const userState = userStates[fromNumber];

                    if (userState.stage === 'welcome') {
                        const buttons = [
                            {
                                type: 'reply',
                                reply: {
                                    id: 'get_a_quote',
                                    title: 'Get a Quote'
                                }
                            },
                            {
                                type: 'reply',
                                reply: {
                                    id: 'track_a_booking',
                                    title: 'Track a Booking'
                                }
                            },
                            {
                                type: 'reply',
                                reply: {
                                    id: 'track_container',
                                    title: 'Track Container'
                                }
                            }
                        ];
                        sendButtonMessage(fromNumber, 'Welcome! Please choose an option:', buttons);
                    } else if (userState.stage === 'awaiting_booking_number') {
                        const bookingNumber = messageBody;
                        sendWMessage(fromNumber, `Tracking information for booking number ${bookingNumber}`);
                        userState.stage = 'welcome';
                    } else if (userState.stage === 'awaiting_load_port_filter') {
                        sendFilteredPortMessage(fromNumber, 'Please select the Load Port', 'load_port', messageBody);
                        userState.stage = 'awaiting_load_port';
                    } else if (userState.stage === 'awaiting_dest_port_filter') {
                        sendFilteredPortMessage(fromNumber, 'Please select the Dest Port', 'dest_port', messageBody);
                        userState.stage = 'awaiting_dest_port';
                    } else if (userState.stage === 'awaiting_container_count') {
                        userState.containers[userState.containers.length - 1].numberOfContainers = Number(messageBody)

                        const buttons = [
                            {
                                type: 'reply',
                                reply: {
                                    id: 'need_more_container',
                                    title: 'Yes'
                                }
                            },
                            {
                                type: 'reply',
                                reply: {
                                    id: 'no_need_more_container',
                                    title: 'No, Confirm now!'
                                }
                            }
                        ];
                        sendButtonMessage(fromNumber, 'Want to add more container?', buttons);
                    } else if (userState.stage === 'awaiting_container_number') {
                        const containerNumber = messageBody;
                        let result =await trackContainer(containerNumber)
                        if(result.error) {
                            sendWMessage(fromNumber, result.error );
                         } else {
                            sendWMessage(fromNumber, result );
                        }
                        userState.stage = 'welcome';
                    }
                }
            }
        }

        res.sendStatus(200);
    } catch (err) {
        console.error(JSON.stringify({
            traceId : req?.traceId,
            error: err,
            stack : err?.stack
        }))
        res.sendStatus(500);
    }
}