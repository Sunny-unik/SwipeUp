var path = require('path');
var multer = require('multer');

var storage = multer.diskStorage(
    {
        destination: function (req, file, cb) {
            console.log(path);
            cb(null, 'userImages')
        },
        filename: function (req, file, cb) {
            var ext = path.extname(file.originalname);
            console.log("in config 12---trying to upload --" + file.fieldname.slice(0, 3) + '-' + Date.now() + "." + ext)
            cb(null, file.fieldname.slice(0, 3) + '-' + Date.now() + "." + ext);
        }
    }
    //  resume-234763458969876.jpg  
)

var multerOptions = {
    storage: storage,
    fileFilter: function (req, file, callback) {
        console.log(file);
        var ext = path.extname(file.originalname);
        var fieldName = file.fieldname;

        if (fieldName == "profile") {
            if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
                return callback(new Error('Only images are allowed for profile'));
            }
            callback(null, true);
        }
    }
}

var upload = multer(multerOptions).fields([{ name: "profile", maxCount: 1 }]);

module.exports = upload;