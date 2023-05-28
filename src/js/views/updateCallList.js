import { minsHoursFormat } from "../helpers";
import { toggleVisibleList, toggleVisibleItems } from "./buttonsView";
let lastLoadedList;
const callListHeading = document.getElementById("call-list-heading");
const callListSubHeading = document.getElementById("call-list-subheading");
const latestContainer = document.getElementById("call-list-container");
const callList = document.getElementById("call-list");
let isEventListenerAdded = false;
const formattedDate = new Date().toLocaleString("en-US", {
  // weekday: "long",
  // month: "long",
  // day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hour12: true,
});

export const updateCallList = function (latestMarkers, map, nearby) {
  const callList = document.getElementById("call-list");
  let calcHour = -1;
  const sortedMarkersArr = latestMarkers.getLayers();
  const index = sortedMarkersArr.findIndex((circleMarker) => {
    const receivedTimeAgo = circleMarker.options.data.receivedTimeAgo;
    return receivedTimeAgo > 2910;
  });

  let slicedData;
  if (index !== 0 && index !== 1) {
    slicedData = sortedMarkersArr.slice(0, index);
  }
  if (slicedData.length === 0) return;
  slicedData.forEach((circleMarker) => {
    const receivedTimeAgoF = circleMarker.options.data.receivedTimeAgoF;

    const hours = Math.floor(circleMarker.options.data.receivedTimeAgo / 60);
    if (hours > calcHour) {
      calcHour = hours;
      const minutesNumber = document.createElement("span");
      minutesNumber.classList.add("received-time-ago-hours");
      if (nearby) {
        minutesNumber.style.fontSize = "20px";
      }
      if (calcHour === 0 && nearby) {
        minutesNumber.textContent = `Last hour`;
        minutesNumber.style.color = "Yellow";
        minutesNumber.style.fontStyle = "italic";
      }
      if (calcHour !== 0) {
        minutesNumber.textContent = `${calcHour} hour${
          calcHour === 1 ? "" : "s"
        } ago`;
      }
      nearby
        ? calcHour === 1
          ? (minutesNumber.style.color = "Yellow")
          : calcHour === 2
          ? (minutesNumber.style.color = "Yellow")
          : ""
        : "";
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
          ${receivedTimeAgoF === NaN ? "" : `${receivedTimeAgoF} ago in`} 
          ${circleMarker.options.data.neighborhood}, priority ${
        circleMarker.options.data.priority
      }</p>
         </i><p>${
           circleMarker.options.data.onView === "Y"
             ? `Officer observed`
             : responseTime
             ? `Response time: ${responseTimeF}`
             : circleMarker.options.data.dispatchedTimeAgoF
             ? `Dispatched ${circleMarker.options.data.dispatchedTimeAgoF} ago`
             : circleMarker.options.data.enteredTimeAgo
             ? `Call entry in queue ${circleMarker.options.data.enteredTimeAgo} ago`
             : `Call received, pending entry`
         }${
        circleMarker.options.data.disposition
          ? `, ${circleMarker.options.data.disposition.toLowerCase()}`
          : ", open"
      }
        </p>
          <p>${circleMarker.options.data.address}</p>
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
  const callBoxes = document.getElementsByClassName(
    nearby ? "nearby-call-box" : "allSF-call-box"
  );
  const callBoxesHide = document.getElementsByClassName(
    nearby ? "allSF-call-box" : "nearby-call-box"
  );
  for (let i = 0; i < callBoxesHide.length; i++) {
    callBoxesHide[i].classList.add("hidden");
  }
  for (let i = 0; i < callBoxes.length; i++) {
    callBoxes[i].classList.remove("hidden");
  }
  callListHeading.textContent = message;
  callListSubHeading.textContent = `Last updated: ` + formattedDate;
  toggleVisibleItems();
  toggleVisibleList();
  if (
    (lastLoadedList === "nearby" && !nearby) ||
    (lastLoadedList === "SF" && nearby)
  ) {
    callList.scrollTop = 0;
  }
  if (nearby) map.setView(originalPosition, originalZoom);
  localStorage.setItem("openList", nearby ? "nearby" : "allSF");
  const handleClick = (event) => {
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
      localStorage.removeItem("openList");
    }
  };

  if (latestContainer && callList) {
    nearby ? (lastLoadedList = "nearby") : (lastLoadedList = "SF");
    if (!isEventListenerAdded) {
      window.addEventListener("click", handleClick);
      isEventListenerAdded = true;
    }
  }
};
