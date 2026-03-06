const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));

router.use(require('./auth.routes'));
router.use(require('./tracking.routes'));
router.use(require('./ai.routes'));
router.use(require('./finance.routes'));
router.use(require('./dashboard.routes'));
router.use(require('./reports.routes'));
router.use(require('./communication.routes'));
router.use(require('./storage.routes'));
router.use(require('./webhook.routes'));

router.use(require('./crud.routes'));

module.exports = router;
