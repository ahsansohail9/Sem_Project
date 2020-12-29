var multer = require("multer");
var path = require("path");

var Storage = new multer.diskStorage({
    destination: "./public/img/events/",
    filename: (req, file, cb) => {
        cb(
            null,
            file.fieldname + "_" + Date.now() + path.extname(file.originalname)
        );
    },
});

var upload = multer({
    storage: Storage,
}).single("file");

module.exports = upload;