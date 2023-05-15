export const formatDate = function (rawDate) {
    const date = new Date(rawDate).toLocaleString("en-US", {
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
  