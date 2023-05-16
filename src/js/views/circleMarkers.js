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

      // 3) Format dates
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

        // 4) Format address
        const properCaseAddress = textProperCase(call.address);

        // 4) Create Disposition Meaning from Disposition Map
        const dispositionMeaning =
          DISPOSITION_MAP_POLICE[call.disposition] ?? "";

        // 6) Create Circle Marker Popups
        let popupContent = `<b>${textProperCase(call.call_type)}</b>`;
        popupContent += ` \u2022 ${minsHoursFormat(timeAgo)}`;
        // popupContent += `<br>${receivedTimeFormatted}`;

        if (responseTimeMins !== undefined && !isNaN(responseTimeMins) && call.onView !== "Y") {
          const timeDiffText = minsHoursFormat(responseTimeMins);
          popupContent += `<br><i>Response time: ${timeDiffText}</i>`;
        }
        if (responseTimeMins === 0  && call.onView === "Y") {
          popupContent += `<br><i>Observed by Officer</i>`;
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
            radius: call.priority === "A" ? 4 : call.priority === "B" ? 4 : 3,
            keepInView: false,
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
              call.priority === "A" ? 0.9 : call.priority === "B" ? 0.9 : 0.8,
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
            autoPan: false, // Disable automatic panning causing issue
            closeOnClick: false,
            interactive: false,
            bubblingMouseEvents: false,
          }
        ).bindPopup(popupContent, {
          closeButton: false,
          disableAnimation: true,
        }); 
        marker.addTo(this._layerGroups[layerName]);
      }
    });
    this.removeOverlappingMarkers(this._layerGroups);
  }

  removeOverlappingMarkers(layerGroup) {
    const layers = Object.values(layerGroup);
    const markersByLatLng = {};

    layers.forEach((layer) => {
      if (layer instanceof L.CircleMarker) {
        const latLng = layer.getLatLng().toString();
        if (!markersByLatLng[latLng]) {
          markersByLatLng[latLng] = layer;
        } else {
          layerGroup.removeLayer(layer);
        }
      }
    });
  }
}
// }
// <link rel="icon" type="image/png" sizes="32x32" href="path/to/favicon-32x32.png">
