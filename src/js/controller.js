import "regenerator-runtime/runtime"; // Polyfilling ASYNC/AWAIT
import "core-js/stable"; // Polyfilling everything else
import L from "leaflet";
import * as model from "./model.js";
import * as sfapi from "./config.js";
import circleMarkers from "./views/circleMarkers.js";
import sortMarkers from "./views/circleMarkersSort.js";
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
} from "./views/buttonsView.js";
import { async } from "regenerator-runtime";

let map;
let originalPosition;
let originalZoom;
let position;
// let nearbyMarkersL = [];
const latestContainer = document.getElementById("call-list-container");
const callList = document.getElementById("call-list");
const latestButton = document.getElementById("latest-list");
const disclaimerContainer = document.querySelector(".disclaimer");
const callListHeading = document.getElementById("call-list-heading");
const countNearbyContainer = document.getElementById("nearby-info");

const controlMap = async function () {
  try {
    position = await getPosition(sfapi.getLatLngSF());
    originalPosition = position;
    originalZoom = sfapi.getMapZoomLevel();
    map = L.map("map").setView(originalPosition, originalZoom);
    const initLayer = L.tileLayer(sfapi.MAP_LAYERS[1]).addTo(map);
    if (!map) return;
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
    const dataApiPolice48hFiltered = dataApiPolice48h.filter((item) =>
      sfapi.includedCallTypes.includes(item.call_type_final_desc)
    );

    const circleMarkersInst = new circleMarkers();

    /////////////////////////
    /////////////////////////
    const [
      allCalls,
      police48Layer,
      nearbyLayer,
    ] = circleMarkersInst.addCircleMarkers(dataApiPolice48hFiltered, position);

    police48Layer.addTo(map);
    initPopupNieghborhood(position, police48Layer);
    const { latestMarkers: latestMarkersSorted, count: countRecentSF } =
    sortMarkers(police48Layer,sfapi.timeElapSF);
    loadLatestListButton(controlOpenLatestList, latestMarkersSorted);
    addHandlerMoveCenter(allCalls, police48Layer, map);

    const { latestMarkers: nearbyLatestMarkersSorted, count: countRecentNearby } =
    sortMarkers(nearbyLayer, sfapi.timeElapNearby);
    loadNearbyListButton(controlOpenNearbyList, nearbyLatestMarkersSorted);

    ///////////////////////// 
    /////////////////////////
    // countNearbyContainer.classList.toggle("hidden");
    if (JSON.stringify(position) !== JSON.stringify(sfapi.getLatLngSF())) {
      // countNearbyContainer.classList.toggle("hidden");
      document.getElementById("nearby-info").textContent =
      nearbyLatestMarkersSorted.length.toString() +
        " calls nearby, \n" +
        countRecentNearby.toString() +
        " past 6h";
      const circle = L.circle(position, {
        radius: 500, // meters
        color: "white",
        fillColor: "blue",
        fillOpacity: 0.1,
        weight: 1,
      });
      circle.addTo(map);
    } else {
      // countNearbyContainer.classList.toggle("hidden");
      document.getElementById("nearby-info").textContent =
        countRecentSF.toString() + " calls past 2h";
    }
    return map;
  } catch (err) {
    console.log(err);
  }
};

let currentLayer = 0;
const controlButtons = function () {
  currentLayer = (currentLayer + 1) % sfapi.MAP_LAYERS.length;
  const newLayer = L.tileLayer(sfapi.MAP_LAYERS[currentLayer]);
  newLayer.on("tileerror", function (e) {
    console.log("tile error", e);
    L.tileLayer(sfapi.MAP_LAYERS[currentLayer]).remove();
    currentLayer = (currentLayer + 1) % sfapi.MAP_LAYERS.length;
    L.tileLayer(sfapi.MAP_LAYERS[currentLayer]).addTo(map);
  });
  L.tileLayer(sfapi.MAP_LAYERS[currentLayer]).addTo(map);
  L.tileLayer(sfapi.MAP_LAYERS[currentLayer - 1]).remove();
};

const controlOpenLatestList = function (latestMarkers) {
  callListHeading.textContent = "Latest SF Dispatched Calls";
  updateCallList(latestMarkers, map);
  toggleVisibleItems();
  setTimeout(
    window.addEventListener("click", (event) => {
      const clickTarget = event.target;
      if (
        !latestContainer.classList.contains("hidden") &&
        !callList.contains(clickTarget) &&
        clickTarget !== latestButton
      ) {
        toggleVisibleItems();
      }
    }),
    200
  );
};

const controlOpenNearbyList = function (nearbyMarkersL) {
  callListHeading.textContent = "Latest Nearby Dispatched Calls";
  updateCallList(nearbyMarkersL, map);
  toggleVisibleItems();
  map.setView(originalPosition, originalZoom);
  setTimeout(
    window.addEventListener("click", (event) => {
      const clickTarget = event.target;
      if (
        !latestContainer.classList.contains("hidden") &&
        !callList.contains(clickTarget) &&
        clickTarget !== latestButton
      ) {
        toggleVisibleItems();
      }
    }),
    200
  );
};

const init = async function () {
  try {
    const map = await controlMap();
    await controlCircleMarkers();
    loadChangeMapButton(controlButtons);

    // loadNearbyListButton(controlOpenNearbyList, nearbyMarkersL);
    getWeather();
    disclaimerContainer.style.display = "block";
  } catch (err) {
    console.error(`Init error: ${err}`);
  }
};

init();
