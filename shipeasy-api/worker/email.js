const { Worker } = require('bullmq');
const nodemailer = require('nodemailer');
const { getValidModelAndSchema, getTransporter, getSenderName, replacePlaceholders, saveEmailBatch, replaceISODateStrings, replacePlaceholders48_hour, replacePlaceholdersETASTUTS } = require('../controller/helper.controller');

const emailWorker = new Worker('email', async job => {
    const { orgId, templateId, to, cc, params, batchId, triggerId, attachments, traceId, subject, htmlBody } = job.data;
    const { Model: EmailTemplateModel } = getValidModelAndSchema('emailtemplate');
    const { Model: agentModel } = getValidModelAndSchema('agent');

    let agent;
    let transporterAgent;
    let senderText = "";

    if (orgId) {
        transporterAgent = await getTransporter({ orgId: orgId });
        agent = await agentModel.findOne({ agentId: orgId });
        if (agent) {
            agent = agent.toObject();
        }
        senderText = getSenderName(agent);
    } else {
        transporterAgent = nodemailer.createTransport({
            host: process.env.SERVER_SMTP,
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_SMTP,
                pass: process.env.PASS_SMTP
            }
        });
    }

    if (htmlBody) {
        // Send email with raw HTML
        let mailOptions = {
            from: senderText,
            to: to.map((e) => e.email),
            cc: cc.map((c) => c.email),
            subject: subject,
            text: '',
            html: htmlBody,
            attachments
        };
        await transporterAgent.sendMail(mailOptions);
    } else {
        // Send email using template
        const emailTemplate = await EmailTemplateModel.findOne({ emailtemplateId: templateId });

        if (emailTemplate) {
            let footer;
            if (agent) {
                footer = `<footer><img style="height:125px;" src="https://shipeasy.blob.core.windows.net/ship-docs/${agent.uploadSign}" alt="Email Signature" /></footer>`;
            }
            let htmlContent = "<html>" + (emailTemplate.header || "") + emailTemplate.body + (footer || emailTemplate.footer || "") + "</html>";

            const processedParams = replaceISODateStrings(params);

            if (traceId === "alert_48_hour_before_pod_arrival") {
                htmlContent = replacePlaceholders48_hour(htmlContent, processedParams);
            } else if (traceId === "alert_in_5_days_before_ETA") {
                htmlContent = replacePlaceholdersETASTUTS(htmlContent, processedParams);
            } else {
                htmlContent = replacePlaceholders(htmlContent, processedParams);
            }
            htmlContent = htmlContent.replace(/{{params\.[^}]+}}/g, '');

            let subjectUpdated = emailTemplate.subject;
            if (traceId === "alert_48_hour_before_pod_arrival") {
                subjectUpdated = replacePlaceholders48_hour(subjectUpdated, processedParams);
            } else if (traceId === "alert_in_5_days_before_ETA") {
                subjectUpdated = replacePlaceholdersETASTUTS(subjectUpdated, processedParams);
            } else {
                subjectUpdated = replacePlaceholders(subjectUpdated, processedParams);
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
                await saveEmailBatch({ traceId }, batchId, senderText, mailOptions.to, mailOptions.cc, mailOptions.subject, mailOptions.text, mailOptions.html, mailOptions.headers);
            }

            await transporterAgent.sendMail(mailOptions);
        }
    }
}, {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
  },
  limiter: {
    max: 10,
    duration: 1000,
  },
});

emailWorker.on('completed', job => {
  console.log(`Job ${job.id} has completed!`);
});

emailWorker.on('failed', (job, err) => {
  console.log(`Job ${job.id} has failed with ${err.message}`);
});

module.exports = emailWorker;
