/* eslint-disable max-len */
const createAccountOtp = (otp) => {
  return `<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  
            <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-collapse: collapse;">
                <tr>
                    <td style="text-align: center; background-color: #0a2647; padding: 20px; color: white;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: bold;">EduBridge</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 40px 30px;">
                        <h2 style="color: #0a2647; margin-top: 0; margin-bottom: 20px; font-size: 22px;">Email Verification Code</h2>
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">To complete your account setup, please enter the verification code below:</p>
                        <div style="background-color: #f2f4f7; text-align: center; padding: 15px; margin: 20px 0; border-radius: 8px;">
                          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0a2647;">${otp}</span>
                        </div>
                        <p style="color: #555; font-size: 14px; line-height: 1.5; margin-top: 25px;">This code will expire in 30 minutes. If you didn't request this code, please ignore this email.</p>
                    </td>
                </tr>
                <tr>
                    <td style="background-color: #0a2647; color: white; padding: 20px; text-align: center;">
                        <p style="margin: 0 0 10px; font-size: 14px;">© 2024 EduBridge. All rights reserved.</p>
                        <div style="margin-top: 15px;">
                          <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" width="24" height="24" alt="Facebook" style="border: 0;"></a>
                          <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png" width="24" height="24" alt="Instagram" style="border: 0;"></a>
                          <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://img.icons8.com/ios-filled/50/ffffff/twitter.png" width="24" height="24" alt="Twitter" style="border: 0;"></a>
                        </div>
                    </td>
                </tr>
            </table>
        
        </body>`;
};

const welcomeEmail = (userName) => {
  return `<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
      <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-collapse: collapse;">
          <tr>
              <td style="text-align: center; background-color: #0a2647; padding: 20px; color: white;">
                <h1 style="margin: 0; font-size: 24px; font-weight: bold;">EduBridge</h1>
              </td>
          </tr>
          <tr>
              <td style="padding: 40px 30px;">
                  <h2 style="color: #0a2647; margin-top: 0; margin-bottom: 20px; font-size: 22px;">Welcome to EduBridge, ${userName}!</h2>
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 15px;">Thank you for joining our educational community. We're excited to have you with us!</p>
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 15px;">EduBridge is designed to provide a seamless learning experience, connecting students and educators in a collaborative environment.</p>
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 15px;">With EduBridge, you can access course materials, communicate with instructors, submit assignments, and track your progress all in one place.</p>
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 15px;">We're committed to enhancing your educational journey and making learning accessible and enjoyable.</p>
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="#" style="background-color: #0a2647; color: white; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold; display: inline-block;">Explore Your Dashboard</a>
                  </div>
              </td>
          </tr>
          <tr>
              <td style="background-color: #0a2647; color: white; padding: 20px; text-align: center;">
                  <p style="margin: 0 0 10px; font-size: 14px;">© 2024 EduBridge. All rights reserved.</p>
                  <div style="margin-top: 15px;">
                    <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" width="24" height="24" alt="Facebook" style="border: 0;"></a>
                    <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png" width="24" height="24" alt="Instagram" style="border: 0;"></a>
                    <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://img.icons8.com/ios-filled/50/ffffff/twitter.png" width="24" height="24" alt="Twitter" style="border: 0;"></a>
                  </div>
      </td>
      </tr>
      
      </table> </body>`;
};

/* eslint-disable max-len */
const resetPasswordOtp = (otp) => {
  return `<body style="margin: 0; padding: 0; background-color: #F2F4F7; font-family: Arial, sans-serif;">
  
            <table style="width: 100%; max-width: 500px; margin: 0 auto; background-color: #FFFFFF; padding: 20px;">
                <tr>
                    <td style="text-align: center;">
                    <p style="font-size: 12px; font-weight: bold; margin: 5px 0;"> EDUBRIDGE.</p>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: center; margin: 20px 0;">
                        <p style="font-size: 24px; font-weight: bold;">Email OTP Verification</p>
                        <p style="color: #475467; font-size: 16px;"> This OTP is valid for 30 minutes. Please do not share this code with anyone.</p>
                        <div style="background-color: #F2F4F7; font-size: 24px; padding: 10px 30px; border-radius: 20px; display: inline-block;">${otp}</div>
                        <p style="font-size: 12px; margin: 5px 0;">This email was sent to you because you tried to change your Edubridge account password. If you did not attempt any password change for your account, please ignore this email.</p>
                  
                    </td>
                </tr>
                <tr>
                    <td style="background-color: #F2F4F7; padding: 20px; text-align: center;">
                         
                        <p style="font-size: 12px; font-weight: bold; margin: 5px 0;">© 2024 Edubridge. All rights reserved.</p>
                        <p style="font-size: 12px; margin: 5px 0;">Follow us</p>
                        <img style="width: 20px; margin: 0 2px; display: inline-block;" src="https://img.freepik.com/premium-vector/purple-gradiend-social-media-logo_197792-1883.jpg" alt="Instagram">
                        <img style="width: 20px; margin: 0 2px; display: inline-block;" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/640px-LinkedIn_logo_initials.png" alt="LinkedIn">
                        <img style="width: 20px; margin: 0 2px; display: inline-block;" src="https://about.twitter.com/content/dam/about-twitter/x/brand-toolkit/logo-black.png.twimg.1920.png" alt="Twitter">
                    </td>
                </tr>
            </table>
        
        </body>`;
};

