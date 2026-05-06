const SibApiV3Sdk = require('sib-api-v3-sdk');

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const sendEmail = async ({ to, subject, htmlContent }) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
      to: [{ email: to }],
      sender: {
        name: 'Poolato Support',
        email: 'support@poolato.com',
      },
      subject,
      htmlContent,
    });

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Verification email sent.');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email sending failed');
  }
};

module.exports = { sendEmail };
