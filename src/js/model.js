export const fetchApi = async function (url, reqParam, order) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response for promise was not ok");
    }
    return response;
  } catch (err) {
    console.log(err);
  }
};
