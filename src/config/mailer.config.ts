import SMTPTransport from 'nodemailer/lib/smtp-transport';

export const mailerTransportConfig: SMTPTransport.Options = {
  service: 'gmail',
  auth: {
    user: process.env.GOOGLE_GMAIL,
    pass: process.env.GOOGLE_GMAIL_SECRET,
  },
};
