function normalizePersian(str) {
  return str
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[‌\u200c]/g, ' '); // remove half-space / ZWNJ
}

module.exports = normalizePersian;
