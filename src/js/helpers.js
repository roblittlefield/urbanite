export const formatDate = function (rawDate) {
  const date = rawDate.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  return date;
};

export const standardizeData = function (rawData, apiMap) {
  const standardizedData = {};
  for (const key in apiMap) {
    if (apiMap.hasOwnProperty(key)) {
      standardizedData[key] = rawData[apiMap[key]];
    }
  }
  return standardizedData;
};
