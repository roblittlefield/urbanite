const latestContainer = document.getElementById("latest-container");
const latestButton = document.getElementById("latest-list");
const changeMap = document.getElementById("change-map");
const neighborhoodContainer = document.getElementById("neighborhood-text");
const countNearbyContainer = document.getElementById("count-display");
const temperatureContainer = document.querySelector(".weather");

export const loadChangeMapButton = function (handler) {
  changeMap.addEventListener("click", (e) => {
    const btn = e.target.closest("#change-map");
    if (!btn) return;
    handler();
  });
};

export const loadLatestListButton = function (handler) {
  latestButton.addEventListener("click", (e) => {
    const btn = e.target.closest("#latest-list");
    if (!btn) return;
    handler();
  });
};

export const toggleVisibleItems = function () {
  latestContainer.classList.toggle("hidden");
  latestButton.classList.toggle("hidden");
  countNearbyContainer.classList.toggle("hidden");
  temperatureContainer.classList.toggle("hidden");
  neighborhoodContainer.classList.toggle("hidden");
  changeMap.classList.toggle("hidden");
};
