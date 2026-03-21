const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const handleUpload = require('../middleware/uploadMiddleware');

router.post('/', authMiddleware, roleMiddleware('admin'), handleUpload, uploadImage);

module.exports = router;