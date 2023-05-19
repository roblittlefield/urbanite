const callListContainer = document.getElementById("call-list-container");
const callList = document.getElementById("call-list");
const map = document.getElementById("map");
let startY;
let endY;

callListContainer.addEventListener("touchstart", function (event) {
  startY = event.touches[0].clientY;
});

callListContainer.addEventListener("touchmove", function (event) {
  const currentY = event.touches[0].clientY;
  const deltaY = startY - currentY;

  if (deltaY > 0 && callList.scrollTop === 0) {
    event.preventDefault();
    map.style.pointerEvents = "auto"; // Enable pointer events on the map
  } else if (
    deltaY < 0 &&
    callList.scrollHeight - callList.scrollTop === callList.clientHeight
  ) {
    event.preventDefault();
    map.style.pointerEvents = "none"; // Disable pointer events on the map
  }

  endY = currentY;
});

callListContainer.addEventListener("touchend", function (event) {
  const deltaY = startY - endY;

  if (deltaY > 0 && callList.scrollTop === 0) {
    event.preventDefault();
    map.style.pointerEvents = "auto"; // Enable pointer events on the map
  } else if (
    deltaY < 0 &&
    callList.scrollHeight - callList.scrollTop === callList.clientHeight
  ) {
    event.preventDefault();
    map.style.pointerEvents = "none"; // Disable pointer events on the map
  }
});
