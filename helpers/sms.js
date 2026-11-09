// Panelchi / MaxSMS webservice (both brands share the same API)
// Docs: https://docs.panelchi.com/redoc/
// Env: PANELCHI_TOKEN, PANELCHI_PATTERN (approved pattern code), PANELCHI_SOURCE (default 10001)
const axios = require('axios');
const CustomError = require('../classes/custom-error');

const API_URL = 'https://api.panelchi.com/sms/pattern';

// 09xxxxxxxxx -> +989xxxxxxxxx
const toInternational = (phone) => `+98${String(phone).replace(/^0/, '')}`;

/**
 * Send a pattern SMS. `variables` keys must match the placeholders in the approved pattern.
 * A successful response means the message was queued, not delivered.
 */
const sendPatternSMS = async ({ to, variables, pattern = process.env.PANELCHI_PATTERN }) => {
  try {
    const { data } = await axios.post(
      API_URL,
      {
        pattern,
        variables,
        recipient: toInternational(to),
        sourceNumber: process.env.PANELCHI_SOURCE || '10001',
      },
      {
        headers: { Authorization: `Bearer ${process.env.PANELCHI_TOKEN}` },
        timeout: 10_000,
      },
    );
    return data;
  } catch (error) {
    throw new CustomError(
      502,
      'SMS_FAILED',
      { fa: 'ارسال پیامک با خطا مواجه شد. لطفا دوباره تلاش کنید.', en: 'Failed to send SMS. Please try again.' },
      `panelchi ${error.response?.status ?? error.code}: ${JSON.stringify(error.response?.data ?? error.message)}`,
    );
  }
};

const sendOtpSMS = ({ to, code }) => sendPatternSMS({ to, variables: { code } });

module.exports = { sendPatternSMS, sendOtpSMS };
