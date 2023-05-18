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
  toggleVisibleItems,
} from "./views/buttonsView.js";
import { async } from "regenerator-runtime";

let map;
let position;
const latestContainer = document.getElementById("latest-container");
const callList = document.getElementById("call-list");
const latestButton = document.getElementById("latest-list");
const disclaimerContainer = document.querySelector(".disclaimer");

const controlMap = async function () {
  try {
    position = await getPosition(sfapi.getLatLngSF());

    map = L.map("map").setView(position, sfapi.getMapZoomLevel());
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

    const { latestMarkers, count } = sortMarkers(police48Layer);
    console.log(count); // COunt of last 2 hrs
    const latestLayerGroup = updateCallList(
      latestMarkers,
      circleMarkersInst.layerGroups,
      map
    );
    latestLayerGroup.addTo(map);
    displayNearestMarkerPopup(position, police48Layer);
    addHandlerMoveCenter(allCalls, police48Layer, map);
    const countNearbyContainer = document.getElementById("count-display");
    countNearbyContainer.classList.toggle("hidden");
    if (JSON.stringify(position) !== JSON.stringify(sfapi.getLatLngSF())) {
      countNearbyContainer.classList.toggle("hidden");
      document.getElementById("count-display").textContent =
      markerCount.toString() + " calls within 500m";
      const circle = L.circle(position, {
        radius: 500, // meters
        color: "white",
        fillColor: "blue",
        fillOpacity: 0.1,
        weight: 1,
      });
      circle.addTo(map);
    } else {
      countNearbyContainer.classList.toggle("hidden");
      document.getElementById("count-display").textContent =
        count.toString() + " calls past 2h";
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
