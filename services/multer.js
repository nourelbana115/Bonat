const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
aws.config.update({
  secretAccessKey: process.env.AWS_SES_SECRET,
  accessKeyId: process.env.AWS_SES_KEY,
  region:process.env.AWS_S3_REGION // region of your bucket
});
const s3 = new aws.S3();
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      //console.log(req)
      //console.log(file)

      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
})

module.exports = upload;