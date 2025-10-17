import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@buildflow.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }

      await this.transporter.sendMail(mailOptions)
      console.log(`✅ Email sent to ${options.to}`)
      return true
    } catch (error) {
      console.error('❌ Failed to send email:', error)
      return false
    }
  }

  async sendWelcomeEmail(userEmail: string, firstName: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Welcome to BuildFlow!</h1>
        <p>Hi ${firstName},</p>
        <p>Welcome to BuildFlow! We're excited to have you on board.</p>
        <p>You can now start building amazing websites with our drag & drop builder.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
           style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Get Started
        </a>
        <p>Best regards,<br>The BuildFlow Team</p>
      </div>
    `

    return await this.sendEmail({
      to: userEmail,
      subject: 'Welcome to BuildFlow!',
      html,
    })
  }

  async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Password Reset Request</h1>
        <p>You requested a password reset for your BuildFlow account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" 
           style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The BuildFlow Team</p>
      </div>
    `

    return await this.sendEmail({
      to: userEmail,
      subject: 'Password Reset Request - BuildFlow',
      html,
    })
  }

  async sendVerificationEmail(userEmail: string, verificationToken: string): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Verify Your Email</h1>
        <p>Please verify your email address to complete your BuildFlow registration.</p>
        <a href="${verificationUrl}" 
           style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The BuildFlow Team</p>
      </div>
    `

    return await this.sendEmail({
      to: userEmail,
      subject: 'Verify Your Email - BuildFlow',
      html,
    })
  }

  async sendNotificationEmail(userEmail: string, subject: string, message: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">BuildFlow Notification</h1>
        <p>${message}</p>
        <p>Best regards,<br>The BuildFlow Team</p>
      </div>
    `

    return await this.sendEmail({
      to: userEmail,
      subject: `BuildFlow: ${subject}`,
      html,
    })
  }
}

const emailService = new EmailService()

export const sendEmail = (options: EmailOptions) => emailService.sendEmail(options)
export const sendWelcomeEmail = (userEmail: string, firstName: string) => 
  emailService.sendWelcomeEmail(userEmail, firstName)
export const sendPasswordResetEmail = (userEmail: string, resetToken: string) => 
  emailService.sendPasswordResetEmail(userEmail, resetToken)
export const sendVerificationEmail = (userEmail: string, verificationToken: string) => 
  emailService.sendVerificationEmail(userEmail, verificationToken)
export const sendNotificationEmail = (userEmail: string, subject: string, message: string) => 
  emailService.sendNotificationEmail(userEmail, subject, message)

export default emailService
