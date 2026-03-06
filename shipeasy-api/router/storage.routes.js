const express = require('express');
const router = express.Router();
const multer = require('multer');

const { validateAuth } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/security');
const { validateFileDownload } = require('../middleware/validateRequest');
const { uploadFile, uploadPublicFile, downloadFile, downloadMobileFile, downloadPublicFile } = require('../controller/storage.controller');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/uploadfile', uploadLimiter, upload.single('file'), [validateAuth, uploadFile]);
router.post('/uploadpublicreport', uploadLimiter, upload.single('file'), [validateAuth, uploadPublicFile]);
router.post('/downloadfile/:fileName', validateFileDownload, [validateAuth, downloadFile]);
router.post('/downloadmobilefile/:fileName', validateFileDownload, [validateAuth, downloadMobileFile]);
router.post('/downloadpublicfile/:fileName', validateFileDownload, [validateAuth, downloadPublicFile]);

module.exports = router;
