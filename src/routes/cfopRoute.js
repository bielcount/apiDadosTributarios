const express = require('express');
const router = express.Router();
const cfopController = require('../controllers/cfopController');

router.post('/', cfopController.createCFOP);
router.get('/', cfopController.getAllCFOPs);
router.get('/:id', cfopController.getCFOPById);
router.put('/:id', cfopController.updateCFOP);
router.delete('/:id', cfopController.deleteCFOP);

module.exports = router;
