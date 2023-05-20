const temperatureContainer = document.querySelector(".weather");
const changeMap = document.getElementById("change-map-btn");
const latestButton = document.getElementById("latest-list-btn");
const nearbyButton = document.getElementById("nearby-list-btn");
const projectInfoButton = document.getElementById("project-info-btn");
const latestContainer = document.getElementById("call-list-container");
const countNearbyContainer = document.getElementById("nearby-info");
const neighborhoodContainer = document.getElementById("neighborhood-text");

export const loadChangeMapButton = function (handler) {
  changeMap.addEventListener("click", (e) => {
    const btn = e.target.closest("#change-map-btn");
    if (!btn) return;
    e.stopPropagation();
    handler();
  });
};

export const loadLatestListButton = function (handler, latestMarkers) {
  latestButton.addEventListener("click", (e) => {
    const btn = e.target.closest("#latest-list-btn");
    if (!btn) return;
    e.stopPropagation();
    handler(latestMarkers);
  });
};

export const loadNearbyListButton = function (handler, nearbyMarkers) {
  nearbyButton.addEventListener("click", (e) => {
    const btn = e.target.closest("#nearby-list-btn");
    if (!btn) return;
    handler(nearbyMarkers);
    e.stopPropagation();
  });
};

export const toggleVisibleItems = function () {
  temperatureContainer.classList.toggle("hidden");
  changeMap.classList.toggle("hidden");
  latestButton.classList.toggle("hidden");
  nearbyButton.classList.toggle("hidden");
  projectInfoButton.classList.toggle("hidden");
  countNearbyContainer.classList.toggle("hidden");
  latestContainer.classList.toggle("hidden");
  neighborhoodContainer.classList.toggle("hidden");
};
