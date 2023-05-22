const showAlert = function (message) {
  const alertElement = document.createElement("div");
  alertElement.classList.add("alert");
  alertElement.textContent = message;
  document.body.appendChild(alertElement);

  setTimeout(function () {
    if (alertElement.parentElement) {
      alertElement.parentElement.removeChild(alertElement);
    }
  }, 2000);
};

const getPosition = function (defaultMapSF) {
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
            showAlert(
              `Looks like you're outside San Francisco, loading city center 🌉`
            );
            reject(new Error("Location outside expanded SF bounds"));
          } else {
            resolve([latitude, longitude]);
          }
        },
        () => {
          showAlert(
            `Couldn't find your location in San Francisco, loading city center 🌉`
          );
          resolve(defaultMapSF);
        }
      );
    } else {
      showAlert(
        `Couldn't find your location in San Francisco, loading city center 🌉`
      );
      resolve(defaultMapSF);
    }
  });
};

const lastUpdatedElement = document.getElementById("last-updated");
const storedTimestamp = localStorage.getItem("lastUpdatedTimestamp");
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
localStorage.setItem("lastUpdatedTimestamp", formattedDate);

export default getPosition;
