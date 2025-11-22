const fs = require('fs');
const path = require('path');

const deleteFile = (filePath) => {
    const fullPath = path.join(__dirname, '..', filePath); // aici se rezolvă tot

    fs.unlink(fullPath, (err) => {
        if (err) {
            console.log('Error deleting file:', err);
        }
    });
}

exports.deleteFile = deleteFile;
