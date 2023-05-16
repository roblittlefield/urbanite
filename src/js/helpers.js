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

export const textProperCase = function (textRaw) {
  const textProper = textRaw
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
  return textProper;
};

export const minsHoursFormat = function (time) {
  const timeFormatted =
    time < 60
      ? `${time}m`
      : time < 180
      ? `${(time / 60).toFixed(0)}h ${time % 60}m`
      : `${(time / 60).toFixed(0)}h`;
  return timeFormatted;
};
