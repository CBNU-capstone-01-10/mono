import nodemailer from 'nodemailer';
import { mailerTransportConfig } from '../config/mailer.config';
import ejs from 'ejs';
import path from 'path';

interface sender {
  src: string;
}

interface defaultConfig {
  dst: string | string[];
}

interface VerificationMailConfig extends defaultConfig {
  token: string;
}

class Mailer {
  transporter: nodemailer.Transporter;
  sender: sender;
  templatesPath: string;

  constructor() {
    this.templatesPath = path.join(process.cwd(), 'emails');
    this.sender = { src: 'seungho.hub@gmail.com' };
    this.transporter = nodemailer.createTransport(mailerTransportConfig);
  }

  async sendVerificationMail(config: VerificationMailConfig) {
    const html = await ejs.renderFile(
      path.join(this.templatesPath, 'verification/index.ejs'),
      {
        token: config.token,
      }
    );

    const messageConfig: nodemailer.SendMailOptions = {
      from: this.sender.src,
      to: config.dst,
      subject: '왕눈이 계정 인증코드',
      html,
    };

    return await this.transporter.sendMail(messageConfig);
  }
}

export default new Mailer();
