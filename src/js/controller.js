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
  loadCarBreakinsButton,
} from "./views/buttonsView.js";
import getURLParameter from "./views/hashURL.js";
import { async } from "regenerator-runtime";

let map;
let originalPosition;
let originalZoom;
let initLoaded = false;

const countContainer = document.getElementById("nearby-info");
const infoContainer = document.getElementById("project-info-container");
const lastUpdatedElement = document.getElementById("last-updated");
const carCountElement = document.getElementById("car-breakins-text");
const carSubtextElement = document.getElementById("car-breakins-subtext");

let urlCAD;
const initGetUrlParam = function () {
  urlCAD = getURLParameter("cad_number");
};

const interval = 60000;

function reloadData() {
  localStorage.setItem("last-load", new Date());
  reInit();
  setTimeout(reloadData, interval);
}

const lastLoad = localStorage.getItem("last-load");
const remainingTime = lastLoad
  ? interval - (new Date() - new Date(lastLoad))
  : interval;
setTimeout(reloadData, remainingTime);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    const lastLoad = localStorage.getItem("last-load");
    if (!lastLoad || new Date() - new Date(lastLoad) > 60000) reloadData();
  }
});

const controlMap = async function () {
  try {
    originalPosition = sfapi.getLatLngSF();
    originalZoom = sfapi.getMapZoomLevel();
    map = L.map("map").setView(originalPosition, originalZoom);
    const mapLayer = localStorage.getItem("map");
    L.tileLayer(sfapi.MAP_LAYERS[mapLayer ? mapLayer : 0]).addTo(map);
    map.addEventListener("touchstart", function (e) {
      e.stopPropagation();
    });
    getWeather(originalPosition);
    return map;
  } catch (err) {
    throw err;
  }
};

let police48Layer;
const controlCircleMarkers = async function () {
  try {
    loadLastUpdated();
    const responsePolice48h = await model.fetchApi(
      sfapi.API_URL_POLICE_48h_FILTERED
    );
    const dataApiPolice48h = await responsePolice48h.json();
    const dataResult = model.dataProcess(
      originalPosition,
      dataApiPolice48h,
      sfapi.includedCallTypes,
      sfapi.PARAM_MAP_POLICE_48h
    );
    const data = dataResult.data;
    console.log(`${data.length} calls`);
    const circleMarkersInst = new circleMarkers();
    console.log(police48Layer);
    police48Layer = circleMarkersInst.addCircleMarkers(data, originalPosition);
    document.getElementById("call-list").innerHTML = "";
    updateCallList(police48Layer, map, false);
    calcMedian();
    countContainer.textContent =
      dataResult.countCallsRecent.toString() +
      ` calls past ${sfapi.timeElapSF / 60}h`;
    if (!initLoaded) {
      initPopupNieghborhood(originalPosition, police48Layer, urlCAD, map);
      loadLatestListButton(openCallList);
      loadNearbyListButton(loadNearbyCalls, openCallList);
      loadResponseTimesButton();
      loadCarBreakinsButton(controlCarBreakins);
      if (localStorage.getItem("openList") === "allSF")
        document.getElementById("latest-list-btn").click();
    }
    if (initLoaded) police48Layer.addTo(map);
    if (initLoaded && position) loadNearbyCalls();
    initLoaded = true;
    return map, police48Layer;
  } catch (err) {
    console.error(err);
  }
};

