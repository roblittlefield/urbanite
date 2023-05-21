const temperatureContainer = document.querySelector(".weather");
const changeMap = document.getElementById("change-map-btn");
const latestButton = document.getElementById("latest-list-btn");
const nearbyButton = document.getElementById("nearby-list-btn");
const projectInfoButton = document.getElementById("project-info-btn");
const latestContainer = document.getElementById("call-list-container");
const countNearbyContainer = document.getElementById("nearby-info");
const neighborhoodContainer = document.getElementById("neighborhood-text");
const infoContainer = document.getElementById("project-info-container");

export const loadChangeMapButton = function (handler) {
  changeMap.addEventListener("click", (e) => {
    const btn = e.target.closest("#change-map-btn");
    if (!btn) return;
    e.stopPropagation();
    handler();
  });
};

export const loadLatestListButton = function (handler, latestMarkers) {
  const message = "Latest SF Dispatched Calls";
  latestButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = e.target.closest("#latest-list-btn");
    if (!btn) return;
    handler(latestMarkers, message, false);
  });
};

export const loadNearbyListButton = function (handler, nearbyMarkers) {
  const message = "Latest Nearby Dispatched Calls";
  nearbyButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = e.target.closest("#nearby-list-btn");
    if (!btn) return;
    handler(nearbyMarkers, message, true);
  });
};

export const loadProjectInfoButton = function (handler) {
  projectInfoButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = e.target.closest("#project-info-btn");
    console.log(`button pressed`);
    if (!btn) return;
    handler();
  });
};

export const toggleVisibleItems = function () {
  temperatureContainer.classList.toggle("hidden");
  changeMap.classList.toggle("hidden");
  latestButton.classList.toggle("hidden");
  nearbyButton.classList.toggle("hidden");
  projectInfoButton.classList.toggle("hidden");
  countNearbyContainer.classList.toggle("hidden");
  neighborhoodContainer.classList.toggle("hidden");
};

export const toggleVisibleList = function () {
  latestContainer.classList.toggle("hidden");
};

export const toggleVisibleInfo = function () {
  console.log(`toggling visible project info in buttons view`);
  infoContainer.classList.toggle("hidden");
};
