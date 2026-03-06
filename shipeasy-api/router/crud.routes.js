const express = require('express');
const router = express.Router();

const { validateAuth } = require('../middleware/auth');
const { checkIndex } = require('../middleware/checkIndex');
const { enforceTenantIsolation } = require('../middleware/tenantIsolation');
const { validateCrudInsert, validateCrudUpdate, validateSearch } = require('../middleware/validateRequest');
const { get } = require('../controller/search.controller');
const { insert, insertBatch } = require('../controller/insert.commonController');
const { updateBatch, update } = require('../controller/update.commonController');
const { deleteCommon } = require('../controller/delete.commonController');

router.post('/search/:indexName/:id?', validateSearch, [validateAuth, enforceTenantIsolation, get]);
router.post('/:indexName', validateCrudInsert, [validateAuth, checkIndex, enforceTenantIsolation, insert]);
router.post('/:indexName/batchinsert', validateCrudInsert, [validateAuth, checkIndex, enforceTenantIsolation, insertBatch]);
router.put('/:indexName/batchupdate', validateCrudInsert, [validateAuth, checkIndex, enforceTenantIsolation, updateBatch]);
router.put('/:indexName/:id', validateCrudUpdate, [validateAuth, checkIndex, enforceTenantIsolation, update]);
router.delete('/:indexName/:id', validateCrudUpdate, [validateAuth, checkIndex, enforceTenantIsolation, deleteCommon]);

module.exports = router;
