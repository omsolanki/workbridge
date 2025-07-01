"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBulkEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("../utils/logger");
const createTransporter = () => {
    return nodemailer_1.default.createTransport({
        host: process.env["EMAIL_HOST"],
        port: parseInt(process.env["EMAIL_PORT"] || "587"),
        secure: false,
        auth: {
            user: process.env["EMAIL_USER"],
            pass: process.env["EMAIL_PASS"],
        },
    });
};
const emailTemplates = {
    emailVerification: (data) => ({
        subject: "Verify Your Email - WorkBridge",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to WorkBridge!</h2>
        <p>Hi ${data.name},</p>
        <p>Thank you for registering with WorkBridge. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.verificationUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${data.verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account with WorkBridge, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email from WorkBridge. Please do not reply to this email.
        </p>
      </div>
    `,
    }),
    passwordReset: (data) => ({
        subject: "Password Reset Request - WorkBridge",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi ${data.name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetUrl}" 
             style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${data.resetUrl}</p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email from WorkBridge. Please do not reply to this email.
        </p>
      </div>
    `,
    }),
    welcomeEmail: (data) => ({
        subject: "Welcome to WorkBridge!",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to WorkBridge!</h2>
        <p>Hi ${data.name},</p>
        <p>Welcome to WorkBridge! We're excited to have you join our community of ${data.role}s.</p>
        <p>Here's what you can do to get started:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Browse available jobs</li>
          <li>Connect with other professionals</li>
          <li>Start building your portfolio</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email from WorkBridge. Please do not reply to this email.
        </p>
      </div>
    `,
    }),
    jobApplication: (data) => ({
        subject: `New Proposal for "${data.jobTitle}"`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Job Proposal</h2>
        <p>Hi ${data.clientName},</p>
        <p>You have received a new proposal from ${data.freelancerName} for your job "${data.jobTitle}".</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.proposalUrl}" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Proposal
          </a>
        </div>
        <p>Review the proposal and let the freelancer know if you'd like to proceed.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email from WorkBridge. Please do not reply to this email.
        </p>
      </div>
    `,
    }),
    proposalAccepted: (data) => ({
        subject: `Proposal Accepted for "${data.jobTitle}"`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Proposal Accepted!</h2>
        <p>Hi ${data.freelancerName},</p>
        <p>Great news! ${data.clientName} has accepted your proposal for "${data.jobTitle}".</p>
        <p>A contract has been created and is ready for your review.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.contractUrl}" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Contract
          </a>
        </div>
        <p>Please review the contract terms and accept if everything looks good.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email from WorkBridge. Please do not reply to this email.
        </p>
      </div>
    `,
    }),
    contractStarted: (data) => ({
        subject: `Contract Started for "${data.jobTitle}"`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Contract Started!</h2>
        <p>Hi ${data.freelancerName},</p>
        <p>Your contract with ${data.clientName} for "${data.jobTitle}" has officially started!</p>
        <p>You can now begin working on the project and track your time.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.contractUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Contract
          </a>
        </div>
        <p>Good luck with your project!</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email from WorkBridge. Please do not reply to this email.
        </p>
      </div>
    `,
    }),
    paymentReceived: (data) => ({
        subject: `Payment Received - $${data.amount}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Payment Received!</h2>
        <p>Hi ${data.freelancerName},</p>
        <p>Great news! You have received a payment of $${data.amount} for your work on "${data.jobTitle}".</p>
        <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
        <p>The payment has been processed and should be available in your account shortly.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email from WorkBridge. Please do not reply to this email.
        </p>
      </div>
    `,
    }),
    milestoneCompleted: (data) => ({
        subject: `Milestone Completed: ${data.milestoneName}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Milestone Completed!</h2>
        <p>Hi ${data.clientName},</p>
        <p>${data.freelancerName} has marked the milestone "${data.milestoneName}" as completed for your project "${data.jobTitle}".</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.contractUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Review Milestone
          </a>
        </div>
        <p>Please review the completed work and approve the milestone if everything meets your requirements.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email from WorkBridge. Please do not reply to this email.
        </p>
      </div>
    `,
    }),
    projectCompleted: (data) => ({
        subject: `Project Completed: "${data.jobTitle}"`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Project Completed!</h2>
        <p>Hi ${data.clientName},</p>
        <p>Congratulations! Your project "${data.jobTitle}" with ${data.freelancerName} has been completed.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.contractUrl}" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Project
          </a>
        </div>
        <p>Please review the final deliverables and release the remaining payment if everything meets your expectations.</p>
        <p>Don't forget to leave a review for ${data.freelancerName}!</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email from WorkBridge. Please do not reply to this email.
        </p>
      </div>
    `,
    }),
};
const sendEmail = async (emailData) => {
    try {
        const transporter = createTransporter();
        const template = emailTemplates[emailData.template];
        if (!template) {
            throw new Error(`Email template '${emailData.template}' not found`);
        }
        const emailContent = template(emailData.data);
        const mailOptions = {
            from: process.env["EMAIL_FROM"] || "WorkBridge <noreply@workbridge.com>",
            to: emailData.email,
            subject: emailContent.subject,
            html: emailContent.html,
        };
        const info = await transporter.sendMail(mailOptions);
        logger_1.logger.info(`Email sent successfully: ${info.messageId}`);
        return true;
    }
    catch (error) {
        logger_1.logger.error("Error sending email:", error);
        return false;
    }
};
exports.sendEmail = sendEmail;
const sendBulkEmail = async (emails, template, data) => {
    try {
        const transporter = createTransporter();
        const emailTemplate = emailTemplates[template];
        if (!emailTemplate) {
            throw new Error(`Email template '${template}' not found`);
        }
        const emailContent = emailTemplate(data);
        const mailOptions = {
            from: process.env["EMAIL_FROM"] || "WorkBridge <noreply@workbridge.com>",
            to: emails.join(", "),
            subject: emailContent.subject,
            html: emailContent.html,
        };
        const info = await transporter.sendMail(mailOptions);
        logger_1.logger.info(`Bulk email sent successfully: ${info.messageId}`);
        return true;
    }
    catch (error) {
        logger_1.logger.error("Error sending bulk email:", error);
        return false;
    }
};
exports.sendBulkEmail = sendBulkEmail;
//# sourceMappingURL=emailService.js.map