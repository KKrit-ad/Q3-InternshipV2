const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config(); // โหลด environment variables จาก .env

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.use(express.static("public"));

app.listen(3000, () => {
  console.log("Node app is running on port 3000!");
});

app.post("/sendemail", upload.single("resume"), (req, res) => {
  const { name, email } = req.body;
  const resumePath = req.file ? req.file.path : "";
  const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: process.env.EMAIL_USER, // ใช้ environment variables สำหรับ user
      pass: process.env.EMAIL_PASS, // ใช้ environment variables สำหรับ pass
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Application Received",
    text: `Dear ${name},\n\nThank you for applying for the internship position. We have received your application and resume. We will get back to you shortly.\n\nBest regards,\nThe Team`,
    attachments: resumePath ? [{ path: resumePath }] : [],
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (resumePath) {
      fs.unlinkSync(resumePath);
    }

    if (err) {
      console.log("Error:", err);
      return res.status(500).json({
        RespCode: 400,
        RespMessage: "Failed to send email",
        RespError: err,
      });
    } else {
      console.log("Email sent:", info.response);
      return res.status(200).json({
        RespCode: 200,
        RespMessage: "Application submitted successfully",
      });
    }
  });
});

module.exports = app;
