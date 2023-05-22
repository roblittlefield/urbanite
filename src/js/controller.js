import "regenerator-runtime/runtime"; // Polyfilling ASYNC/AWAIT
import "core-js/stable"; // Polyfilling everything else
import L from "leaflet";
import * as model from "./model.js";
import * as sfapi from "./config.js";
import circleMarkers from "./views/circleMarkers.js";
import updateCallList from "./views/updateToLatest.js";
import addHandlerMoveCenter from "./views/moveCenter.js";
import getPosition from "./views/getPosition.js";
import initPopupNieghborhood from "./views/initPopupNeighborhood.js";
import getWeather from "./views/getWeather.js";
import {
  loadChangeMapButton,
  loadLatestListButton,
  toggleVisibleItems,
  loadNearbyListButton,
  loadProjectInfoButton,
  toggleVisibleList,
  toggleVisibleInfo,
} from "./views/buttonsView.js";
import { async } from "regenerator-runtime";

let map;
let originalPosition;
let originalZoom;
let position;
let lastLoadedList;
const latestContainer = document.getElementById("call-list-container");
const callList = document.getElementById("call-list");
const disclaimerContainer = document.querySelector(".disclaimer");
const callListHeading = document.getElementById("call-list-heading");
const countContainer = document.getElementById("nearby-info");
const infoContainer = document.getElementById("project-info-container");

const controlMap = async function () {
  try {
    position = await getPosition(sfapi.getLatLngSF());
    originalPosition = position;
    originalZoom = sfapi.getMapZoomLevel();
    map = L.map("map").setView(originalPosition, originalZoom);
    const initLayer = L.tileLayer(sfapi.MAP_LAYERS[0]).addTo(map);
    if (!map) return;
    return map;
  } catch (err) {
    console.error(`${err} Leaflet map error`);
    throw err;
  }
};

const controlCircleMarkers = async function () {
  try {
    // Fetch API data
    const responsePolice48h = await model.fetchApi(
      sfapi.API_URL_POLICE_48h_FILTERED
    );

    // Receive API data
    const dataApiPolice48h = await responsePolice48h.json();
    const dataResult = model.dataProcess(
      position,
      dataApiPolice48h,
      sfapi.includedCallTypesPDlive,
      sfapi.PARAM_MAP_POLICE_48h
    );
    const data = dataResult.data;

    // Create Circle Markers
    const circleMarkersInst = new circleMarkers();
    const [police48Layer, nearbyLayer] = circleMarkersInst.addCircleMarkers(
      data,
      position
    );

    // Circle Markers to Map
    police48Layer.addTo(map);

    // 1st Popup
    initPopupNieghborhood(position, police48Layer);

    loadLatestListButton(controlOpenCallList, police48Layer, false);

    addHandlerMoveCenter(data, police48Layer, map);

    loadNearbyListButton(controlOpenCallList, nearbyLayer, true);

    // Control Call Count Display
    if (JSON.stringify(position) !== JSON.stringify(sfapi.getLatLngSF())) {
      countContainer.textContent =
        dataResult.countCallsNearby.toString() +
        ` calls nearby, ` +
        dataResult.countCallsNearbyRecent.toString() +
        ` past ${sfapi.timeElapNearby / 60}h`;
      const circle = L.circle(position, {
        radius: 500, // meters
        color: "white",
        fillColor: "blue",
        fillOpacity: 0.1,
        weight: 1,
      });
      circle.addTo(map);
    } else {
      countContainer.textContent =
        dataResult.countCallsRecent.toString() +
        ` calls past ${sfapi.timeElapSF / 60}h`;
    }
    return map;
  } catch (err) {
    console.log(err);
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

const controlOpenCallList = function (markers, message, nearby) {
  callListHeading.textContent = message;
  updateCallList(markers, map, nearby);
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
      }
    }),
    200
  );
};

const controlProjectInfo = function () {
  toggleVisibleInfo();
  toggleVisibleItems();
  setTimeout(
    window.addEventListener("click", (event) => {
      const clickTarget = event.target;
      if (
        !infoContainer.classList.contains("hidden") &&
        !callList.contains(clickTarget)
      ) {
        toggleVisibleItems();
        toggleVisibleInfo();
      }
    }),
    200
  );
};

const init = async function () {
  try {
    const map = await controlMap();
    await controlCircleMarkers();
    loadChangeMapButton(controlChangeMap);
    loadProjectInfoButton(controlProjectInfo);
    getWeather();
    disclaimerContainer.style.display = "block";
  } catch (err) {
    console.error(`Init error: ${err}`);
  }
};

init();
