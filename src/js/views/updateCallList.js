import { minsHoursFormat } from "../helpers";
import { toggleVisibleList, toggleVisibleItems } from "./buttonsView";
let lastLoadedList;
const callListHeading = document.getElementById("call-list-heading");
const latestContainer = document.getElementById("call-list-container");
const callList = document.getElementById("call-list");

export const updateCallList = function (latestMarkers, map, nearby) {
  const callList = document.getElementById("call-list");
  // callList.innerHTML = "";
  let calcHour = 0;
  const sortedMarkersArr = latestMarkers.getLayers().reverse();
  sortedMarkersArr.forEach((circleMarker) => {
    const receivedTimeAgo = circleMarker.options.data.receivedTimeAgo;
    const receivedTimeAgoF = minsHoursFormat(receivedTimeAgo);

    const hours = Math.floor(receivedTimeAgo / 60);
    if (hours > calcHour) {
      calcHour = hours;

      const minutesNumber = document.createElement("span");
      minutesNumber.classList.add("received-time-ago-hours");
      if (nearby) {
        minutesNumber.style.fontSize = "15px";
      }
      minutesNumber.textContent = `${calcHour} hour${
        calcHour === 1 ? "" : "s"
      } ago`;
      if (nearby) {
        minutesNumber.classList.add("nearby-call-box");
      } else {
        minutesNumber.classList.add("allSF-call-box");
      }
      minutesNumber.classList.add("hidden");
      callList.appendChild(minutesNumber);
    }

    const responseTime = circleMarker.options.data.responseTime;
    const responseTimeF = minsHoursFormat(responseTime);
    if (circleMarker.options.data) {
      const callBox = document.createElement("li");
      callBox.classList.add("call-box");
      callBox.classList.add("hidden");
      if (nearby) {
        callBox.classList.add("nearby-call-box");
      } else {
        callBox.classList.add("allSF-call-box");
      }
      callBox.innerHTML = `
        <h3 style="color: ${
          circleMarker.options.fillColor === "#000000"
            ? "#D3D3D3"
            : circleMarker.options.fillColor === "#FF00FF"
            ? "#FF5AFF"
            : circleMarker.options.fillColor === "#0000FF"
            ? "#66CCFF"
            : circleMarker.options.fillColor
        };">${circleMarker.options.data.callType}${
        circleMarker.options.data.sensitive ? "  *sensitive call" : ""
      }</h3>
          <i><p>
          ${receivedTimeAgo === NaN ? "" : `${receivedTimeAgoF} ago in`} 
          ${circleMarker.options.data.neighborhood}
        </p></i>
          <p>${
            circleMarker.options.data.onView === "Y"
              ? `Officer observed`
              : responseTime
              ? `Response time: ${responseTimeF}`
              : circleMarker.options.data.dispatchTime
              ? `Dispatched ${circleMarker.options.data.dispatchedTimeAgo} ago`
              : circleMarker.options.data.entryTime
              ? `Call entry in queue ${circleMarker.options.data.enteredTimeAgo} ago`
              : `Call received, pending entry`
          }${
        circleMarker.options.data.disposition
          ? `, ${circleMarker.options.data.disposition.toLowerCase()}`
          : ", open"
      }
        </p>
          <p>${circleMarker.options.data.address.slice(0, 45)}</p>
        `;
      callBox.addEventListener("click", () => {
        toggleVisibleList();
        toggleVisibleItems();
        map.flyTo(circleMarker.getLatLng(), 14);
        circleMarker.openPopup();
      });
      callList.appendChild(callBox);
    }
  });
};

export const controlOpenCallList = function (
  message,
  nearby,
  originalPosition,
  originalZoom,
  map
) {
  const callBoxes = document.getElementsByClassName(nearby ? "nearby-call-box" : "allSF-call-box");
  const callBoxesHide = document.getElementsByClassName(nearby? "allSF-call-box" : "nearby-call-box");
  for (let i = 0; i < callBoxesHide.length; i++) {
    callBoxesHide[i].classList.add("hidden");
  }
  for (let i = 0; i < callBoxes.length; i++) {
    callBoxes[i].classList.remove("hidden");
  }
  callListHeading.textContent = message;
  toggleVisibleItems();
  toggleVisibleList();
  if (
    (lastLoadedList === "nearby" && !nearby) ||
    (lastLoadedList === "SF" && nearby)
  ) {
    callList.scrollTop = 0;
  }
  if (nearby) map.setView(originalPosition, originalZoom);
  nearby ? (lastLoadedList = "nearby") : (lastLoadedList = "SF");
  setTimeout(
    window.addEventListener("click", (event) => {
      const clickTarget = event.target;
      if (
        !latestContainer.classList.contains("hidden") &&
        !callList.contains(clickTarget)
      ) {
        toggleVisibleItems();
        toggleVisibleList();
        const callBoxCallList = nearby ? "nearby-call-box" : "allSF-call-box";
        const callBoxes = document.getElementsByClassName(callBoxCallList);
        for (let i = 0; i < callBoxes.length; i++) {
          callBoxes[i].classList.add("hidden");
        }
      }
    }),
    800
  );
};
