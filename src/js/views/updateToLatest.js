import { minsHoursFormat } from "../helpers";
import { toggleVisibleItems } from "./buttonsView";

const updateCallList = function (latestMarkers, layerGroups, map) {
  const callList = document.getElementById("call-list");
  const status = (callList.innerHTML = "");
  if (!layerGroups[`latest`]) {
    layerGroups[`latest`] = L.layerGroup();
  }
  layerGroups["latest"].clearLayers();
  latestMarkers.forEach((circleMarker) => {
    if (circleMarker.options.data) {
      const callType = circleMarker.options.data.callType;
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
        circleMarker.options.data.sensitive ? "***" : ""
      }</h3>
          <i><p>
          ${timeAgo === undefined ? "" : `${minsHoursFormat(timeAgo)} ago in`} 
          ${circleMarker.options.data.neighborhood}
        </p></i>
          <p>${
            circleMarker.options.data.responseTime !== undefined &&
            !isNaN(circleMarker.options.data.responseTime) &&
            circleMarker.options.data.responseTime !== 0
              ? `Response time: ${minsHoursFormat(
                  circleMarker.options.data.responseTime
                )}`
              : circleMarker.options.data.responseTime === 0
              ? ``
              : circleMarker.options.data.dispatchTime
              ? `Dispatched`
              : circleMarker.options.data.entryTime
              ? `Awaiting dispatch`
              : `Call received`
          }${
        circleMarker.options.data.onView === "Y" ? ` Office observed` : ""
      }${
        circleMarker.options.data.disposition
          ? `, ${circleMarker.options.data.disposition.toLowerCase()}`
          : ""
      }
        </p>
          <p>${circleMarker.options.data.address}</p>
        `;
      callBox.addEventListener("click", () => {
        toggleVisibleItems();
        map.flyTo(circleMarker.getLatLng(), 14);
        circleMarker.openPopup();
      });
      callList.appendChild(callBox);
      layerGroups[`latest`].addLayer(circleMarker);
    }
  });
  return layerGroups[`latest`];
};
export default updateCallList;
