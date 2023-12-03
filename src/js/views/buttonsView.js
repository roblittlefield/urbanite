const temperatureContainer = document.getElementById("weather");
const projectInfoButton = document.getElementById("project-info-btn");
const changeMap = document.getElementById("change-map-btn");
const latestButton = document.getElementById("latest-list-btn");
const latestContainer = document.getElementById("call-list-container");
const nearbyButton = document.getElementById("nearby-list-btn");
const responseButton = document.getElementById("response-times-list-btn");
const buttonContainer1 = document.getElementById("button-container-1");
const buttonContainer2 = document.getElementById("button-container-2");
const responseTimesContainer = document.getElementById(
  "response-times-container"
);
const carBreaksinsButton = document.getElementById("car-breakins-btn");
const countNearbyContainer = document.getElementById("nearby-info");
const neighborhoodContainer = document.getElementById("neighborhood-text");
const infoContainer = document.getElementById("project-info-container");
const lastUpdatedElement = document.getElementById("last-updated");
// const affiliateCont = document.getElementById("affiliate");

/**
 * Load and initialize the "Change Map" button with a click event handler.
 *
 * @param {function} handler - The event handler function to be executed when the button is clicked.
 */
export const loadChangeMapButton = function (handler) {
  changeMap.addEventListener("click", (e) => {
    const btn = e.target.closest("#change-map-btn");
    if (!btn) return;
    e.stopPropagation();
    handler();
  });
};

/**
 * Load and initialize the "Latest List" button with a click event handler and a function to close all popups.
 *
 * @param {function} handler - The event handler function to be executed when the button is clicked.
 * @param {function} closeAllPopups - The function to close all popups before executing the event handler.
 */
export const loadLatestListButton = function (handler, closeAllPopups) {
  latestButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = e.target.closest("#latest-list-btn");
    if (!btn) return;
    closeAllPopups();
    handler(false);
  });
};

/**
 * Load and initialize the "Nearby List" button with a click event handler, data loader, and a function to close all popups.
 *
 * @param {function} loader - The data loading function to be executed when the button is clicked.
 * @param {function} handler - The event handler function to be executed after data loading and before closing popups.
 * @param {function} closeAllPopups - The function to close all popups before executing the event handler.
 */
export const loadNearbyListButton = function (loader, handler, closeAllPopups) {
  nearbyButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = e.target.closest("#nearby-list-btn");
    if (!btn) return;
    nearbyButton.disabled = true;
    (async function () {
      try {
        await loader();
        closeAllPopups();
        handler(true);
        nearbyButton.disabled = false;
      } catch (err) {
        console.error(err);
      }
    })();
  });
};

/**
 * Load and initialize the "Project Info" button with a click event handler.
 *
 * @param {function} handler - The event handler function to be executed when the button is clicked.
 */
export const loadProjectInfoButton = function (handler) {
  projectInfoButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = e.target.closest("#project-info-btn");
    if (!btn) return;
    handler();
  });
};

/**
 * Load and initialize the "Response Times" button with a click event handler.
 *
 * @param {function} closeAllPopups - The function to close all popups before executing the event handler.
 */
export const loadResponseTimesButton = function (closeAllPopups) {
  responseButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = e.target.closest("#response-times-list-btn");
    if (!btn) return;
    toggleResponseTimesList();
    toggleVisibleItems();
    closeAllPopups();
  });
};

/**
 * Load and initialize the "Car Break-ins" button with a click event handler.
 *
 * @param {function} handler - The event handler function to be executed when the button is clicked.
 */
let firstCarBreakin = true;
export const loadCarBreakinsButton = function (handler) {
  carBreaksinsButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = e.target.closest("#car-breakins-btn");
    if (!btn) return;
    carBreaksinsButton.disabled = true;
    const interval = firstCarBreakin ? 6005 : 8005;
    handler();
    setTimeout(function () {
      carBreaksinsButton.disabled = false;
      firstCarBreakin = false;
    }, interval);
  });
};

/**
 * Toggle the visibility of various UI elements on the web app.
 * Elements such as temperature, buttons, and other containers are toggled between hidden and visible states.
 */
export const toggleVisibleItems = function () {
  temperatureContainer.classList.toggle("hidden");
  projectInfoButton.classList.toggle("hidden");
  changeMap.classList.toggle("hidden");
  latestButton.classList.toggle("hidden");
  nearbyButton.classList.toggle("hidden");
  responseButton.classList.toggle("hidden");
  carBreaksinsButton.classList.toggle("hidden");
  countNearbyContainer.classList.toggle("hidden");
  neighborhoodContainer.classList.toggle("hidden");
  lastUpdatedElement.classList.toggle("hidden");
  // affiliateCont.classList.toggle("hidden");
  buttonContainer1.classList.toggle("hidden");
  buttonContainer2.classList.toggle("hidden");
};

/**
 * Toggle the visibility of the "ALL SF" latest list container.
 * Hides or shows the container where the latest list of calls is displayed.
 */
export const toggleVisibleList = function () {
  latestContainer.classList.toggle("hidden");
};

/**
 * Toggle the visibility of the "Response Times" list container.
 * Hides or shows the container where the response times list is displayed.
 */
export const toggleResponseTimesList = function () {
  responseTimesContainer.classList.toggle("hidden");
};

/**
 * Toggle the visibility of the site "About" information container.
 * Hides or shows the container that displays information or details about the web app.
 */
export const toggleVisibleInfo = function () {
  infoContainer.classList.toggle("hidden");
};
