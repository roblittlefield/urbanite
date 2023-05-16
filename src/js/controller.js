import "regenerator-runtime/runtime"; // Polyfilling ASYNC/AWAIT
import "core-js/stable"; // Polyfilling everything else
import L from "leaflet";
import * as model from "./model.js";
import * as sfapi from "./config.js";
import View from "./views/circleMarkers.js";
import { async } from "regenerator-runtime";
import circleMarkers from "./views/circleMarkers.js";
import sortMarkers from "./views/circleMarkersSort.js";
import updateCallList from "./views/updateToLatest.js";

let map;
const controlMap = async function () {
  try {
    // Initialize Leaflet map object, set Lat/Lng, add layer, add to "map" HTML element
    map = L.map("map").setView(sfapi.getLatLngSF(), sfapi.getMapZoomLevel());
    const initLayer = L.tileLayer(sfapi.MAP_LAYERS[4]).addTo(map);
    if (!map) return;
    return map;
  } catch (err) {
    console.error(`${err} Leaflet map error`);
    throw err;
  }
};

const controlCircleMarkers = async function () {
  try {
    // 0) Get Police48h promise
    const responsePolice48h = await model.fetchApi(
      sfapi.API_URL_POLICE_48h_FILTERED
    );
    // 1) Resolve Police48h promise to json
    const dataApiPolice48h = await responsePolice48h.json();

    // 2) Create new view and add markers
    const circleMarkersInst = new circleMarkers();
    circleMarkersInst.addCircleMarkers(
      dataApiPolice48h,
      sfapi.API_MAP_POLICE_48h
    );

    // SFPD
    // SFFD

    const layerGroups = circleMarkersInst.layerGroups;
    console.log(layerGroups);
    const latestMarkers = sortMarkers(layerGroups);
    console.log(latestMarkers);

    const latestLayerGroup = updateCallList(latestMarkers, layerGroups);
    console.log(latestLayerGroup);
    latestLayerGroup.addTo(map);
    // 2) Standardize Polce48h object parameters, format dates, add parameters, add layer groups, add circle markers

    // const [response2, response3] = await Promise.all([
    //   model.fetchApi(anotherApiUrl),
    //   model.fetchApi(yetAnotherApiUrl),
    // ]);

    // const dataApi2 = await response2.json();
    // const dataApi3 = await response3.json();

    // Flatten to 1 array
    // const dataRaw = dataApi.flatMap((arr) => arr);
    // console.log(dataRaw);
    // Remove duplicates without a cad number
  } catch (err) {
    console.log(err);
  }
};

const init = async function () {
  try {
    await Promise.all([controlMap()]);
  } catch (err) {
    console.error(`Init error: ${err}`);
  }
};

init().then(() => {
  controlCircleMarkers();
});
