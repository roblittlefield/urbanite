import { formatDate, standardizeData } from "../helpers.js";
import * as sfapi from "../config.js";

export default class circleMarkers {
  constructor() {
    this._layerGroups = {}; // Initialize _layergroups
  }

  get layerGroups() {
    return this._layerGroups;
  }

  addCircleMarkers(data, map) {
    data.map((callRaw) => {
      // 2a) Standardize Data
      const call = standardizeData(callRaw, map);

      // 2b) Categorize by call type
      const callType = call.call_type || call.call_type_original;

      // 3) Create layer groups
      if (!this._layerGroups[callType]) {
        this._layerGroups[callType] = L.layerGroup();
      }

      // 4) Format dates
      if (call.onSceneTime && call.receivedTime) {
        const receivedTime = new Date(call.receivedTime);
        const onSceneTime = new Date(call.onSceneTime);
        const now = new Date();
        const responseTimeSecs = onSceneTime.getTime() - receivedTime.getTime();
        const responseTimeMins = Math.round(responseTimeSecs / 60000);
        const timeAgo = Math.floor((now - receivedTime) / 60000);
        const receivedTimeFormatted = formatDate(receivedTime);
        const onSceneTimeTimeFormatted = formatDate(receivedTime);
        console.log(onSceneTimeTimeFormatted);

        // 5) Format address
        const properCaseAddress = call.address
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase());

        // 6) Create Disposition Meaning from Disposition Map
        const dispositionMeaning =
          sfapi.DISPOSITION_MAP_POLICE[call.disposition] ?? "";

        // 7) Create Circle Marker Popups
        let popupContent = `<b>${call.call_type}</b>`;
        popupContent += `<br>${receivedTimeFormatted}`;

        if (responseTimeMins !== undefined && !isNaN(responseTimeMins)) {
          const timeDiffText =
            responseTimeMins < 60
              ? `${responseTimeMins} mins`
              : `${responseTimeMins / 60} hours ${responseTimeMins % 60} mins`;
          popupContent += `<br><i>On-Scene: ${timeDiffText}</i>`;
        }
        if (call.onView === "Y") {
          popupContent += `<br>Observed by Officer (On View)`;
        }
        if (dispositionMeaning !== "" && dispositionMeaning !== "Unknown") {
          popupContent += `<br/>${dispositionMeaning}`;
        }
        popupContent += `<br><br>${properCaseAddress}<br>${call.neighborhood}<br>`;

        // 8) Create Circle Markers
        const marker = L.circleMarker(
          [
            Number(call.coords.coordinates[1]),
            Number(call.coords.coordinates[0]),
          ],
          {
            radius: 6,
            // fillColor: fillColor,
            color: "#000",
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.3,
            data: {
              receivedTimeCalc: new Date(call.receivedTime).getTime(),
              disposition: dispositionMeaning,
              neighborhood: call.neighborhood,
              receivedTime: receivedTimeFormatted,
              entryTime: call.entry_datetime,
              dispatchTime: call.dispatch_datetime,
              responseTime: responseTimeMins,
              address: properCaseAddress,
              callType: call.call_type,
              timeAgo: timeAgo,
              desc: call.desc,
              onView: call.onView,
              priority: call.priority,
            },
          }
        ).bindPopup(popupContent);
        marker.addTo(this._layerGroups[callType]);
      }
    });
  }
}
