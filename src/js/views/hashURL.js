const getURLParameter = function (cad_number) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(cad_number);
};
export default getURLParameter;
