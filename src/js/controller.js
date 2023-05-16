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
import { loadChangeMapButton } from "./views/buttonsView.js";
import { async } from "regenerator-runtime";

let map;
const controlMap = async function () {
  try {
    const position = await getPosition(sfapi.getLatLngSF());

    map = L.map("map").setView(position, sfapi.getMapZoomLevel());
    map.options.inertia = false;
    map.options.dragging = {
      sensitivity: 0.5, // Adjust the sensitivity (default: 1)
    };
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
    const dataApiPolice48hFiltered = dataApiPolice48h.filter((item) =>
      sfapi.includedCallTypes.includes(item.call_type_final_desc)
    );

    // getCallTypeCount(dataApiPolice48hFiltered);
    // 2) Create new view and add markers
    const circleMarkersInst = new circleMarkers();
    circleMarkersInst.addCircleMarkers(
      dataApiPolice48hFiltered,
      sfapi.API_MAP_POLICE_48h,
      "police48"
    );
    // circleMarkersInst.removeOverlappingMarkers(circleMarkersInst.layerGroups)
    // SFPD
    // SFFD

    const latestMarkers = sortMarkers(circleMarkersInst.layerGroups);

    const latestLayerGroup = updateCallList(
      latestMarkers,
      circleMarkersInst.layerGroups
    );
    latestLayerGroup.addTo(map);

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
  if (currentLayer === 4) {
    alert(`Beware, watercolors are beautiful but load a bit slower! 👨‍🎨`);
  }
};

const init = async function () {
  try {
    const map = await controlMap(); // Wait for map initialization

    await controlCircleMarkers(); // Wait for circle markers to be added

    addHandlerMoveCenter(map); // Call addHandlerMoveCenter with the map
    loadChangeMapButton(controlButtons);
    // document.body.removeChild(overlay);
    // Load position
  } catch (err) {
    console.error(`Init error: ${err}`);
  }
};

init();
// const getCallTypeCount = function (data) {
//   const countByCallType = {};
//   data.forEach((call) => {
//     const callType = call.call_type_original_desc;
//     if (callType in countByCallType) {
//       countByCallType[callType]++;
//     } else {
//       countByCallType[callType] = 1;
//     }
//   });
//   const countPairs = Object.entries(countByCallType);
//   countPairs.sort((a, b) => b[1] - a[1]);
//   countPairs.forEach((pair) => {
//     console.log(`${pair[0]}: ${pair[1]}`);
//   });
// };
