const express = require('express');
const router = express.Router();
const KTPController = require('../controllers/KTPController');

// Process KTP image with OCR
router.post('/process', KTPController.uploadMiddleware, KTPController.processKTP);

// Validate KTP data
router.post('/validate', KTPController.validateKTPData);

// Get KTP field templates and examples
router.get('/templates', KTPController.getKTPTemplates);

module.exports = router;