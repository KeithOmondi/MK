export function generateVerificationotpEmailTemplate(otpCode) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 40px 20px; max-width: 600px; margin: auto; border-radius: 10px; color: #333;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <h2 style="color: #0066ff; text-align: center; margin-bottom: 20px;">Your Verification Code</h2>
        <p style="font-size: 16px;">Hi there,</p>
        <p style="font-size: 16px;">Thank you for signing up for the <strong>mk store</strong>. Use the verification code below to complete your registration:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; background-color: #f0f4ff; padding: 15px 30px; font-size: 32px; font-weight: bold; color: #003366; border-radius: 8px; letter-spacing: 4px;">
            ${otpCode}
          </span>
        </div>
        <p style="font-size: 15px;">This code is valid for <strong>10 minutes</strong>. If you did not request this code, please ignore this email.</p>
        <p style="font-size: 15px;">Need help? Contact our support team anytime.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #999; text-align: center;">This is an automated message. Please do not reply.</p>
      </div>
    </div>
  `;
}

export function generateForgotPasswordEmailTemplate(resetPasswordUrl) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 40px 20px; max-width: 600px; margin: auto; border-radius: 10px; color: #333;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <h2 style="color: #e74c3c; text-align: center; margin-bottom: 20px;">Reset Your Password</h2>
        <p style="font-size: 16px;">Hi there,</p>
        <p style="font-size: 16px;">We received a request to reset your password for your <strong>Blesses Hope Library Management System</strong> account. If you didn't request for this, you can safely ignore this email.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetPasswordUrl}" style="background-color: #3498db; color: white; text-decoration: none; padding: 12px 24px; font-size: 16px; border-radius: 5px;">Reset Password</a>
        </div>
        <p style="font-size: 15px;">This link is valid for <strong>15 minutes</strong>.</p>
        <p style="font-size: 15px;">If the button above doesn't work, copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; font-size: 14px; color: #555;">${resetPasswordUrl}</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #999; text-align: center;">This is an automated message. Please do not reply.</p>
      </div>
    </div>
  `;
}


export function generatePasswordChangeEmailTemplate(userName) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 40px 20px; max-width: 600px; margin: auto; border-radius: 10px; color: #333;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <h2 style="color: #27ae60; text-align: center; margin-bottom: 20px;">Password Changed Successfully</h2>
        <p style="font-size: 16px;">Hello ${userName || "there"},</p>
        <p style="font-size: 16px;">This is a security alert to let you know that your account password for <strong>${process.env.APP_NAME || "mk store"}</strong> was successfully changed.</p>
        
        <div style="margin: 20px 0; text-align: center;">
          <span style="display: inline-block; background-color: #f0f4ff; padding: 12px 20px; font-size: 16px; font-weight: bold; color: #003366; border-radius: 6px;">
            If this was <u>NOT</u> you, please reset your password immediately.
          </span>
        </div>

        <p style="font-size: 15px;">To secure your account, reset your password here:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.FRONTEND_URL}/password/forgot" 
             style="background-color: #e74c3c; color: white; text-decoration: none; padding: 12px 24px; font-size: 16px; border-radius: 5px;">
            Reset Password
          </a>
        </div>

        <p style="font-size: 15px;">If you made this change, no further action is required.</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #999; text-align: center;">This is an automated message. Please do not reply.</p>
      </div>
    </div>
  `;
}


//login email notification
export function generateLoginAlertEmailTemplate(name, ip, userAgent, time) {
  return `
    <div style="font-family: Arial, sans-serif; background:#f9f9f9; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
        <h2 style="color:#0066ff;">New Login Alert</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>We noticed a login to your account with the following details:</p>
        <ul style="line-height:1.6;">
          <li><strong>IP Address:</strong> ${ip}</li>
          <li><strong>Device/Browser:</strong> ${userAgent}</li>
          <li><strong>Time:</strong> ${time}</li>
        </ul>
        <p>If this was you, no further action is required. If you don’t recognize this activity, please <strong>reset your password immediately</strong> and contact support.</p>
        <p style="margin-top:20px;">Stay safe,<br/><strong>MK Store Security Team</strong></p>
        <hr style="margin:30px 0; border:0; border-top:1px solid #eee;"/>
        <p style="font-size:12px; color:#999;">This is an automated message. Please do not reply.</p>
      </div>
    </div>
  `;
}

