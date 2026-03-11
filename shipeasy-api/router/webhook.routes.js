const express = require('express');
const router = express.Router();

const { oceanIOWebhook } = require('../controller/webhooks.controller');
const { contactFormFilled, quotationUpdates } = require('../controller/non-auth.controller');

router.post('/oceanIOWebhook', (req, res, next) => {
    const signature = req.headers['x-webhook-signature'] || req.headers['x-signature'];
    const secret = process.env.OCEANIO_WEBHOOK_SECRET;
    if (!secret) {
        return next();
    }
    if (!signature) {
        return res.status(401).json({ error: 'Missing webhook signature' });
    }
    const crypto = require('crypto');
    const rawBody = JSON.stringify(req.body);
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    try {
        if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))) {
            return res.status(401).json({ error: 'Invalid webhook signature' });
        }
    } catch {
        return res.status(401).json({ error: 'Invalid webhook signature' });
    }
    next();
}, [oceanIOWebhook]);

router.post('/:fromPage/contactFormFilled', async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    if (token && token === process.env.WORDPRESS_TOKEN) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}, [contactFormFilled]);

router.get('/quotation/update/:id/:status', [quotationUpdates]);

module.exports = router;
