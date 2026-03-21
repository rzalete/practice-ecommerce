const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', authMiddleware, roleMiddleware('admin'), upload.single('image'), uploadImage);

module.exports = router;