const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
        }
    }
});

const handleUpload = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
};

module.exports = handleUpload;