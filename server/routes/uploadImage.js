const express = require("express");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  console.log("test");
  var form = new formidable.IncomingForm();
  
  // Set the upload directory
  const uploadFolder = path.join(__dirname, "../userImages");
  
  form.uploadDir = uploadFolder;
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    // Log files to see its structure
    console.log(files);

    if (err) {
      return res.status(400).json({
        status: 'Fail',
        message: 'There was an error parsing the files',
        error: err,
      });
    }

    // Access the first file in the 'image' array
    let file = files.image[0]; // files.image is an array, so we need the first element

    // Check if file is properly uploaded
    if (!file || !file.filepath) {
      return res.status(400).json({
        status: 'Fail',
        message: 'File not uploaded correctly or missing in the request.',
      });
    }

    let oldpath = file.filepath;
    let newpath = path.join(form.uploadDir, file.originalFilename);

    fs.rename(oldpath, newpath, function (err) {
      if (err) {
        return res.status(400).json({
          status: 'Fail',
          message: 'Error renaming the file',
          error: err,
        });
      }
      
      // Respond with success
      res.send({
        result: 'OK',
        data: { 'filename': file.originalFilename, 'size': file.size },
        numberOfImages: 1,
        message: 'upload successful',
      });
    });
  });
});

module.exports = router;
