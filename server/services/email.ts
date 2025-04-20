import mailgun from 'mailgun-js';

interface EmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  text?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env;
    
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
      console.error('Mailgun configuration missing. Emails cannot be sent.');
      return false;
    }
    
    const mg = mailgun({
      apiKey: MAILGUN_API_KEY,
      domain: MAILGUN_DOMAIN
    });
    
    const data = {
      from: params.from || 'TinyPaws <noreply@tinypaws.com>',
      to: Array.isArray(params.to) ? params.to.join(',') : params.to,
      subject: params.subject,
      html: params.html,
      text: params.text || params.html.replace(/<[^>]*>?/gm, '')
    };
    
    const response = await mg.messages().send(data);
    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}