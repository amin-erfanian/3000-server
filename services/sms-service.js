const axios = require('axios');

const SMS_API_KEY = process.env.SMS_API_KEY;
const SMS_FROM = process.env.SMS_FROM;

const TYPES = {
  resetPassword: 338607,
  signup: 338606,
  deleteUserData: 338805,
};

const sendSimpleSMS = async ({ to, text }) => {
  const requestData = {
    from: SMS_FROM,
    to,
    text,
  };

  return await axios.post(`https://console.melipayamak.com/api/send/shared/${SMS_API_KEY}`, requestData);
};

const sendPatternSMS = async ({ to, code, type }) => {
  const requestData = {
    bodyId: TYPES[type],
    to,
    args: [code],
  };

  return await axios.post(`https://console.melipayamak.com/api/send/shared/${SMS_API_KEY}`, requestData);
};

const getCredit = async () => {
  const response = await axios.get(`https://console.melipayamak.com/api/receive/credit/${SMS_API_KEY}`);
  return response.data;
};

module.exports = { sendPatternSMS, sendSimpleSMS, getCredit };
