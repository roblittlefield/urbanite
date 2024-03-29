import "regenerator-runtime/runtime";
import "core-js/stable";
import L from "leaflet";
import * as sfapi from "./config.js";
import * as model from "./model.js";
import { addCircleMarkers } from "./views/circleMarkers.js";
import addStations from "./views/sfpdStations.js";
import {
  updateCallList,
  controlOpenCallList,
  calcMedian,
} from "./views/updateCallList.js";
import { getPosition, loadTimeSinceUpdate } from "./views/getPosition.js";
import {
  initPopupNieghborhood,
  closestZoom,
} from "./views/initPopupNeighborhood.js";
import getWeather from "./views/getWeather.js";
import {
  loadChangeMapButton,
  loadLatestListButton,
  toggleVisibleItems,
  loadNearbyListButton,
  loadProjectInfoButton,
  toggleVisibleInfo,
  loadResponseTimesButton,
  loadCarBreakinsButton,
  loadTweetButton,
  loadTextMessageButton,
} from "./views/buttonsView.js";
import getURLParameter from "./views/hashURL.js";
import loadAff from "./views/affiliate.js";
import { addHandlerMoveCenter } from "./views/moveCenter.js";
import { async } from "regenerator-runtime";

let map;
let originalPosition;
let originalZoom;
let initLoaded = false;
window.moving = false;
const prefersDarkMode = window.matchMedia(
  "(prefers-color-scheme: dark)"
).matches;
let mapLayer =
  navigator.language === "en-US"
    ? prefersDarkMode
      ? 3
      : 0
    : prefersDarkMode
    ? 4
    : 5;

const countContainer = document.getElementById("nearby-info");
const infoContainer = document.getElementById("project-info-container");
const lastUpdatedElement = document.getElementById("last-updated");
const carCountElement = document.getElementById("car-breakins-text");
const carSubtextElement = document.getElementById("car-breakins-subtext");

/**
 * Initializes the 'urlCAD' variable by retrieving the value of the 'cad' parameter from the URL.
 * If 'cad' parameter is not found, it attempts to retrieve 'cad_number', for older posts.
 */
let urlCAD = getURLParameter("cad") || getURLParameter("cad_number");

/**
 * Refreshes the current page with a hard reload after 10 minutes.
 *
 * @param {Function} callback - The function to execute when the timeout elapses.
 * @param {number} delay - The delay time in milliseconds before executing the callback.
 */
setTimeout(() => {
  window.location.reload(true);
}, 60000 * 10);

/**
 * Schedule a data reload after 5 minutes.
 *
 * @param {number} reloadInterval - The interval in milliseconds between data reloads.
 * @param {function} callback - The function to execute when the timeout elapses.
 */
(function reloadTimeout() {
  setTimeout(() => {
    reloadData();
    reloadTimeout();
  }, 60000 * 5);
})();

/**
 * Reloads data based on the current state and scheduling.
 *
 * @param {boolean} showingCarBreakin - A flag indicating whether car break-ins are being shown.
 */
function reloadData() {
  if (showingCarBreakin) {
    setTimeout(reloadData, 20000);
  } else {
    reInit();
  }
}

let visTimePassed = false;
setTimeout(() => {
  visTimePassed = true;
}, 60000 * 3.5);

/**
 * Adds an event listener for visibility change to reload the page when it becomes visible after a period of inactivity.
 * @param {Event} event - The visibility change event object.
 */
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    /**
     * @param {boolean} visTimePassed - A flag indicating whether five minutes have passed.
     */
    if (visTimePassed) {
      window.location.reload(true);
    }
  }
});

