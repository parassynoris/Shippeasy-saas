const express = require('express');
const router = express.Router();

const { validateAuth } = require('../middleware/auth');
const { checkIndex } = require('../middleware/checkIndex');
const { enforceTenantIsolation } = require('../middleware/tenantIsolation');
const { authLimiter, uploadLimiter } = require('../middleware/security');
const {
    validateLogin,
    validatePasswordReset,
    validateCrudInsert,
    validateCrudUpdate,
    validateSearch,
    validateFileDownload,
} = require('../middleware/validateRequest');

const jasperController = require('../controller/jasperController');

const multer = require('multer');
const proxy = require('express-http-proxy');

var bodyParser = require('body-parser');
const { downloadQrCode, getQrData, getWarehouseQrData } = require('../controller/qr.controller');
const { createLoadPlan, calculateLoad } = require('../controller/loadPlan.controller');
const { profileCompletion, chatInitialization, chartDataDashboard, clearAllNotification, sendBookingConfirmation } = require('../controller/dashboard.controller');
const { generateTALLYEntry } = require('../controller/tally.controller');
const { findRateFreightos, quotationRate, globalSearch, exchangeRate, get, milestoneWiseJobCount, locationWiseContainers, fetchPortLocation, containerLocationTrack, scanBl, scanPurchaseInvoice } = require('../controller/search.controller');
const { generateEDIFILE } = require('../controller/edi.controller');
const { pushToZircon, cancelFromZircon } = require('../controller/eInvoicing.controller');
const { contactFormFilled, quotationUpdates } = require('../controller/non-auth.controller');
const { dashboardReport, reports } = require('../controller/reports.controller');
const { oceanIOWebhook } = require('../controller/webhooks.controller');
const { agentOnBoarding, getToken, resetUser, authProfile, changePassword } = require('../controller/auth.controller');
const { getMails, sendBatchEmail, sendBookingMail, emailApi } = require('../controller/email.controller');
const { createOrderReport, checkOrderReport, downloadOrderReport } = require('../controller/creditReport.controller');
const { uploadFile, uploadPublicFile, downloadFile, downloadMobileFile, downloadPublicFile, uploadPublicFileForWhatsapp } = require('../controller/storage.controller');
const { insert, insertBatch } = require('../controller/insert.commonController');
const { updateBatch, update, resetEvent } = require('../controller/update.commonController');
const { deleteCommon } = require('../controller/delete.commonController');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
router.use(urlencodedParser);

const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });

router.post('/ulipMCA', [validateAuth, proxy(`${process.env.ULIP_SERVER_URL}`, { preserveHostHdr: true })])
router.post('/ulipICEGATE', [validateAuth, proxy(`${process.env.ULIP_SERVER_URL}`, { preserveHostHdr: true })])
router.post('/ulipFASTAG', [validateAuth, proxy(`${process.env.ULIP_SERVER_URL}`, { preserveHostHdr: true })])
router.post('/ulipGST', [validateAuth, proxy(`${process.env.ULIP_SERVER_URL}`, { preserveHostHdr: true })])
router.post('/containerTrack', [validateAuth, proxy(`${process.env.ULIP_SERVER_URL}`, { preserveHostHdr: true })])

router.get('/containerLocationTrack/:number', [validateAuth, containerLocationTrack])

router.post('/scan-bl', upload.single('file'), [validateAuth, scanBl])
router.post('/scan-p-invoice', upload.single('file'), [validateAuth, scanPurchaseInvoice])

router.post('/downloadQr', [validateAuth, downloadQrCode])

router.post('/search-port-and-location', [validateAuth, fetchPortLocation])

router.post('/milestoneWiseJobs', [validateAuth, milestoneWiseJobCount])

router.post('/locationWiseContainers', [validateAuth, locationWiseContainers])

router.post('/load-plan', [ createLoadPlan])

router.post('/load-calculate', [ calculateLoad])

router.get('/send-booking-confirmation/:id', [validateAuth, sendBookingConfirmation])

router.get('/reset-event/:id', [validateAuth, resetEvent])

router.post('/profileCompletion', [validateAuth, profileCompletion])

router.post('/generateTALLYEntry', [validateAuth, generateTALLYEntry])

router.post('/upload-public-file/:name', [validateAuth, uploadPublicFileForWhatsapp])

router.post('/findRate', [validateAuth, findRateFreightos])

router.post('/edi/:ediName/:documentId', [validateAuth, generateEDIFILE])

router.get('/sent-to-einvoicing/:invoiceId', [validateAuth, pushToZircon])
router.get('/cancel-from-einvoicing/:invoiceId', [validateAuth, cancelFromZircon])
 
router.post('/chatInitialization', [validateAuth, chatInitialization])


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
}, [contactFormFilled])

router.post('/dashboardReport', [validateAuth, dashboardReport])

router.post('/oceanIOWebhook', [oceanIOWebhook])

router.post('/chartDataDashboard', [validateAuth, chartDataDashboard])

router.post('/agentOnBoarding', [ agentOnBoarding])

router.post('/quotationRate', [validateAuth, quotationRate])

router.post('/globalSearch', [validateAuth, globalSearch])

router.post('/exchangeRate', [validateAuth, exchangeRate])

router.post('/pdf/download', [validateAuth, jasperController.downloadReport])
router.post('/quotation/download', [ jasperController.downloadReportOpenApi])

router.post('/emailList', [validateAuth, getMails])

router.post('/sendBatchEmail',  upload.any(), [validateAuth, sendBatchEmail])

router.post('/getQrs', [validateAuth, getQrData])

router.post('/warehouseQrs', [validateAuth, getWarehouseQrData])

router.post('/sendBookingMail', [validateAuth, sendBookingMail])

router.post('/clearAllNotification', [validateAuth, clearAllNotification])

router.post('/report/:reportName', [validateAuth, reports])

router.post('/user/login', authLimiter, validateLogin, getToken);
router.post('/user/reset', authLimiter, validatePasswordReset, resetUser);
router.post('/user/change-password', authLimiter, validateAuth, changePassword);

router.get('/quotation/update/:id/:status', [quotationUpdates])

router.post('/createOrderReport', [validateAuth, createOrderReport])

router.post('/checkOrderReport', [validateAuth, checkOrderReport])

router.post('/downloadOrderReport', [validateAuth, downloadOrderReport])