/* eslint-disable max-len */
const resetPasscodeOtp = (otp) => {
  return `<body style="margin: 0; padding: 0; background-color: #F2F4F7; font-family: Arial, sans-serif;">
  
            <table style="width: 100%; max-width: 500px; margin: 0 auto; background-color: #FFFFFF; padding: 20px;">
                <tr>
                    <td style="text-align: center;">
                    <p style="font-size: 12px; font-weight: bold; margin: 5px 0;"> EDUBRIDGE.</p>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: center; margin: 20px 0;">
                        <p style="font-size: 24px; font-weight: bold;">Email OTP Verification</p>
                        <p style="color: #475467; font-size: 16px;"> This OTP is valid for 30 minutes. Please do not share this code with anyone.</p>
                        <div style="background-color: #F2F4F7; font-size: 24px; padding: 10px 30px; border-radius: 20px; display: inline-block;">${otp}</div>
                        <p style="font-size: 12px; margin: 5px 0;">This email was sent to you because you tried to change your Edubridge account password. If you did not attempt any password change for your account, please ignore this email.</p>
                  
                    </td>
                </tr>
                <tr>
                    <td style="background-color: #F2F4F7; padding: 20px; text-align: center;">
                         
                        <p style="font-size: 12px; font-weight: bold; margin: 5px 0;">© 2024 Edubridge. All rights reserved.</p>
                        <p style="font-size: 12px; margin: 5px 0;">Follow us</p>
                        <img style="width: 20px; margin: 0 2px; display: inline-block;" src="https://img.freepik.com/premium-vector/purple-gradiend-social-media-logo_197792-1883.jpg" alt="Instagram">
                        <img style="width: 20px; margin: 0 2px; display: inline-block;" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/640px-LinkedIn_logo_initials.png" alt="LinkedIn">
                        <img style="width: 20px; margin: 0 2px; display: inline-block;" src="https://about.twitter.com/content/dam/about-twitter/x/brand-toolkit/logo-black.png.twimg.1920.png" alt="Twitter">
                    </td>
                </tr>
            </table>
        
        </body>`;
};

const changeEmailOtp = (otp) => {
  return `<body style="margin: 0; padding: 0; background-color: #F2F4F7; font-family: Arial, sans-serif;">
    
              <table style="width: 100%; max-width: 500px; margin: 0 auto; background-color: #FFFFFF; padding: 20px;">
                  <tr>
                      <td style="text-align: center;">
                      <p style="font-size: 12px; font-weight: bold; margin: 5px 0;"> EDUBRIDGE.</p>
                      </td>
                  </tr>
                  <tr>
                      <td style="text-align: center; margin: 20px 0;">
                          <p style="font-size: 24px; font-weight: bold;">Email OTP Verification</p>
                          <p style="color: #475467; font-size: 16px;"> This OTP is valid for 30 minutes. Please do not share this code with anyone.</p>
                          <div style="background-color: #F2F4F7; font-size: 24px; padding: 10px 30px; border-radius: 20px; display: inline-block;">${otp}</div>
                          <p style="font-size: 12px; margin: 5px 0;">This email was sent to you because you tried to change your Email, if this action was not taken by you, please ignore this email.</p>
                    
                      </td>
                  </tr>
                  <tr>
                      <td style="background-color: #F2F4F7; padding: 20px; text-align: center;">
                           
                          <p style="font-size: 12px; font-weight: bold; margin: 5px 0;">© 2024 Edubridge. All rights reserved.</p>
                          <p style="font-size: 12px; margin: 5px 0;">Follow us</p>
                          <img style="width: 20px; margin: 0 2px; display: inline-block;" src="https://img.freepik.com/premium-vector/purple-gradiend-social-media-logo_197792-1883.jpg" alt="Instagram">
                          <img style="width: 20px; margin: 0 2px; display: inline-block;" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/640px-LinkedIn_logo_initials.png" alt="LinkedIn">
                          <img style="width: 20px; margin: 0 2px; display: inline-block;" src="https://about.twitter.com/content/dam/about-twitter/x/brand-toolkit/logo-black.png.twimg.1920.png" alt="Twitter">
                      </td>
                  </tr>
              </table>
          
          </body>`;
};

