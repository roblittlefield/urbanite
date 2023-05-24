// import "regenerator-runtime/runtime"; // Polyfilling ASYNC/AWAIT
// import "core-js/stable"; // Polyfilling everything else
// const countContainer = document.getElementById("nearby-info");
// import circleMarkers from "./circleMarkersView.js";
// import { updateCallList, controlOpenCallList } from "./updateCallListView.js";
// import addHandlerMoveCenter from "./moveCenterView.js";
// import initPopupNieghborhood from "./initPopupNeighborhood.js";
// import { loadLatestListButton, loadNearbyListButton } from "./buttonsView.js";
// import * as model from "../model.js";
// import { async } from "regenerator-runtime";
// import * as sfapi from "../config.js";

// // const controlCircleMarkers = async function (
// //   position,
// //   map,
// //   originalPosition,
// //   originalZoom
// // ) {
// //   try {
// //     const responsePolice48h = await model.fetchApi(
// //       sfapi.API_URL_POLICE_48h_FILTERED
// //     );
// //     const dataApiPolice48h = await responsePolice48h.json();
// //     const dataResult = model.dataProcess(
// //       position,
// //       dataApiPolice48h,
// //       sfapi.includedCallTypesPDlive,
// //       sfapi.PARAM_MAP_POLICE_48h
// //     );
// //     const data = dataResult.data;

//     const circleMarkersInst = new circleMarkers();
//     const [police48Layer, nearbyLayer] = circleMarkersInst.addCircleMarkers(
//       data,
//       position
//     );
//     police48Layer.addTo(map);

//     initPopupNieghborhood(position, police48Layer);
//     addHandlerMoveCenter(data, police48Layer, map);

//     loadLatestListButton(controlOpenCallList);
//     loadNearbyListButton(
//       controlOpenCallList,
//       originalPosition,
//       originalZoom,
//       map
//     );

//     updateCallList(nearbyLayer, map, true);
//     updateCallList(police48Layer, map, false);

//     if (JSON.stringify(position) !== JSON.stringify(sfapi.getLatLngSF())) {
//       countContainer.textContent =
//         dataResult.countCallsNearby.toString() +
//         ` calls nearby, ` +
//         dataResult.countCallsNearbyRecent.toString() +
//         ` past ${sfapi.timeElapNearby / 60}h`;
//       const circle = L.circle(position, {
//         radius: 500, // m
//         color: "white",
//         fillColor: "blue",
//         fillOpacity: 0.1,
//         weight: 1,
//       });
//       circle.addTo(map);
//     } else {
//       countContainer.textContent =
//         dataResult.countCallsRecent.toString() +
//         ` calls past ${sfapi.timeElapSF / 60}h`;
//     }
//     return map;
//   } catch (err) {
//     console.log(err);
//   }
// };

// export default controlCircleMarkers;
