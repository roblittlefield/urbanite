const getURLParameter = function (cad_number) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(cad_number);
};
export default getURLParameter;
// https://urbanitesf.netlify.app.html?cad_number=231441030

// https://urbanitesf.netlify.app/?cad_number=231441034    // Marina incident

// http://localhost:1234/?cad_number=231441034  // Local Host Marina incident