// let inputSeq = "";
let inputSequence = "";
function handleKeydown(event) {
  console.log(event.key);
  inputSequence += event.key;
  // inputSeq = event.key;
  if (
    inputSequence === "`" ||
    inputSequence === "q" ||
    // inputSequence.includes("1") ||
    inputSequence === "l" ||
    inputSequence === "w"
  ) {
    document.getElementById("latest-list-btn").click();
    inputSequence = "";
  } else if (inputSequence === "n" || inputSequence === "2") {
    document.getElementById("nearby-list-btn").click();
    inputSequence = "";
  } else if (inputSequence === "x" || inputSequence === "z") {
    document.getElementById("tweet-btn").click();
    inputSequence = "";
  } else if (inputSequence === "t") {
    document.getElementById("text-message-btn").click();
    inputSequence = "";
  } else if (inputSequence === "m") {
    document.getElementById("change-map-btn").click();
    inputSequence = "";
  } else if (inputSequence === "3") {
    reInit();
    inputSequence = "";
  }
  // inputSeq = "";

  // else if (inputSequence.includes("n") || inputSequence.includes("i")) {
  //   document.getElementById("nearby-list-btn").click();
  // }

  // }
  // inputSequence = "";
  else if (inputSequence === "415" || inputSequence === "frisco") {
    document.getElementById("affiliate").style.setProperty("display", "none");
    document.querySelector(".affiliate-popup").classList.add("hidden");
    inputSequence = "";
    window.removeEventListener("keydown", handleKeydown);
  }

  if (inputSequence.length > 0) {
    const delay = inputSequence.length > 5 ? 1000 : 4000;
    setTimeout(() => {
      inputSequence = "";
    }, delay);
  }
}

window.addEventListener("keydown", handleKeydown);

/**
 * Initializes the map by creating a Leaflet map, setting its view, and adding layers.
 * @async
 * @function controlMap
 * @param {number} delay - The delay in milliseconds for stations to add to map.
 * @returns {L.Map} The Leaflet map instance.
 * @throws {Error} If an error occurs during map initialization.
 */
const controlMap = async function () {
  try {
    // Get the original position and zoom level
    originalPosition = sfapi.getLatLngSF();
    originalZoom = sfapi.getMapZoomLevel();

    // Remove any existing map
    if (map) map.remove();

    // Create a new Leaflet map and set its view
    map = L.map("map").setView(originalPosition, originalZoom);
    // map = L.map("map", { zoomControl: false }).setView(originalPosition, originalZoom);

    // Remove all existing map layers
    map.eachLayer((layer) => {
      map.removeLayer(layer);
    });

    L.tileLayer(sfapi.MAP_LAYERS[mapLayer]).addTo(map);

    // Prevent touchstart event propagation
    map.addEventListener("touchstart", function (e) {
      e.stopPropagation();
    });

    // Get weather information for the original position
    getWeather(originalPosition);

    // Add stations to the map after 1100 ms
    setTimeout(function () {
      addStations(map);
    }, 1100);

    // Return the created map instance
    return map;
  } catch (err) {
    // If an error occurs, throw it
    throw err;
  }
};

/**
 * Controls the display of circle markers on the map, showing recent police calls.
 *
 * @async
 * @function controlCircleMarkers
 */
let callsLayer = "";
let respCircleLayer = "";
const controlCircleMarkers = async function () {
  try {
    // Remove any current Leaflet marker layers
    if (callsLayer) {
      map.removeLayer(callsLayer);
    }
    if (respCircleLayer) {
      map.removeLayer(respCircleLayer);
    }
    callsLayer = "";
    callsLayer = L.layerGroup();
    respCircleLayer = "";
    respCircleLayer = L.layerGroup();

    // Load time stamp on page
    // setInterval(loadTimeSinceUpdate(), 1000);
    loadTimeSinceUpdate();

    // Retrieve data from Data SF
    const responseSFPDAPI = await model.fetchApi(
      sfapi.API_URL_POLICE_48h_FILTERED
    );

    // Converto JSON data
    const dataSFPDraw = await responseSFPDAPI.json();

    // Process data and filter by included call types
    const dataResult = model.dataProcess(
      originalPosition,
      dataSFPDraw,
      sfapi.includedCallTypes,
      sfapi.PARAM_MAP_POLICE_48h
    );
    const data = dataResult.data;
    // Console log the number of calls
    console.log(`${data.length} calls`);

    // Add calls to map as circle markers
    [callsLayer, respCircleLayer] = addCircleMarkers(
      data,
      callsLayer,
      respCircleLayer
    );

    // Update call list popup with latest data
    document.getElementById("call-list").innerHTML = "";
    updateCallList(callsLayer, map, false);

    // Calculate median SFPD response time
    calcMedian();

    // Call count of calls specific time
    countContainer.textContent =
      dataResult.countCallsRecent.toString() +
      ` calls past ${sfapi.timeElapSF / 60}h`;
    callsLayer.addTo(map);
    respCircleLayer.addTo(map);

    // Load buttons and metrics if initial website load
    if (!initLoaded) {
      initPopupNieghborhood(originalPosition, callsLayer, urlCAD, map);
      loadLatestListButton(openCallList, closeAllPopups);
      loadNearbyListButton(loadNearbyCalls, openCallList, closeAllPopups);
      loadResponseTimesButton(closeAllPopups);
      loadCarBreakinsButton(controlCarBreakins);
      loadTweetButton();
      loadTextMessageButton();
      // if (localStorage.getItem("openList") === "allSF")
      //   document.getElementById("latest-list-btn").click();
    } else {
      addHandlerMoveCenter(callsLayer, map);
      openPopup();
    }

    // If user location is known, update the nearby calls list
    if (initLoaded && position) loadNearbyCalls();

    // Mark the initial load as complete
    initLoaded = true;
  } catch (err) {
    // Catch any errors
    console.error(err);
  }
};

