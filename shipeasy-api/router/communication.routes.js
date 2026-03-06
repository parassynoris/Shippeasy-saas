const express = require('express');
const router = express.Router();
const multer = require('multer');

const { validateAuth } = require('../middleware/auth');
const { getMails, sendBatchEmail, sendBookingMail, emailApi } = require('../controller/email.controller');
const { uploadPublicFileForWhatsapp } = require('../controller/storage.controller');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/emailList', [validateAuth, getMails]);
router.post('/sendBatchEmail', upload.any(), [validateAuth, sendBatchEmail]);
router.post('/sendBookingMail', [validateAuth, sendBookingMail]);
router.post('/email/send', [validateAuth, emailApi]);
router.post('/upload-public-file/:name', [validateAuth, uploadPublicFileForWhatsapp]);

module.exports = router;
