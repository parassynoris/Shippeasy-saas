const mongoose = require('mongoose');
const Schema = require('../schema/schema');
const invoiceSchema = require('../schema/invoiceSchema');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const azureStorage = require('./azureStorageContoller')
const inAppNotificationService = require('../service/inAppNotification')
const querystring = require('querystring');
const nodemailer = require('nodemailer');
const pdfScanner = require("pdf-parse")
const ediController = require('../controller/ediController')
const OpenAI = require("openai")
const objecdiff = require('objecdiff');
const openAIClient = new OpenAI({
    apiKey: process.env.OPENAI_API, // This is the default and can be omitted
});
const { sendMessage, getTextMessageInput } = require("./../service/messageHelper");
const fs = require('fs');
const _ = require('lodash');
const simpleParser = require('mailparser').simpleParser;
const { connect } = require('imap-simple');
const path = require("path");

const imapConfig = {
    imap: {
        user: process.env.EMAIL_SMTP,
        password: process.env.PASS_SMTP,
        host: process.env.SERVER_SMTP,
        port: 993,
        tls: true,
        authTimeout: 3000,
        tlsOptions: {
            rejectUnauthorized: false // Ignore SSL/TLS errors
        }
    }
};
let transporter = nodemailer.createTransport({
    host: process.env.SERVER_SMTP,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_SMTP, // your email
        pass: process.env.PASS_SMTP // your password or App Password for Gmail
    }
});

function getSenderName(agent) {
    return `${agent?.agentName}" <${agent?.emailConfig?.emailId}>`
}

