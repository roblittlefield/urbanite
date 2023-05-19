import { minsHoursFormat } from "../helpers";
import { toggleVisibleItems } from "./buttonsView";

const updateCallList = function (latestMarkers, map) {
  const callList = document.getElementById("call-list");
  const callListHeading = document.getElementById("call-list-heading");
  callList.innerHTML = "";
  // if (!layerGroups[`latest`]) {
  //   layerGroups[`latest`] = L.layerGroup();
  // }
  // layerGroups["latest"].clearLayers();
  latestMarkers.forEach((circleMarker) => {
    if (circleMarker.options.data) {
      const timeAgo = circleMarker.options.data.timeAgo;
      const callBox = document.createElement("li");
      callBox.classList.add("call-box");
      callBox.innerHTML = `
        <h3 style="color: ${
          circleMarker.options.fillColor === "#000000"
            ? "#D3D3D3"
            : circleMarker.options.fillColor === "#FF00FF"
            ? "#FF5AFF"
            : circleMarker.options.fillColor === "#0000FF"
            ? "#66CCFF"
            : circleMarker.options.fillColor
        };">${circleMarker.options.data.callType}${
        circleMarker.options.data.sensitive ? "  *sensitive call" : ""
      }</h3>
          <i><p>
          ${timeAgo === undefined ? "" : `${minsHoursFormat(timeAgo)} ago in`} 
          ${circleMarker.options.data.neighborhood}
        </p></i>
          <p>${
            circleMarker.options.data.onView === "Y"
              ? `Officer observed`
              : circleMarker.options.data.responseTime
              ? `Response time: ${minsHoursFormat(
                  circleMarker.options.data.responseTime
                )}`
              : circleMarker.options.data.dispatchTime
              ? `Dispatched ${minsHoursFormat(
                  circleMarker.options.data.dispatchTime
                )} ago`
              : circleMarker.options.data.entryTime
              ? `Call entry in queue`
              : `Call received`
          }${
        circleMarker.options.data.disposition
          ? `, ${circleMarker.options.data.disposition.toLowerCase()}`
          : ""
      }
        </p>
          <p>${circleMarker.options.data.address.slice(0, 45)}</p>
        `;
      callBox.addEventListener("click", () => {
        toggleVisibleItems();
        map.flyTo(circleMarker.getLatLng(), 14);
        circleMarker.openPopup();
      });
      callList.appendChild(callBox);
      // layerGroups[`latest`].addLayer(circleMarker);
    }
  });
  // return layerGroups[`latest`];
};
export default updateCallList;
