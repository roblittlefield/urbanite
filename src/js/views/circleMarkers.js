import { formatDate, minsHoursFormat } from "../helpers.js";
import { colorMap } from "../config.js";

export default class circleMarkers {
  constructor() {
    this.police48Layer = L.layerGroup();
    this.nearbyLayer = L.layerGroup();
  }

  addCircleMarkers(data, position) {
    const positionLatLng = L.latLng(position[0], position[1]);
    data.map((call) => {
      let popupContent = `<b>${call.callTypeFormatted}</b>`;
      popupContent += ` \u2022 ${minsHoursFormat(call.receivedTimeAgo)}`;
      popupContent += `<br>${call.properCaseAddress}`;
      popupContent += `<br>Priority ${call.priority}`;
      popupContent +=
        call.onView === "Y"
          ? `<br>Officer observed`
          : call.responseTime
          ? `<br>Response time: ${minsHoursFormat(call.responseTime)}`
          : call.dispatchTime
          ? `<br>Dispatched ${call.dispatchedTimeAgo} ago`
          : call.enteredTime
          ? `<br>Call entry in queue ${call.enteredTimeAgo} ago`
          : `<br>Call received`;
      popupContent +=
        call.dispositionMeaning !== "" && call.dispositionMeaning !== "Unknown"
          ? `<br>${call.dispositionMeaning}`
          : "";
      const callLatlng = [
        Number(call.coords.coordinates[1]),
        Number(call.coords.coordinates[0]),
      ];
      const marker = L.circleMarker(callLatlng, {
        radius: window.innerWidth <= 758 ? 3 : 4,
        keepInView: false,
        fillColor: colorMap.get(call.call_type) || "#0000000",
        color: "#333333",
        weight: 1,
        opacity: 0.6,
        fillOpacity: 0.9,
        data: {
          cadNumber: call.cadNumber,
          // receivedTimeCalc: call.receivedTime,
          disposition: call.dispositionMeaning,
          neighborhood: call.neighborhoodFormatted,
          receivedTime: formatDate(call.receivedTime),
          // entryTime: enteredTime,
          entryTimeAgo: call.enteredTimeAgo,
          // dispatchTime: dispatchedTime,
          dispatchedTimeAgo: call.dispatchedTimeAgo,
          responseTime: call.responseTime,
          address: call.properCaseAddress,
          callType: call.callTypeFormatted,
          receivedTimeAgo: call.receivedTimeAgo,
          // callTypeCode: call.callTypeCode,
          // desc: call.desc,
          onView: call.onView,
          priority: call.priority,
        },
        autoPan: false,
        closeOnClick: false,
        interactive: false,
        bubblingMouseEvents: false,
      }).bindPopup(popupContent, {
        closeButton: false,
        disableAnimation: true,
      });
      const markerLatLng = callLatlng;
      const distance = positionLatLng.distanceTo(markerLatLng);
      if (distance < 500) {
        marker.addTo(this.nearbyLayer);
      }
      marker.addTo(this.police48Layer);
    });
    return [this.police48Layer, this.nearbyLayer];
  }
}
