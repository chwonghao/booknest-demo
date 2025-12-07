/**
 * Formats a number into a Vietnamese Dong (VND) currency string.
 * @param {number} amount The numeric amount to format.
 * @returns {string} The formatted currency string (e.g., "150.000 ₫"). Returns an empty string if the input is not a valid number.
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '';
  }
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};