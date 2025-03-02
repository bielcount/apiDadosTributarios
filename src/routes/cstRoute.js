const express = require('express');
const router = express.Router();
const cstController = require('../controllers/cstController');

router.post('/', cstController.createCST);
router.get('/', cstController.getAllCSTs);
router.get('/:id', cstController.getCSTById);
router.put('/:id', cstController.updateCST);
router.delete('/:id', cstController.deleteCST);

module.exports = router;
