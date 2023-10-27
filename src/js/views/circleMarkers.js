import { formatDate, minsHoursFormat } from "../helpers.js";
import { colorMap, onSceneCircleOpt } from "../config.js";
// Amount to offset each circle marker by when there are multiple at the same location (stacks the circle markers North a bit)
const overlapOffset = 0.00008;

/**
 * Add circle markers to the Leaflet map based on provided data.
 *
 * @param {Array} data - An array of SFPD data to create circle markers from.
 * @param {L.LayerGroup} callsLayer - The layer group to which markers are added.
 * @returns {L.LayerGroup} The updated layer group with added markers.
 */
export function addCircleMarkers(data, callsLayer) {
  data.map((call) => {
    // Collecting all the time milestones: received time, response time, dispatched time ago, received time ago
    const receivedTimeF = formatDate(call.receivedTime);
    const responseTimeF = minsHoursFormat(call.responseTime);
    const dispatchedTimeAgoF = minsHoursFormat(call.dispatchedTimeAgo);
    const receivedTimeAgoF = minsHoursFormat(Math.round(call.receivedTimeAgo));

    // Collect call conclusion/disposition, if available yet
    const disposition =
      call.dispositionMeaning !== "" && call.dispositionMeaning !== "Unknown"
        ? `${call.dispositionMeaning}`
        : "";

    // Create Tweet / X message content from call data
    const tweetContent = `${call.callTypeFormatted} at ${
      call.properCaseAddress
    } in ${call.neighborhoodFormatted} ${
      call.receivedTimeAgo <= 6
        ? `${receivedTimeAgoF} ago`
        : `${formatDate(call.receivedTime)}`
    }, Priority ${call.priority}, ${
      call.onView === "Y"
        ? "SFPD officer observed"
        : call.responseTime
        ? `SFPD response time: ${responseTimeF}`
        : dispatchedTimeAgoF
        ? `SFPD dispatched ${dispatchedTimeAgoF} ago`
        : call.enteredTime
        ? `call entry in SFPD queue ${call.enteredTimeAgo} ago`
        : "call received by SFPD"
    }${
      disposition ? `, ${disposition.toLowerCase()}` : ""
    } https://urbanitesf.netlify.app/?cad=${call.cadNumber}`;

    // Create text message / iMessage content from call data
    const textMessageContent = `"${call.callTypeFormatted} at ${
      call.properCaseAddress
    } in ${call.neighborhoodFormatted} ${receivedTimeAgoF} ago, ${
      call.onView === "Y"
        ? "officer observed"
        : call.responseTime
        ? `SFPD response time: ${responseTimeF}`
        : dispatchedTimeAgoF
        ? `dispatched ${dispatchedTimeAgoF} ago`
        : call.enteredTime
        ? `call entry in queue ${call.enteredTimeAgo} ago`
        : "call received"
    }${
      disposition ? `, ${disposition.toLowerCase()}` : ""
    }" via https://urbanitesf.netlify.app/?cad=${call.cadNumber}`;

    // Create call circle marker pop-up content
    const popupContent = `
  <div>
    <b>${call.callTypeFormatted}</b>
    \u2022 ${receivedTimeAgoF} <a href="sms:&body=${encodeURIComponent(
      textMessageContent
    )}">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IMessage_logo.svg/20px-IMessage_logo.svg.png" alt="iMessage / text" style=" height:20px; position: absolute; bottom: 0px; left: calc(50% - 27px); transform: translate(-50%, -50%);">
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
    // Get the call latitude / longitude coordinates
    let callLatlng = [
      Number(call.coords.coordinates[1]),
      Number(call.coords.coordinates[0]),
    ];

    // Offset the call if it overlaps with another below it
    if (callsLayer) {
      callsLayer.eachLayer(function (layer) {
        if (layer.getLatLng().equals(callLatlng)) {
          callLatlng[0] += overlapOffset;
        }
      });
    }

    // Generat the marker data
    let markerData = {
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
      responseTimeExact: call.responseTimeExact,
      address: call.properCaseAddress,
      callType: call.callTypeFormatted,
      receivedTimeAgo: Math.round(call.receivedTimeAgo),
      receivedTimeAgoExact: call.receivedTimeAgo,
      // callTypeCode: call.callTypeCode,
      // desc: call.desc,
      onView: call.onView,
      priority: call.priority,
    };

    // Add the icon or circle marker
    // Dispatched but not on-scene yet
    let recentlyDispatched =
      isNaN(call.responseTime) &&
      (call.dispatchedTimeAgo <= 120 ||
        (call.priority === "B" && call.dispatchedTimeAgo <= 180) ||
        (call.priority === "A" && call.dispatchedTimeAgo <= 500));

    // Recently arrived on-scene
    let onSceneTimeAgo = call.receivedTimeAgo - call.responseTime;
    let recentlyResponded =
      isFinite(call.responseTime) &&
      (onSceneTimeAgo < 20 ||
        (call.priority === "B" && onSceneTimeAgo < 40) ||
        (call.priority === "A" && onSceneTimeAgo < 60));

    // Create content for recent calls
    if (recentlyDispatched || recentlyResponded) {
      let emojiIcon = "";
      let popupContentResponding = "";
      if (recentlyDispatched) {
        emojiIcon = "🚨";
        popupContentResponding =
          "<i><span class='response-marker-popup-text'>~~Currently Responding~~</span></i>" +
          popupContent;
      } else {
        emojiIcon = "🚓";
        popupContentResponding =
          "<i><span class='response-marker-popup-text'>~~Recently On-Scene~~</span></i>" +
          popupContent;
        L.circle(callLatlng, onSceneCircleOpt).addTo(respCircleLayer);
      }

      // If SFPD still responding, use a police car emoji instead of a circle marker
      let respondingIcon = L.divIcon({
        className: "response-marker",
        html: emojiIcon,
        iconSize: [30, 30],
      });

      // Edit the pop-up content to mention SFPD is responding
      L.marker(callLatlng, {
        icon: respondingIcon,
        keepInView: false,
        fillColor: colorMap.get(call.call_type) || "#0000000",
        data: markerData,
        autoPan: false,
        closeOnClick: false,
        interactive: true,
        bubblingMouseEvents: false,
      })
        .bindPopup(popupContentResponding, {
          closeButton: false,
          disableAnimation: true,
          autoPan: false,
          // className: "station-popup",
        })
        .addTo(callsLayer);
    } else {
      // Create a new circle marker with the combined call data
      L.circleMarker(callLatlng, {
        radius: window.innerWidth <= 758 ? 6 : 6,
        keepInView: false,
        fillColor: colorMap.get(call.call_type) || "#0000000",
        color: "#333333",
        weight: 1,
        opacity: 0.6,
        fillOpacity: 0.9,
        data: markerData,
        autoPan: false,
        closeOnClick: false,
        interactive: true,
        bubblingMouseEvents: false,
      })
        .bindPopup(popupContent, {
          closeButton: false,
          disableAnimation: true,
        })
        .addTo(callsLayer);
    }
    // Add the circle marker to the calls layer
    // Possible future work with notifications:
    // if (call.callTypeFormatted === "Shooting") {
    //   //send Notification
    // }
  });
  return [callsLayer, respCircleLayer];
}
