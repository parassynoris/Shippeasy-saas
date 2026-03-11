const express = require('express');
const router = express.Router();
const proxy = require('express-http-proxy');

const { validateAuth } = require('../middleware/auth');
const { containerLocationTrack } = require('../controller/search.controller');

router.post('/ulipMCA', [validateAuth, proxy(`${process.env.ULIP_SERVER_URL}`, { preserveHostHdr: true })]);
router.post('/ulipICEGATE', [validateAuth, proxy(`${process.env.ULIP_SERVER_URL}`, { preserveHostHdr: true })]);
router.post('/ulipFASTAG', [validateAuth, proxy(`${process.env.ULIP_SERVER_URL}`, { preserveHostHdr: true })]);
router.post('/ulipGST', [validateAuth, proxy(`${process.env.ULIP_SERVER_URL}`, { preserveHostHdr: true })]);
router.post('/containerTrack', [validateAuth, proxy(`${process.env.ULIP_SERVER_URL}`, { preserveHostHdr: true })]);
router.get('/containerLocationTrack/:number', [validateAuth, containerLocationTrack]);

module.exports = router;
