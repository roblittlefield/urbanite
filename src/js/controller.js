import "regenerator-runtime/runtime"; // Polyfilling ASYNC/AWAIT
import "core-js/stable"; // Polyfilling everything else
import L from "leaflet";
import * as model from "./model.js";
import * as sfapi from "./config.js";
// import { formatDate } from "./helper.js";
import { async } from "regenerator-runtime";

const latLngSF = sfapi.getLatLngSF();
const zoomLevel = sfapi.getMapZoomLevel();
const layerGroups = {};

const controlMap = function () {
  try {
    // Initialize Leaflet map object, set Lat/Lng, add layer, add to "map" HTML element
    const map = L.map("map").setView(latLngSF, zoomLevel);

    const startingLayer = L.tileLayer(sfapi.MAP_LAYERS[1]).addTo(map);
    if (!map) return;
  } catch (err) {
    console.error(err);
  }
};

const init = function () {
  controlMap();
};
init();
