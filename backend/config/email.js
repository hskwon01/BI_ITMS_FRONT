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

// 관리자 승인 알림 메일 발송 함수
const sendAdminApprovalNotification = async (adminEmails, newUser) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmails.join(', '),
    subject: '[ITMS] 새로운 사용자 승인 요청',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d3652; text-align: center;">새로운 사용자 승인 요청</h2>
        <div style="background: #f6f8fc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #4a5568; font-size: 16px; margin-bottom: 20px;">
            새로운 사용자가 ITMS에 가입했습니다. 승인 처리가 필요합니다.
          </p>
          <div style="background: #fff; padding: 20px; border-radius: 8px; border: 2px solid #e2e8f0;">
            <h3 style="color: #2d3652; margin: 0 0 15px 0;">사용자 정보</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #4a5568;">이름:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #2d3652;">${newUser.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #4a5568;">이메일:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #2d3652;">${newUser.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #4a5568;">회사:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #2d3652;">${newUser.company_name || '미입력'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #4a5568;">가입일시:</td>
                <td style="padding: 8px 0; color: #2d3652;">${new Date(newUser.created_at).toLocaleString('ko-KR')}</td>
              </tr>
            </table>
          </div>
          <div style="background: #e6ffe6; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #38a169;">
            <p style="color: #2d3652; font-size: 14px; margin: 0;">
              <strong>관리자 페이지</strong>에서 사용자 <strong>승인/거부</strong>를 처리할 수 있습니다.
            </p>
          </div>
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
    console.error('Admin notification email sending error:', error);
    return false;
  }
};

module.exports = {
  generateVerificationCode,
  sendVerificationEmail,
  sendAdminApprovalNotification
}; 