function getChangedFields(original, updated) {
    return objecdiff.diff(original, updated)
}
function removeIdField(obj) {
    // Create a new object without the _id field
    const { _id, ...rest } = obj;

    // Iterate over each key in the object
    for (const key in rest) {
        // If the value is an array, remove _id from objects inside the array
        if (Array.isArray(rest[key])) {
            rest[key] = rest[key].map(item => {
                if (typeof item === 'object') {
                    return removeIdField(item); // Recursively handle objects in the array
                }
                return item; // Return non-object items unchanged
            });
        }
        // If the value is an object, remove _id from the object recursively
        else if (typeof rest[key] === 'object' && rest[key] !== null) {
            rest[key] = removeIdField(rest[key]); // Recursively handle nested objects
        }
    }

    return rest;
}
const diffInDays = (from, to = new Date()) => {
    if (!from) return null;

    const start = new Date(from);
    const end = new Date(to);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

async function recordLogAudit(req, action, resource, resourceId, oldPayload, newPayload) {
    const auditlogModel = mongoose.models[`auditlogModel`] || mongoose.model(`auditlogModel`, Schema["logaudit"], `logaudits`);

    try {
        await auditlogModel({
            action,
            traceId: req.traceId,
            userId: req.userId,  // Assuming `req.user` is populated by authentication middleware
            resource,
            resourceId,
            changes: action === "UPDATE" ? getChangedFields(removeIdField(oldPayload?.toObject()), removeIdField(newPayload?.toObject())) : { after: newPayload },
            requestDetails: {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
            },
            recordedOn: new Date().toISOString()
        }).save();
    } catch (error) {
        console.error('Error logging audit:', error);
    }
}
function encryptObject(obj, secretKey) {
    const text = JSON.stringify(obj);

    // Generate a 32-byte key from the secretKey
    const key = crypto.createHash('sha256').update(secretKey).digest();

    // Generate a random 16-byte IV
    const iv = crypto.randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV + encrypted text, separated by ':'
    return iv.toString('hex') + ':' + encrypted;
}

function decryptObject(encryptedText, secretKey) {
    // Extract IV and encrypted text
    const [ivHex, encrypted] = encryptedText.split(':');

    // Convert IV back to Buffer
    const iv = Buffer.from(ivHex, 'hex');

    // Derive the same 32-byte key
    const key = crypto.createHash('sha256').update(secretKey).digest();

    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
}
function isSubset(obj1, obj2) {
    if (obj1 == undefined) {
        console.log("      ❌ obj1 (trigger.value) is undefined");
        return false;
    }

    console.log("      🔍 Checking isSubset:");
    console.log("        obj1 (trigger.value):", JSON.stringify(obj1));
    console.log("        obj2 keys being checked:", Object.keys(obj1).join(', '));

    for (const key in obj1) {
        const val1 = _.get(obj1, key);
        const val2 = _.get(obj2, key);

        console.log(`        Comparing '${key}': "${val1}" === "${val2}" ? ${val1 === val2}`);

        if (val1 !== val2) {
            console.log(`        ❌ Mismatch at key '${key}'`);
            return false;
        }
    }

    console.log("        ✅ isSubset match found!");
    return true;
}
async function createInAppNotification(req, notificationName, notificationDescription, userData) {
    let notificationData = {};

    notificationData.createdOn = new Date().toISOString();
    notificationData.email = userData?.userEmail
    notificationData.inappnotificationId = uuid.v1();
    notificationData.notificationName = notificationName;
    notificationData.notificationType = "temp";
    notificationData.description = notificationDescription || ""
    notificationData.notificationURL = "";
    notificationData.read = false;
    notificationData.tenantId = userData?.tenantId
    notificationData.userId = userData?.userId
    notificationData.createdBy = "AUTO"
    notificationData.orgId = userData?.orgId
    notificationData.userLogin = userData?.userLogin
    notificationData.module = "SE"

    const InAppNotificationModel = mongoose.models[`InAppNotificationModel`] || mongoose.model(`InAppNotificationModel`, Schema["inappnotification"], `inappnotifications`);
    const document = InAppNotificationModel(notificationData);

    const options = {
        returnDocument: 'after',
        projection: { _id: 0, __v: 0 },
    };

    document.save(options).then(async savedDocument => {

        inAppNotificationService.sendNotification("inAppNotification", savedDocument);
        const documentWithoutId = savedDocument.toObject({ transform: (doc, ret) => { delete ret._id; } });

    }).catch(function (err) {
        console.error(JSON.stringify({
            traceId: req.traceId,
            error: err,
            stack: err.stack
        }))
    });
}
function replacePlaceholdersETASTUTS(html, params) {
    const rowRegex = /{{params\.row\.(.+?)}}/g; // Match `params.row.events.eventName`

    // Detect <tr> rows containing `params.row` anywhere (not just first td)
    const rowPatternMatch = html.match(/<tr>(\s*<td>.*?{{params\.row\.(.+?)}}.*?<\/tr>)/s);

    if (rowPatternMatch) {
        let rowTemplate = rowPatternMatch[0]; // Extract the full <tr> template
        let fullPath = rowPatternMatch[2]; // Example: "events.eventName"

        // Extract array key from the placeholder (e.g., "events" from "events.eventName")
        const keys = fullPath.split(".");
        let arrayKey = keys.shift(); // First key should be the iterable array (e.g., "events")

        // Validate if `params` contains the array
        if (!params[arrayKey] || !Array.isArray(params[arrayKey])) {
            return html; // Return unchanged if the array is missing
        }

        let dataArray = params[arrayKey]; // Extract the array

        // Generate new rows dynamically, ensuring <tr> is properly included
        let newRows = dataArray
            .map((item) => {
                let row = rowTemplate.replace(rowRegex, (match, path) => {
                    const subKeys = path.split(".");
                    let value = item; // Start from the current row object

                    for (let [i, key] of subKeys.slice(1).entries()) {
                        if (value === undefined) break;

                        if (key === 'loop' && Array.isArray(value)) {
                            const nestedKey = subKeys.slice(1)[i + 1];
                            if (!nestedKey) return match;
                            return Array.from(
                                new Set(value.map(item => item[nestedKey]).filter(v => v !== undefined))
                            ).join(', ');
                        } else if (key === 'pattern' && Array.isArray(value)) {
                            const noOfContainerKey = subKeys.slice(1)[i + 1];
                            const containerTypeKey = subKeys.slice(1)[i + 2];
                            if (!noOfContainerKey || !containerTypeKey) return match;

                            // Group by containerType and sum noOfContainer
                            const grouped = value.reduce((acc, item) => {
                                const type = item[containerTypeKey];
                                let count = item[noOfContainerKey];
                                if (!type || count === undefined) return acc;

                                try {
                                    if (typeof count === "string") {
                                        count = Number(count)
                                    }
                                } catch (error) {
                                    console.log("replacePlaceholders Function : Error while converting the count to type Number");
                                }


                                if (!acc[type]) acc[type] = 0;
                                acc[type] += count;
                                return acc;
                            }, {});

                            return Object.entries(grouped)
                                .map(([type, count]) => `${count} X ${type}`)
                                .join(', ');
                        } else if (key === 'or') {
                            const nestedKey = subKeys.slice(1)[i + 1];
                            if (!nestedKey) return match;
                            return value === "-" ? item[nestedKey] : value;
                        }
                        value = value[key];
                    }

                    return value !== undefined ? value : match; // Replace if found, else keep placeholder
                });

                // Also replace non-row params placeholders within the row (like {{params.batchNo}})
                row = row.replace(/{{params\.([^.}]+)}}/g, (match, key) => {
                    return params[key] !== undefined ? params[key] : match;
                });

                return row;
            })
            .join("\n");

        // Replace the detected row with all generated rows
        html = html.replace(rowTemplate, newRows);
    }

    // Replace other placeholders outside of rows
    const regex = /{{params\.(.+?)}}/g;
    html = html.replace(regex, (match, path) => {
        const keys = path.split('.');
        let value = params;

        for (let i = 0; i < keys.length; i++) {
            if (value === undefined) break;

            if (keys[i] === 'length' && Array.isArray(value)) {
                return value.length;
            }

            if (keys[i] === 'loop' && Array.isArray(value)) {
                const nestedKey = keys[i + 1];
                if (!nestedKey) return match;
                return Array.from(
                    new Set(value.map(item => item[nestedKey]).filter(v => v !== undefined))
                ).join(', ');
            }
            // loopmerge logic --> {{params.loopmerge.array1.array2.field}}
            if (keys[i] === 'loopmerge') {
                const array1Key = keys[i + 1];
                const array2Key = keys[i + 2];
                const fieldKey = keys[i + 3];

                if (!array1Key || !array2Key || !fieldKey) return match;

                const merged = [];

                const pushFromSource = (src) => {
                    if (src === undefined || src === null) return;

                    // If src is array → loop
                    if (Array.isArray(src)) {
                        src.forEach(item => {
                            if (item && typeof item === "object" && fieldKey in item) {
                                merged.push(item[fieldKey]);
                            } else {
                                merged.push(item); // for raw values inside array
                            }
                        });
                        return;
                    }

                    // If src is object → extract field or raw
                    if (typeof src === "object") {
                        if (fieldKey in src) merged.push(src[fieldKey]);
                        return;
                    }

                    // If primitive (string/number) → push as it is
                    merged.push(src);
                };

                pushFromSource(params[array1Key]);
                pushFromSource(params[array2Key]);

                return [...new Set(
                    merged.filter(v => v !== undefined && v !== null && v !== "")
                )].join(', ');
            }
            if (keys[i] === 'sum' && Array.isArray(value)) {
                const nestedKey = keys[i + 1];
                if (!nestedKey) {

                    if (value.every(iValue => typeof iValue === "number")) {

                        return value
                            .map(item => item)
                            .filter(v => v !== undefined)
                            .reduce((partialSum, a) => partialSum + a, 0);
                    }

                    return match;
                }

                return value
                    .map(item => item[nestedKey])
                    .filter(v => v !== undefined)
                    .reduce((partialSum, a) => partialSum + a, 0);
            }

            if (keys[i] === 'pattern' && Array.isArray(value)) {
                const noOfContainerKey = keys[i + 1];
                const containerTypeKey = keys[i + 2];
                if (!noOfContainerKey || !containerTypeKey) return match;

                // Group by containerType and sum noOfContainer
                const grouped = value.reduce((acc, item) => {
                    const type = item[containerTypeKey];
                    const count = item[noOfContainerKey];
                    if (!type || count === undefined) return acc;

                    if (!acc[type]) acc[type] = 0;
                    acc[type] += count;
                    return acc;
                }, {});

                return Object.entries(grouped)
                    .map(([type, count]) => `${count} X ${type}`)
                    .join(', ');
            }

            value = value[keys[i]];
        }

        return value !== undefined ? value : match;
    });

    return html;
}
function replacePlaceholders(html, params) {
    const rowRegex = /{{params\.row\.(.+?)}}/g; // Match `params.row.events.eventName`

    // Detect the first <tr> row pattern containing `params.row`
    const rowPatternMatch = html.match(/<tr>\s*(<td>{{params\.row\.(.+?)}}<\/td>.*?<\/tr>)/s);

    if (rowPatternMatch) {
        let rowTemplate = rowPatternMatch[0]; // Extract the full <tr> template
        let fullPath = rowPatternMatch[2]; // Example: "events.eventName"

        // Extract array key from the placeholder (e.g., "events" from "events.eventName")
        const keys = fullPath.split(".");
        let arrayKey = keys.shift(); // First key should be the iterable array (e.g., "events")

        // Validate if `params` contains the array
        if (!params[arrayKey] || !Array.isArray(params[arrayKey])) {
            return html; // Return unchanged if the array is missing
        }

        let dataArray = params[arrayKey]; // Extract the array

        // Generate new rows dynamically, ensuring <tr> is properly included
        let newRows = dataArray
            .map((item) => {
                return rowTemplate.replace(rowRegex, (match, path) => {
                    const subKeys = path.split(".");
                    let value = item; // Start from the current row object

                    for (let [i, key] of subKeys.slice(1).entries()) {
                        if (value === undefined) break;

                        if (key === 'loop' && Array.isArray(value)) {
                            const nestedKey = subKeys.slice(1)[i + 1];
                            if (!nestedKey) return match;
                            return Array.from(
                                new Set(value.map(item => item[nestedKey]).filter(v => v !== undefined))
                            ).join(', ');
                        } else if (key === 'pattern' && Array.isArray(value)) {
                            const noOfContainerKey = subKeys.slice(1)[i + 1];
                            const containerTypeKey = subKeys.slice(1)[i + 2];
                            if (!noOfContainerKey || !containerTypeKey) return match;

                            // Group by containerType and sum noOfContainer
                            const grouped = value.reduce((acc, item) => {
                                const type = item[containerTypeKey];
                                let count = item[noOfContainerKey];
                                if (!type || count === undefined) return acc;

                                try {
                                    if (typeof count === "string") {
                                        count = Number(count)
                                    }
                                } catch (error) {
                                    console.log("replacePlaceholders Function : Error while converting the count to type Number");
                                }


                                if (!acc[type]) acc[type] = 0;
                                acc[type] += count;
                                return acc;
                            }, {});

                            return Object.entries(grouped)
                                .map(([type, count]) => `${count} X ${type}`)
                                .join(', ');
                        } else if (key === 'or') {
                            const nestedKey = subKeys.slice(1)[i + 1];
                            if (!nestedKey) return match;
                            return value === "-" ? item[nestedKey] : value;
                        }
                        value = value[key];
                    }

                    return value !== undefined ? value : match; // Replace if found, else keep placeholder
                });
            })
            .join("\n");

        // Replace the detected row with all generated rows
        html = html.replace(rowTemplate, newRows);
    }

    // Replace other placeholders outside of rows
    const regex = /{{params\.(.+?)}}/g;
    html = html.replace(regex, (match, path) => {
        const keys = path.split('.');
        let value = params;

        for (let i = 0; i < keys.length; i++) {
            if (value === undefined) break;

            if (keys[i] === 'length' && Array.isArray(value)) {
                return value.length;
            }

            if (keys[i] === 'loop' && Array.isArray(value)) {
                const nestedKey = keys[i + 1];
                if (!nestedKey) return match;
                return Array.from(
                    new Set(value.map(item => item[nestedKey]).filter(v => v !== undefined))
                ).join(', ');
            }
            // loopmerge logic --> {{params.loopmerge.array1.array2.field}}
            if (keys[i] === 'loopmerge') {
                const array1Key = keys[i + 1];
                const array2Key = keys[i + 2];
                const fieldKey = keys[i + 3];

                if (!array1Key || !array2Key || !fieldKey) return match;

                const merged = [];

                const pushFromSource = (src) => {
                    if (src === undefined || src === null) return;

                    // If src is array → loop
                    if (Array.isArray(src)) {
                        src.forEach(item => {
                            if (item && typeof item === "object" && fieldKey in item) {
                                merged.push(item[fieldKey]);
                            } else {
                                merged.push(item); // for raw values inside array
                            }
                        });
                        return;
                    }

                    // If src is object → extract field or raw
                    if (typeof src === "object") {
                        if (fieldKey in src) merged.push(src[fieldKey]);
                        return;
                    }

                    // If primitive (string/number) → push as it is
                    merged.push(src);
                };

                pushFromSource(params[array1Key]);
                pushFromSource(params[array2Key]);

                return [...new Set(
                    merged.filter(v => v !== undefined && v !== null && v !== "")
                )].join(', ');
            }
            if (keys[i] === 'sum' && Array.isArray(value)) {
                const nestedKey = keys[i + 1];
                if (!nestedKey) {

                    if (value.every(iValue => typeof iValue === "number")) {

                        return value
                            .map(item => item)
                            .filter(v => v !== undefined)
                            .reduce((partialSum, a) => partialSum + a, 0);
                    }

                    return match;
                }

                return value
                    .map(item => item[nestedKey])
                    .filter(v => v !== undefined)
                    .reduce((partialSum, a) => partialSum + a, 0);
            }

            if (keys[i] === 'pattern' && Array.isArray(value)) {
                const noOfContainerKey = keys[i + 1];
                const containerTypeKey = keys[i + 2];
                if (!noOfContainerKey || !containerTypeKey) return match;

                // Group by containerType and sum noOfContainer
                const grouped = value.reduce((acc, item) => {
                    const type = item[containerTypeKey];
                    const count = item[noOfContainerKey];
                    if (!type || count === undefined) return acc;

                    if (!acc[type]) acc[type] = 0;
                    acc[type] += count;
                    return acc;
                }, {});

                return Object.entries(grouped)
                    .map(([type, count]) => `${count} X ${type}`)
                    .join(', ');
            }

            value = value[keys[i]];
        }

        return value !== undefined ? value : match;
    });

    return html;
}
function replacePlaceholders48_hour(html, params) {
    const rowRegex = /{{params\.row\.(.+?)}}/g; // Match `params.row.events.eventName`

    // Detect the first <tr> row pattern containing `params.row`
    const rowPatternMatch = html.match(/<tr>\s*(<td>{{params\.row\.(.+?)}}<\/td>.*?<\/tr>)/s);

    if (rowPatternMatch) {
        let rowTemplate = rowPatternMatch[0]; // Extract the full <tr> template
        let fullPath = rowPatternMatch[2]; // Example: "events.eventName"

        // Extract array key from the placeholder (e.g., "events" from "events.eventName")
        const keys = fullPath.split(".");
        let arrayKey = keys.shift(); // First key should be the iterable array (e.g., "events")

        // Validate if `params` contains the array
        if (!params[arrayKey] || !Array.isArray(params[arrayKey])) {
            return html; // Return unchanged if the array is missing
        }

        let dataArray = params[arrayKey]; // Extract the array

        // Generate new rows dynamically, ensuring <tr> is properly included
        let newRows = dataArray
            .map((item) => {
                return rowTemplate.replace(rowRegex, (match, path) => {
                    const subKeys = path.split(".");
                    let value = item; // Start from the current row object

                    for (let [i, key] of subKeys.slice(1).entries()) {
                        if (value === undefined) break;

                        if (key === 'loop' && Array.isArray(value)) {
                            const nestedKey = subKeys.slice(1)[i + 1];
                            if (!nestedKey) return match;
                            return Array.from(
                                new Set(value.map(item => item[nestedKey]).filter(v => v !== undefined))
                            ).join(', ');
                        } else if (key === 'pattern' && Array.isArray(value)) {
                            const noOfContainerKey = subKeys.slice(1)[i + 1];
                            const containerTypeKey = subKeys.slice(1)[i + 2];
                            if (!noOfContainerKey || !containerTypeKey) return match;

                            // Group by containerType and sum noOfContainer
                            const grouped = value.reduce((acc, item) => {
                                const type = item[containerTypeKey];
                                let count = item[noOfContainerKey];
                                if (!type || count === undefined) return acc;

                                try {
                                    if (typeof count === "string") {
                                        count = Number(count)
                                    }
                                } catch (error) {
                                    console.log("replacePlaceholders Function : Error while converting the count to type Number");
                                }


                                if (!acc[type]) acc[type] = 0;
                                acc[type] += count;
                                return acc;
                            }, {});

                            return Object.entries(grouped)
                                .map(([type, count]) => `${count} X ${type}`)
                                .join(', ');
                        } else if (key === 'or') {
                            const nestedKey = subKeys.slice(1)[i + 1];
                            if (!nestedKey) return match;
                            return value === "-" ? item[nestedKey] : value;
                        }
                        value = value[key];
                    }

                    return value !== undefined ? value : match; // Replace if found, else keep placeholder
                });
            })
            .join("\n");

        // Replace the detected row with all generated rows
        html = html.replace(rowTemplate, newRows);
    }

    // Replace other placeholders outside of rows
    const regex = /{{params\.(.+?)}}/g;
    html = html.replace(regex, (match, path) => {
        const keys = path.split('.');
        let value = params;

        for (let i = 0; i < keys.length; i++) {
            if (value === undefined) break;

            if (keys[i] === 'length' && Array.isArray(value)) {
                return value.length;
            }

            if (keys[i] === 'loop' && Array.isArray(value)) {
                const nestedKey = keys[i + 1];
                if (!nestedKey) return match;
                return Array.from(
                    new Set(value.map(item => item[nestedKey]).filter(v => v !== undefined))
                ).join(', ');
            }
            // loopmerge logic --> {{params.loopmerge.array1.array2.field}}
            if (keys[i] === 'loopmerge') {
                const array1Key = keys[i + 1];
                const array2Key = keys[i + 2];
                const fieldKey = keys[i + 3];

                if (!array1Key || !array2Key || !fieldKey) return match;

                const merged = [];

                const pushFromSource = (src) => {
                    if (src === undefined || src === null) return;

                    // If src is array → loop
                    if (Array.isArray(src)) {
                        src.forEach(item => {
                            if (item && typeof item === "object" && fieldKey in item) {
                                merged.push(item[fieldKey]);
                            } else {
                                merged.push(item); // for raw values inside array
                            }
                        });
                        return;
                    }

                    // If src is object → extract field or raw
                    if (typeof src === "object") {
                        if (fieldKey in src) merged.push(src[fieldKey]);
                        return;
                    }

                    // If primitive (string/number) → push as it is
                    merged.push(src);
                };

                pushFromSource(params[array1Key]);
                pushFromSource(params[array2Key]);

                return [...new Set(
                    merged.filter(v => v !== undefined && v !== null && v !== "")
                )].join(', ');
            }
            if (keys[i] === 'sum' && Array.isArray(value)) {
                const nestedKey = keys[i + 1];
                if (!nestedKey) {

                    if (value.every(iValue => typeof iValue === "number")) {

                        return value
                            .map(item => item)
                            .filter(v => v !== undefined)
                            .reduce((partialSum, a) => partialSum + a, 0);
                    }

                    return match;
                }

                return value
                    .map(item => item[nestedKey])
                    .filter(v => v !== undefined)
                    .reduce((partialSum, a) => partialSum + a, 0);
            }

            if (keys[i] === 'pattern' && Array.isArray(value)) {
                const noOfContainerKey = keys[i + 1];
                const containerTypeKey = keys[i + 2];
                if (!noOfContainerKey || !containerTypeKey) return match;

                // Group by containerType and sum noOfContainer
                const grouped = value.reduce((acc, item) => {
                    const type = item[containerTypeKey];
                    const count = item[noOfContainerKey];
                    if (!type || count === undefined) return acc;

                    if (!acc[type]) acc[type] = 0;
                    acc[type] += count;
                    return acc;
                }, {});

                return Object.entries(grouped)
                    .map(([type, count]) => `${count} X ${type}`)
                    .join(', ');
            }

            value = value[keys[i]];
        }

        return value !== undefined ? value : match;
    });

    return html;
}


