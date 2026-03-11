const express = require('express');
const router = express.Router();

const { validateAuth } = require('../middleware/auth');
const { requireRole, requireFeature } = require('../middleware/tenantIsolation');
const { generateTALLYEntry } = require('../controller/tally.controller');
const { pushToZircon, cancelFromZircon } = require('../controller/eInvoicing.controller');
const { createOrderReport, checkOrderReport, downloadOrderReport } = require('../controller/creditReport.controller');

router.post('/generateTALLYEntry', [validateAuth, requireRole('admin', 'finance'), generateTALLYEntry]);
router.get('/sent-to-einvoicing/:invoiceId', [validateAuth, requireRole('admin', 'finance'), requireFeature('einvoicing'), pushToZircon]);
router.get('/cancel-from-einvoicing/:invoiceId', [validateAuth, requireRole('admin', 'finance'), requireFeature('einvoicing'), cancelFromZircon]);
router.post('/createOrderReport', [validateAuth, requireRole('admin', 'finance'), createOrderReport]);
router.post('/checkOrderReport', [validateAuth, requireRole('admin', 'finance'), checkOrderReport]);
router.post('/downloadOrderReport', [validateAuth, requireRole('admin', 'finance'), downloadOrderReport]);

module.exports = router;
