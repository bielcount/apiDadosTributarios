const express = require('express');
const router = express.Router();
const csosnController = require('../controllers/csosnController');

router.post('/', csosnController.createCSOSN);
router.get('/', csosnController.getAllCSOSNs);
router.get('/:id', csosnController.getCSOSNById);
router.put('/:id', csosnController.updateCSOSN);
router.delete('/:id', csosnController.deleteCSOSN);

module.exports = router;
