const express = require('express');
const router = express.Router();

const { validateAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/tenantIsolation');
const { profileCompletion, chatInitialization, chartDataDashboard, clearAllNotification, sendBookingConfirmation } = require('../controller/dashboard.controller');
const { findRateFreightos, quotationRate, globalSearch, exchangeRate, milestoneWiseJobCount, locationWiseContainers, fetchPortLocation } = require('../controller/search.controller');
const { downloadQrCode, getQrData, getWarehouseQrData } = require('../controller/qr.controller');
const { createLoadPlan, calculateLoad } = require('../controller/loadPlan.controller');
const { generateEDIFILE } = require('../controller/edi.controller');
const { updateBatch, update, resetEvent } = require('../controller/update.commonController');

router.post('/chartDataDashboard', [validateAuth, requireRole('admin', 'manager', 'finance', 'operations'), chartDataDashboard]);
router.post('/chatInitialization', [validateAuth, chatInitialization]);
router.post('/profileCompletion', [validateAuth, profileCompletion]);
router.post('/clearAllNotification', [validateAuth, clearAllNotification]);
router.get('/send-booking-confirmation/:id', [validateAuth, sendBookingConfirmation]);
router.get('/reset-event/:id', [validateAuth, resetEvent]);

router.post('/search-port-and-location', [validateAuth, fetchPortLocation]);
router.post('/milestoneWiseJobs', [validateAuth, milestoneWiseJobCount]);
router.post('/locationWiseContainers', [validateAuth, locationWiseContainers]);
router.post('/globalSearch', [validateAuth, globalSearch]);
router.post('/exchangeRate', [validateAuth, exchangeRate]);
router.post('/findRate', [validateAuth, findRateFreightos]);
router.post('/quotationRate', [validateAuth, quotationRate]);

router.post('/downloadQr', [validateAuth, downloadQrCode]);
router.post('/getQrs', [validateAuth, getQrData]);
router.post('/warehouseQrs', [validateAuth, getWarehouseQrData]);

router.post('/load-plan', [validateAuth, createLoadPlan]);
router.post('/load-calculate', [validateAuth, calculateLoad]);

router.post('/edi/:ediName/:documentId', [validateAuth, requireRole('admin', 'operations', 'finance'), generateEDIFILE]);

module.exports = router;
