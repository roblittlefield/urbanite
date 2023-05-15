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

const getCallTypeCount = function (data) {
  const countByCallType = {};
  data.forEach((call) => {
    const callType = call.call_type_original_desc;
    if (callType in countByCallType) {
      countByCallType[callType]++;
    } else {
      countByCallType[callType] = 1;
    }
  });
  const countPairs = Object.entries(countByCallType);
  countPairs.sort((a, b) => b[1] - a[1]);
  countPairs.forEach((pair) => {
    console.log(`${pair[0]}: ${pair[1]}`);
  });
};
