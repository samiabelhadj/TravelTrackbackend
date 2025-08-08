const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    console.log("Email configuration:", {
      service: process.env.EMAIL_SERVICE,
      user: process.env.EMAIL_USERNAME,
      from: process.env.EMAIL_FROM,
    });

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify transporter
    await transporter.verify();

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    console.log("Sending email to:", options.email);

    // Send email
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  // Email verification template
  verificationEmail: (user, verificationCode) => {
    return {
      subject: "Verify Your Email - TRAVELTRACK",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">TRAVELTRACK</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your Travel Planning Companion</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to TRAVELTRACK!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${user.firstName},
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for signing up for TRAVELTRACK! To complete your registration and start planning your next adventure, please verify your email address using the verification code below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #f8f9fa; border: 2px solid #667eea; border-radius: 10px; padding: 20px; display: inline-block;">
                <h3 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">Your Verification Code</h3>
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; display: inline-block;">
                  ${verificationCode}
                </div>
              </div>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Please enter this code in the verification page to complete your registration. This code will expire in 10 minutes.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you didn't create an account with TRAVELTRACK, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              © 2024 TRAVELTRACK. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };
  },

  // Password reset template
  passwordResetEmail: (user, resetCode) => {
    return {
      subject: "Reset Your Password - TRAVELTRACK",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">TRAVELTRACK</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${user.firstName},
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You requested a password reset for your TRAVELTRACK account. Use the verification code below to reset your password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #f8f9fa; border: 2px solid #667eea; border-radius: 10px; padding: 20px; display: inline-block;">
                <h3 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">Your Reset Code</h3>
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; display: inline-block;">
                  ${resetCode}
                </div>
              </div>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Enter this code in the password reset page to create a new password. This code will expire in 10 minutes.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you didn't request a password reset, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              © 2024 TRAVELTRACK. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };
  },

  // Trip invitation template
  tripInvitationEmail: (user, trip, inviter, invitationToken) => {
    const acceptUrl = `${process.env.FRONTEND_URL}/trip-invitation/${invitationToken}`;

    return {
      subject: `You're invited to collaborate on: ${trip.title} - TRAVELTRACK`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">TRAVELTRACK</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Trip Collaboration Invitation</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">You're Invited!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${user.firstName},
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <strong>${inviter.firstName} ${
        inviter.lastName
      }</strong> has invited you to collaborate on their trip: <strong>${
        trip.title
      }</strong>
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-bottom: 10px;">Trip Details:</h3>
              <p style="color: #666; margin: 5px 0;"><strong>Destination:</strong> ${
                trip.destination
              }</p>
              <p style="color: #666; margin: 5px 0;"><strong>Dates:</strong> ${new Date(
                trip.startDate
              ).toLocaleDateString()} - ${new Date(
        trip.endDate
      ).toLocaleDateString()}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Duration:</strong> ${
                trip.duration
              } days</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${acceptUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block; 
                        font-weight: bold;">
                Accept Invitation
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Join the trip planning and start creating amazing memories together!
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              © 2024 TRAVELTRACK. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };
  },
};

module.exports = {
  sendEmail,
  emailTemplates,
};
