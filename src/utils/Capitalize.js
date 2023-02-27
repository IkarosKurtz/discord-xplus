
/**
 * Capitalize a string
 * @param {String} string - String to capitalize
 * @returns {String} - Capitalized string
 */
function capitalize (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

module.exports = { capitalize }