function replacePlaceholdersNotification(html, params) {
    for (let key in params) {
        if (params.hasOwnProperty(key)) {
            const regex = new RegExp(`{${key}}`, 'g');
            html = html.replace(regex, params[key]);
        }
    }
    return html;
}
function generateRandomPassword(length) {
    // Using a safer character set that avoids problematic characters for HTML emails and copy-paste
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#!_-";
    let password = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    return password;
}

function formatToIST(isoDateString) {
    const date = new Date(isoDateString);

    // Convert to IST (UTC +5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const istDate = new Date(date.getTime() + istOffset);

    // Extract day, month, year, hours, minutes, and seconds
    const day = String(istDate.getDate()).padStart(2, '0');
    const month = String(istDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = istDate.getFullYear();

    let hours = istDate.getHours();
    const minutes = String(istDate.getMinutes()).padStart(2, '0');
    const seconds = String(istDate.getSeconds()).padStart(2, '0');

    // Determine AM/PM
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert hours to 12-hour format
    hours = hours % 12 || 12; // Converts 0 to 12 for midnight

    // Format hours with leading zero for single-digit hours
    hours = String(hours).padStart(2, '0');

    // Format to dd/mm/yyyy hh:mm:ss AM/PM
    // return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
    return `${day}/${month}/${year}`;
}

function replaceISODateStrings(input) {
    const isoDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;

    if (typeof input === "string" && isoDateRegex.test(input)) {
        return formatToIST(input);
    } else if (Array.isArray(input)) {
        return input.map(item => replaceISODateStrings(item));
    } else if (typeof input === "object" && input !== null) {
        for (const key in input) {
            input[key] = replaceISODateStrings(input[key]);
        }
    }
    return input;
}
// sending mail from smtp server
async function sendMail(req, orgId, templateId, to, cc, params, batchId, triggerId, attachments = []) {
    const EmailTemplateModel = mongoose.models[`EmailTemplateModel`] || mongoose.model(`EmailTemplateModel`, Schema["emailtemplate"], `emailtemplates`);
    const agentModel = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, Schema["agent"], `agents`);

    let agent;

    params = replaceISODateStrings(params)
    let transporterAgent;
    let senderText = "";

    if (orgId) {
        transporterAgent = await getTransporter({ orgId: orgId })
        agent = await agentModel.findOne({
            agentId: orgId
        })
        if (agent)
            agent = agent?.toObject();

        senderText = getSenderName(agent);
    } else {
        transporterAgent = transporter
    }
    await EmailTemplateModel.findOne({ emailtemplateId: templateId }).then(async function (emailTemplate) {
        if (emailTemplate) {
            let footer;

            if (agent)
                footer = `<footer><img style="height:125px;" src="https://shipeasy.blob.core.windows.net/ship-docs/${agent?.uploadSign}" alt="Email Signature" /></footer>`
            let htmlContent = "<html>" + (emailTemplate?.header || "") + emailTemplate.body + (footer || emailTemplate?.footer || "") + "</html>"


            if (req?.traceId === "alert_48_hour_before_pod_arrival") {

                htmlContent = replacePlaceholders48_hour(htmlContent, params)
            } else if (req?.traceId === "alert_in_5_days_before_ETA") {

                htmlContent = replacePlaceholdersETASTUTS(htmlContent, params)
            } else {
                // For all other alerts, use the regular function
                htmlContent = replacePlaceholders(htmlContent, params)
            }
            htmlContent = htmlContent.replace(/{{params\.[^}]+}}/g, '');

            let subjectUpdated = emailTemplate.subject;
            if (req?.traceId === "alert_48_hour_before_pod_arrival") {
                subjectUpdated = replacePlaceholders48_hour(subjectUpdated, params)
            } else if (req?.traceId === "alert_in_5_days_before_ETA") {
                subjectUpdated = replacePlaceholdersETASTUTS(subjectUpdated, params)
            } else {
                subjectUpdated = replacePlaceholders(subjectUpdated, params)
            }
            subjectUpdated = subjectUpdated.replace(/{{params\.[^}]+}}/g, '');

            let mailOptions;

            if (!batchId) {
                mailOptions = {
                    from: senderText,
                    to: to.map((e) => e.email),
                    cc: cc.map((c) => c.email),
                    subject: subjectUpdated,
                    text: '',
                    html: htmlContent,
                    attachments
                };
            } else {
                mailOptions = {
                    from: senderText,
                    to: to.map((e) => e.email),
                    cc: cc.map((c) => c.email),
                    subject: subjectUpdated,
                    text: '',
                    html: htmlContent,
                    headers: {
                        'Message-ID': `${batchId}@gmail.com`
                    },
                    attachments
                };

                saveEmailBatch(req, batchId, senderText, mailOptions.to, mailOptions.cc, mailOptions.subject, mailOptions.text, mailOptions.html, mailOptions.headers)


            }

            return new Promise((resolve, reject) => {
                transporterAgent?.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(JSON.stringify({
                            traceId: req.traceId,
                            message: `❌ Email NOT sent to ${to.map((e) => e.email)}, cc : ${cc.map((c) => c.email)} with templateId : ${templateId} for triggerId : ${triggerId}`,
                            error: error.message,
                            errorCode: error.code,
                            errorCommand: error.command,
                            errorResponse: error.response,
                            stack: error.stack
                        }))
                        reject(error)
                    } else {
                        console.log(JSON.stringify({
                            traceId: req.traceId,
                            message: `✅ Emails SUCCESSFULLY sent to ${to.map((e) => e.email)}, cc : ${cc.map((c) => c.email)} with templateId : ${templateId} for triggerId : ${triggerId}`,
                            messageId: info.messageId,
                            response: info.response,
                            accepted: info.accepted,
                            rejected: info.rejected,
                            pending: info.pending
                        }))

                        // Check if any emails were rejected
                        if (info.rejected && info.rejected.length > 0) {
                            console.warn(JSON.stringify({
                                traceId: req.traceId,
                                message: `⚠️ Some emails were rejected`,
                                rejected: info.rejected
                            }))
                        }

                        resolve(`Message sent: ${info.messageId}`)
                    }
                });
            });
        }
    }).catch(async function (error) {
        console.error(JSON.stringify({
            traceId: req.traceId,
            error: error.message,
            stack: error.stack
        }))

        throw error // Re-throw to propagate the error
    })
}

