const multer = require("multer")
const nodemailer = require("nodemailer");

// for save image to database
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'upload')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + "-" + file.originalname)
    }
})

const upload = multer({
    storage: storage
})


// for sending a mail
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "parthivtrapasiya18@gmail.com",
        pass: "zttkdyakgiuxhwpk",
    },
});

const sendMail = async (to, subject, html, attachments = []) => {
    return await transporter.sendMail({
        from: "PARTHIV <parthivtrapasiya18@gmail.com>",
        to,
        subject,
        html,
        attachments,
    });
};

module.exports = {
    upload: upload,
    sendMail: sendMail,
}
