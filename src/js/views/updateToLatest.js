import { minsHoursFormat } from "../helpers";
const updateCallList = function (latestMarkers, layerGroups) {
  // Get the call-list element and update it with the latest circle markers
  const callList = document.getElementById("call-list");
  const status = (callList.innerHTML = "");
  if (!layerGroups[`latest`]) {
    layerGroups[`latest`] = L.layerGroup();
  }
  layerGroups["latest"].clearLayers();
  latestMarkers.forEach((circleMarker) => {
    // Add a check to make sure data is defined
    if (circleMarker.options.data) {
      const callTypeProper = circleMarker.options.data.callType
        .toLowerCase()
        .split(" ")
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(" ");
      const timeAgo = circleMarker.options.data.timeAgo;
      const callBox = document.createElement("li");
      // style="color: ${circleMarker.options.fillColor};" // Add next to h3 before >
      callBox.classList.add("call-box");
      callBox.innerHTML = `
        <h3 style="color: ${
          circleMarker.options.fillColor
        };">${callTypeProper}${
        circleMarker.options.data.sensitive ? "***" : ""
      }</h3>
          <i><p>
          ${timeAgo === undefined ? "" : `${minsHoursFormat(timeAgo)} ago in`} 
          ${circleMarker.options.data.neighborhood}
        </p></i>
          <p>${
            circleMarker.options.data.responseTime === undefined
              ? circleMarker.options.data.dispatchTime
                ? `dispatched`
                : circleMarker.options.data.entryTime
                ? `Call entry, awaiting dispatch`
                : `Received, awaiting call entry`
              : `Response time: ${minsHoursFormat(
                  circleMarker.options.data.responseTime
                )}`
          }${circleMarker.options.data.onView === "Y" ? ` (observed)` : ""}${
        circleMarker.options.data.disposition
          ? `, ${circleMarker.options.data.disposition.toLowerCase()}`
          : ""
      }
        
        </p>
          <p>${circleMarker.options.data.address}</p>
        `;
      callList.appendChild(callBox);
      layerGroups[`latest`].addLayer(circleMarker);
    }
  });
  return layerGroups[`latest`];
};
export default updateCallList;
