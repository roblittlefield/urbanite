/**
 * Get the value of a URL parameter by its name.
 *
 * @param {string} cad_number - The name of the URL parameter to retrieve.
 * @returns {string|null} - The value of the URL parameter, or null if not found.
 */
const getURLParameter = function (cad_number) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(cad_number);
};

export default getURLParameter;
