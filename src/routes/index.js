const express = require('express');
const router = express.Router();

const cfopRoutes = require('./cfopRoute');
const csosnRoutes = require('./csosnRoute');
const cstRoutes = require('./cstRoute');

router.use('/cfop', cfopRoutes);
router.use('/csosn', csosnRoutes);
router.use('/cst', cstRoutes);

module.exports = router;