const saveEmailBatch = async (req, batchId, from, to, cc, subject, text, html, header, attachments = [], isReply = false) => {
    try {
        const emailModel = mongoose.models[`emailModel`] || mongoose.model(`emailModel`, Schema["email"], `emails`);

        let emailData = await emailModel.findOne({ batchId: batchId })
        emailData = emailData?.toObject()

        const emailDoc = {
            from: from,
            to: to,
            cc: cc,
            subject: subject,
            text: text,
            html: html,
            header: header,
            createdOn: new Date().toISOString(),
            isReply: isReply,
            attachments: [],
        }

        const uploadPromises = await Promise.all(attachments.map(async (attachment) => {
            try {
                const uploadResult = await azureStorage.uploadFile(`${uuid.v1()}_${attachment.filename}`, attachment.content);

                if (uploadResult && uploadResult.status === 200) {
                    emailDoc?.attachments?.push({
                        azureStorageFileName: uploadResult.name,
                        requestId: uploadResult.requestId,
                        isPublic: attachment.isPublic || false,
                        name: attachment.filename,
                    });
                } else {
                    console.error(JSON.stringify({
                        traceId: req?.traceId,
                        error: `Failed to upload attachment: ${attachment.filename} ${uploadResult?.error || 'Unknown error'}`
                    }))
                }
            } catch (err) {
                console.error(JSON.stringify({
                    traceId: req?.traceId,
                    error: err,
                    stack: err?.stack
                }))
            }
        }));

        if (emailData) {
            const oldMails = emailData["emails"]
            oldMails.push(emailDoc)

            await emailModel.findOneAndUpdate({ batchId: batchId }, { emails: oldMails, updatedOn: new Date().toISOString() })
        } else {
            let updatedData = {}

            updatedData["batchId"] = batchId

            updatedData["emails"] = [
                emailDoc
            ]

            updatedData["emailId"] = uuid.v1();
            updatedData.createdOn = new Date().toISOString();
            updatedData.updatedOn = new Date().toISOString();

            const document = emailModel(updatedData);
            await document.save()
        }
    } catch (error) {
        console.error(JSON.stringify({
            traceId: req?.traceId,
            error: error,
            stack: error?.stack
        }))
    }
}
async function triggerPointExecute(req, updatedDocument, indexName) {
    console.log("\n    🎯 triggerPointExecute called:");
    console.log("      traceId:", req.traceId);
    console.log("      indexName:", indexName);
    console.log("      batchNo:", updatedDocument?.batchNo);
    console.log("      orgId:", updatedDocument?.orgId);
    console.log("      alert_in_5_days_before_ETA_for_MBL_STATUS:", updatedDocument?.alert_in_5_days_before_ETA_for_MBL_STATUS);

    const EmailTriggerModel = mongoose.models[`EmailTriggerModel`] ||
        mongoose.model(`EmailTriggerModel`, Schema["notificationmaster"], `notificationmasters`);

    let notification = await EmailTriggerModel.findOne({
        'orgId': updatedDocument.orgId,
        module: indexName
    });

    if (!notification) {
        console.log("      ❌ No notification found for:");
        console.log("        orgId:", updatedDocument.orgId);
        console.log("        module:", indexName);
        console.log("      ⚠️ Please check if notification configuration exists in 'notificationmasters' collection");
        return;
    }

    notification = notification.toObject();
    console.log(`      ✅ Found notification with ${notification.trigger?.length || 0} triggers`);

    if (!notification.trigger || notification.trigger.length === 0) {
        console.log("      ⚠️ No triggers configured in notification");
        return;
    }

    for (let i = 0; i < notification.trigger?.length; i++) {
        console.log(`\n      📧 Checking trigger ${i + 1}/${notification.trigger.length}`);
        console.log(`        triggerId: ${notification.trigger[i].triggerId}`);
        console.log(`        trigger.value:`, JSON.stringify(notification.trigger[i].value));

        if (isSubset(notification.trigger[i].value, updatedDocument)) {
            console.log(`      ✅ Trigger ${i + 1} MATCHED! Processing email...`);

            const TriggerModel = mongoose.models[`TriggerModel`] ||
                mongoose.model(`TriggerModel`, Schema["trigger"], `triggers`);

            let trigger = await TriggerModel.findOne({ 'triggerId': notification.trigger[i].triggerId });

            if (!trigger) {
                console.log(`        ❌ Trigger configuration not found for triggerId: ${notification.trigger[i].triggerId}`);
                continue;
            }

            trigger = trigger?.toObject();
            console.log(`        ✅ Loaded trigger configuration`);

            const fulfilledParameters = {};

            if (trigger) {
                console.log(`        📋 Processing ${trigger?.params?.length || 0} parameters...`);

                for (let p = 0; p < trigger?.params?.length; p++) {
                    const parameter = trigger.params[p];

                    console.log(`          Parameter ${p + 1}: ${parameter.object} (${parameter.isMultiple ? 'multiple' : 'single'})`);

                    const objectModel = mongoose.models[`${parameter.object}ModelObject`] ||
                        mongoose.model(`${parameter.object}ModelObject`, Schema[`${parameter.object}`], `${parameter.object}s`);
                    const objectFilter = {};

                    for (let f = 0; f < trigger.params[p].filters.length; f++) {
                        const filter = parameter.filters[f];

                        if (filter?.type === "or") {
                            objectFilter["$or"] = filter.conditions.map(c => ({
                                [c.filter]: updatedDocument[c.search] || c.search
                            }));
                        } else {
                            objectFilter[`${filter.filter}`] = updatedDocument[`${filter.search}`] || filter.search;
                        }
                    }

                    console.log(`          Filter:`, JSON.stringify(objectFilter));

                    let sort = {};
                    for (var sortField in trigger?.params[p]?.sort) {
                        sort[sortField] = trigger?.params[p]?.sort[sortField];
                    }

                    if (parameter?.isMultiple) {
                        let foundDataFromObjects = await objectModel.find(objectFilter, null, { sort: sort });

                        if (foundDataFromObjects && foundDataFromObjects.length > 0) {
                            foundDataFromObjects = foundDataFromObjects?.map(e => e?.toObject());
                            console.log(`          ✅ Found ${foundDataFromObjects.length} records`);

                            for (let f = 0; f < trigger.params[p].fields.length; f++) {
                                const field = trigger.params[p].fields[f];

                                foundDataFromObjects.forEach(foundDataFromObject => {
                                    for (let t = 0; t < field.type.length; t++) {
                                        const type = field.type[t];

                                        const valueToBeFound = {};

                                        for (var fromField in field.value) {
                                            valueToBeFound[fromField] = _.get(foundDataFromObject, field.value[fromField]) || "-";
                                        }

                                        if (fulfilledParameters[type] && fulfilledParameters[type][parameter.fieldName]) {
                                            fulfilledParameters[type][parameter.fieldName].push(valueToBeFound);
                                        } else {
                                            const tempField = {};
                                            tempField[parameter.fieldName] = [valueToBeFound];
                                            fulfilledParameters[type] = {
                                                ...tempField,
                                                ...fulfilledParameters[type]
                                            };
                                        }
                                    }
                                });
                            }
                        } else {
                            console.log(`          ⚠️ No records found`);
                        }
                    } else {
                        let foundDataFromObject = await objectModel.findOne(objectFilter);

                        if (foundDataFromObject) {
                            foundDataFromObject = foundDataFromObject.toObject();
                            console.log(`          ✅ Found record`);

                            for (let f = 0; f < trigger.params[p].fields.length; f++) {
                                const field = trigger.params[p].fields[f];

                                for (let t = 0; t < field.type.length; t++) {
                                    const type = field.type[t];

                                    for (var fromField in field.value) {
                                        const valueToBeFound = {};
                                        valueToBeFound[fromField] = _.get(foundDataFromObject, field.value[fromField]) ?? "-";

                                        fulfilledParameters[type] = {
                                            ...valueToBeFound,
                                            ...fulfilledParameters[type]
                                        };
                                    }
                                }
                            }
                        } else {
                            console.log(`          ⚠️ No record found`);
                        }
                    }
                }

                console.log(`        ✅ Parameters collected`);

                let to = [];
                let cc = [];

                // Special handling for alert_in_5_days_before_ETA
                if (req.traceId == "alert_in_5_days_before_ETA") {
                    console.log(`        🔍 Special handling for ETA alert - fetching agent emails`);

                    const PartymasterModel = mongoose.models.PartymasterModel ||
                        mongoose.model('PartymasterModel', Schema["partymaster"], 'partymasters');

                    const agentId = updatedDocument.enquiryDetails?.basicDetails?.agentId;
                    console.log(`          Agent ID: ${agentId}`);

                    if (agentId) {
                        const partymaster = await PartymasterModel.findOne({ "partymasterId": agentId }).exec();

                        if (partymaster && partymaster.primaryMailId) {
                            const emails = partymaster.primaryMailId.split(',').map(email => email.trim()).filter(Boolean);
                            console.log(`          ✅ Found ${emails.length} agent email(s): ${emails.join(', ')}`);

                            emails.forEach(email => {
                                to.push({
                                    email: email,
                                    name: partymaster.name
                                });
                            });
                        } else {
                            console.log(`          ⚠️ No primary email found for agent ${agentId}`);
                        }
                    } else {
                        console.log(`          ⚠️ No agent ID found in batch`);
                    }
                }

                console.log(`        📧 Processing ${notification.trigger[i].emailSettings?.length || 0} email settings...`);

                for (let es = 0; es < notification.trigger[i].emailSettings?.length; es++) {
                    const emailSetting = notification.trigger[i].emailSettings[es];
                    console.log(`          Email setting ${es + 1}: type=${emailSetting.type}`);

                    if (emailSetting['type'] === "departments") {
                        const DepartmentModel = mongoose.models[`DepartmentModel`] ||
                            mongoose.model(`DepartmentModel`, Schema["department"], `departments`);

                        let department = await DepartmentModel.findOne({ 'departmentId': emailSetting.deptId });

                        if (department) {
                            console.log(`            ✅ Department: ${department.deptName}`);

                            if (emailSetting?.isEmailTo) {
                                to.push({ email: department.deptEmail, name: department.deptName });
                            } else if (emailSetting?.isEmailCC) {
                                cc.push({ email: department.deptEmail, name: department.deptName });
                            }

                            const UserModel = mongoose.models[`UserModel`] ||
                                mongoose.model(`UserModel`, Schema["user"], `users`);

                            let users = await UserModel.find({ 'department.item_id': department.departmentId });

                            console.log(`            Found ${users?.length || 0} users in department`);

                            for (let u = 0; u < users?.length; u++) {
                                if (emailSetting?.isEmailTo) {
                                    to.push({
                                        email: users[u].userEmail,
                                        name: `${users[u].userFirstName} ${users[u].userLastName}`
                                    });
                                } else if (emailSetting?.isEmailCC) {
                                    cc.push({
                                        email: users[u].userEmail,
                                        name: `${users[u].userFirstName} ${users[u].userLastName}`
                                    });
                                }

                                if (trigger.inAppNotification?.enabled) {
                                    const notificationDescription = trigger.inAppNotification.inAppParams.notificationDescription;
                                    const filledNotificationDescription = await replacePlaceholdersNotification(
                                        notificationDescription,
                                        fulfilledParameters.inApp
                                    );

                                    await createInAppNotification(
                                        req,
                                        trigger.emailname,
                                        filledNotificationDescription,
                                        users[u]
                                    );
                                }
                            }
                        }
                    } else if (emailSetting['type'] === "direct") {
                        let toEmails = emailSetting.emailTo?.split(',') || [];
                        for (let em = 0; em < toEmails.length; em++) {
                            if (toEmails[em]) {
                                to.push({ email: toEmails[em].trim(), name: toEmails[em].trim() });
                            }
                        }

                        if (emailSetting.emailCC && emailSetting.emailCC != "") {
                            let emailCC = emailSetting.emailCC?.split(',') || [];
                            for (let em = 0; em < emailCC.length; em++) {
                                if (emailCC[em]) {
                                    cc.push({ email: emailCC[em].trim(), name: emailCC[em].trim() });
                                }
                            }
                        }

                        console.log(`            ✅ Direct emails - To: ${toEmails.length}, CC: ${emailSetting.emailCC?.split(',')?.length || 0}`);
                    } else if (emailSetting['type'] === "consignee" ||
                        emailSetting['type'] === "booking party" ||
                        emailSetting['type'] === "shipper") {

                        let shipperId;
                        let idToBeSearched = "";

                        if (emailSetting['type'] === "shipper") {
                            idToBeSearched = "shipperId";
                        } else if (emailSetting['type'] === "booking party") {
                            idToBeSearched = "agentId";
                        } else if (emailSetting['type'] === "consignee") {
                            idToBeSearched = "consigneeId";
                        }

                        if (indexName === "batch") {
                            shipperId = updatedDocument?.enquiryDetails?.basicDetails[idToBeSearched];
                        } else if (indexName === "invoice") {
                            shipperId = updatedDocument[idToBeSearched];
                        } else if (indexName === "enquiry") {
                            shipperId = updatedDocument.basicDetails[idToBeSearched];
                        } else if (indexName === "container") {
                            const batchModel = mongoose.models[`batchModel`] ||
                                mongoose.model(`batchModel`, Schema["batch"], `batchs`);
                            const bathData = await batchModel.findOne({ batchId: updatedDocument.batchId });
                            shipperId = bathData?.enquiryDetails?.basicDetails[idToBeSearched];
                        } else if (indexName === "event") {
                            const batchModel = mongoose.models[`batchModel`] ||
                                mongoose.model(`batchModel`, Schema["batch"], `batchs`);
                            const bathData = await batchModel.findOne({ batchId: updatedDocument.entityId });
                            shipperId = bathData?.enquiryDetails?.basicDetails[idToBeSearched];
                        }

                        console.log(`            ${emailSetting['type']} ID: ${shipperId}`);

                        if (emailSetting['type'] === "shipper" && trigger.inAppNotification?.enabled) {
                            const CustomerModel = mongoose.models[`CustomerModel`] ||
                                mongoose.model(`CustomerModel`, Schema["user"], `users`);

                            let customerData = await CustomerModel.findOne({ "customerId": shipperId });

                            if (customerData) {
                                const notificationDescription = trigger.inAppNotification.inAppParams.notificationDescription;
                                const filledNotificationDescription = await replacePlaceholdersNotification(
                                    notificationDescription,
                                    fulfilledParameters.inApp
                                );

                                await createInAppNotification(
                                    req,
                                    trigger.emailname,
                                    filledNotificationDescription,
                                    customerData
                                );
                            }
                        }

                        const PartymasterModel = mongoose.models[`PartymasterModel`] ||
                            mongoose.model(`PartymasterModel`, Schema["partymaster"], `partymasters`);

                        let partymaster = await PartymasterModel.findOne({ "partymasterId": shipperId });

                        if (partymaster) {
                            if (emailSetting?.isEmailTo) {
                                const emails = partymaster.primaryMailId?.split(',')?.map(email => email?.trim()).filter(Boolean);
                                emails?.forEach(email => {
                                    to.push({ email, name: partymaster?.name });
                                });
                                console.log(`            ✅ Added ${emails?.length || 0} TO email(s)`);
                            }
                            if (emailSetting?.isEmailCC) {
                                const emails = partymaster.primaryMailId?.split(',')?.map(email => email?.trim()).filter(Boolean);
                                emails?.forEach(email => {
                                    cc.push({ email, name: partymaster?.name });
                                });
                                console.log(`            ✅ Added ${emails?.length || 0} CC email(s)`);
                            }
                        } else {
                            console.log(`            ⚠️ Partymaster not found for ID: ${shipperId}`);
                        }
                    }
                }

                console.log(`        📬 Total recipients - To: ${to.length}, CC: ${cc.length}`);
                console.log(`          To emails: ${to.map(t => t.email).join(', ')}`);
                console.log(`          CC emails: ${cc.map(c => c.email).join(', ')}`);

                            // Calculate days until ETA for alert_in_5_days_before_ETA trigger
                            let daysUntilETA = null;
                            if (req.traceId === "alert_in_5_days_before_ETA") {
                                const etaDateStr = updatedDocument?.routeDetails?.eta;
                                if (etaDateStr) {
                                    const etaDate = new Date(etaDateStr);
                                    const today = new Date();
                                    // Reset time to midnight for accurate day calculation
                                    etaDate.setHours(0, 0, 0, 0);
                                    today.setHours(0, 0, 0, 0);
                                    const diffTime = etaDate.getTime() - today.getTime();
                                    daysUntilETA = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                    // Show as 0 if ETA is today or already passed
                                    if (daysUntilETA < 0) {
                                        daysUntilETA = 0;
                                    }

                        console.log(`        📅 Days until ETA: ${daysUntilETA}`);
                    }
                }

                const emailParameters = {
                    ...fulfilledParameters["email"],
                    ...(req.traceId === "alert_in_5_days_before_ETA" && daysUntilETA !== null && {
                        batchNo: updatedDocument?.batchNo,
                        daysUntilETA: daysUntilETA
                    }),
                    // Override bls with allJobsData for consolidated agent-grouped emails
                    ...(req.traceId === "alert_in_5_days_before_ETA" && updatedDocument?.allJobsData && {
                        allJobsData: updatedDocument.allJobsData,
                        bls: updatedDocument.allJobsData
                    }),
                    params: JSON.stringify(fulfilledParameters["email"])
                };

                console.log(`        📝 Email parameters prepared`);
                if (emailParameters.allJobsData) {
                    console.log(`        📊 allJobsData contains ${emailParameters.allJobsData.length} job(s) for grouped email`);
                }

                            for (let tId = 0; tId < trigger.template?.length; tId++) {
                                const templateId = trigger.template[tId].templateId;

                    console.log(`        📄 Processing template ${tId + 1}/${trigger.template.length}: ${templateId}`);

                    if (trigger.template[tId]?.isConditionBased) {
                        if (!(trigger.template[tId]?.filter && isSubset(trigger.template[tId]?.filter, emailParameters))) {
                            console.log(`          ⏭️  Skipped (condition not met)`);
                            continue;
                        }
                    }

                                // WhatsApp notification for booking confirmed
                                if (indexName === "batch" && updatedDocument.statusOfBatch === "Booking Confirmed") {
                                    const dataWH = getTextMessageInput("919727291020", "booking_confirmed", [
                                        emailParameters.referenceNumber,
                                        emailParameters.quotationNo,
                                        emailParameters.Origin,
                                        emailParameters.Destination
                                    ])
                                    sendMessage(dataWH).catch(function (err) {
                                        console.error(JSON.stringify({
                                            traceId: req.traceId,
                                            error: err,
                                            stack: err.stack
                                        }))
                                    });
                                }

                                // Process attachments
                                const attachments = [];
                                for (let a = 0; a < trigger?.attachment?.length; a++) {
                                    const attachment = trigger?.attachment[a];

                                    if (attachment?.type === "jasperReport") {
                                        const jasperUrl = process.env.JASPER_URL;
                                        const jasperheader = {
                                            "Authorization": `Basic ${process.env.JASPER_Auth}`,
                                            "Content-Type": "application/pdf",
                                        }

                                        if (attachment?.isMultiple) {
                                            for (let mf = 0; mf < fulfilledParameters["jasperReport"][attachment?.multipleField]?.length; mf++) {
                                                const individualField = fulfilledParameters["jasperReport"][attachment?.multipleField][mf];

                                                const jasperRawParams = {
                                                    ...individualField,
                                                    ...fulfilledParameters["jasperReport"]
                                                }

                                                const jasperParams = Object.fromEntries(
                                                    Object.entries(jasperRawParams).filter(
                                                        ([_, value]) =>
                                                            value === null ||
                                                            ["string", "number", "boolean"].includes(typeof value)
                                                    )
                                                );

                                                if (attachment?.conditions && (!(isObjectMatch(attachment?.conditions, jasperParams)))) {
                                                    continue;
                                                }

                                                try {
                                                    let headers = { params: jasperParams, headers: jasperheader, responseType: "arraybuffer", };
                                                    let jasperdata = await axios.get(
                                                        `${jasperUrl}/jasperserver/rest_v2/reports/${process.env.JASPER_PATH}/${attachment?.reportName}.${attachment?.format}`,
                                                        headers
                                                    );

                                                    attachments.push({
                                                        filename: replacePlaceholders(
                                                            attachment.attachmentName,
                                                            jasperParams
                                                        ) + `.${attachment.format}`,
                                                        content: Buffer.from(jasperdata.data),
                                                        contentType: "application/pdf",
                                                    });
                                                } catch (error) {
                                                    console.error(JSON.stringify({
                                                        traceId: req.traceId,
                                                        message: `Error generating jasper report: ${attachment.attachmentName}`
                                                    }))
                                                }
                                            }
                                        }
                                    } else if (attachment?.type === "document") {
                                        const documentParams = fulfilledParameters?.document
                                        const documentModel = mongoose.models[`documentModel`] || mongoose.model(`documentModel`, Schema["document"], `documents`);
                                        let batchDocument = await documentModel.findOne({
                                            refId: documentParams?.batchId,
                                            documentType: attachment?.documentType
                                        })

                                        if (batchDocument) {
                                            batchDocument = batchDocument?.toObject()
                                            const docURL = batchDocument?.documentURL
                                            const docName = batchDocument?.documentName
                                            const docExt = path.extname(docName);

                                            try {
                                                const content = await azureStorage.downloadFile(docURL);
                                                const chunks = [];
                                                for await (const chunk of content.readableStreamBody) {
                                                    chunks.push(chunk);
                                                }
                                                const fileBuffer = Buffer.concat(chunks);

                                                attachments.push({
                                                    filename: attachment?.attachmentNameOriginal ?
                                                        batchDocument?.documentName :
                                                        (replacePlaceholders(attachment.attachmentName, documentParams) + `.${docExt}`),
                                                    content: fileBuffer,
                                                });
                                            } catch (error) {
                                                console.error(JSON.stringify({
                                                    traceId: req.traceId,
                                                    message: `Error downloading document: ${attachment.attachmentName}`
                                                }))
                                            }
                                        }
                                    }
                                }

                                if (emailParameters.bls) {
                                    emailParameters.bls = emailParameters.bls.map(bl => {
                                        return {
                                            ...bl,
                                            MBLStatus: bl.MBLStatus && bl.MBLStatus !== '-' ? bl.MBLStatus : '',
                                            HBLStatus: bl.HBLStatus && bl.HBLStatus !== '-' ? bl.HBLStatus : ''
                                        };
                                    });
                                }

                                // Check if filtering is needed for 5-day ETA alert
                                if (req.traceId === "alert_in_5_days_before_ETA" &&
                                    emailParameters.bls &&
                                    emailParameters.bls.length > 0) {

                        console.log(`          🔍 Filtering BLs (total: ${emailParameters.bls.length})`);

                                    // Filter to only MBL with Pending status
                                    const filteredBls = emailParameters.bls.filter(bl => {
                                        if (bl.blType !== 'MBL') return false;
                                        const status = bl.MBLStatus || '';
                                        return status.toLowerCase().includes('pending');
                                    });

                        console.log(`          📋 Filtered BLs: ${filteredBls.length} MBLs with pending status`);

                                    // Only send if there are qualifying BLs
                                    if (filteredBls.length > 0) {
                                        emailParameters.bls = filteredBls;

                            console.log(`          📤 Sending email...`);

                            await sendMail(
                                req,
                                updatedDocument.orgId,
                                templateId,
                                to,
                                cc,
                                emailParameters,
                                updatedDocument?.batchId || "",
                                notification.trigger[i].triggerId,
                                attachments
                            );
                        } else {
                            console.log(`          ⚠️ No qualifying BLs found after filtering. Email not sent.`);
                        }
                    }
                    // For 48-hour POD arrival alert - send ALL BLs without filtering
                    else if (req.traceId === "alert_48_hour_before_pod_arrival") {
                        console.log(`          📤 Sending email (48h POD alert, no BL filtering)`);

                        await sendMail(
                            req,
                            updatedDocument.orgId,
                            templateId,
                            to,
                            cc,
                            emailParameters,
                            updatedDocument?.batchId || "",
                            notification.trigger[i].triggerId,
                            attachments
                        );
                    }
                    // For all other triggers, send normally
                    else {
                        console.log(`          📤 Sending email (no BL filtering)`);

                        await sendMail(
                            req,
                            updatedDocument.orgId,
                            templateId,
                            to,
                            cc,
                            emailParameters,
                            updatedDocument?.batchId || "",
                            notification.trigger[i].triggerId,
                            attachments
                        );
                    }
                }
            }
        } else {
            console.log(`      ⏭️  Trigger ${i + 1} did NOT match`);
        }
    }
}
async function getTOCCEmailsForScheduler(req, updatedDocument, indexName) {
    let to = [];
    let cc = [];

    const EmailTriggerModel = mongoose.models[`EmailTriggerModel`] || mongoose.model(`EmailTriggerModel`, Schema["notificationmaster"], `notificationmasters`);
    let notification = await EmailTriggerModel.findOne({ 'orgId': updatedDocument.orgId, module: indexName })

    if (notification)
        notification = notification?.toObject()


    for (let i = 0; i < notification.trigger?.length; i++)
        if (isSubset(notification.trigger[i].value, updatedDocument)) {
            console.log(JSON.stringify({
                traceId: req.traceId,
                message: `Trigger found with triggerId : ${notification.trigger[i].triggerId}`
            }))


            for (let es = 0; es < notification.trigger[i].emailSettings.length; es++) {
                const emailSetting = notification.trigger[i].emailSettings[es];

                if (emailSetting['type'] === "departments") {
                    const DepartmentModel = mongoose.models[`DepartmentModel`] || mongoose.model(`DepartmentModel`, Schema["department"], `departments`);
                    await DepartmentModel.findOne({ 'departmentId': emailSetting.deptId }).then(async function (department) {
                        if (department) {
                            console.log(JSON.stringify({
                                traceId: req.traceId,
                                message: `Department setting found for triggerId : ${notification.trigger[i].triggerId} is ${department.deptName}`
                            }))

                            if (emailSetting?.isEmailTo)
                                to.push({ email: department.deptEmail, name: department.deptName })
                            else if (emailSetting?.isEmailCC)
                                cc.push({ email: department.deptEmail, name: department.deptName })

                            const UserModel = mongoose.models[`UserModel`] || mongoose.model(`UserModel`, Schema["user"], `users`);
                            await UserModel.find({ 'department.item_id': department.departmentId }).then(async function (users) {
                                for (let u = 0; u < users?.length; u++) {
                                    if (emailSetting?.isEmailTo)
                                        to.push({ email: users[u].userEmail, name: `${users[u].userFirstName} ${users[u].userLastName}` })
                                    else if (emailSetting?.isEmailCC)
                                        cc.push({ email: users[u].userEmail, name: `${users[u].userFirstName} ${users[u].userLastName}` })
                                }
                            })
                        }
                    })
                } else if (emailSetting['type'] === "direct") {
                    let toEmails = emailSetting.emailTo?.split(',') || []
                    for (let em = 0; em < toEmails.length; em++)
                        if (toEmails[em])
                            to.push({ email: toEmails[em], name: toEmails[em] })

                    if (emailSetting.emailCC != "") {
                        let emailCC = emailSetting.emailCC?.split(',') || []
                        for (let em = 0; em < emailCC.length; em++)
                            if (emailCC[em])
                                cc.push({ email: emailCC[em], name: emailCC[em] })
                    }
                } else if (emailSetting['type'] === "consignee" || emailSetting['type'] === "booking party" || emailSetting['type'] === "shipper") {
                    let shipperId;

                    let idToBeSearched = "";

                    if (emailSetting['type'] === "shipper")
                        idToBeSearched = "shipperId"
                    else if (emailSetting['type'] === "booking party")
                        idToBeSearched = "agentId"
                    else if (emailSetting['type'] === "consignee")
                        idToBeSearched = "consigneeId"

                    console.log(JSON.stringify({
                        traceId: req.traceId,
                        message: `Email setting type is ${emailSetting['type']} for triggerId : ${notification.trigger[i].triggerId}`
                    }))

                    if (indexName === "batch") {
                        shipperId = updatedDocument?.enquiryDetails?.basicDetails[idToBeSearched];
                    } else if (indexName === "invoice") {
                        shipperId = updatedDocument[idToBeSearched];
                    } else if (indexName === "enquiry") {
                        shipperId = updatedDocument.basicDetails[idToBeSearched];
                    } else if (indexName === "container") {
                        const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
                        const bathData = await batchModel.findOne({ batchId: updatedDocument.batchId })
                        shipperId = bathData?.enquiryDetails?.basicDetails[idToBeSearched];
                    } else if (indexName === "event") {
                        const batchModel = mongoose.models[`batchModel`] || mongoose.model(`batchModel`, Schema["batch"], `batchs`);
                        const bathData = await batchModel.findOne({ batchId: updatedDocument.entityId })
                        shipperId = bathData?.enquiryDetails?.basicDetails[idToBeSearched];
                    }

                    if (emailSetting['type'] === "shipper") {
                        if (trigger.inAppNotification.enabled) {
                            const CustomerModel = mongoose.models[`CustomerModel`] || mongoose.model(`CustomerModel`, Schema["user"], `users`);
                            await CustomerModel.findOne({ "customerId": shipperId }).then(async function (customerData) {
                                const notificationDescription = trigger.inAppNotification.inAppParams.notificationDescription;
                                const filledNotificationDescription = await replacePlaceholdersNotification(notificationDescription, fulfilledParameters.inApp)

                                await createInAppNotification(req, trigger.emailname, filledNotificationDescription, customerData);
                            })
                        }
                    }



                    const PartymasterModel = mongoose.models[`PartymasterModel`] || mongoose.model(`PartymasterModel`, Schema["partymaster"], `partymasters`);
                    await PartymasterModel.findOne({ "partymasterId": shipperId }).then(async function (partymaster) {
                        if (partymaster) {
                            if (emailSetting?.isEmailTo) {
                                const emails = partymaster.primaryMailId?.split(',')?.map(email => email?.trim()); // Split and trim emails
                                emails.forEach(email => {
                                    to.push({ email, name: partymaster?.name }); // Push each email to the `to` array
                                });
                            }
                            if (emailSetting?.isEmailCC) {
                                const emails = partymaster.primaryMailId?.split(',')?.map(email => email?.trim()); // Split and trim emails
                                emails.forEach(email => {
                                    cc.push({ email, name: partymaster?.name }); // Push each email to the `cc` array
                                });
                            }
                        }
                    })
                }
            }
        }

    console.log("getTOCCEmailsForScheduler", JSON.stringify({ traceId: req.traceId, toMails: to, ccMails: cc }));

    return { toMails: to, ccMails: cc };
}
async function insertIntoTally(req, invoice) {
    try {
        let data = `<?xml version="1.0"?>
            <ENVELOPE>
                <HEADER>
                    <TALLYREQUEST>Import Data</TALLYREQUEST>
                </HEADER>
                <BODY>
                    <IMPORTDATA>
                        <REQUESTDESC>
                            <REPORTNAME>Vouchers</REPORTNAME>
                            <STATICVARIABLES>
                                <SVCURRENTCOMPANY>Synoris</SVCURRENTCOMPANY>
                            </STATICVARIABLES>
                        </REQUESTDESC>
                        <REQUESTDATA>
                            <TALLYMESSAGE
                                xmlns:UDF="TallyUDF">
                                <VOUCHER VCHTYPE="Sales" ACTION="Create">
                                    <DATE>20240501</DATE>
                                    <GUID>${invoice.invoiceId}</GUID>
                                    <VOUCHERNUMBER>124</VOUCHERNUMBER>
                                    <PARTYLEDGERNAME>${invoice.consigneeName}</PARTYLEDGERNAME>
                                    <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
                                    <REFERENCE>${invoice.invoiceNo}</REFERENCE>
                                    <LEDGERENTRIES.LIST>
                                        <LEDGERNAME>Rutvik</LEDGERNAME>
                                        <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
                                        <AMOUNT>${Number(invoice.invoiceAmount)}</AMOUNT>
                                    </LEDGERENTRIES.LIST>
                                    <LEDGERENTRIES.LIST>
                                        <LEDGERNAME>USA</LEDGERNAME>
                                        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                                        <AMOUNT>${-Number(invoice.invoiceAmount)}</AMOUNT>
                                    </LEDGERENTRIES.LIST>
                                    <ALLINVENTORYENTRIES.LIST>
                                        <STOCKITEMNAME>Cost Items</STOCKITEMNAME>
                                        <ISDEEMEDPOSITIVE>QTY</ISDEEMEDPOSITIVE>
                                        <RATE>${invoice.invoiceAmount}</RATE>
                                        <AMOUNT>${invoice.invoiceAmount}</AMOUNT>
                                        <ACTUALQTY>1 QTY</ACTUALQTY>
                                        <BILLEDQTY>1 QTY</BILLEDQTY>
                                    </ALLINVENTORYENTRIES.LIST>
                                </VOUCHER>
                            </TALLYMESSAGE>
                        </REQUESTDATA>
                    </IMPORTDATA>
                </BODY>
            </ENVELOPE>`;

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://qhm03fj5-9000.inc1.devtunnels.ms',
            headers: {
                'X-Auth-Key': 'live_5296cc6da6c24f619da5e92ba7f3fbec',
                'Template-Key': '3',
                'CompanyName': 'Synoris',
                'version': '1',
                'ID': 'GetCompanyName',
                'Content-Type': 'application/xml'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
            })
            .catch((err) => {
                console.error(JSON.stringify({
                    traceId: req.traceId,
                    error: err,
                    stack: err.stack
                }))
            });
    } catch (err) {
        console.error(JSON.stringify({
            traceId: req?.traceId,
            error: err,
            stack: err?.stack
        }))
    }
}
async function getTransporter(user) {
    const agentModel = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, Schema["agent"], `agents`);
    const agentData = await agentModel.findOne({ agentId: user.orgId })
    let transporterAgent = nodemailer.createTransport({
        host: agentData?.emailConfig?.mailServer || process.env.SERVER_SMTP,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: agentData?.emailConfig?.emailId || process.env.EMAIL_SMTP, // your email
            pass: agentData?.emailConfig?.mailServerPassword || process.env.PASS_SMTP// your password or App Password for Gmail
        }
    });

    try {
        await transporterAgent?.verify();
        return transporterAgent;
    } catch (error) {
        console.error('Error verifying transporter:', error);
        return null;
    }
}
async function getChildCompany(partymasterIds) {
    let partyModel = mongoose.models[`partyModel`] || mongoose.model(`partyModel`, Schema["partymaster"], `partymasters`);

    let partyData = await partyModel.find({
        parenetcustomerId: {
            $in: partymasterIds
        },
        parentCompany: true
    })

    if (partyData)
        partyData = partyData?.map(e => e?.toObject())

    if (partyData) {
        return [...partymasterIds, ...partyData.map(e => e.partymasterId)]

    } else
        return partymasterIds
}
function isObjectMatch(source, target) {
    return Object.keys(source).every(
        key => key in target && target[key] === source[key]
    );
}

module.exports = {
    mongoose,
    Schema,
    invoiceSchema,
    diffInDays,
    uuid,
    jwt,
    crypto,
    axios,
    azureStorage,
    inAppNotificationService,
    querystring,
    nodemailer,
    pdfScanner,
    replacePlaceholdersETASTUTS,
    replacePlaceholders48_hour,
    ediController,
    OpenAI,
    objecdiff,
    sendMessage,
    getTextMessageInput,
    fs,
    _,
    sendMail,
    simpleParser,
    connect,
    imapConfig,
    transporter,
    getChangedFields,
    removeIdField,
    recordLogAudit,
    encryptObject,
    decryptObject,
    isSubset,
    createInAppNotification,
    replacePlaceholders,
    generateRandomPassword,
    triggerPointExecute,
    insertIntoTally,
    getTransporter,
    getChildCompany,
    saveEmailBatch,
    getSenderName,
    getTOCCEmailsForScheduler
};