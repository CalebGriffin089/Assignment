const express = require("express");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const form = new formidable.IncomingForm();
  const uploadFolder = path.join(__dirname, "../userImages");
  form.uploadDir = uploadFolder;
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ status: "Fail", message: "Error parsing files", error: err });
    }

    // Handle array or single file
    let file = Array.isArray(files.image) ? files.image[0] : files.image;
    if (!file || !file.filepath) {
      return res.status(400).json({ status: "Fail", message: "File missing" });
    }

    const ext = path.extname(file.originalFilename || file.newFilename);
    const base = path.basename(file.originalFilename || file.newFilename, ext);
    const uniqueName = `${base}-${Date.now()}${ext}`;
    const oldpath = file.filepath;
    const newpath = path.join(uploadFolder, uniqueName);

    // Move file safely
    fs.rename(oldpath, newpath, (err) => {
      if (err) {
        // Try fallback: copy and delete
        fs.copyFile(oldpath, newpath, (copyErr) => {
          if (copyErr) {
            return res.status(500).json({ status: "Fail", message: "Error saving file", error: copyErr });
          }
          fs.unlink(oldpath, () => {}); // remove temp file
          return res.json({
            result: "OK",
            data: { filename: uniqueName, size: file.size },
            message: "Upload successful (copied fallback)"
          });
        });
      } else {
        return res.json({
          result: "OK",
          data: { filename: uniqueName, size: file.size },
          message: "Upload successful"
        });
      }
    });
  });
});

module.exports = router;