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
import displayNearestMarkerPopup from "./views/getPositionNearby.js";
import getWeather from "./views/getWeather.js";
import {
  loadChangeMapButton,
  loadLatestListButton,
} from "./views/buttonsView.js";
import { async } from "regenerator-runtime";

let map;
let position;
const latestContainer = document.getElementById("latest-container");
const classList = document.getElementById("call-list");
const latestButton = document.getElementById("latest-list");
const changeMap = document.getElementById("change-map");
const neighborhoodContainer = document.getElementById("neighborhood-text");
const countNearbyContainer = document.getElementById("count-nearby");
const temperatureContainer = document.querySelector(".weather");
const disclaimerContainer = document.querySelector(".disclaimer");

const attribution = document.querySelector(".leaflet-control-attribution");
const zoomControls = document.querySelector(
  ".leaflet-control-zoom.leaflet-bar"
);

const controlMap = async function () {
  try {
    position = await getPosition(sfapi.getLatLngSF());

    map = L.map("map").setView(position, sfapi.getMapZoomLevel());
    map.options.inertia = false;
    map.options.dragging = {
      sensitivity: 0.5, // Adjust the sensitivity (default: 1)
    };
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
    const [allCalls, police48Layer, markerCount] =
      circleMarkersInst.addCircleMarkers(dataApiPolice48hFiltered, position);
    document.getElementById("count-nearby").textContent =
      markerCount.toString() + " calls within 500m";
    const latestMarkers = sortMarkers(police48Layer);
    const latestLayerGroup = updateCallList(
      latestMarkers,
      circleMarkersInst.layerGroups
    );
    latestLayerGroup.addTo(map);
    displayNearestMarkerPopup(position, police48Layer);
    addHandlerMoveCenter(allCalls, police48Layer, map);
    if (position !== sfapi.getLatLngSF()) {
      const circle = L.circle(position, {
        radius: 500, // meters
        color: "white",
        fillColor: "blue",
        fillOpacity: 0.1,
        weight: 1,
      });
      circle.addTo(map);
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

const controlOpenLatestList = function () {
  latestContainer.classList.toggle("hidden");
  latestButton.classList.toggle("hidden");
  changeMap.classList.toggle("hidden");
  temperatureContainer.classList.toggle("hidden");
  countNearbyContainer.classList.toggle("hidden");
  neighborhoodContainer.classList.toggle("hidden");
  disclaimerContainer.classList.toggle("hidden");

  setTimeout(
    window.addEventListener("click", (event) => {
      const clickTarget = event.target;
      if (
        !latestContainer.classList.contains("hidden") &&
        clickTarget !== latestContainer &&
        !classList.contains(clickTarget) &&
        clickTarget !== latestButton
      ) {
        latestContainer.classList.add("hidden");
        latestButton.classList.toggle("hidden");
        countNearbyContainer.classList.toggle("hidden");
        temperatureContainer.classList.toggle("hidden");
        neighborhoodContainer.classList.toggle("hidden");
        disclaimerContainer.classList.toggle("hidden");
        changeMap.classList.toggle("hidden");
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
    loadLatestListButton(controlOpenLatestList);
    getWeather();
    disclaimerContainer.style.display = "block";
  } catch (err) {
    console.error(`Init error: ${err}`);
  }
};

init();
/////////////////////////////////////////
/////////////////////////////////////////
const mapEl = document.getElementById("map");
const screenshotEl = document.getElementById("screenshot-capture");
screenshotEl.addEventListener(
  "click",
  () => {
    console.log("Button pressed");
  },
  100
); // Adjust the delay as needed
