import "regenerator-runtime/runtime"; // Polyfilling ASYNC/AWAIT
import "core-js/stable"; // Polyfilling everything else
import L from "leaflet";
import * as model from "./model.js";
import * as sfapi from "./config.js";
import { formatDate, standardizeData } from "./helpers.js";
import { async } from "regenerator-runtime";

const latLngSF = sfapi.getLatLngSF();
const zoomLevel = sfapi.getMapZoomLevel();
const layerGroups = {};

const controlMap = async function () {
  try {
    // Initialize Leaflet map object, set Lat/Lng, add layer, add to "map" HTML element
    const map = L.map("map").setView(latLngSF, zoomLevel);
    const initLayer = L.tileLayer(sfapi.MAP_LAYERS[4]).addTo(map);
    if (!map) return;
  } catch (err) {
    console.error(`${err} Leaflet map error`);
    throw err;
  }
};

const addMarkersToLayerGroups = async function () {
  try {
    // Get Police48h promise
    const responsePolice48h = await model.fetchApi(
      sfapi.API_URL_POLICE_48h_FILTERED
    );
    // Resolve Police48h promise to json
    const dataApiPolice48h = await responsePolice48h.json();
    console.log(dataApiPolice48h);
    // Standardize Polce48h object parameters
    const standardizedData = dataApiPolice48h.map((call) => {
      return standardizeData(call, sfapi.API_MAP_POLICE_48h);
    });
    console.log(standardizedData);

    // data = standardizedData
    //   .map((acc, val) => {
    //     if (+val.cad_number === NaN || val.cad_mumber === undefined) {
    //       console.log(`cad is duplicate`);
    //       return null;
    //     } else {
    //       return val;
    //     }
    //   })
    //   .filter(Boolean);

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

    //   console.log(standardizedData);

    //   const callType =
    //     call.call_type_final_desc ?? call.call_type_original_desc; // Will need to update for Historic data
    //   if (!layerGroups[callType]) {
    //     layerGroups[callType] = L.layerGroup();
    //   }
    //   let timeDiffMinutes;
    //   if (call.onSceneTime && call.receivedTime) {
    //     const onSceneTime = new Date(call.onSceneTime);
    //     const receivedTime = new Date(call.receivedTime);
    //     const timeDiffMs = onSceneTime.getTime() - receivedTime.getTime();
    //     timeDiffMinutes = Math.round(timeDiffMs / (1000 * 60));
    //   }
  } catch (err) {
    console.log(err);
  }
};

const init = async function () {
  try {
    await Promise.all([controlMap(), addMarkersToLayerGroups()]);
  } catch (err) {
    console.error(`Init error: ${err}`);
  }
};

init();
