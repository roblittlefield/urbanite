import { minsHoursFormat } from "../helpers";
import {
  toggleVisibleList,
  toggleVisibleItems,
  toggleResponseTimesList,
} from "./buttonsView";
let lastLoadedList;
const callListHeading = document.getElementById("call-list-heading");
const callListSubHeading = document.getElementById("call-list-subheading");
const latestContainer = document.getElementById("call-list-container");
const responseTimesContainer = document.getElementById(
  "response-times-container"
);
const callList = document.getElementById("call-list");
let isEventListenerAdded = false;
const callTypeTotals = {};
const callNeighborhoodCount = {};
const callNeighborhoodTime = {};
const callNeighborhoodMedian = {};
const formattedDate = new Date().toLocaleString("en-US", {
  hour: "numeric",
  minute: "numeric",
  hour12: true,
});

export const updateCallList = function (latestMarkers, map, nearby) {
  const callList = document.getElementById("call-list");
  let calcHour = -1;
  const markersArr = latestMarkers.getLayers();

  const sortedMarkersArr = markersArr.sort(
    (a, b) => a.options.data.receivedTimeAgo - b.options.data.receivedTimeAgo
  );

  sortedMarkersArr.forEach((circleMarker) => {
    callTypeTotals[circleMarker.options.data.callType] =
      (callTypeTotals[circleMarker.options.data.callType] || 0) + 1;
    if (circleMarker.options.data.responseTimeExact) {
      callNeighborhoodCount[circleMarker.options.data.neighborhood] =
        (callNeighborhoodCount[circleMarker.options.data.neighborhood] || 0) +
        1;
      if (circleMarker.options.data.priority === "A") {
        if (!callNeighborhoodTime[circleMarker.options.data.neighborhood])
          callNeighborhoodTime[circleMarker.options.data.neighborhood] = [];
        callNeighborhoodTime[circleMarker.options.data.neighborhood].push(
          circleMarker.options.data.responseTimeExact
        );
      }
    }

    const receivedTimeAgo = circleMarker.options.data.receivedTimeAgo;
    const receivedTimeAgoF = minsHoursFormat(receivedTimeAgo);

    const hours = Math.floor(receivedTimeAgo / 60);
    if (hours > calcHour) {
      calcHour = hours;
      const minutesNumber = document.createElement("span");
      minutesNumber.style.display = "block";
      minutesNumber.style.flexBasis = "100%";
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
          ${receivedTimeAgo === NaN ? "" : `${receivedTimeAgoF} ago in`} 
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
  if (!nearby) console.log(callTypeTotals);
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
  if (nearby) latestContainer.classList.add("nearby-list");
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
      if (nearby) latestContainer.classList.remove("nearby-list");
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

const updateResponseTimesList = function (callNeighborhoodMedian) {
  const sortedCallNeighborhoodMedian = {};
  Object.keys(callNeighborhoodMedian)
    .sort()
    .forEach((key) => {
      sortedCallNeighborhoodMedian[key] = callNeighborhoodMedian[key];
    });
  const responseList = document.getElementById("response-times-list");
  Object.entries(sortedCallNeighborhoodMedian).forEach(([key, value]) => {
    const responseBox = document.createElement("li");
    responseBox.innerHTML =
      Number(value) <= 8
        ? `<p style="color: #D3D3D3">${key}  ${value} mins </p>`
        : Number(value) < 12
        ? `<p style="color: #f0fe8b">${key}  ${value} mins </p>`
        : Number(value) < 15
        ? `<p style="color: #f46d43">${key}  ${value} mins </p>`
        : `<p style="color: #f46d43">${key}  ${value} mins </p>`;
    responseList.appendChild(responseBox);
  });
  const handleResponseTimesClick = (event) => {
    const clickTarget = event.target;
    if (
      !responseTimesContainer.classList.contains("hidden") &&
      !responseTimesContainer.contains(clickTarget)
    ) {
      toggleVisibleItems();
      toggleResponseTimesList();
    }
  };
  window.addEventListener("click", handleResponseTimesClick);
};

export const calcMedian = function () {
  const overallArr = [].concat(...Object.values(callNeighborhoodTime));
  const overallMid = Math.floor(overallArr.length / 2);
  const overallNums = [...overallArr].sort((a, b) => a - b);
  const overallMedian =
    overallArr.length % 2 !== 0
      ? overallNums[overallMid]
      : (overallNums[overallMid - 1] + overallNums[overallMid]) / 2;
  Object.keys(callNeighborhoodTime).forEach((neighborhood) => {
    const arr = callNeighborhoodTime[neighborhood];
    const mid = Math.floor(arr.length / 2);
    const nums = [...arr].sort((a, b) => a - b);
    const median =
      arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    callNeighborhoodMedian[neighborhood] = median.toFixed(1);
  });
  callNeighborhoodMedian["All San Francisco [Overall]"] =
    overallMedian.toFixed(2);
  updateResponseTimesList(callNeighborhoodMedian);
};
