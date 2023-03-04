const nodemailer = require("nodemailer");

exports.sendVerificationEmail = async (user, generatedOTP) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.GMAIL_HOST,
      auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: process.env.GMAIL,
      to: user.email,
      subject: "Email Verification OTP",
      html: `<h1> Your OTP is ${generatedOTP} </h1>
      <a href="http://localhost:5000/api/v1/user/verify/${user.email}">   CLICK ON THIS LINK TO GO TO VERIFICATION PAGE</a>
      
      `,
    });
    console.log("EMAIL SENT SUCCESSFULLY");
  } catch (error) {
    console.log("EMAIL NOT SENT", error);
    return error;
  }
};
