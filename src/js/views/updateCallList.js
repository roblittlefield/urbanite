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
let callNeighborhoodTime = {};

/**
 * Update the call list based on the latest markers and map configuration.
 *
 * @param {L.LayerGroup} latestMarkers - The layer group containing the latest call markers.
 * @param {L.Map} map - The Leaflet map instance.
 * @param {boolean} nearby - A boolean indicating if the nearby call list is being updated.
 */
export const updateCallList = function (latestMarkers, map, nearby) {
  const callTypeTotals = {};
  const callNeighborhoodCount = {};
  let calcHour = -1;
  const markersArr = latestMarkers.getLayers();

  // Create Call Type String Length Dummy Element Span
  const measureElement = document.createElement("span");
  document.body.appendChild(measureElement);
  measureElement.style.visibility = "hidden";
  measureElement.style.whiteSpace = "nowrap";
  measureElement.style.fontFamily = "Tahoma, Arial, Helvetica, sans-serif";
  measureElement.style.fontSize = "16px";
  function getStringVisualLength(str) {
    measureElement.textContent = str;
    return measureElement.offsetWidth;
  }
  let totalRoom = 210;
  // if (window.innerWidth >= 387) {
  //   totalRoom = 210;
  // }

  // Sort markers by received time
  const sortedMarkersArr = markersArr.sort(
    (a, b) =>
      a.options.data.receivedTimeAgoExact - b.options.data.receivedTimeAgoExact
  );

  // Iterate through the sorted markers and update call data
  sortedMarkersArr.forEach((circleMarker) => {
    const callType = circleMarker.options.data.callType;

    callTypeTotals[callType] = (callTypeTotals[callType] || 0) + 1;
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

      let minutesNumberHtml = `<span `;
      if (nearby) {
        minutesNumberHtml += `class="hidden received-time-ago-hours nearby-call-box" style="display: block; flex-basis: 100%; font-size: 20px !important; `;

        if (calcHour < 3) {
          minutesNumberHtml += ` color: yellow !important; font-style: italic;">`;
        } else {
          minutesNumberHtml += `">`;
        }

        if (calcHour === 0) {
          minutesNumberHtml += `Last hour</span>`;
        } else {
          minutesNumberHtml += `${calcHour} hour${
            calcHour === 1 ? "" : "s"
          } ago</span>`;
        }
      } else {
        minutesNumberHtml += `class="hidden received-time-ago-hours allSF-call-box" style="display: block; flex-basis: 100%;">`;
        if (calcHour !== 0) {
          minutesNumberHtml += `${calcHour} hour${
            calcHour === 1 ? "" : "s"
          } ago</span>`;
        } else {
          minutesNumberHtml += `</span>`;
        }
      }

      callList.insertAdjacentHTML("beforeend", minutesNumberHtml);
    }

    const responseTime = circleMarker.options.data.responseTime;
    const responseTimeF = minsHoursFormat(responseTime);
    if (circleMarker.options.data) {
      let callNotesTrim = "";
      if (window.innerWidth >= 369);
      {
        if (circleMarker.options.data.callNotes) {
          const callTypeLength = getStringVisualLength(callType);
          callNotesTrim = `: ${circleMarker.options.data.callNotes}`;
          let callNotesLength = getStringVisualLength(callNotesTrim);

          let extraRoom = totalRoom - callTypeLength - callNotesLength;
          while (extraRoom < 0) {
            callNotesTrim = callNotesTrim.slice(0, -1);
            callNotesLength = getStringVisualLength(callNotesTrim);
            extraRoom = totalRoom - callTypeLength - callNotesLength;
          }
        }
      }

      // Create and add call box elements
      const callBoxClasses = ["call-box", "hidden"];
      circleMarker.options.data.recentlyResponded
        ? callBoxClasses.push("recent-resp")
        : circleMarker.options.data.recentlyDispatched
        ? callBoxClasses.push("recent-disp")
        : "";

      if (circleMarker.options.data.disposition === "No merit") {
        callBoxClasses.push("call-box-no-merit");
      }

      if (nearby) {
        callBoxClasses.push("nearby-call-box");
      } else {
        callBoxClasses.push("allSF-call-box");
      }

      const callBoxClassString = callBoxClasses.join(" ");

      const callBoxContent = `
        <h3 style="color: ${
          circleMarker.options.fillColor === "#000000"
            ? "#D3D3D3"
            : circleMarker.options.fillColor === "#FF00FF"
            ? "#FF5AFF"
            : circleMarker.options.fillColor === "#0000FF"
            ? "#66CCFF"
            : circleMarker.options.fillColor
        };">${callType}${callNotesTrim}${
        circleMarker.options.data.sensitive ? "  *sensitive call" : ""
      }</h3>
          <i><p>
          ${receivedTimeAgo === NaN ? "" : `${receivedTimeAgoF} ago in`} 
          ${circleMarker.options.data.neighborhood}, Priority ${
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

      const callBox = document.createElement("li");
      callBox.className = callBoxClassString;
      callBox.innerHTML = callBoxContent;

      // Add a click event listener to open popup and adjust the map view
      callBox.addEventListener("click", () => {
        toggleVisibleList();
        toggleVisibleItems();
        moving = true;
        setTimeout(() => {
          moving = false;
        }, 3000);
        map.flyTo(circleMarker.getLatLng(), 14);
        circleMarker.openPopup();

        // Get the 'neighborhood', 'tweetContent' and 'Text Messsage Content' data from the marker's options
        const { neighborhood, callTweetContent, callMessageContent } =
          circleMarker.options.data;
        document.getElementById("neighborhood-text").textContent = neighborhood;
        document.getElementById("tweet-content").textContent = callTweetContent;
        document.getElementById("text-message-content").textContent =
          callMessageContent;
      });
      callList.appendChild(callBox);
    }
  });
  if (localStorage.getItem("openList") === "nearby") {
    const nearbyCallBoxes = document.querySelectorAll(".nearby-call-box");
    nearbyCallBoxes.forEach((el) => el.classList.remove("hidden"));
  }
  if (localStorage.getItem("openList") === "allSF") {
    const allCallBoxes = document.querySelectorAll(".allSF-call-box");
    allCallBoxes.forEach((el) => el.classList.remove("hidden"));
  }

  // Set the last updated time for the call list
  let formattedDate = new Date().toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  callListSubHeading.textContent = `Last updated: ` + formattedDate;
  if (!nearby) console.log(callTypeTotals);
  document.body.removeChild(measureElement);
};

/**
 * Control the visibility and behavior of the open call list.
 *
 * @param {string} message - The message to display in the call list heading.
 * @param {boolean} nearby - A boolean indicating if the nearby call list is being opened.
 * @param {Function} openPopup - A function to open a popup on the map.
 * @param {Array<number>} position - The map position to set when opening the nearby call list.
 * @param {number} originalZoom - The original map zoom level.
 * @param {L.Map} map - The Leaflet map instance.
 */
export const controlOpenCallList = function (
  message,
  nearby,
  openPopup,
  position,
  originalZoom,
  map
) {
  // Get and manipulate call boxes elements based on nearby or allSF
  const callBoxes = document.getElementsByClassName(
    nearby ? "nearby-call-box" : "allSF-call-box"
  );
  const callBoxesHide = document.getElementsByClassName(
    nearby ? "allSF-call-box" : "nearby-call-box"
  );

  // Hide call boxes that are not selected
  for (let i = 0; i < callBoxesHide.length; i++) {
    callBoxesHide[i].classList.add("hidden");
  }

  // Show selected call boxes
  for (let i = 0; i < callBoxes.length; i++) {
    callBoxes[i].classList.remove("hidden");
  }

  // Set the call list heading
  callListHeading.textContent = message;

  // Toggle visibility of items and lists
  toggleVisibleItems();
  toggleVisibleList();

  // Scroll to the top of the list if switching between nearby and allSF
  if (
    (lastLoadedList === "nearby" && !nearby) ||
    (lastLoadedList === "SF" && nearby)
  ) {
    callList.scrollTop = 0;
  }

  // Additional actions if opening nearby call list
  if (nearby) latestContainer.classList.add("nearby-list");
  if (nearby) {
    moving = true;
    setTimeout(() => {
      moving = false;
    }, 3000);
    map.setView(
      [position[0] + (window.innerWidth <= 450 ? 0.004 : 0.002), position[1]],
      originalZoom
    );
  }

  // Store the selected list type in local storage so it opens back up if the page is closed
  localStorage.setItem("openList", nearby ? "nearby" : "allSF");

  // Close the call box
  const closeCallBox = () => {
    // Close the call list if it's open
    toggleVisibleItems();
    toggleVisibleList();
    openPopup();
    latestContainer.classList.remove("nearby-list");

    // Hide call boxes
    const callBoxCallList = nearby ? "nearby-call-box" : "allSF-call-box";
    const callBoxes = document.getElementsByClassName(callBoxCallList);
    for (let i = 0; i < callBoxes.length; i++) {
      callBoxes[i].classList.add("hidden");
    }
    // Remove the selected open list type from local storage
    localStorage.removeItem("openList");
  };

  // Define click event handler to close the call list when clicking outside
  const handleClick = (event) => {
    const clickTarget = event.target;
    if (
      !latestContainer.classList.contains("hidden") &&
      !callList.contains(clickTarget)
    ) {
      closeCallBox();
    }
  };

  const handleEsc = (event) => {
    const allowedKeys = ["Escape", " ", "Enter", "c", "Delete", "q"];
    if (
      allowedKeys.includes(event.key) &&
      !latestContainer.classList.contains("hidden")
    ) {
      closeCallBox();
    }
  };

  // Attach click event listener for handling clicks outside the call list
  if (latestContainer && callList) {
    nearby ? (lastLoadedList = "nearby") : (lastLoadedList = "SF");
    if (!isEventListenerAdded) {
      window.addEventListener("click", handleClick);
      window.addEventListener("keydown", handleEsc);
      isEventListenerAdded = true;
    }
  }
};

/**
 * Update the response times list based on neighborhood median response times.
 *
 * @param {object} callNeighborhoodMedian - An object containing neighborhood median response times.
 */
let callNeighborhoodMedian = {};
const updateResponseTimesList = function (callNeighborhoodMedian) {
  // Initialize a sorted version of the neighborhood median data
  const sortedCallNeighborhoodMedian = {};

  // Get the response times list container element
  const responseList = document.getElementById("response-times-list");
  // Clear the existing content of the response times list
  responseList.innerHTML = "";

  // Sort the neighborhood median data by neighborhood namev
  Object.keys(callNeighborhoodMedian)
    .sort()
    .forEach((key) => {
      sortedCallNeighborhoodMedian[key] = callNeighborhoodMedian[key];
    });

  // Create and populate response time boxes for each neighborhood
  Object.entries(sortedCallNeighborhoodMedian).forEach(([key, value]) => {
    // Create a list item for the response time data
    const responseBox = document.createElement("li");

    // Define the style based on response time value
    let responseHtml = "";

    if (Number(value) <= 8) {
      responseHtml = `<p style="color: #D3D3D3">${key} ${value} mins </p>`;
    } else if (Number(value) < 12) {
      responseHtml = `<p style="color: #f0fe8b">${key} ${value} mins </p>`;
    } else if (Number(value) < 15) {
      responseHtml = `<p style="color: #f46d43">${key} ${value} mins </p>`;
    } else {
      responseHtml = `<p style="color: #f46d43">${key} ${value} mins </p>`;
    }

    // Set the HTML content
    responseBox.innerHTML = responseHtml;

    // Add the response time box to the response times list
    responseList.appendChild(responseBox);
  });

  // Define a click event handler for closing the response times list
  const handleResponseTimesClick = (event) => {
    const clickTarget = event.target;
    // Close the response times list if it's open and user clicks on somewhere not part of the list
    if (
      !responseTimesContainer.classList.contains("hidden")
      // && !responseTimesContainer.contains(clickTarget) Allow click to close
    ) {
      toggleVisibleItems();
      toggleResponseTimesList();
    }
  };

  // Attach a click event listener for handling clicks outside the response times list
  window.addEventListener("click", handleResponseTimesClick);
};

/**
 * Calculate median response times for neighborhoods and update the response times list.
 */
export const calcMedian = function () {
  // Combine all response time data for neighborhoods into a single array
  const overallArr = [].concat(...Object.values(callNeighborhoodTime));

  // Calculate the midpoint index for the overall response times
  const overallMid = Math.floor(overallArr.length / 2);

  // Sort the overall response time data in ascending order
  const overallNums = [...overallArr].sort((a, b) => a - b);

  // Calculate the overall median response time
  const overallMedian =
    overallArr.length % 2 !== 0
      ? overallNums[overallMid]
      : (overallNums[overallMid - 1] + overallNums[overallMid]) / 2;

  // Calculate median response times for individual neighborhoods
  Object.keys(callNeighborhoodTime).forEach((neighborhood) => {
    const arr = callNeighborhoodTime[neighborhood];

    // Calculate the midpoint index for neighborhood response times
    const mid = Math.floor(arr.length / 2);

    // Sort the response times for the neighborhood in ascending order
    const nums = [...arr].sort((a, b) => a - b);

    // Calculate the median response time for the neighborhood
    const median =
      arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;

    // Store the calculated median in the callNeighborhoodMedian object
    callNeighborhoodMedian[neighborhood] = median.toFixed(1);
  });

  // Add the calculated overall median to the neighborhood medians
  callNeighborhoodMedian["All San Francisco (citywide)"] =
    overallMedian.toFixed(2);

  // Update the response times list with the calculated median values
  updateResponseTimesList(callNeighborhoodMedian);
};
