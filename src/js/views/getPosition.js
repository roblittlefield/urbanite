export const showAlert = function (message) {
  const alertElement = document.getElementById("alert");
  alertElement.textContent = "";
  alertElement.classList.remove("hidden");
  alertElement.textContent = message;
  setTimeout(function () {
    if (alertElement.parentElement) {
      alertElement.classList.add("hidden");
    }
  }, 2500);
};

export const getPosition = async function () {
  showAlert(`Getting your location & loading nearby calls...`);
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          const expandedMinLatitude = 37.6398 - 0.0045;
          const expandedMaxLatitude = 37.9298 + 0.0045;
          const expandedMinLongitude = -123.1738 - 0.0045;
          const expandedMaxLongitude = -122.2815 + 0.0045;

          if (
            latitude < expandedMinLatitude ||
            latitude > expandedMaxLatitude ||
            longitude < expandedMinLongitude ||
            longitude > expandedMaxLongitude
          ) {
            showAlert(`Nearby only works in San Francisco, sorry! 🌉`);
            reject(new Error("Location outside SF"));
          } else {
            resolve([latitude, longitude]);
          }
        },
        () => {
          showAlert(`Share your location to see nearby calls 🌉`);
          reject(new Error("Couldn't find position"));
        }
      );
    } else {
      showAlert(`Share your location to see nearby calls 🌉`);
      reject(new Error("Couldn't find position"));
    }
  }).catch((err) => {
    throw err;
  });
};

export const loadLastUpdated = function () {
  const lastUpdatedElement = document.getElementById("last-updated");
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZoneName: "short",
  });
  lastUpdatedElement.textContent = `${formattedDate}`;
};
