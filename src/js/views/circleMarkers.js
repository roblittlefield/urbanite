import { formatDate, minsHoursFormat } from "../helpers.js";
import { colorMap } from "../config.js";
const overlapOffset = 0.00008;

export default class circleMarkers {
  constructor() {
    this.police48Layer = L.layerGroup();
    this.nearbyLayer = L.layerGroup();
  }

  addCircleMarkers(data, position) {
    const positionLatLng = L.latLng(position[0], position[1]);
    data.map((call) => {
      const receivedTimeF = formatDate(call.receivedTime);
      const responseTimeF = minsHoursFormat(call.responseTime);
      const dispatchedTimeAgoF = minsHoursFormat(call.dispatchedTimeAgo);
      const receivedTimeAgoF = minsHoursFormat(call.receivedTimeAgo);
      const disposition =
        call.dispositionMeaning !== "" && call.dispositionMeaning !== "Unknown"
          ? `${call.dispositionMeaning}`
          : "";
      const tweetContent = `${call.callTypeFormatted} at ${
        call.properCaseAddress
      } in ${call.neighborhoodFormatted} ${
        call.receivedTimeAgo <= 6
          ? `${receivedTimeAgoF} ago`
          : `${formatDate(call.receivedTime)}`
      }, ${
        call.onView === "Y"
          ? "SFPD officer observed"
          : call.responseTime
          ? `SFPD response time: ${
              call.responseTime > 30 ? `${responseTimeF} 😬` : responseTimeF
            }`
          : dispatchedTimeAgoF
          ? `SFPD dispatched ${dispatchedTimeAgoF} ago`
          : call.enteredTime
          ? `call entry in SFPD queue ${call.enteredTimeAgo} ago`
          : "call received by SFPD"
      }${
        disposition ? `, ${disposition.toLowerCase()}` : ""
      } #SanFrancisco https://urbanitesf.netlify.app/?cad_number=${
        call.cadNumber
      }`;
      const textMessageContent = `"${call.callTypeFormatted} at ${
        call.properCaseAddress
      } in ${call.neighborhoodFormatted} ${receivedTimeAgoF} ago, ${
        call.onView === "Y"
          ? "officer observed"
          : call.responseTime
          ? `SFPD response time: ${
              call.responseTime > 30 ? `${responseTimeF} 😬` : responseTimeF
            }`
          : dispatchedTimeAgoF
          ? `dispatched ${dispatchedTimeAgoF} ago`
          : call.enteredTime
          ? `call entry in queue ${call.enteredTimeAgo} ago`
          : "call received"
      }${
        disposition ? `, ${disposition.toLowerCase()}` : ""
      }" via https://urbanitesf.netlify.app/?cad_number=${call.cadNumber}`;
      const popupContent = `
    <div>
      <b>${call.callTypeFormatted}</b>
      \u2022 ${receivedTimeAgoF} <a href="sms:&body=${encodeURIComponent(
        textMessageContent
      )}">
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IMessage_logo.svg/20px-IMessage_logo.svg.png" alt="iMessage / text" style="height:20px; position: absolute; bottom: 0px; left: calc(50% - 27px); transform: translate(-50%, -50%);">
      </a>
      <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(
        tweetContent
      )}" target="_blank">
      <img src="https://icons.iconarchive.com/icons/xenatt/the-circle/256/App-Twitter-icon.png" alt="Twitter Bird Icon" style=" height: 20px; position: absolute; bottom: 0px; left: calc(50% + 25px); transform: translate(-50%, -50%);">
      </a>
      <br>${call.properCaseAddress}
      <br>Priority ${
        call.priority
      } #<a href="https://data.sfgov.org/resource/gnap-fj3t.json?cad_number=${
        call.cadNumber
      }" target="_blank">${call.cadNumber}</a>
      ${
        call.onView === "Y"
          ? "<br>Officer observed"
          : call.responseTime
          ? `<br>Response time: ${responseTimeF}`
          : dispatchedTimeAgoF
          ? `<br>Dispatched ${dispatchedTimeAgoF} ago`
          : call.enteredTime
          ? `<br>Call entry in queue ${call.enteredTimeAgo} ago`
          : "<br>Call received"
      }<br>${disposition}
  </div>
`;
      let callLatlng = [
        Number(call.coords.coordinates[1]),
        Number(call.coords.coordinates[0]),
      ];
      this.police48Layer.eachLayer(function (layer) {
        if (layer.getLatLng().equals(callLatlng)) {
          callLatlng[0] += overlapOffset;
        }
      });

      const marker = L.circleMarker(callLatlng, {
        radius: window.innerWidth <= 758 ? 5 : 5,
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
          receivedTime: receivedTimeF,
          // entryTime: enteredTime,
          enteredTimeAgo: call.enteredTimeAgo,
          // dispatchTime: dispatchedTime,
          dispatchedTimeAgoF: dispatchedTimeAgoF,
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
