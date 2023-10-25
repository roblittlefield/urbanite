/**
 * Formats a raw date string into a human-readable date and time in the "America/Los_Angeles" time zone.
 *
 * @param {string} rawDate - The raw date string to be formatted.
 * @returns {string} The formatted date and time string.
 */
export const formatDate = function (rawDate) {
  const newRawDate = new Date(rawDate);
  const date = newRawDate.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  return date.replace(",", "");
};

/**
 * Standardizes raw data based on a provided API reference object.
 *
 * @param {Object} rawData - The raw data to be standardized.
 * @param {Object} apiRef - The API reference object that defines the data mapping.
 * @returns {Object} The standardized data object.
 */
export const standardizeData = function (rawData, apiRef) {
  const standardizedData = {};
  for (const key in apiRef) {
    if (apiRef.hasOwnProperty(key)) {
      standardizedData[key] = rawData[apiRef[key]];
    }
  }
  return standardizedData;
};

/**
 * Converts a raw text string into a proper case string with limited length.
 *
 * @param {string} textRaw - The raw text string to be converted.
 * @returns {string} The proper case string with limited length.
 */
export const textProperCase = function (textRaw) {
  const text = textRaw
    .replace(/\\\\/g, "\\")
    .replace(/0(\d)/g, "$1")
    .replace(/\\/g, "/")
    .split("/")
    .slice(0, 2)
    .join("/")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .slice(0, 45);
  return text;
};

/**
 * Formats a given time in minutes into a human-readable format with various time units.
 *
 * @param {number} time - The time in minutes to be formatted.
 * @returns {string} The formatted time string.
 */
export const minsHoursFormat = function (time) {
  const hours = Math.floor(time / 60);
  const days = Math.floor(time / 1440);
  const minutes = time % 60;
  if (hours === 0) {
    return `${minutes}m`;
  } else if (hours < 6) {
    return `${hours}h${minutes === 0 ? "" : ` ${minutes}m`}`;
  } else if (hours <= 50) {
    return `${hours}h`;
  } else if (days < 365) {
    return `${days}d${
      Math.floor((time % 1440) / 60) === 0
        ? ` ${time % 1440}m`
        : ` ${Math.floor((time % 1440) / 60)}h ${(time % 1440) % 60}m`
    }`;
  } else {
    return `${Math.floor(days / 365)}y ${Math.floor((time % 525600) / 1440)}d`;
  }
};

/**
 * Formats a neighborhood name to a more common, shorter, more concise version if available.
 *
 * @param {string} neighborhood - The neighborhood name to be formatted.
 * @returns {string} The formatted neighborhood name.
 */
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