router.post('/uploadfile', uploadLimiter, upload.single('file'), [validateAuth, uploadFile])
router.post('/uploadpublicreport', uploadLimiter, upload.single('file'), [validateAuth, uploadPublicFile])

router.post('/downloadfile/:fileName', validateFileDownload, [validateAuth, downloadFile])
router.post('/downloadmobilefile/:fileName', validateFileDownload, [validateAuth, downloadMobileFile])
router.post('/downloadpublicfile/:fileName', validateFileDownload, [validateAuth, downloadPublicFile])

router.post('/email/send', [validateAuth, emailApi])

router.post('/auth', [validateAuth, authProfile])

router.post('/search/:indexName/:id?', validateSearch, [validateAuth, enforceTenantIsolation, get])
router.post('/:indexName', validateCrudInsert, [validateAuth, checkIndex, enforceTenantIsolation, insert])

router.post('/:indexName/batchinsert', validateCrudInsert, [validateAuth, checkIndex, enforceTenantIsolation, insertBatch])
router.put('/:indexName/batchupdate', validateCrudInsert, [validateAuth, checkIndex, enforceTenantIsolation, updateBatch])

router.put('/:indexName/:id', validateCrudUpdate, [validateAuth, checkIndex, enforceTenantIsolation, update])
router.delete('/:indexName/:id', validateCrudUpdate, [validateAuth, checkIndex, enforceTenantIsolation, deleteCommon])

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Auth apis
 * /auth:
 *   post:
 *     summary: Get roles of user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The roles recieved for current user.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Transaction
 *   description: Transactions apis
 * /transaction:
 *   post:
 *     summary: Add a new transaction
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: The transaction added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /transaction/batchinsert:
 *   post:
 *     summary: Add multiple transactions
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The transaction added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /transaction/{transactionId}:
 *   put:
 *     summary: Update a transaction
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the transaction to retrieve
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: The transaction updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/transaction/{transactionId}:
 *   post:
 *     summary: Get single or multiple transaction
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the transaction master to retrieve
 *     tags: [Transaction]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All transactions.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /transaction/{transactionId}:
 *   delete:
 *     summary: Delete transactions
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the transaction to delete
 *     tags: [Transaction]
 *     responses:
 *       200:
 *         description: Deleted transactions.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /transaction/batchupdate:
 *   put:
 *     summary: Update multiple transactions
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The transaction updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Comment
 *   description: Comments apis
 * /comment:
 *   post:
 *     summary: Add a new comment
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       200:
 *         description: The comment added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /comment/batchinsert:
 *   post:
 *     summary: Add multiple comments
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The comment added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /comment/{commentId}:
 *   put:
 *     summary: Update a comment
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to retrieve
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       200:
 *         description: The comment updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/comment/{commentId}:
 *   post:
 *     summary: Get single or multiple comment
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the comment to retrieve
 *     tags: [Comment]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All comments.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /comment/{commentId}:
 *   delete:
 *     summary: Delete comments
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the comment to delete
 *     tags: [Comment]
 *     responses:
 *       200:
 *         description: Deleted comments.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /comment/batchupdate:
 *   put:
 *     summary: Update multiple comments
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The comment updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Enquiryitem
 *   description: Enquiryitems apis
 * /enquiryitem:
 *   post:
 *     summary: Add a new enquiryitem
 *     tags: [Enquiryitem]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Enquiryitem'
 *     responses:
 *       200:
 *         description: The enquiryitem added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /enquiryitem/batchinsert:
 *   post:
 *     summary: Add multiple enquiryitems
 *     tags: [Enquiryitem]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The enquiryitem added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /enquiryitem/{enquiryitemId}:
 *   put:
 *     summary: Update a enquiryitem
 *     parameters:
 *       - in: path
 *         name: enquiryitemId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the enquiryitem to retrieve
 *     tags: [Enquiryitem]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Enquiryitem'
 *     responses:
 *       200:
 *         description: The enquiryitem updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/enquiryitem/{enquiryitemId}:
 *   post:
 *     summary: Get single or multiple enquiryitem
 *     parameters:
 *       - in: path
 *         name: enquiryitemId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the enquiryitem to retrieve
 *     tags: [Enquiryitem]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All enquiryitems.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /enquiryitem/{enquiryitemId}:
 *   delete:
 *     summary: Delete enquiryitems
 *     parameters:
 *       - in: path
 *         name: enquiryitemId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the enquiryitem to delete
 *     tags: [Enquiryitem]
 *     responses:
 *       200:
 *         description: Deleted enquiryitems.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /enquiryitem/batchupdate:
 *   put:
 *     summary: Update multiple enquiryitems
 *     tags: [Enquiryitem]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The enquiryitem updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Enquiry
 *   description: Enquirys apis
 * /enquiry:
 *   post:
 *     summary: Add a new enquiry
 *     tags: [Enquiry]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Enquiry'
 *     responses:
 *       200:
 *         description: The enquiry added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /enquiry/batchinsert:
 *   post:
 *     summary: Add multiple enquirys
 *     tags: [Enquiry]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The enquiry added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /enquiry/{enquiryId}:
 *   put:
 *     summary: Update a enquiry
 *     parameters:
 *       - in: path
 *         name: enquiryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the enquiry to retrieve
 *     tags: [Enquiry]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Enquiry'
 *     responses:
 *       200:
 *         description: The enquiry updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/enquiry/{enquiryId}:
 *   post:
 *     summary: Get single or multiple enquiry
 *     parameters:
 *       - in: path
 *         name: enquiryId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the enquiry to retrieve
 *     tags: [Enquiry]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All enquirys.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /enquiry/{enquiryId}:
 *   delete:
 *     summary: Delete enquirys
 *     parameters:
 *       - in: path
 *         name: enquiryId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the enquiry to delete
 *     tags: [Enquiry]
 *     responses:
 *       200:
 *         description: Deleted enquirys.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /enquiry/batchupdate:
 *   put:
 *     summary: Update multiple enquirys
 *     tags: [Enquiry]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The enquiry updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Containermaster
 *   description: Containermasters apis
 * /containermaster:
 *   post:
 *     summary: Add a new containermaster
 *     tags: [Containermaster]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Containermaster'
 *     responses:
 *       200:
 *         description: The containermaster added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /containermaster/batchinsert:
 *   post:
 *     summary: Add multiple enquirys
 *     tags: [Containermaster]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The containermaster added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /containermaster/{containermasterId}:
 *   put:
 *     summary: Update a containermaster
 *     parameters:
 *       - in: path
 *         name: containermasterId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the containermaster to retrieve
 *     tags: [Containermaster]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Containermaster'
 *     responses:
 *       200:
 *         description: The containermaster updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/containermaster/{containermasterId}:
 *   post:
 *     summary: Get single or multiple containermaster
 *     parameters:
 *       - in: path
 *         name: containermasterId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the containermaster to retrieve
 *     tags: [Containermaster]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All containermasters.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /containermaster/{containermasterId}:
 *   delete:
 *     summary: Delete enquirys
 *     parameters:
 *       - in: path
 *         name: containermasterId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the containermaster to delete
 *     tags: [Containermaster]
 *     responses:
 *       200:
 *         description: Deleted containermasters.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /containermaster/batchupdate:
 *   put:
 *     summary: Update multiple containermasters
 *     tags: [Containermaster]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The containermaster updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Container
 *   description: Containers apis
 * /container:
 *   post:
 *     summary: Add a new container
 *     tags: [Container]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Container'
 *     responses:
 *       200:
 *         description: The container added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /container/batchinsert:
 *   post:
 *     summary: Add multiple containers
 *     tags: [Container]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The container added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /container/{containerId}:
 *   put:
 *     summary: Update a container
 *     parameters:
 *       - in: path
 *         name: containerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the container to retrieve
 *     tags: [Container]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Container'
 *     responses:
 *       200:
 *         description: The container updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/container/{containerId}:
 *   post:
 *     summary: Get single or multiple container
 *     parameters:
 *       - in: path
 *         name: containerId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the container to retrieve
 *     tags: [Container]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All containers.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /container/{containerId}:
 *   delete:
 *     summary: Delete containers
 *     parameters:
 *       - in: path
 *         name: containerId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the container to delete
 *     tags: [Container]
 *     responses:
 *       200:
 *         description: Deleted containers.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /container/batchupdate:
 *   put:
 *     summary: Update multiple containers
 *     tags: [Container]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The container updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Instruction
 *   description: Instructions apis
 * /instruction:
 *   post:
 *     summary: Add a new instruction
 *     tags: [Instruction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Instruction'
 *     responses:
 *       200:
 *         description: The instruction added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /instruction/batchinsert:
 *   post:
 *     summary: Add multiple instructions
 *     tags: [Instruction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The instruction added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /instruction/{instructionId}:
 *   put:
 *     summary: Update a instruction
 *     parameters:
 *       - in: path
 *         name: instructionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the instruction to retrieve
 *     tags: [Instruction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Instruction'
 *     responses:
 *       200:
 *         description: The instruction updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/instruction/{instructionId}:
 *   post:
 *     summary: Get single or multiple instruction
 *     parameters:
 *       - in: path
 *         name: instructionId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the instruction to retrieve
 *     tags: [Instruction]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All instructions.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /instruction/{instructionId}:
 *   delete:
 *     summary: Delete instructions
 *     parameters:
 *       - in: path
 *         name: instructionId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the instruction to delete
 *     tags: [Instruction]
 *     responses:
 *       200:
 *         description: Deleted instructions.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /instruction/batchupdate:
 *   put:
 *     summary: Update multiple instructions
 *     tags: [Instruction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The instruction updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Location
 *   description: Locations apis
 * /location:
 *   post:
 *     summary: Add a new location
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Location'
 *     responses:
 *       200:
 *         description: The location added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /location/batchinsert:
 *   post:
 *     summary: Add multiple locations
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The location added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /location/{locationId}:
 *   put:
 *     summary: Update a location
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the location to retrieve
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Location'
 *     responses:
 *       200:
 *         description: The location updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/location/{locationId}:
 *   post:
 *     summary: Get single or multiple location
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the location to retrieve
 *     tags: [Location]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All locations.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /location/{locationId}:
 *   delete:
 *     summary: Delete locations
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the location to delete
 *     tags: [Location]
 *     responses:
 *       200:
 *         description: Deleted locations.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /location/batchupdate:
 *   put:
 *     summary: Update multiple locations
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The location updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Voyage
 *   description: Voyages apis
 * /voyage:
 *   post:
 *     summary: Add a new voyage
 *     tags: [Voyage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Voyage'
 *     responses:
 *       200:
 *         description: The voyage added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /voyage/batchinsert:
 *   post:
 *     summary: Add multiple voyages
 *     tags: [Voyage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The voyage added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /voyage/{voyageId}:
 *   put:
 *     summary: Update a voyage
 *     parameters:
 *       - in: path
 *         name: voyageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the voyage to retrieve
 *     tags: [Voyage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Voyage'
 *     responses:
 *       200:
 *         description: The voyage updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/voyage/{voyageId}:
 *   post:
 *     summary: Get single or multiple voyage
 *     parameters:
 *       - in: path
 *         name: voyageId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the voyage to retrieve
 *     tags: [Voyage]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All voyages.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /voyage/{voyageId}:
 *   delete:
 *     summary: Delete voyages
 *     parameters:
 *       - in: path
 *         name: voyageId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the voyage to delete
 *     tags: [Voyage]
 *     responses:
 *       200:
 *         description: Deleted voyages.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /voyage/batchupdate:
 *   put:
 *     summary: Update multiple voyages
 *     tags: [Voyage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The voyage updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Port
 *   description: Ports apis
 * /port:
 *   post:
 *     summary: Add a new port
 *     tags: [Port]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Port'
 *     responses:
 *       200:
 *         description: The port added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /port/batchinsert:
 *   post:
 *     summary: Add multiple ports
 *     tags: [Port]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The port added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /port/{portId}:
 *   put:
 *     summary: Update a port
 *     parameters:
 *       - in: path
 *         name: portId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the port to retrieve
 *     tags: [Port]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Port'
 *     responses:
 *       200:
 *         description: The port updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/port/{portId}:
 *   post:
 *     summary: Get single or multiple port
 *     parameters:
 *       - in: path
 *         name: portId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the port to retrieve
 *     tags: [Port]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All ports.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /port/{portId}:
 *   delete:
 *     summary: Delete ports
 *     parameters:
 *       - in: path
 *         name: portId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the port to delete
 *     tags: [Port]
 *     responses:
 *       200:
 *         description: Deleted ports.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /port/batchupdate:
 *   put:
 *     summary: Update multiple ports
 *     tags: [Port]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The port updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Products apis
 * /product:
 *   post:
 *     summary: Add a new product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: The product added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /product/batchinsert:
 *   post:
 *     summary: Add multiple products
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The product added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /product/{productId}:
 *   put:
 *     summary: Update a product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to retrieve
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: The product updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/product/{productId}:
 *   post:
 *     summary: Get single or multiple product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the product to retrieve
 *     tags: [Product]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All products.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /product/{productId}:
 *   delete:
 *     summary: Delete products
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the product to delete
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Deleted products.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /product/batchupdate:
 *   put:
 *     summary: Update multiple products
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The product updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Uom
 *   description: Uoms apis
 * /uom:
 *   post:
 *     summary: Add a new uom
 *     tags: [Uom]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Uom'
 *     responses:
 *       200:
 *         description: The uom added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /uom/batchinsert:
 *   post:
 *     summary: Add multiple uoms
 *     tags: [Uom]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The uom added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /uom/{uomId}:
 *   put:
 *     summary: Update a uom
 *     parameters:
 *       - in: path
 *         name: uomId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the uom to retrieve
 *     tags: [Uom]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Uom'
 *     responses:
 *       200:
 *         description: The uom updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/uom/{uomId}:
 *   post:
 *     summary: Get single or multiple uom
 *     parameters:
 *       - in: path
 *         name: uomId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the uom to retrieve
 *     tags: [Uom]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All uoms.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /uom/{uomId}:
 *   delete:
 *     summary: Delete uoms
 *     parameters:
 *       - in: path
 *         name: uomId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the uom to delete
 *     tags: [Uom]
 *     responses:
 *       200:
 *         description: Deleted uoms.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /uom/batchupdate:
 *   put:
 *     summary: Update multiple uoms
 *     tags: [Uom]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The uom updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Vessel
 *   description: Vessels apis
 * /vessel:
 *   post:
 *     summary: Add a new vessel
 *     tags: [Vessel]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vessel'
 *     responses:
 *       200:
 *         description: The vessel added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /vessel/batchinsert:
 *   post:
 *     summary: Add multiple vessels
 *     tags: [Vessel]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The vessel added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /vessel/{vesselId}:
 *   put:
 *     summary: Update a vessel
 *     parameters:
 *       - in: path
 *         name: vesselId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the vessel to retrieve
 *     tags: [Vessel]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vessel'
 *     responses:
 *       200:
 *         description: The vessel updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/vessel/{vesselId}:
 *   post:
 *     summary: Get single or multiple vessel
 *     parameters:
 *       - in: path
 *         name: vesselId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the vessel to retrieve
 *     tags: [Vessel]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All vessels.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /vessel/{vesselId}:
 *   delete:
 *     summary: Delete vessels
 *     parameters:
 *       - in: path
 *         name: vesselId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the vessel to delete
 *     tags: [Vessel]
 *     responses:
 *       200:
 *         description: Deleted vessels.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /vessel/batchupdate:
 *   put:
 *     summary: Update multiple vessels
 *     tags: [Vessel]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The vessel updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Costtemplate
 *   description: Costtemplates apis
 * /costtemplate:
 *   post:
 *     summary: Add a new costtemplate
 *     tags: [Costtemplate]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Costtemplate'
 *     responses:
 *       200:
 *         description: The costtemplate added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /costtemplate/batchinsert:
 *   post:
 *     summary: Add multiple costtemplates
 *     tags: [Costtemplate]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The costtemplate added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /costtemplate/{costtemplateId}:
 *   put:
 *     summary: Update a costtemplate
 *     parameters:
 *       - in: path
 *         name: costtemplateId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the costtemplate to retrieve
 *     tags: [Costtemplate]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Costtemplate'
 *     responses:
 *       200:
 *         description: The costtemplate updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/costtemplate/{costtemplateId}:
 *   post:
 *     summary: Get single or multiple costtemplate
 *     parameters:
 *       - in: path
 *         name: costtemplateId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the costtemplate to retrieve
 *     tags: [Costtemplate]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All costtemplates.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /costtemplate/{costtemplateId}:
 *   delete:
 *     summary: Delete costtemplates
 *     parameters:
 *       - in: path
 *         name: costtemplateId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the costtemplate to delete
 *     tags: [Costtemplate]
 *     responses:
 *       200:
 *         description: Deleted costtemplates.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /costtemplate/batchupdate:
 *   put:
 *     summary: Update multiple costtemplates
 *     tags: [Costtemplate]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The costtemplate updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: City
 *   description: Citys apis
 * /city:
 *   post:
 *     summary: Add a new city
 *     tags: [City]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/City'
 *     responses:
 *       200:
 *         description: The city added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /city/batchinsert:
 *   post:
 *     summary: Add multiple citys
 *     tags: [City]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The city added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /city/{cityId}:
 *   put:
 *     summary: Update a city
 *     parameters:
 *       - in: path
 *         name: cityId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the city to retrieve
 *     tags: [City]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/City'
 *     responses:
 *       200:
 *         description: The city updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/city/{cityId}:
 *   post:
 *     summary: Get single or multiple city
 *     parameters:
 *       - in: path
 *         name: cityId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the city to retrieve
 *     tags: [City]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All citys.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /city/{cityId}:
 *   delete:
 *     summary: Delete citys
 *     parameters:
 *       - in: path
 *         name: cityId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the city to delete
 *     tags: [City]
 *     responses:
 *       200:
 *         description: Deleted citys.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /city/batchupdate:
 *   put:
 *     summary: Update multiple citys
 *     tags: [City]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The city updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Country
 *   description: Countrys apis
 * /country:
 *   post:
 *     summary: Add a new country
 *     tags: [Country]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Country'
 *     responses:
 *       200:
 *         description: The country added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /country/batchinsert:
 *   post:
 *     summary: Add multiple countrys
 *     tags: [Country]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The country added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /country/{countryId}:
 *   put:
 *     summary: Update a country
 *     parameters:
 *       - in: path
 *         name: countryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the country to retrieve
 *     tags: [Country]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Country'
 *     responses:
 *       200:
 *         description: The country updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/country/{countryId}:
 *   post:
 *     summary: Get single or multiple country
 *     parameters:
 *       - in: path
 *         name: countryId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the country to retrieve
 *     tags: [Country]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All countrys.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /country/{countryId}:
 *   delete:
 *     summary: Delete countrys
 *     parameters:
 *       - in: path
 *         name: countryId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the country to delete
 *     tags: [Country]
 *     responses:
 *       200:
 *         description: Deleted countrys.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /country/batchupdate:
 *   put:
 *     summary: Update multiple countrys
 *     tags: [Country]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The country updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Partymaster
 *   description: Partymasters apis
 * /partymaster:
 *   post:
 *     summary: Add a new partymaster
 *     tags: [Partymaster]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Partymaster'
 *     responses:
 *       200:
 *         description: The partymaster added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /partymaster/batchinsert:
 *   post:
 *     summary: Add multiple partymasters
 *     tags: [Partymaster]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The partymaster added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /partymaster/{partymasterId}:
 *   put:
 *     summary: Update a partymaster
 *     parameters:
 *       - in: path
 *         name: partymasterId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the partymaster to retrieve
 *     tags: [Partymaster]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Partymaster'
 *     responses:
 *       200:
 *         description: The partymaster updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/partymaster/{partymasterId}:
 *   post:
 *     summary: Get single or multiple partymaster
 *     parameters:
 *       - in: path
 *         name: partymasterId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the partymaster to retrieve
 *     tags: [Partymaster]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All partymasters.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /partymaster/{partymasterId}:
 *   delete:
 *     summary: Delete partymasters
 *     parameters:
 *       - in: path
 *         name: partymasterId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the partymaster to delete
 *     tags: [Partymaster]
 *     responses:
 *       200:
 *         description: Deleted partymasters.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /partymaster/batchupdate:
 *   put:
 *     summary: Update multiple partymasters
 *     tags: [Partymaster]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The partymaster updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Role
 *   description: Roles apis
 * /role:
 *   post:
 *     summary: Add a new role
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Role'
 *     responses:
 *       200:
 *         description: The role added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /role/batchinsert:
 *   post:
 *     summary: Add multiple roles
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The role added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /role/{roleId}:
 *   put:
 *     summary: Update a role
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the role to retrieve
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Role'
 *     responses:
 *       200:
 *         description: The role updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/role/{roleId}:
 *   post:
 *     summary: Get single or multiple role
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the role to retrieve
 *     tags: [Role]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All roles.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /role/{roleId}:
 *   delete:
 *     summary: Delete roles
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the role to delete
 *     tags: [Role]
 *     responses:
 *       200:
 *         description: Deleted roles.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /role/batchupdate:
 *   put:
 *     summary: Update multiple roles
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The role updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Users apis
 * /user:
 *   post:
 *     summary: Add a new user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The user added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /user/batchinsert:
 *   post:
 *     summary: Add multiple users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The user added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /user/{userId}:
 *   put:
 *     summary: Update a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The user updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/user/{userId}:
 *   post:
 *     summary: Get single or multiple user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the user to retrieve
 *     tags: [User]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All users.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /user/{userId}:
 *   delete:
 *     summary: Delete users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the user to delete
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Deleted users.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /user/batchupdate:
 *   put:
 *     summary: Update multiple users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The user updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Bank
 *   description: Banks apis
 * /bank:
 *   post:
 *     summary: Add a new bank
 *     tags: [Bank]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Bank'
 *     responses:
 *       200:
 *         description: The bank added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /bank/batchinsert:
 *   post:
 *     summary: Add multiple banks
 *     tags: [Bank]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The bank added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /bank/{bankId}:
 *   put:
 *     summary: Update a bank
 *     parameters:
 *       - in: path
 *         name: bankId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the bank to retrieve
 *     tags: [Bank]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Bank'
 *     responses:
 *       200:
 *         description: The bank updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/bank/{bankId}:
 *   post:
 *     summary: Get single or multiple bank
 *     parameters:
 *       - in: path
 *         name: bankId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the bank to retrieve
 *     tags: [Bank]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All banks.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /bank/{bankId}:
 *   delete:
 *     summary: Delete banks
 *     parameters:
 *       - in: path
 *         name: bankId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the bank to delete
 *     tags: [Bank]
 *     responses:
 *       200:
 *         description: Deleted banks.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /bank/batchupdate:
 *   put:
 *     summary: Update multiple banks
 *     tags: [Bank]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The bank updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Costitem
 *   description: Costitems apis
 * /costitem:
 *   post:
 *     summary: Add a new costitem
 *     tags: [Costitem]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Costitem'
 *     responses:
 *       200:
 *         description: The costitem added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /costitem/batchinsert:
 *   post:
 *     summary: Add multiple costitems
 *     tags: [Costitem]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The costitem added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /costitem/{costitemId}:
 *   put:
 *     summary: Update a costitem
 *     parameters:
 *       - in: path
 *         name: costitemId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the costitem to retrieve
 *     tags: [Costitem]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Costitem'
 *     responses:
 *       200:
 *         description: The costitem updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/costitem/{costitemId}:
 *   post:
 *     summary: Get single or multiple costitem
 *     parameters:
 *       - in: path
 *         name: costitemId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the costitem to retrieve
 *     tags: [Costitem]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All costitems.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /costitem/{costitemId}:
 *   delete:
 *     summary: Delete costitems
 *     parameters:
 *       - in: path
 *         name: costitemId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the costitem to delete
 *     tags: [Costitem]
 *     responses:
 *       200:
 *         description: Deleted costitems.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /costitem/batchupdate:
 *   put:
 *     summary: Update multiple costitems
 *     tags: [Costitem]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The costitem updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Clause
 *   description: Clauses apis
 * /clause:
 *   post:
 *     summary: Add a new clause
 *     tags: [Clause]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Clause'
 *     responses:
 *       200:
 *         description: The clause added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /clause/batchinsert:
 *   post:
 *     summary: Add multiple clauses
 *     tags: [Clause]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The clause added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /clause/{clauseId}:
 *   put:
 *     summary: Update a clause
 *     parameters:
 *       - in: path
 *         name: clauseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the clause to retrieve
 *     tags: [Clause]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Clause'
 *     responses:
 *       200:
 *         description: The clause updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/clause/{clauseId}:
 *   post:
 *     summary: Get single or multiple clause
 *     parameters:
 *       - in: path
 *         name: clauseId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the clause to retrieve
 *     tags: [Clause]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All clauses.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /clause/{clauseId}:
 *   delete:
 *     summary: Delete clauses
 *     parameters:
 *       - in: path
 *         name: clauseId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the clause to delete
 *     tags: [Clause]
 *     responses:
 *       200:
 *         description: Deleted clauses.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /clause/batchupdate:
 *   put:
 *     summary: Update multiple clauses
 *     tags: [Clause]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The clause updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Costhead
 *   description: Costheads apis
 * /costhead:
 *   post:
 *     summary: Add a new costhead
 *     tags: [Costhead]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Costhead'
 *     responses:
 *       200:
 *         description: The costhead added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /costhead/batchinsert:
 *   post:
 *     summary: Add multiple costheads
 *     tags: [Costhead]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The costhead added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /costhead/{costheadId}:
 *   put:
 *     summary: Update a costhead
 *     parameters:
 *       - in: path
 *         name: costheadId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the costhead to retrieve
 *     tags: [Costhead]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Costhead'
 *     responses:
 *       200:
 *         description: The costhead updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/costhead/{costheadId}:
 *   post:
 *     summary: Get single or multiple costhead
 *     parameters:
 *       - in: path
 *         name: costheadId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the costhead to retrieve
 *     tags: [Costhead]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All costheads.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /costhead/{costheadId}:
 *   delete:
 *     summary: Delete costheads
 *     parameters:
 *       - in: path
 *         name: costheadId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the costhead to delete
 *     tags: [Costhead]
 *     responses:
 *       200:
 *         description: Deleted costheads.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /costhead/batchupdate:
 *   put:
 *     summary: Update multiple costheads
 *     tags: [Costhead]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The costhead updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Currency
 *   description: Currencys apis
 * /currency:
 *   post:
 *     summary: Add a new currency
 *     tags: [Currency]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Currency'
 *     responses:
 *       200:
 *         description: The currency added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /currency/batchinsert:
 *   post:
 *     summary: Add multiple currencys
 *     tags: [Currency]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The currency added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /currency/{currencyId}:
 *   put:
 *     summary: Update a currency
 *     parameters:
 *       - in: path
 *         name: currencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the currency to retrieve
 *     tags: [Currency]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Currency'
 *     responses:
 *       200:
 *         description: The currency updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/currency/{currencyId}:
 *   post:
 *     summary: Get single or multiple currency
 *     parameters:
 *       - in: path
 *         name: currencyId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the currency to retrieve
 *     tags: [Currency]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All currencys.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /currency/{currencyId}:
 *   delete:
 *     summary: Delete currencys
 *     parameters:
 *       - in: path
 *         name: currencyId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the currency to delete
 *     tags: [Currency]
 *     responses:
 *       200:
 *         description: Deleted currencys.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /currency/batchupdate:
 *   put:
 *     summary: Update multiple currencys
 *     tags: [Currency]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The currency updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Currrate
 *   description: Currrates apis
 * /currrate:
 *   post:
 *     summary: Add a new currrate
 *     tags: [Currrate]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Currrate'
 *     responses:
 *       200:
 *         description: The currrate added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /currrate/batchinsert:
 *   post:
 *     summary: Add multiple currrates
 *     tags: [Currrate]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The currrate added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /currrate/{currrateId}:
 *   put:
 *     summary: Update a currrate
 *     parameters:
 *       - in: path
 *         name: currrateId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the currrate to retrieve
 *     tags: [Currrate]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Currrate'
 *     responses:
 *       200:
 *         description: The currrate updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/currrate/{currrateId}:
 *   post:
 *     summary: Get single or multiple currrate
 *     parameters:
 *       - in: path
 *         name: currrateId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the currrate to retrieve
 *     tags: [Currrate]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All currrates.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /currrate/{currrateId}:
 *   delete:
 *     summary: Delete currrates
 *     parameters:
 *       - in: path
 *         name: currrateId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the currrate to delete
 *     tags: [Currrate]
 *     responses:
 *       200:
 *         description: Deleted currrates.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /currrate/batchupdate:
 *   put:
 *     summary: Update multiple currrates
 *     tags: [Currrate]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The currrate updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Taxtype
 *   description: Taxtypes apis
 * /taxtype:
 *   post:
 *     summary: Add a new taxtype
 *     tags: [Taxtype]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Taxtype'
 *     responses:
 *       200:
 *         description: The taxtype added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /taxtype/batchinsert:
 *   post:
 *     summary: Add multiple taxtypes
 *     tags: [Taxtype]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The taxtype added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /taxtype/{taxtypeId}:
 *   put:
 *     summary: Update a taxtype
 *     parameters:
 *       - in: path
 *         name: taxtypeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the taxtype to retrieve
 *     tags: [Taxtype]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Taxtype'
 *     responses:
 *       200:
 *         description: The taxtype updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/taxtype/{taxtypeId}:
 *   post:
 *     summary: Get single or multiple taxtype
 *     parameters:
 *       - in: path
 *         name: taxtypeId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the taxtype to retrieve
 *     tags: [Taxtype]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All taxtypes.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /taxtype/{taxtypeId}:
 *   delete:
 *     summary: Delete taxtypes
 *     parameters:
 *       - in: path
 *         name: taxtypeId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the taxtype to delete
 *     tags: [Taxtype]
 *     responses:
 *       200:
 *         description: Deleted taxtypes.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /taxtype/batchupdate:
 *   put:
 *     summary: Update multiple taxtypes
 *     tags: [Taxtype]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The taxtype updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Shippingline
 *   description: Shippinglines apis
 * /shippingline:
 *   post:
 *     summary: Add a new shippingline
 *     tags: [Shippingline]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Shippingline'
 *     responses:
 *       200:
 *         description: The shippingline added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /shippingline/batchinsert:
 *   post:
 *     summary: Add multiple shippinglines
 *     tags: [Shippingline]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The shippingline added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /shippingline/{shippinglineId}:
 *   put:
 *     summary: Update a shippingline
 *     parameters:
 *       - in: path
 *         name: shippinglineId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the shippingline to retrieve
 *     tags: [Shippingline]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Shippingline'
 *     responses:
 *       200:
 *         description: The shippingline updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/shippingline/{shippinglineId}:
 *   post:
 *     summary: Get single or multiple shippingline
 *     parameters:
 *       - in: path
 *         name: shippinglineId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the shippingline to retrieve
 *     tags: [Shippingline]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All shippinglines.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /shippingline/{shippinglineId}:
 *   delete:
 *     summary: Delete shippinglines
 *     parameters:
 *       - in: path
 *         name: shippinglineId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the shippingline to delete
 *     tags: [Shippingline]
 *     responses:
 *       200:
 *         description: Deleted shippinglines.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /shippingline/batchupdate:
 *   put:
 *     summary: Update multiple shippinglines
 *     tags: [Shippingline]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The shippingline updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Systemtype
 *   description: Systemtypes apis
 * /systemtype:
 *   post:
 *     summary: Add a new systemtype
 *     tags: [Systemtype]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Systemtype'
 *     responses:
 *       200:
 *         description: The systemtype added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /systemtype/batchinsert:
 *   post:
 *     summary: Add multiple systemtypes
 *     tags: [Systemtype]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The systemtype added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /systemtype/{systemtypeId}:
 *   put:
 *     summary: Update a systemtype
 *     parameters:
 *       - in: path
 *         name: systemtypeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the systemtype to retrieve
 *     tags: [Systemtype]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Systemtype'
 *     responses:
 *       200:
 *         description: The systemtype updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/systemtype/{systemtypeId}:
 *   post:
 *     summary: Get single or multiple systemtype
 *     parameters:
 *       - in: path
 *         name: systemtypeId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the systemtype to retrieve
 *     tags: [Systemtype]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All systemtypes.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /systemtype/{systemtypeId}:
 *   delete:
 *     summary: Delete systemtypes
 *     parameters:
 *       - in: path
 *         name: systemtypeId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the systemtype to delete
 *     tags: [Systemtype]
 *     responses:
 *       200:
 *         description: Deleted systemtypes.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /systemtype/batchupdate:
 *   put:
 *     summary: Update multiple systemtypes
 *     tags: [Systemtype]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The systemtype updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Agent
 *   description: Agents apis
 * /agent:
 *   post:
 *     summary: Add a new agent
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Agent'
 *     responses:
 *       200:
 *         description: The agent added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /agent/batchinsert:
 *   post:
 *     summary: Add multiple agents
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The agent added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /agent/{agentId}:
 *   put:
 *     summary: Update a agent
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the agent to retrieve
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Agent'
 *     responses:
 *       200:
 *         description: The agent updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/agent/{agentId}:
 *   post:
 *     summary: Get single or multiple agent
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the agent to retrieve
 *     tags: [Agent]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All agents.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /agent/{agentId}:
 *   delete:
 *     summary: Delete agents
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the agent to delete
 *     tags: [Agent]
 *     responses:
 *       200:
 *         description: Deleted agents.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /agent/batchupdate:
 *   put:
 *     summary: Update multiple agents
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The agent updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Branch
 *   description: Branchs apis
 * /branch:
 *   post:
 *     summary: Add a new branch
 *     tags: [Branch]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Branch'
 *     responses:
 *       200:
 *         description: The branch added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /branch/batchinsert:
 *   post:
 *     summary: Add multiple branchs
 *     tags: [Branch]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The branch added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /branch/{branchId}:
 *   put:
 *     summary: Update a branch
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the branch to retrieve
 *     tags: [Branch]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Branch'
 *     responses:
 *       200:
 *         description: The branch updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/branch/{branchId}:
 *   post:
 *     summary: Get single or multiple branch
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the branch to retrieve
 *     tags: [Branch]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All branchs.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /branch/{branchId}:
 *   delete:
 *     summary: Delete branchs
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the branch to delete
 *     tags: [Branch]
 *     responses:
 *       200:
 *         description: Deleted branchs.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /branch/batchupdate:
 *   put:
 *     summary: Update multiple branchs
 *     tags: [Branch]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The branch updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Contacts apis
 * /contact:
 *   post:
 *     summary: Add a new contact
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contact'
 *     responses:
 *       200:
 *         description: The contact added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /contact/batchinsert:
 *   post:
 *     summary: Add multiple contacts
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The contact added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /contact/{contactId}:
 *   put:
 *     summary: Update a contact
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the contact to retrieve
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contact'
 *     responses:
 *       200:
 *         description: The contact updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/contact/{contactId}:
 *   post:
 *     summary: Get single or multiple contact
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the contact to retrieve
 *     tags: [Contact]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All contacts.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /contact/{contactId}:
 *   delete:
 *     summary: Delete contacts
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the contact to delete
 *     tags: [Contact]
 *     responses:
 *       200:
 *         description: Deleted contacts.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /contact/batchupdate:
 *   put:
 *     summary: Update multiple contacts
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The contact updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Employee
 *   description: Employees apis
 * /employee:
 *   post:
 *     summary: Add a new employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       200:
 *         description: The employee added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /employee/batchinsert:
 *   post:
 *     summary: Add multiple employees
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The employee added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /employee/{employeeId}:
 *   put:
 *     summary: Update a employee
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the employee to retrieve
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       200:
 *         description: The employee updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/employee/{employeeId}:
 *   post:
 *     summary: Get single or multiple employee
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the employee to retrieve
 *     tags: [Employee]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All employees.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /employee/{employeeId}:
 *   delete:
 *     summary: Delete employees
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the employee to delete
 *     tags: [Employee]
 *     responses:
 *       200:
 *         description: Deleted employees.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /employee/batchupdate:
 *   put:
 *     summary: Update multiple employees
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The employee updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Department
 *   description: Departments apis
 * /department:
 *   post:
 *     summary: Add a new department
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Department'
 *     responses:
 *       200:
 *         description: The department added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /department/batchinsert:
 *   post:
 *     summary: Add multiple departments
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The department added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /department/{departmentId}:
 *   put:
 *     summary: Update a department
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the department to retrieve
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Department'
 *     responses:
 *       200:
 *         description: The department updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/department/{departmentId}:
 *   post:
 *     summary: Get single or multiple department
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the department to retrieve
 *     tags: [Department]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All departments.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /department/{departmentId}:
 *   delete:
 *     summary: Delete departments
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the department to delete
 *     tags: [Department]
 *     responses:
 *       200:
 *         description: Deleted departments.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /department/batchupdate:
 *   put:
 *     summary: Update multiple departments
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The department updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Agentadvice
 *   description: Agentadvices apis
 * /agentadvice:
 *   post:
 *     summary: Add a new agentadvice
 *     tags: [Agentadvice]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Agentadvice'
 *     responses:
 *       200:
 *         description: The agentadvice added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /agentadvice/batchinsert:
 *   post:
 *     summary: Add multiple agentadvices
 *     tags: [Agentadvice]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The agentadvice added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /agentadvice/{agentadviceId}:
 *   put:
 *     summary: Update a agentadvice
 *     parameters:
 *       - in: path
 *         name: agentadviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the agentadvice to retrieve
 *     tags: [Agentadvice]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Agentadvice'
 *     responses:
 *       200:
 *         description: The agentadvice updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/agentadvice/{agentadviceId}:
 *   post:
 *     summary: Get single or multiple agentadvice
 *     parameters:
 *       - in: path
 *         name: agentadviceId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the agentadvice to retrieve
 *     tags: [Agentadvice]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All agentadvices.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /agentadvice/{agentadviceId}:
 *   delete:
 *     summary: Delete agentadvices
 *     parameters:
 *       - in: path
 *         name: agentadviceId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the agentadvice to delete
 *     tags: [Agentadvice]
 *     responses:
 *       200:
 *         description: Deleted agentadvices.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /agentadvice/batchupdate:
 *   put:
 *     summary: Update multiple agentadvices
 *     tags: [Agentadvice]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The agentadvice updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Invoice
 *   description: Invoices apis
 * /invoice:
 *   post:
 *     summary: Add a new invoice
 *     tags: [Invoice]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Invoice'
 *     responses:
 *       200:
 *         description: The invoice added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /invoice/batchinsert:
 *   post:
 *     summary: Add multiple invoices
 *     tags: [Invoice]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The invoice added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /invoice/{invoiceId}:
 *   put:
 *     summary: Update a invoice
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the invoice to retrieve
 *     tags: [Invoice]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Invoice'
 *     responses:
 *       200:
 *         description: The invoice updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/invoice/{invoiceId}:
 *   post:
 *     summary: Get single or multiple invoice
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the invoice to retrieve
 *     tags: [Invoice]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All invoices.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /invoice/{invoiceId}:
 *   delete:
 *     summary: Delete invoices
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the invoice to delete
 *     tags: [Invoice]
 *     responses:
 *       200:
 *         description: Deleted invoices.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /invoice/batchupdate:
 *   put:
 *     summary: Update multiple invoices
 *     tags: [Invoice]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The invoice updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Document
 *   description: Documents apis
 * /document:
 *   post:
 *     summary: Add a new document
 *     tags: [Document]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Document'
 *     responses:
 *       200:
 *         description: The document added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /document/batchinsert:
 *   post:
 *     summary: Add multiple documents
 *     tags: [Document]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The document added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /document/{documentId}:
 *   put:
 *     summary: Update a document
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the document to retrieve
 *     tags: [Document]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Document'
 *     responses:
 *       200:
 *         description: The document updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/document/{documentId}:
 *   post:
 *     summary: Get single or multiple document
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the document to retrieve
 *     tags: [Document]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All documents.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /document/{documentId}:
 *   delete:
 *     summary: Delete documents
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the document to delete
 *     tags: [Document]
 *     responses:
 *       200:
 *         description: Deleted documents.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /document/batchupdate:
 *   put:
 *     summary: Update multiple documents
 *     tags: [Document]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The document updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Deliveryorder
 *   description: Deliveryorders apis
 * /deliveryorder:
 *   post:
 *     summary: Add a new deliveryorder
 *     tags: [Deliveryorder]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Deliveryorder'
 *     responses:
 *       200:
 *         description: The deliveryorder added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /deliveryorder/batchinsert:
 *   post:
 *     summary: Add multiple deliveryorders
 *     tags: [Deliveryorder]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The deliveryorder added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /deliveryorder/{deliveryorderId}:
 *   put:
 *     summary: Update a deliveryorder
 *     parameters:
 *       - in: path
 *         name: deliveryorderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deliveryorder to retrieve
 *     tags: [Deliveryorder]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Deliveryorder'
 *     responses:
 *       200:
 *         description: The deliveryorder updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/deliveryorder/{deliveryorderId}:
 *   post:
 *     summary: Get single or multiple deliveryorder
 *     parameters:
 *       - in: path
 *         name: deliveryorderId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the deliveryorder to retrieve
 *     tags: [Deliveryorder]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All deliveryorders.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /deliveryorder/{deliveryorderId}:
 *   delete:
 *     summary: Delete deliveryorders
 *     parameters:
 *       - in: path
 *         name: deliveryorderId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the deliveryorder to delete
 *     tags: [Deliveryorder]
 *     responses:
 *       200:
 *         description: Deleted deliveryorders.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /deliveryorder/batchupdate:
 *   put:
 *     summary: Update multiple deliveryorders
 *     tags: [Deliveryorder]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The deliveryorder updated.
 *       500:
 *         description: Some server error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Tds
 *   description: Tdss apis
 * /tds:
 *   post:
 *     summary: Add a new tds
 *     tags: [Tds]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tds'
 *     responses:
 *       200:
 *         description: The tds added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /tds/batchinsert:
 *   post:
 *     summary: Add multiple tdss
 *     tags: [Tds]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The tds added.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /tds/{tdsId}:
 *   put:
 *     summary: Update a tds
 *     parameters:
 *       - in: path
 *         name: tdsId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tds to retrieve
 *     tags: [Tds]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tds'
 *     responses:
 *       200:
 *         description: The tds updated.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /search/tds/{tdsId}:
 *   post:
 *     summary: Get single or multiple tds
 *     parameters:
 *       - in: path
 *         name: tdsId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the tds to retrieve
 *     tags: [Tds]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: All tdss.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /tds/{tdsId}:
 *   delete:
 *     summary: Delete tdss
 *     parameters:
 *       - in: path
 *         name: tdsId
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: null
 *         description: The ID of the tds to delete
 *     tags: [Tds]
 *     responses:
 *       200:
 *         description: Deleted tdss.
 *       500:
 *         description: Some server error
 *
 */
/**
 * @swagger
 * /tds/batchupdate:
 *   put:
 *     summary: Update multiple tdss
 *     tags: [Tds]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: 
 *             type: array
 *             items: 
 *               type: string
 *     responses:
 *       200:
 *         description: The tds updated.
 *       500:
 *         description: Some server error
 *
 */

router.use('*', (req, res) => {
    return res.status(404).json({
      success: false,
      message: 'API endpoint doesnt exist'
    })
});
module.exports = router;