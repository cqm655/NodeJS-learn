const multer = require('multer');
const {v4: uuidv4} = require('uuid');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images'); // folderul unde se vor salva imaginile
    },
    filename: (req, file, cb) => {
        const safeName = new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname;
        cb(null, safeName);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

module.exports = multer({storage: fileStorage, fileFilter: fileFilter});
