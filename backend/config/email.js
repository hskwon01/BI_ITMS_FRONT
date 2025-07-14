const nodemailer = require('nodemailer');
require('dotenv').config();

// 이메일 전송을 위한 transporter 설정
const transporter = nodemailer.createTransport({
  service: 'gmail', // Gmail 사용
  auth: {
    user: process.env.EMAIL_USER, // Gmail 계정
    pass: process.env.EMAIL_PASS  // Gmail 앱 비밀번호
  }
});


// 인증 코드 생성 함수
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 이메일 발송 함수
const sendVerificationEmail = async (email, verificationCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '[ITMS] 이메일 인증 코드',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d3652; text-align: center;">ITMS 이메일 인증</h2>
        <div style="background: #f6f8fc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #4a5568; font-size: 16px; margin-bottom: 20px;">
            안녕하세요! ITMS 회원가입을 위한 이메일 인증 코드를 발송드립니다.
          </p>
          <div style="background: #fff; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #e2e8f0;">
            <h3 style="color: #2d3652; margin: 0 0 10px 0;">인증 코드</h3>
            <div style="font-size: 32px; font-weight: bold; color: #7c83fd; letter-spacing: 5px; margin: 10px 0;">
              ${verificationCode}
            </div>
          </div>
          <p style="color: #7b8190; font-size: 14px; margin-top: 20px;">
            이 인증 코드는 10분간 유효합니다. 타인에게 공유하지 마세요.
          </p>
        </div>
        <p style="color: #7b8190; font-size: 12px; text-align: center;">
          © 2025 ITMS. All rights reserved.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

module.exports = {
  generateVerificationCode,
  sendVerificationEmail
}; 