import * as sfapi from "./config.js";

const layerGroups = {};

export const fetchApiPolice48h = async function (url) {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Network response for promise was not ok");
    }
    const data = await res.json();

    getCallTypeCount(data); // To delete
    console.log(data); // To delete

    return data;
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
