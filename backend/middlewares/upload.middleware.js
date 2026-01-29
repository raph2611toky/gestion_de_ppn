const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Fichier non supporté. Seules les images sont autorisées.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: fileFilter
});

module.exports = {
    uploadRegister: upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'piece_identite_face', maxCount: 1 },
        { name: 'piece_identite_recto', maxCount: 1 }
    ]),
    
    uploadPhoto: upload.single('photo')
};