// Load calls nearby user
let position;
let nearbyClicked = false;
const loadNearbyCalls = async function () {
  let [countCallsNearby, countCallsNearbyRecent] = [0, 0];
  try {
    // Get the user position if it does not exist yet
    if (!position) position = await getPosition();
    console.log(`finding calls near ${position}`);

    // Get the nearby weather
    getWeather(position);

    // Calculate distance from user to the calls
    let nearbyLayer = L.layerGroup();
    const positionLatLng = L.latLng(position[0], position[1]);
    callsLayer.eachLayer((marker) => {
      const distance = positionLatLng.distanceTo(marker.getLatLng());
      if (distance < sfapi.nearbyRadius) {
        countCallsNearby++;
        marker.addTo(nearbyLayer);
        if (marker.options.data.receivedTimeAgo <= sfapi.timeElapNearby) {
          countCallsNearbyRecent++;
        }
      }
    });
    countContainer.textContent =
      countCallsNearby.toString() +
      ` calls nearby, ` +
      countCallsNearbyRecent.toString() +
      ` past ${sfapi.timeElapNearby / 60}h`;

    // Open nearby call list
    if (!nearbyClicked) {
      const circleNearby = L.circle(position, sfapi.nearbyCircleOpt).addTo(map);
      circleNearby.getElement().style.pointerEvents = "none";

      const circleExact = L.circle(
        position,
        sfapi.exactPositionCircleOpt
      ).addTo(map);
      circleExact.bindPopup("You are here.", { closeButton: false });
    }
    document.getElementById("alert").classList.add("hidden");
    updateCallList(nearbyLayer, map, true, openPopup);
    nearbyClicked = true;
  } catch (err) {
    throw err;
  }
};

// Close all Leaflet popups
const closeAllPopups = function () {
  map.eachLayer((layer) => {
    if (layer instanceof L.CircleMarker) {
      layer.closePopup();
    }
  });
};

/**
 * Open a call list based on the user's choice to view nearby or all SF dispatched calls.
 *
 * @param {boolean} nearby - Indicates whether to open a call list for nearby calls (true) or all SF calls (false).
 */
const openCallList = function (nearby) {
  /**
   * Constructs a message based on the nearby parameter to specify the type of call list to open.
   *
   * @param {boolean} nearby - Indicates whether to display nearby calls (true) or all SF calls (false).
   * @returns {string} A message indicating the type of call list.
   */
  const message = `Latest ${nearby ? "Nearby" : "All SF"} Dispatched Calls`;
  nearby
    ? controlOpenCallList(message, true, openPopup, position, originalZoom, map)
    : controlOpenCallList(message, false, openPopup);
};

/**
 * Switch between different map layers and update the currently displayed layer.
 */
