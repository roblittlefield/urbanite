/**
 * Displays an alert message on the web page and hides it after a short duration.
 *
 * @param {string} message - The message to be displayed in the alert.
 */
export const showAlert = function (message) {
  const alertElement = document.getElementById("alert");
  alertElement.textContent = "";
  alertElement.classList.remove("hidden");
  alertElement.textContent = message;

  // Hide alert after 2.5 seconds
  setTimeout(function () {
    if (alertElement.parentElement) {
      alertElement.classList.add("hidden");
    }
  }, 2500);
};

/**
 * Gets the user's geolocation and displays relevant messages.
 *
 * @returns {Promise<Array<number>} - A promise that resolves to an array with the user's latitude and longitude.
 * @throws {Error} - If the user's location is outside of San Francisco or if location access is denied.
 */
export const getPosition = async function () {
  showAlert(`Getting your location & loading nearby calls...`);
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // SF city bounds by latitude and longitude boundaries
          const expandedMinLatitude = 37.6398 - 0.0045;
          const expandedMaxLatitude = 37.9298 + 0.0045;
          const expandedMinLongitude = -123.1738 - 0.0045;
          const expandedMaxLongitude = -122.2815 + 0.0045;

          // Checking if user location is outside of SF
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

export const loadTimeSinceUpdate = () => {
  // Get the HTML element with the id "last-updated"
  const lastUpdatedElement = document.getElementById("last-updated");

  // Create a new JavaScript Date object representing the current date and time
  const currentDate = new Date();

  // Format the date as a string in a user-friendly format
  const formattedDate = currentDate.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZoneName: "short",
  });

  // Update the text content of the lastUpdatedElement with the formatted date
  lastUpdatedElement.textContent = `${formattedDate}`;

  // const startTime = new Date(); // Capture the start time when the function is called

  // const updateCounter = () => {
  //   const now = new Date();
  //   const secondsPast = Math.floor((now - startTime) / 1000);
  //   let result = "";

  //   if (secondsPast < 60) {
  //     // less than a minute
  //     result = `${secondsPast}s`;
  //   } else if (secondsPast < 3600) {
  //     // less than an hour
  //     result = `${Math.floor(secondsPast / 60)}m ${secondsPast % 60}s`;
  //   } else if (secondsPast <= 86400) {
  //     // less than a day
  //     result = `${Math.floor(secondsPast / 3600)}h ${Math.floor(
  //       (secondsPast % 3600) / 60
  //     )}m`;
  //   } // Extend for longer durations as needed

  //   document.getElementById(
  //     "last-updated"
  //   ).innerText = `Last updated ${result} ago`;
  // };

  // return updateCounter;
};

// Example usage in another module:
// setInterval(loadTimeSinceUpdate(), 1000);

// /**
//  * Loads and updates the last updated timestamp in the user interface.
//  */

// // Get the HTML element with the id "last-updated"
// const lastUpdatedElement = document.getElementById("last-updated");

// // Create a new JavaScript Date object representing the current date and time
// const currentDate = new Date();

// // Format the date as a string in a user-friendly format
// const formattedDate = currentDate.toLocaleString("en-US", {
//   month: "long",
//   day: "numeric",
//   hour: "numeric",
//   minute: "numeric",
//   hour12: true,
//   timeZoneName: "short",
// });

// // Update the text content of the lastUpdatedElement with the formatted date
// lastUpdatedElement.textContent = `${formattedDate}`;
// };
