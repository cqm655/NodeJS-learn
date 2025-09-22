const express = require('express');

const router = express.Router();

const path = require("path");

const rootDir = require('../util/path')

router.get("/", (req, res) => {
    res.sendFile(path.join(rootDir, 'views', 'main.html'));
})


module.exports = router;