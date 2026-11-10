// IPPanel Edge webservice
// Docs: https://docs.ippanel.com/docs/send/pattern/
// Env: IPPANEL_API_KEY (Panel > Developers > Access Keys), IPPANEL_PATTERN_CODE (approved pattern),
//      IPPANEL_FROM_NUMBER (sender line assigned to the account, e.g. +983000505)
const axios = require('axios');
const CustomError = require('../classes/custom-error');

const API_URL = 'https://edge.ippanel.com/v1/api/send';

// 09xxxxxxxxx -> +989xxxxxxxxx (E.164, as IPPanel expects)
const toInternational = (phone) => `+98${String(phone).replace(/^0/, '')}`;

// Sender numbers may be saved as 3000505 / 983000505 / +983000505
const toSenderNumber = (number) => `+98${String(number ?? '').replace(/^(\+98|0098|98|0)/, '')}`;

const smsFailed = (details) =>
  new CustomError(
    502,
    'SMS_FAILED',
    { fa: 'ارسال پیامک با خطا مواجه شد. لطفا دوباره تلاش کنید.', en: 'Failed to send SMS. Please try again.' },
    `ippanel ${details}`,
  );

/**
 * Send a pattern SMS. `params` keys must match the placeholders in the approved pattern.
 * A successful response means the message was queued, not delivered.
 */
const sendPatternSMS = async ({ to, params, pattern = process.env.IPPANEL_PATTERN_CODE }) => {
  const missing = ['IPPANEL_API_KEY', 'IPPANEL_FROM_NUMBER'].filter((name) => !process.env[name]);
  if (!pattern) missing.push('IPPANEL_PATTERN_CODE');
  if (missing.length) throw smsFailed(`missing env: ${missing.join(', ')}`);

  let data;
  try {
    ({ data } = await axios.post(
      API_URL,
      {
        sending_type: 'pattern',
        from_number: toSenderNumber(process.env.IPPANEL_FROM_NUMBER),
        code: pattern,
        recipients: [toInternational(to)],
        // IPPanel only documents string values
        params: Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
      },
      {
        // The raw API key, no `Bearer` prefix
        headers: { Authorization: process.env.IPPANEL_API_KEY },
        timeout: 10_000,
      },
    ));
  } catch (error) {
    throw smsFailed(`${error.response?.status ?? error.code}: ${JSON.stringify(error.response?.data ?? error.message)}`);
  }

  // Errors are reported in `meta`, so a 2xx alone doesn't mean it was sent
  if (!data?.meta?.status) throw smsFailed(`rejected: ${JSON.stringify(data)}`);

  return data.data;
};

// The approved OTP pattern's placeholder is %otp%
const sendOtpSMS = ({ to, code }) => sendPatternSMS({ to, params: { otp: code } });

module.exports = { sendPatternSMS, sendOtpSMS };
