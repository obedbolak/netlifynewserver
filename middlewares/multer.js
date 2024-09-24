const multer = require("multer");

const storage = multer.memoryStorage();

const multipleUpload = multer({ storage }).array("files", 10); // Adjust 10 to the max number of files you want to accept

module.exports = { multipleUpload };
