/**
 * Formats a number with comma separators for thousands
 * @param {number|string} num - The number to format
 * @returns {string} - Formatted number with comma separators (e.g., 1000000 -> "1,000,000")
 */
function formatNumberWithCommas(num) {
  // Convert to number if it's a string
  const number = typeof num === 'string' ? parseFloat(num) : num;
  
  // Handle invalid numbers
  if (isNaN(number)) {
    return num.toString();
  }
  
  // Convert to string and add comma separators
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

module.exports = { formatNumberWithCommas };

