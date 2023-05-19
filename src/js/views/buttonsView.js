const latestContainer = document.getElementById("call-list-container");
const latestButton = document.getElementById("latest-list");
const nearbyButton = document.getElementById("nearby-list");
const changeMap = document.getElementById("change-map");
const neighborhoodContainer = document.getElementById("neighborhood-text");
const countNearbyContainer = document.getElementById("nearby-info");
const temperatureContainer = document.querySelector(".weather");

export const loadChangeMapButton = function (handler) {
  changeMap.addEventListener("click", (e) => {
    const btn = e.target.closest("#change-map");
    if (!btn) return;
    e.stopPropagation();
    handler();
  });
};

export const loadLatestListButton = function (handler, latestMarkers) {
  latestButton.addEventListener("click", (e) => {
    const btn = e.target.closest("#latest-list");
    if (!btn) return;
    e.stopPropagation();
    handler(latestMarkers);
  });
};

export const loadNearbyListButton = function (handler, nearbyMarkers) {
  nearbyButton.addEventListener("click", (e) => {
    const btn = e.target.closest("#nearby-list");
    if (!btn) return;
    handler(nearbyMarkers);
    e.stopPropagation();
  });
};

export const toggleVisibleItems = function () {
  latestContainer.classList.toggle("hidden");
  latestButton.classList.toggle("hidden");
  nearbyButton.classList.toggle("hidden");
  countNearbyContainer.classList.toggle("hidden");
  temperatureContainer.classList.toggle("hidden");
  neighborhoodContainer.classList.toggle("hidden");
  changeMap.classList.toggle("hidden");
};

// Add custom scroll bar to the element with the class 'custom-scrollbar'
const scrollbarTrack = document.createElement('div');
const scrollbarThumb = document.createElement('div');

scrollbarTrack.classList.add('scrollbar-track');
scrollbarThumb.classList.add('scrollbar-thumb');

document.body.appendChild(scrollbarTrack);
scrollbarTrack.appendChild(scrollbarThumb);
