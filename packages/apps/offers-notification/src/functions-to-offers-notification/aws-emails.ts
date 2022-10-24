import type { Stores } from '@cloudcommerce/api/types';
import * as nodemailer from 'nodemailer';
import * as aws from 'aws-sdk';

export default (
  store: Stores,
  from: string,
  to: string,
  subject: string,
  html: any,
) => {
  return new Promise((resolve, reject) => {
    aws.config.update({
      region: 'us-west-2',
    });

    const transporter = nodemailer.createTransport({
      SES: new aws.SES({
        apiVersion: '2010-12-01',
      }),
    });

    const options = {
      from: {
        name: store.name,
        address: 'noreply@e-com.club',
      },
      to,
      subject,
      html,
      replyTo: from,
      headers: {
        'Reply-To': from,
        Loja: store as any,
      },
    };

    transporter.sendMail(
      options,
      (err, info) => (err ? reject(err) : resolve(info)),
    );
  });
};
