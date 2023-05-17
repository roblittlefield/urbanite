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
} from "../config.js";

export default class circleMarkers {
  constructor() {
    this.police48Layer = L.layerGroup();
  }

  get layerGroups() {
    return this.police48Layer;
  }

  addCircleMarkers(data) {
    let allCalls = [];

    data.map((callRaw) => {
      // 2a) Standardize Data
      const call = standardizeData(callRaw, API_REF_POLICE_48h);
      allCalls.push(call);
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
        const neighborhoodFormatted = neighborhoodFormat(call.neighborhood);
        // 4) Create Disposition Meaning from Disposition
        const dispositionMeaning =
          DISPOSITION_REF_POLICE[call.disposition] ?? "";

        // 6) Create Circle Marker Popups
        let popupContent = `<b>${textProperCase(callType)}</b>`;
        popupContent += ` \u2022 ${minsHoursFormat(timeAgo)}`;
        // popupContent += `<br>${receivedTimeFormatted}`;
        
        popupContent += `<br>${properCaseAddress}`;
        if (
          responseTimeMins !== undefined &&
          !isNaN(responseTimeMins) &&
          call.onView !== "Y"
        ) {
          const timeDiffText = minsHoursFormat(responseTimeMins);
          popupContent += `<br><i>Response time: ${timeDiffText}</i>`;
        }
        if (responseTimeMins === 0 && call.onView === "Y") {
          popupContent += `<br><i>Observed by Officer</i>`;
        }

        if (dispositionMeaning !== "" && dispositionMeaning !== "Unknown") {
          popupContent += `<br/>${dispositionMeaning}`;
        }
        // <br>${call.neighborhood}<br>`;
        console.log(colorMap[call.call_type]);
        // 8) Create Circle Markers
        const marker = L.circleMarker(
          [
            Number(call.coords.coordinates[1]),
            Number(call.coords.coordinates[0]),
          ],
          {
            // radius: call.priority === "A" ? 4 : call.priority === "B" ? 4 : 3,
            radius: 3,
            keepInView: false,
            // fillColor:
            //   call.priority === "A"
            //     ? "#ff0000"
            //     : call.priority === "B"
            //     ? "#ffcc00"
            //     : "#000000",
            fillColor: colorMap[call.call_type] || "#0000000",
            color: "#333333",
            weight: 1,
            // opacity: 0.9,
            opacity:
              timeAgo < 60
                ? 0.9
                : timeAgo < 120
                ? 0.8
                : timeAgo < 180
                ? 0.7
                : timeAgo < 240
                ? 0.6
                : timeAgo < 300
                ? 0.5
                : timeAgo < 360
                ? 0.4
                : 0.35,
            fillOpacity:
              call.priority === "A" ? 0.9 : call.priority === "B" ? 0.9 : 0.8,
            data: {
              receivedTimeCalc: new Date(call.receivedTime).getTime(),
              disposition: dispositionMeaning,
              neighborhood: neighborhoodFormatted,
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
        marker.addTo(this.police48Layer);
      }
    });
    return [allCalls, this.police48Layer];
  }
}
