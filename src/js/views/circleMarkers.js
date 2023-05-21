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
  maxHoursAgo,
} from "../config.js";

export default class circleMarkers {
  now = new Date();
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

    const dataDateFilter = data.filter((call) => {
      return (
        Math.floor((this.now - new Date(call.received_datetime)) / 3600000) <=
        maxHoursAgo
      );
    });

    dataDateFilter.map((callRaw) => {
      const call = standardizeData(callRaw, API_REF_POLICE_48h);
      allCalls.push(call);
      const receivedTime = new Date(call.receivedTime);
      const callType = call.call_type || call.call_type_original;
      const enteredTime = new Date(call.entryTime);
      const enteredTimeAgo = minsHoursFormat(
        Math.round((this.now - enteredTime) / 60000)
      );
      const dispatchedTime = new Date(call.dispatchTime);
      const dispatchedTimeAgo = minsHoursFormat(
        Math.round((this.now - dispatchedTime) / 60000)
      );
      const onSceneTime = new Date(call.onSceneTime);
      const responseTime = Math.round((onSceneTime - receivedTime) / 60000);
      const receivedTimeAgo = Math.round((this.now - receivedTime) / 60000);
      const properCaseAddress = textProperCase(call.address);
      const neighborhoodFormatted = neighborhoodFormat(call.neighborhood);
      const callTypeFormatted = callTypeConversionMap.get(callType) || callType;

      const dispositionMeaning = DISPOSITION_REF_POLICE[call.disposition] ?? "";

      let popupContent = `<b>${callTypeFormatted}</b>`;
      popupContent += ` \u2022 ${minsHoursFormat(receivedTimeAgo)}`;
      popupContent += `<br>${properCaseAddress}`;
      popupContent +=
        call.onView === "Y"
          ? `<br>Officer observed`
          : responseTime
          ? `<br>Response time: ${minsHoursFormat(responseTime)}`
          : call.dispatchTime
          ? `<br>Dispatched ${dispatchedTimeAgo} ago`
          : call.entry_datetime
          ? `<br>Call entry in queue ${enteredTimeAgo} ago`
          : `<br>Call received`;
      popupContent +=
        dispositionMeaning !== "" && dispositionMeaning !== "Unknown"
          ? `<br>${dispositionMeaning}`
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
            // receivedTimeCalc: call.receivedTime,
            disposition: dispositionMeaning,
            neighborhood: neighborhoodFormatted,
            receivedTime: formatDate(receivedTime),
            // entryTime: enteredTime,
            entryTimeAgo: enteredTimeAgo,
            // dispatchTime: dispatchedTime,
            dispatchedTimeAgo: dispatchedTimeAgo,
            responseTime: responseTime,
            address: properCaseAddress,
            callType: callTypeFormatted,
            receivedTimeAgo: receivedTimeAgo,
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
      if (receivedTimeAgo <= 360 && distance < 500) {
        this.markersWithinRadiusRecent.push(marker);
      }

      marker.addTo(this.police48Layer);
    });
    const nearbyMarkers = this.markersWithinRadius;
    const nearbyMarkersCount = this.markersWithinRadius.length;
    const nearbyMarketsCountRecent = this.markersWithinRadiusRecent.length;
    return [allCalls, this.police48Layer, this.nearbyLayer];
  }
}
