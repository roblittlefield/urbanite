const temperatureContainer = document.querySelector(".weather");
const projectInfoButton = document.getElementById("project-info-btn");
const changeMap = document.getElementById("change-map-btn");
const latestButton = document.getElementById("latest-list-btn");
const nearbyButton = document.getElementById("nearby-list-btn");
const responseButton = document.getElementById("response-times-list-btn");
const latestContainer = document.getElementById("call-list-container");
const responseTimesContainer = document.getElementById(
  "response-times-container"
);
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

export const loadLatestListButton = function (handler) {
  const message = "Latest All SF Dispatched Calls";
  latestButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = e.target.closest("#latest-list-btn");
    if (!btn) return;
    handler(message, false);
  });
};

let nearbyClicked = false;
export const loadNearbyListButton = function (handler) {
  nearbyButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = e.target.closest("#nearby-list-btn");
    if (!btn) return;
    handler(nearbyClicked);
    nearbyClicked = true;
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

export const loadResponseTimesButton = function () {
  responseButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = e.target.closest("#response-times-list-btn");
    if (!btn) return;
    toggleResponseTimesList();
    toggleVisibleItems();
  });
};

export const toggleVisibleItems = function () {
  temperatureContainer.classList.toggle("hidden");
  projectInfoButton.classList.toggle("hidden");
  changeMap.classList.toggle("hidden");
  latestButton.classList.toggle("hidden");
  nearbyButton.classList.toggle("hidden");
  responseButton.classList.toggle("hidden");
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

const addSFDataSourceElement = document.querySelector(".addSFDataSource");