const controlChangeMap = function () {
  /**
   * The index of the currently displayed map layer.
   * @type {number}
   */
  let currentLayer =
    // ((+localStorage.getItem("mapNumber") || 0) + 1) % sfapi.MAP_LAYERS.length;
    ((+mapLayer || 0) + 1) % sfapi.MAP_LAYERS.length;

  // Create a new map layer based on the current index
  const newLayer = L.tileLayer(sfapi.MAP_LAYERS[currentLayer]);

  // Handle tile loading errors for the new layer
  newLayer.on("tileerror", function (e) {
    // Remove the new layer with an error and switch to the next one
    L.tileLayer(sfapi.MAP_LAYERS[currentLayer]).remove();
    currentLayer = (currentLayer + 1) % sfapi.MAP_LAYERS.length;
    L.tileLayer(sfapi.MAP_LAYERS[currentLayer]).addTo(map);
    // localStorage.setItem("mapNumber", currentLayer);
    mapLayer = currentLayer;
  });

  // Add the new layer to the map and update the saved map choice in local storage
  L.tileLayer(sfapi.MAP_LAYERS[currentLayer]).addTo(map);
  // localStorage.setItem("mapNumber", currentLayer);
  mapLayer = currentLayer;

  // Remove the previous map layer so only 1 layer remains
  L.tileLayer(sfapi.MAP_LAYERS[currentLayer - 1]).remove();
};

/**
 * Toggle the visibility of project information and handle click events to close it.
 */
const controlProjectInfo = function () {
  // Toggle the visibility of project information and other items
  toggleVisibleInfo();
  toggleVisibleItems();

  /**
   * Handle clicks outside of the project information container to close it.
   *
   * @param {Event} event - The click event.
   */
  const handleClick = (event) => {
    const clickTarget = event.target;
    if (
      !infoContainer.classList.contains("hidden") &&
      !infoContainer.contains(clickTarget)
    ) {
      // Is user clicks outside the popup, close the popup and add back the buttons and info
      toggleVisibleItems();
      toggleVisibleInfo();
    }
  };

  // Set up a click event listener to close the project information when clicking outside
  setTimeout(() => {
    window.addEventListener("click", handleClick);
  }, 200);
};

/**
 * Control the display of car break-ins and stolen vehicle incidents on the map.
 *
 * @async
 */
