var axios = require('axios');

function sendMessage(data) {
  var config = {
    method: 'post',
    url: `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: data
  };

  return axios(config)
}

function getTextMessageInput(recipient, templateName, parameters) {
  return JSON.stringify({
    "messaging_product": "whatsapp",
    "preview_url": false,
    "recipient_type": "individual",
    "to": recipient,
    "type": "template",
    "template": {
      "name": templateName,
      "language": {
          "code": "en_US"
      },
      "components": [
          {
              "type": "body",
              "parameters": parameters.map(e => {return {type : "text", text : e}})
          }
      ]
  }
  });
}

module.exports = {
  sendMessage: sendMessage,
  getTextMessageInput: getTextMessageInput
};