// Report acknpwledgement email
const reportSent = (
  username,
  complaintCategory,
  subject,
  email,
  description,
  imageUrl
) => {
  return `<body style="margin: 0; padding: 0; background-color: #F2F4F7; font-family: Arial, sans-serif;">
    
        <table style="width: 100%; max-width: 500px; margin: 0 auto; background-color: #FFFFFF; padding: 20px;">
            <tr>
                <td style="text-align: center;">
                <p style="font-size: 12px; font-weight: bold; margin: 5px 0;"> EDUBRIDGE.</p>
                </td>
            </tr>
            <tr>
                <td style="text-align: center; margin: 20px 0;">
                    <p style="font-size: 24px; font-weight: bold;">Edubridge support</p>
                    <p style="color: #475467; font-size: 16px;"> Customer Complaint 📣.</p>
                    <p style="font-size: 12px; margin: 5px 0;"> A customer has reported an issue. Here are the details:.</p>
                    <ul style="list-style: none; padding: 0; margin: 10px 0;">
                    <li style="font-size: 14px; color: #475467;">Customer Name: ${username} </li>
                    <li style="font-size: 14px; color: #475467;">Email: ${email} </li>
                    <li style="font-size: 14px; color: #475467;">Subject: ${subject} </li>
                    <li style="font-size: 14px; color: #475467;">Complaint Category: ${complaintCategory} </li>
                    <li style="font-size: 14px; color: #475467;">Description: ${description}.</li>
                    <li style="font-size: 14px; color: #475467;">Image: <img src="${imageUrl}" alt="Customer Report Image" style="max-width: 100%;"></li>
                </ul>
              
                </td>
            </tr>
            <tr>
            <td style="background-color: #F2F4F7; padding: 20px; text-align: center;">
                 
                <p style="font-size: 12px; font-weight: bold; margin: 5px 0;">© 2024 Edubridge. All rights reserved.</p>
                <p style="font-size: 12px; margin: 5px 0;">Follow us</p>
                <img style="width: 20px; margin: 0 2px; display: inline-block;" src="https://img.freepik.com/premium-vector/purple-gradiend-social-media-logo_197792-1883.jpg" alt="Instagram">
                <img style="width: 20px; margin: 0 2px; display: inline-block;" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/640px-LinkedIn_logo_initials.png" alt="LinkedIn">
                <img style="width: 20px; margin: 0 2px; display: inline-block;" src="https://about.twitter.com/content/dam/about-twitter/x/brand-toolkit/logo-black.png.twimg.1920.png" alt="Twitter">
            </td>
        </tr>
    </table>
    
    </body>`;
};

const reportReceived = (username) => {
  return `<body style="margin: 0; padding: 0; background-color: #F2F4F7; font-family: Arial, sans-serif;">
  
      <table style="width: 100%; max-width: 500px; margin: 0 auto; background-color: #FFFFFF; padding: 20px;">
          <tr>
              <td style="text-align: center;">
              <p style="font-size: 12px; font-weight: bold; margin: 5px 0;"> EDUBRIDGE.</p>
              </td>
          </tr>
          <tr>
              <td style="text-align: center; margin: 20px 0;">
                  <p style="font-size: 24px; font-weight: bold;">Hi 👋 ${username}</p>
                  <p style="color: #475467; font-size: 16px;"> We have received your report and we are working on it. We will get back to you as soon as possible.</p>
                  <p style="font-size: 12px; margin: 5px 0;">This email was sent to you because you reported an issue to us. If you did not report any issue, please ignore this email.</p>
            
              </td>
          </tr>
          <tr>
          <td style="background-color: #F2F4F7; padding: 20px; text-align: center;">
               
              <p style="font-size: 12px; font-weight: bold; margin: 5px 0;">© 2024 Edubridge. All rights reserved.</p>
              <p style="font-size: 12px; margin: 5px 0;">Follow us</p>
              <img style="width: 20px; margin: 0 2px; display: inline-block;" src="https://img.freepik.com/premium-vector/purple-gradiend-social-media-logo_197792-1883.jpg" alt="Instagram">
              <img style="width: 20px; margin: 0 2px; display: inline-block;" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/640px-LinkedIn_logo_initials.png" alt="LinkedIn">
              <img style="width: 20px; margin: 0 2px; display: inline-block;" src="https://about.twitter.com/content/dam/about-twitter/x/brand-toolkit/logo-black.png.twimg.1920.png" alt="Twitter">
          </td>
      </tr>
  </table>
  
  </body>`;
};

module.exports = {
  createAccountOtp,
  changeEmailOtp,
  welcomeEmail,
  resetPasswordOtp,
  reportReceived,
  reportSent,
  resetPasscodeOtp,
};