let firstCarBreakin = true;
let showingCarBreakin = false;
const controlCarBreakins = async function () {
  try {
    /**
     * The number of car break-ins.
     * @type {number}
     */
    let carBreakinCount = 0;

    /**
     * The number of stolen vehicle incidents.
     * @type {number}
     */
    let carStolenCount = 0;

    /**
     * Indicates whether car break-ins and stolen vehicle incidents are currently being displayed.
     * @type {boolean}
     */
    showingCarBreakin = true;

    /**
     * Original latitude and longitude positions for CircleMarker layers.
     * @type {Object}
     */
    const originalLatLngs = {};

    // Hide non-car break-in / stolen vehicle incidents on the map
    await map.eachLayer(function (marker) {
      // Check if the layer is a CircleMarker and not other map elements
      if (
        ((marker instanceof L.Marker &&
          marker.options.icon.options.className === "response-marker") ||
          marker instanceof L.CircleMarker) &&
        !(marker instanceof L.Circle) &&
        marker !== map
      ) {
        const callType = marker.options.data.callType;
        if (
          callType !== "Car break-in / strip" &&
          callType !== "Stolen vehicle"
        ) {
          const originalLatLng = marker.getLatLng();
          originalLatLngs[marker._leaflet_id] = originalLatLng;
          marker.setLatLng([9999, 9999]);
        }
      }
      if (
        marker instanceof L.Circle &&
        marker.options.className == "response-circle"
      ) {
        marker.setStyle({ opacity: 0, fillOpacity: 0 });
      }
    });

    // Count car break-ins and stolen vehicle incidents in the callsLayer
    callsLayer.eachLayer((marker) => {
      if (marker.options.data.callType === "Car break-in / strip")
        carBreakinCount++;
      if (marker.options.data.callType === "Stolen vehicle") carStolenCount++;
    });

    // Go to the center of SF on the map and zoom out
    const carLatLng = [37.7611, -122.447];
    map.setView(carLatLng, window.innerWidth <= 758 ? 12 : 13);

    // Update the top banner with total counts
    carCountElement.innerHTML = `${carBreakinCount} car break-ins & ${carStolenCount} stolen cars in 48h`;
    lastUpdatedElement.style.bottom = "20px";

    // Hide the unrelated buttons and metrics
    toggleVisibleItems();
    document.getElementById("affiliate").classList.add("hidden");
    [lastUpdatedElement, carSubtextElement, carCountElement].forEach(
      (element) => element.classList.remove("hidden")
    );

    // Wait 6 seconds the first time, then 12 seconds each time after that before returning to the normal view
    const interval = firstCarBreakin ? 6000 : 12000;
    setTimeout(async () => {
      await map.eachLayer(function (marker) {
        if (
          // Add all circle markers back to the map
          ((marker instanceof L.Marker &&
            marker.options.icon.options.className === "response-marker") ||
            marker instanceof L.CircleMarker) &&
          !(marker instanceof L.Circle) &&
          marker !== map
        ) {
          const callType = marker.options.data.callType;
          if (
            callType !== "Car break-in / strip" &&
            callType !== "Stolen vehicle"
          ) {
            const originalLatLng = originalLatLngs[marker._leaflet_id];
            marker.setLatLng(originalLatLng);
          }
        }
        if (
          marker instanceof L.Circle &&
          marker.options.className == "response-circle"
        ) {
          marker.setStyle({ opacity: 1, fillOpacity: 0.25 });
        }
      });
      // Get the original map position and zoom
      originalZoom = sfapi.getMapZoomLevel();
      originalPosition = sfapi.getLatLngSF();

      /**
       * Adjust the map view based on user interaction or tolerance.
       *
       * This function checks if the map has been zoomed in or out, or if it has moved by an amount greater than the tolerance. If any of these conditions are met, it adjusts the map view accordingly.
       *
       * @param {number} tolerance - The amount the user must move to prevent returning to the original map position.
       * @param {Object} [position] - The new map position the user has moved to.
       * @param {Object} originalPosition - The original user position.
       */
      const tolerance = 0.0005;
      map.setView(
        Math.abs(map.getCenter().lat - carLatLng[0]) <= tolerance &&
          Math.abs(map.getCenter().lng - carLatLng[1]) <= tolerance
          ? position
            ? position
            : originalPosition
          : map.getCenter(),
        originalZoom
      );
      carCountElement.classList.add("hidden");
      carSubtextElement.classList.add("hidden");
      lastUpdatedElement.style.bottom = "28px";
      toggleVisibleItems();
      document.getElementById("affiliate").classList.remove("hidden");
      lastUpdatedElement.classList.remove("hidden");
      firstCarBreakin = false;
      showingCarBreakin = false;
    }, interval);
  } catch (err) {
    console.error(err);
  }
};

/**
 * Open a map popup by zooming to the closest zoom level.
 *
 * This function calculates and sets the closest zoom level to display a map popup at the current map center coordinates.
 */
const openPopup = function () {
  // Calculate the closest zoom level and zoom to it
  closestZoom([map.getCenter().lat, map.getCenter().lng], callsLayer);
};

/**
 * Initialize the map and associate features.
 *
 * This function performs the initial setup for the map and its features. It calls various control functions to set up the map, circle markers, and other components.
 *
 * @async
 */
const init = async function () {
  try {
    // Control map features
    await controlMap();

    // Control circle markers
    await controlCircleMarkers();

    // Load and configure map change button, the project info button
    loadChangeMapButton(controlChangeMap);
    loadProjectInfoButton(controlProjectInfo);

    // Load affiliate links
    loadAff();

    // Remove the "hidden" class from the "addSFDataSource" element to display it
    document.getElementById("addSFDataSource").classList.remove("hidden");
  } catch (err) {
    console.error(err);
  }
};

/**
 * Reinitialize circle markers on the map.
 *
 * This function reinitializes and updates the circle markers on the map.
 *
 * @async
 */
const reInit = async function () {
  try {
    // Control circle markers to reinitialize
    await controlCircleMarkers();
  } catch (err) {
    console.error(err);
  }
};

// Initialize the web app on first load
init();
