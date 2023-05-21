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

export const standardizeData = function (rawData, apiRef) {
  const standardizedData = {};
  for (const key in apiRef) {
    if (apiRef.hasOwnProperty(key)) {
      standardizedData[key] = rawData[apiRef[key]];
    }
  }
  return standardizedData;
};

export const textProperCase = function (textRaw) {
  const text = textRaw
    .replace(/0(\d)/g, "$1")
    .replace(/\\/g, "/")
    .split("/")
    .slice(0, 2)
    .join("/")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
  return text;
};

export const minsHoursFormat = function (time) {
  const hours = Math.floor(time / 60);
  const minutes = time % 60;
  if ((hours === 0)) {
    return `${minutes}m`; // Format as hours and minutes
  } else if (hours < 6) {
    return `${hours}h ${minutes}m`; // Format as hours only
  } else {
    return `${hours}h`; // Format as minutes only
  }
};

export const neighborhoodFormat = function (neighborhood) {
  const neighborhoodFormatted =
    neighborhood === "Financial District/South Beach"
      ? "Financial"
      : neighborhood === "Lone Mountain/USF"
      ? "USF"
      : neighborhood === "Castro/Upper Market"
      ? "Castro"
      : neighborhood === "Sunset/Parkside"
      ? "Sunset"
      : neighborhood === "West of Twin Peaks"
      ? "W Twin Peaks"
      : neighborhood === "Bayview Hunters Point"
      ? "Bayview"
      : neighborhood === "Oceanview/Merced/Ingleside"
      ? "OMI"
      : neighborhood === "South of Market"
      ? "SoMa"
      : neighborhood;
  return neighborhoodFormatted;
};
