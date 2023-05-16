import * as sfapi from "./config.js";

export const fetchApi = async function (url, reqParam, order) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response for promise was not ok");
    }
    // let data = await res.json();
    // getCallTypeCount(data); // To delete
    // console.log(data); // To delete

    // return data;
    return response;
  } catch (err) {
    console.log(err);
  }
};