let [countCallsNearby, countCallsNearbyRecent, position, nearbyClicked] = [
  0,
  0,
  null,
  false,
];
const loadNearbyCalls = async function () {
  try {
    if (!position) position = await getPosition();
    console.log(`finding calls near ${position}`);
    getWeather(position);
    let nearbyLayer = L.layerGroup();
    timedPositionReset();
    const positionLatLng = L.latLng(position[0], position[1]);
    police48Layer.eachLayer((marker) => {
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

    if (!nearbyClicked) {
      const circle = L.circle(position, sfapi.nearbyCircleOpt).addTo(map);
      circle.getElement().style.pointerEvents = "none";
    }
    document.getElementById("alert").classList.add("hidden");
    updateCallList(nearbyLayer, map, true);
    nearbyClicked = true;
  } catch (err) {
    throw err;
  }
};

const openCallList = function (nearby) {
  const message = `Latest ${nearby ? "Nearby" : "All SF"} Dispatch Calls`;
  nearby
    ? controlOpenCallList(message, true, position, originalZoom, map)
    : controlOpenCallList(message, false);
};

const timedPositionReset = function () {
  setTimeout(() => {
    position = null;
  }, 60000 * 10);
};

let currentLayer = 0;
const controlChangeMap = function () {
  currentLayer = (currentLayer + 1) % sfapi.MAP_LAYERS.length;
  const newLayer = L.tileLayer(sfapi.MAP_LAYERS[currentLayer]);
  newLayer.on("tileerror", function (e) {
    L.tileLayer(sfapi.MAP_LAYERS[currentLayer]).remove();
    currentLayer = (currentLayer + 1) % sfapi.MAP_LAYERS.length;
    L.tileLayer(sfapi.MAP_LAYERS[currentLayer]).addTo(map);
    localStorage.setItem("map", currentLayer);
  });
  L.tileLayer(sfapi.MAP_LAYERS[currentLayer]).addTo(map);
  localStorage.setItem("map", currentLayer);
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

let firstCarBreakin = true;
const controlCarBreakins = async function () {
  try {
    let carBreakinCount = 0;
    let carStolenCount = 0;
    await police48Layer.eachLayer((marker) => {
      if (
        marker.options.data.callType !== "Car break-in/strip" &&
        marker.options.data.callType !== "Stolen vehicle"
      ) {
        marker.remove();
      }
      if (marker.options.data.callType === "Car break-in/strip")
        carBreakinCount++;
      if (marker.options.data.callType === "Stolen vehicle") carStolenCount++;
    });
    map.setView([37.7611, -122.447], window.innerWidth <= 758 ? 12 : 13);
    carCountElement.innerHTML = `${carBreakinCount} car break-ins & ${carStolenCount} stolen cars reported in 48h`;
    carCountElement.classList.remove("hidden");
    lastUpdatedElement.style.bottom = "20px";
    toggleVisibleItems();
    lastUpdatedElement.classList.remove("hidden");
    carSubtextElement.classList.remove("hidden");
    const interval = firstCarBreakin ? 6000 : 8000;
    setTimeout(async () => {
      police48Layer.eachLayer((marker) => {
        if (
          marker.options.data.callType !== "Car break-in/strip" &&
          marker.options.data.callType !== "Stolen vehicle"
        )
          marker.addTo(map);
      });
      originalZoom = sfapi.getMapZoomLevel();
      originalPosition = sfapi.getLatLngSF();
      map.setView(
        map.getCenter() === [37.7611, -122.447]
          ? originalPosition
          : map.getCenter(),
        originalZoom
      );
      carCountElement.classList.add("hidden");
      carSubtextElement.classList.add("hidden");
      lastUpdatedElement.style.bottom = "54px";
      toggleVisibleItems();
      lastUpdatedElement.classList.remove("hidden");
      firstCarBreakin = false;
    }, interval);
  } catch (err) {
    console.error(err);
  }
};

const init = async function () {
  try {
    initGetUrlParam();
    await controlMap();
    await controlCircleMarkers();
    loadChangeMapButton(controlChangeMap);
    loadProjectInfoButton(controlProjectInfo);
    document.getElementById("addSFDataSource").classList.remove("hidden");
  } catch (err) {
    console.error(err);
  }
};

init();

const reInit = async function () {
  try {
    await controlCircleMarkers();
  } catch (err) {
    console.error(err);
  }
};
