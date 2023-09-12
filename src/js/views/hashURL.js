const getURLParameter = function (cad_number) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(cad);
};
export default getURLParameter;
