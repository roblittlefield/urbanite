import {
  formatDate,
  standardizeData,
  textProperCase,
  minsHoursFormat,
} from "../helpers.js";
import { DISPOSITION_MAP_POLICE } from "../config.js";

export default class circleMarkers {
  constructor() {
    this._layerGroups = {}; // Initialize _layergroups
  }

  get layerGroups() {
    return this._layerGroups;
  }

  addCircleMarkers(data, map, layerName) {
    this._layerGroups[layerName] = L.layerGroup();
    data.map((callRaw) => {
      // 2a) Standardize Data
      const call = standardizeData(callRaw, map);

      // 2b) Categorize by call type
      const callType = call.call_type || call.call_type_original;

      // // 3) Create layer groups
      // if (!this._layerGroups[callType]) {
      //   this._layerGroups[callType] = L.layerGroup();
      // }

      // 4) Format dates
      if (call.onSceneTime && call.receivedTime) {
        const now = new Date();
        const receivedTime = new Date(call.receivedTime);
        const onSceneTime = new Date(call.onSceneTime);
        const responseTimeMins = Math.round(
          (onSceneTime - receivedTime) / 60000
        );
        const timeAgo = Math.floor((now - receivedTime) / 60000);
        const receivedTimeFormatted = formatDate(receivedTime);
        const onSceneTimeFormatted = formatDate(onSceneTime);

        // 5) Format address
        const properCaseAddress = textProperCase(call.address);

        // 6) Create Disposition Meaning from Disposition Map
        const dispositionMeaning =
          DISPOSITION_MAP_POLICE[call.disposition] ?? "";

        // 7) Create Circle Marker Popups
        let popupContent = `<b>${textProperCase(call.call_type)}</b>`;
        popupContent += ` \u2022 ${minsHoursFormat(timeAgo)}`;
        // popupContent += `<br>${receivedTimeFormatted}`;

        if (responseTimeMins !== undefined && !isNaN(responseTimeMins)) {
          const timeDiffText = minsHoursFormat(responseTimeMins);
          popupContent += `<br><i>Response time: ${timeDiffText}</i>`;
        }
        if (call.onView === "Y") {
          popupContent += `<i> (observed)</i>`;
        }
        if (dispositionMeaning !== "" && dispositionMeaning !== "Unknown") {
          popupContent += `<br/>${dispositionMeaning}`;
        }
        // popupContent += `<br>${properCaseAddress}<br>${call.neighborhood}<br>`;

        // 8) Create Circle Markers
        const marker = L.circleMarker(
          [
            Number(call.coords.coordinates[1]),
            Number(call.coords.coordinates[0]),
          ],
          {
            radius: 4,
            fillColor:
              call.priority === "A"
                ? "#ff0000"
                : call.priority === "B"
                ? "#ffcc00"
                : "#000000",
            color: "#000",
            weight: 1,
            opacity: 0.9,
            fillOpacity:
              call.priority === "A" ? 0.9 : call.priority === "B" ? 0.9 : 0.57,
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
        marker.addTo(this._layerGroups[layerName]);
      }
    });
  }
}
