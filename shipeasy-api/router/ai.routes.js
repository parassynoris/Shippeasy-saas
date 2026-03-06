const express = require('express');
const router = express.Router();
const multer = require('multer');

const { validateAuth } = require('../middleware/auth');
const { requireFeature } = require('../middleware/tenantIsolation');
const { scanBl, scanPurchaseInvoice } = require('../controller/search.controller');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/scan-bl', upload.single('file'), [validateAuth, requireFeature('ai-scanning'), scanBl]);
router.post('/scan-p-invoice', upload.single('file'), [validateAuth, requireFeature('ai-scanning'), scanPurchaseInvoice]);

module.exports = router;
