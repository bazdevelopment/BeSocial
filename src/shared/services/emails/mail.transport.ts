import nodemailer from 'nodemailer';
import sendGrid from '@sendgrid/mail';
import Mail from 'nodemailer/lib/mailer';
import { IMailOptions } from './mail.interface';
// import { BadRequestError } from 'middleware/error-middleware';
import { ENVIRONMENTS } from 'constants/environment';

/**
 * Method used to send an email to a specific email address
 * Used only in DEV mode
 * Nodemailer is used as a mail transport in development
 */
const developmentEmailSender = async (receiverEmail: string, subject: string, body: string): Promise<void> => {
  /**
   * create reusable transporter object using the default SMTP transport
   */
  let transporter: Mail = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false /* true for 465, false for other ports */,
    auth: {
      user: process.env.SENDER_EMAIL /* generated ethereal user */,
      pass: process.env.SENDER_EMAIL_PASSWORD /* generated ethereal password */
    }
  });

  const mailOptions: IMailOptions = {
    from: `Be social <${process.env.SENDER_EMAIL}>`,
    to: receiverEmail,
    subject,
    html: body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Development email sent successfully. ✅`);
  } catch (error) {
    console.log(`[developmentEmailSender]`, error);
    // BadRequestError('Error sending email');
  }
};

/**
 * Method used to send an email to a specific email address
 * Used only in PRODUCTION mode
 * SendGrid is used as a mail transport in production
 */
export const productionEmailSender = async (receiverEmail: string, subject: string, body: string): Promise<void> => {
  const mailOptions: IMailOptions = {
    from: `Be social <${process.env.SENDER_EMAIL}>`,
    to: receiverEmail,
    subject,
    html: body
  };

  try {
    await sendGrid.send(mailOptions);
    console.log(`Production email sent successfully.`);
  } catch (error) {
    console.log(`[productionEmailSender]`, error);
    // BadRequestError('Error sending email');
  }
};

const sendEmail = (receiverEmail: string, subject: string, body: string) => {
  if (process.env.NODE_ENV === ENVIRONMENTS.development) {
    developmentEmailSender(receiverEmail, subject, body);
  } else {
    productionEmailSender(receiverEmail, subject, body);
  }
};

export { sendEmail };
