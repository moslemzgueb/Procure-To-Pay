const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.ready = false;
    }

    async ensureTransporter() {
        if (this.transporter && this.ready) {
            return;
        }

        try {
            // For development without SMTP, create a test account
            const testAccount = await nodemailer.createTestAccount();

            this.transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });

            this.ready = true;
            console.log('✅ Email service initialized with Ethereal test account');
        } catch (error) {
            console.error('❌ Failed to initialize email service:', error.message);
        }
    }

    async sendApprovalNotification(validator, objectType, objectId, entityName, amount) {
        await this.ensureTransporter();

        if (!this.transporter) {
            console.log('⚠️  Email service not available, skipping notification');
            return null;
        }

        const subject = `[Action Required] ${objectType} Approval Needed`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Approval Request</h2>
                <p>Dear ${validator.name},</p>
                <p>A new ${objectType.toLowerCase()} requires your approval:</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Entity:</strong> ${entityName}</p>
                    <p><strong>Amount:</strong> $${amount}</p>
                    <p><strong>${objectType} ID:</strong> #${objectId}</p>
                </div>

                <p>Please log in to the Procure-to-Pay system to review and approve this request.</p>
                
                <a href="${process.env.APP_URL || 'http://localhost:5173'}/budgets/${objectId}" 
                   style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                    Review ${objectType}
                </a>

                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    This is an automated notification from the Procure-to-Pay system.
                </p>
            </div>
        `;

        try {
            const info = await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || '"Procure-to-Pay System" <noreply@p2p.com>',
                to: validator.email,
                subject: subject,
                html: html
            });

            console.log('\n📧 ===== EMAIL SENT =====');
            console.log(`To: ${validator.email}`);
            console.log(`Subject: ${subject}`);
            console.log(`Message ID: ${info.messageId}`);
            console.log(`\n🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            console.log('========================\n');

            return info;
        } catch (error) {
            console.error('❌ Failed to send email:', error.message);
            return null;
        }
    }

    async sendApprovalStatusUpdate(initiatorEmail, objectType, objectId, status, approverName) {
        await this.ensureTransporter();

        if (!this.transporter) {
            console.log('⚠️  Email service not available, skipping notification');
            return null;
        }

        const statusColors = {
            'APPROVED': '#10b981',
            'REJECTED': '#ef4444',
            'NEEDS_INFO': '#f59e0b'
        };

        const subject = `${objectType} ${status}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: ${statusColors[status] || '#6b7280'};">${objectType} ${status}</h2>
                <p>Your ${objectType.toLowerCase()} request has been ${status.toLowerCase()} by ${approverName}.</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>${objectType} ID:</strong> #${objectId}</p>
                    <p><strong>Status:</strong> ${status}</p>
                </div>

                <a href="${process.env.APP_URL || 'http://localhost:5173'}/budgets/${objectId}" 
                   style="display: inline-block; background-color: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                    View Details
                </a>
            </div>
        `;

        try {
            const info = await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || '"Procure-to-Pay System" <noreply@p2p.com>',
                to: initiatorEmail,
                subject: subject,
                html: html
            });

            console.log('\n📧 ===== STATUS UPDATE EMAIL SENT =====');
            console.log(`To: ${initiatorEmail}`);
            console.log(`Subject: ${subject}`);
            console.log(`\n🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            console.log('=======================================\n');

            return info;
        } catch (error) {
            console.error('❌ Failed to send status update email:', error.message);
            return null;
        }
    }
}

module.exports = new EmailService();
