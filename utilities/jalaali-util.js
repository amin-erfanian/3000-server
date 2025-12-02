const jalaali = require('jalaali-js');

function getCurrentJalaaliDateTime() {
  const now = new Date();
  const jNow = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const formattedDate = `${jNow.jy}/${jNow.jm}/${jNow.jd}`;

  return `${formattedDate}`;
}

module.exports = { getCurrentJalaaliDateTime };
