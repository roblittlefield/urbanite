import "regenerator-runtime/runtime";
import "core-js/stable";
import L from "leaflet";
import * as model from "./model.js";
import * as sfapi from "./config.js";
import circleMarkers from "./views/circleMarkers.js";
import {
  updateCallList,
  controlOpenCallList,
  calcMedian,
} from "./views/updateCallList.js";
import { getPosition, loadLastUpdated } from "./views/getPosition.js";
import initPopupNieghborhood from "./views/initPopupNeighborhood.js";
import getWeather from "./views/getWeather.js";
import {
  loadChangeMapButton,
  loadLatestListButton,
  toggleVisibleItems,
  loadNearbyListButton,
  loadProjectInfoButton,
  toggleVisibleInfo,
  loadResponseTimesButton,
} from "./views/buttonsView.js";
import getURLParameter from "./views/hashURL.js";
import { async } from "regenerator-runtime";

let map;
let originalPosition;
let originalZoom;

const countContainer = document.getElementById("nearby-info");
const infoContainer = document.getElementById("project-info-container");
const latestButton = document.getElementById("latest-list-btn");
const nearbyButton = document.getElementById("nearby-list-btn");
const sfDataSource = document.getElementById("addSFDataSource");

let urlCAD;
const initGetUrlParam = function () {
  urlCAD = getURLParameter("cad_number");
};

const interval = 60000 * 10;
function reloadPage() {
  localStorage.setItem("last-load", new Date());
  location.reload();
}
const lastLoad = localStorage.getItem("last-load");
const remainingTime = lastLoad
  ? interval - (new Date() - new Date(lastLoad))
  : interval;
setTimeout(reloadPage, remainingTime);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    const now = new Date();
    const lastLoad = localStorage.getItem("last-load");
    if (!lastLoad || now - new Date(lastLoad) > 60000 * 10) {
      localStorage.setItem("last-load", now);
      location.reload();
    }
  }
});

const controlMap = async function () {
  try {
    originalPosition = sfapi.getLatLngSF();
    originalZoom = sfapi.getMapZoomLevel();
    map = L.map("map").setView(originalPosition, originalZoom);
    L.tileLayer(sfapi.MAP_LAYERS[0]).addTo(map);
    map.addEventListener("touchstart", function (e) {
      e.stopPropagation();
    });
    loadLastUpdated();
    getWeather(originalPosition);
    return map;
  } catch (err) {
    throw err;
  }
};

let allCalls = {};
const controlCircleMarkers = async function () {
  try {
    const responsePolice48h = await model.fetchApi(
      sfapi.API_URL_POLICE_48h_FILTERED
    );
    const dataApiPolice48h = await responsePolice48h.json();
    const dataResult = model.dataProcess(
      originalPosition,
      dataApiPolice48h,
      sfapi.includedCallTypesPDlive,
      sfapi.PARAM_MAP_POLICE_48h
    );
    const data = dataResult.data;
    console.log(`${data.length} calls`);
    const circleMarkersInst = new circleMarkers();
    const [police48Layer] = circleMarkersInst.addCircleMarkers(
      data,
      originalPosition
    );
    allCalls = police48Layer;

    initPopupNieghborhood(originalPosition, police48Layer, urlCAD, map);
    loadLatestListButton(controlOpenCallList);
    loadNearbyListButton(loadNearbyCalls);
    updateCallList(police48Layer, map, false);
    calcMedian();
    loadResponseTimesButton();
    localStorage.getItem("openList") === "nearby" && position
      ? nearbyButton.click()
      : localStorage.getItem("openList") === "allSF"
      ? latestButton.click()
      : "";
    countContainer.textContent =
      dataResult.countCallsRecent.toString() +
      ` calls past ${sfapi.timeElapSF / 60}h`;
    return map, police48Layer;
  } catch (err) {
    console.log(err);
  }
};

let countCallsNearby = 0;
let countCallsNearbyRecent = 0;
let position;
let nearbyClicked = false;
const loadNearbyCalls = async function () {
  const message = "Latest Nearby Dispatched Calls";
  let nearbyLayer = L.layerGroup();
  try {
    if (!position) position = await getPosition();
    if (!nearbyClicked) {
      const positionLatLng = L.latLng(position[0], position[1]);
      allCalls.eachLayer((marker) => {
        var latlng = marker.getLatLng();
        const distance = positionLatLng.distanceTo(latlng);
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
      const circle = L.circle(position, sfapi.nearbyCircleOpt);
      circle.addTo(map);
      circle.getElement().style.pointerEvents = "none";
      nearbyClicked = true;
    }
    updateCallList(nearbyLayer, map, true);
    controlOpenCallList(message, true, position, originalZoom, map);
  } catch (err) {
    throw err;
  }
};

let currentLayer = 0;
const controlChangeMap = function () {
  currentLayer = (currentLayer + 1) % sfapi.MAP_LAYERS.length;
  const newLayer = L.tileLayer(sfapi.MAP_LAYERS[currentLayer]);
  newLayer.on("tileerror", function (e) {
    L.tileLayer(sfapi.MAP_LAYERS[currentLayer]).remove();
    currentLayer = (currentLayer + 1) % sfapi.MAP_LAYERS.length;
    L.tileLayer(sfapi.MAP_LAYERS[currentLayer]).addTo(map);
  });
  L.tileLayer(sfapi.MAP_LAYERS[currentLayer]).addTo(map);
  L.tileLayer(sfapi.MAP_LAYERS[currentLayer - 1]).remove();
};

const controlProjectInfo = function () {
  toggleVisibleInfo();
  toggleVisibleItems();

  const handleClick = (event) => {
    const clickTarget = event.target;
    if (
      !infoContainer.classList.contains("hidden") &&
      !infoContainer.contains(clickTarget)
    ) {
      toggleVisibleItems();
      toggleVisibleInfo();
    }
  };
  setTimeout(() => {
    window.addEventListener("click", handleClick);
  }, 200);
};

const init = async function () {
  try {
    initGetUrlParam();
    await controlMap();
    await controlCircleMarkers();
    loadChangeMapButton(controlChangeMap);
    loadProjectInfoButton(controlProjectInfo);
    sfDataSource.classList.remove("hidden");
  } catch (err) {
    console.error(err);
  }
};

init();
