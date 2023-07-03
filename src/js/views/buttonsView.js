const temperatureContainer = document.querySelector(".weather");
const projectInfoButton = document.getElementById("project-info-btn");
const changeMap = document.getElementById("change-map-btn");
const latestButton = document.getElementById("latest-list-btn");
const latestContainer = document.getElementById("call-list-container");
const nearbyButton = document.getElementById("nearby-list-btn");
const responseButton = document.getElementById("response-times-list-btn");
const responseTimesContainer = document.getElementById(
  "response-times-container"
);
const carBreaksinsButton = document.getElementById("car-breakins-btn");

const countNearbyContainer = document.getElementById("nearby-info");
const neighborhoodContainer = document.getElementById("neighborhood-text");
const infoContainer = document.getElementById("project-info-container");
const lastUpdatedElement = document.getElementById("last-updated");

export const loadChangeMapButton = function (handler) {
  changeMap.addEventListener("click", (e) => {
    const btn = e.target.closest("#change-map-btn");
    if (!btn) return;
    e.stopPropagation();
    handler();
  });
};

export const loadLatestListButton = function (handler, closeAllPopups) {
  latestButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = e.target.closest("#latest-list-btn");
    if (!btn) return;
    closeAllPopups();
    handler(false);
  });
};

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

export const loadProjectInfoButton = function (handler) {
  projectInfoButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = e.target.closest("#project-info-btn");
    if (!btn) return;
    handler();
  });
};

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
};

export const toggleVisibleList = function () {
  latestContainer.classList.toggle("hidden");
};

export const toggleResponseTimesList = function () {
  responseTimesContainer.classList.toggle("hidden");
};

export const toggleVisibleInfo = function () {
  infoContainer.classList.toggle("hidden");
};
