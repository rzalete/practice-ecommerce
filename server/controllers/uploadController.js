const cloudinary = require('../config/cloudinary');

const uploadImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: 'ecommerce-products' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(req.file.buffer);
        });

        res.status(200).json({ url: result.secure_url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Upload failed' });
    }
};

module.exports = { uploadImage };