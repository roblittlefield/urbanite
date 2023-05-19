import {
  formatDate,
  standardizeData,
  textProperCase,
  minsHoursFormat,
  neighborhoodFormat,
} from "../helpers.js";
import {
  DISPOSITION_REF_POLICE,
  API_REF_POLICE_48h,
  colorMap,
  callTypeConversionMap,
} from "../config.js";

export default class circleMarkers {
  constructor() {
    this.police48Layer = L.layerGroup();
    this.markersWithinRadius = [];
    this.markersWithinRadiusRecent = [];
    this.nearbyLayer = L.layerGroup();
  }

  get layerGroups() {
    return this.police48Layer;
  }

  addCircleMarkers(data, position) {
    const allCalls = [];
    const positionLatLng = L.latLng(position[0], position[1]);
    data.map((callRaw) => {
      const call = standardizeData(callRaw, API_REF_POLICE_48h);
      allCalls.push(call);

      const callType = call.call_type || call.call_type_original;
      const now = new Date();
      const receivedTime = new Date(call.receivedTime);
      const onSceneTime = new Date(call.onSceneTime);
      const responseTimeMins = Math.round((onSceneTime - receivedTime) / 60000);
      const timeAgo = Math.floor((now - receivedTime) / 60000);
      const properCaseAddress = textProperCase(call.address);
      const neighborhoodFormatted = neighborhoodFormat(call.neighborhood);
      const callTypeFormatted = callTypeConversionMap.get(callType) || callType;

      const dispositionMeaning = DISPOSITION_REF_POLICE[call.disposition] ?? "";

      let popupContent = `<b>${callTypeFormatted}</b>`;
      popupContent += ` \u2022 ${minsHoursFormat(timeAgo)}`;
      popupContent += `<br>${properCaseAddress}`;

      popupContent +=
        call.onView === "Y"
          ? `<br>Officer observed`
          : call.responseTime
          ? `<br>Response time: ${minsHoursFormat(responseTimeMins)}`
          : call.dispatchTime
          ? `<br>Dispatched ${minsHoursFormat(call.dispatchTime)} ago`
          : call.entry_datetime
          ? `<br>Call entry in queue`
          : `<br>Call received`;
      popupContent +=
        dispositionMeaning !== "" && dispositionMeaning !== "Unknown"
          ? `, ${dispositionMeaning.toLowerCase()}`
          : "";

      const marker = L.circleMarker(
        [
          Number(call.coords.coordinates[1]),
          Number(call.coords.coordinates[0]),
        ],
        {
          radius: window.innerWidth <= 758 ? 3 : 4,
          keepInView: false,
          fillColor: colorMap.get(call.call_type) || "#0000000",
          color: "#333333",
          weight: 1,
          opacity: 0.6,
          fillOpacity: 0.9,
          data: {
            receivedTimeCalc: new Date(call.receivedTime).getTime(),
            disposition: dispositionMeaning,
            neighborhood: neighborhoodFormatted,
            receivedTime: formatDate(receivedTime),
            entryTime: call.entry_datetime,
            dispatchTime: call.dispatch_datetime,
            responseTime: responseTimeMins,
            address: properCaseAddress,
            callType: callTypeFormatted,
            timeAgo: timeAgo,
            // callTypeCode: call.callTypeCode,
            // desc: call.desc,
            onView: call.onView,
            // priority: call.priority,
          },
          autoPan: false,
          closeOnClick: false,
          interactive: false,
          bubblingMouseEvents: false,
        }
      ).bindPopup(popupContent, {
        closeButton: false,
        disableAnimation: true,
      });

      const markerLatLng = marker.getLatLng();
      const distance = positionLatLng.distanceTo(markerLatLng);
      if (distance < 500) {
        this.markersWithinRadius.push(marker);
        marker.addTo(this.nearbyLayer);
      }
      // Count recent markers in circle
      if (timeAgo <= 360 && distance < 500) {
        this.markersWithinRadiusRecent.push(marker);
      }

      marker.addTo(this.police48Layer);
    });
    const nearbyMarkers = this.markersWithinRadius;
    const nearbyMarkersCount = this.markersWithinRadius.length;
    const nearbyMarketsCountRecent = this.markersWithinRadiusRecent.length;
    return [
      allCalls,
      this.police48Layer,
      this.nearbyLayer,
    ];
  }
}
