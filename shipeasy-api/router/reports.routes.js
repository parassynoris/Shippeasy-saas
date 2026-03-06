const express = require('express');
const router = express.Router();

const { validateAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/tenantIsolation');
const jasperController = require('../controller/jasperController');
const { dashboardReport, reports } = require('../controller/reports.controller');

router.post('/dashboardReport', [validateAuth, requireRole('admin', 'manager', 'finance'), dashboardReport]);
router.post('/report/:reportName', [validateAuth, requireRole('admin', 'manager', 'finance', 'operations'), reports]);
router.post('/pdf/download', [validateAuth, jasperController.downloadReport]);
router.post('/quotation/download', [jasperController.downloadReportOpenApi]);

module.exports = router;
