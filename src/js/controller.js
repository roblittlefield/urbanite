import "regenerator-runtime/runtime"; // Polyfilling ASYNC/AWAIT
import "core-js/stable"; // Polyfilling everything else
import L from "leaflet";
import * as model from "./model.js";
import * as sfapi from "./config.js";
import circleMarkers from "./views/circleMarkers.js";
import { updateCallList, controlOpenCallList } from "./views/updateCallList.js";
import addHandlerMoveCenter from "./views/moveCenter.js";
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
} from "./views/buttonsView.js";
import { async } from "regenerator-runtime";

let map;
let originalPosition;
let originalZoom;
let position;

const disclaimerContainer = document.querySelector(".disclaimer");
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
    loadLastUpdated();
    return map;
  } catch (err) {
    console.error(`${err} Leaflet map error`);
    throw err;
  }
};

const controlCircleMarkers = async function () {
  try {
    const responsePolice48h = await model.fetchApi(
      sfapi.API_URL_POLICE_48h_FILTERED
    );
    const dataApiPolice48h = await responsePolice48h.json();
    const dataResult = model.dataProcess(
      position,
      dataApiPolice48h,
      sfapi.includedCallTypesPDlive,
      sfapi.PARAM_MAP_POLICE_48h
    );
    const data = dataResult.data;
    const circleMarkersInst = new circleMarkers();
    const [police48Layer, nearbyLayer] = circleMarkersInst.addCircleMarkers(
      data,
      position
    );
    police48Layer.addTo(map);

    initPopupNieghborhood(position, police48Layer);
    addHandlerMoveCenter(data, police48Layer, map);

    loadLatestListButton(controlOpenCallList);
    loadNearbyListButton(
      controlOpenCallList,
      originalPosition,
      originalZoom,
      map
    );

    updateCallList(nearbyLayer, map, true);
    updateCallList(police48Layer, map, false);

    // Call Count Display
    if (JSON.stringify(position) !== JSON.stringify(sfapi.getLatLngSF())) {
      countContainer.textContent =
        dataResult.countCallsNearby.toString() +
        ` calls nearby, ` +
        dataResult.countCallsNearbyRecent.toString() +
        ` past ${sfapi.timeElapNearby / 60}h`;
      const circle = L.circle(position, {
        radius: 500, // m
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
