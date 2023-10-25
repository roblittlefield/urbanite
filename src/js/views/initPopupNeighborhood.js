import { toggleVisibleItems, toggleVisibleList } from "./buttonsView.js";
import { fetchHistData } from "../model.js";
import {
  formatDate,
  minsHoursFormat,
  textProperCase,
  neighborhoodFormat,
} from "../helpers.js";
import addHandlerMoveCenter from "./moveCenter.js";
import { showAlert } from "./getPosition.js";

/**
 * Initialize the neighborhood popup based on a specified CAD number or nearby location.
 *
 * @param {number[]} position - The position (latitude, longitude) on the map.
 * @param {L.LayerGroup} callsLayer - The layer group containing police data markers.
 * @param {string} urlCAD - The CAD (Computer-Aided Dispatch) number for the incident (if available).
 * @param {L.Map} map - The Leaflet map instance.
 */
export const initPopupNieghborhood = (position, callsLayer, urlCAD, map) => {
  const now = Date.now();
  let liveDataIncludesCAD = false;
  if (urlCAD) {
    // Check if the CAD number exists in the live data
    callsLayer.eachLayer((layer) => {
      if (layer.options.data.cadNumber === urlCAD) {
        liveDataIncludesCAD = true;

        // Check the list view in local storage and toggle items accordingly
        if (
          localStorage.getItem("openList") === "nearby" ||
          localStorage.getItem("openList") === "allSF"
        ) {
          toggleVisibleItems();
          toggleVisibleList();
        }

        // Open the popup, trigger map movement, and set the neighborhood
        layer.openPopup();
        moving = true;
        setTimeout(() => {
          moving = false;
        }, 3000);
        map.flyTo(layer.getLatLng(), 15);
        addHandlerMoveCenter(callsLayer, map);
        const { neighborhood } = layer.options.data;
        const neighborhoodText = document.getElementById("neighborhood-text");
        neighborhoodText.textContent = neighborhood;
        layer.openPopup();
      }
    });
    if (!liveDataIncludesCAD) {
      (async () => {
        try {
          // Fetch historical data for the specified CAD number
          const dataHistbyCAD = await fetchHistData(urlCAD);

          // If historical data exists, display it
          dataHistbyCAD[0] ??
            showAlert(`Call pending DataSF archive entry, try later`);
          const coordsHist = [
            Number(dataHistbyCAD[0].latitude),
            Number(dataHistbyCAD[0].longitude),
          ];
          dataHistbyCAD[coordsHist.coordinates] = coordsHist;
          const cad_numberHist = dataHistbyCAD[0].cad_number;
          const received_datetimeHist = new Date(
            dataHistbyCAD[0].incident_datetime
          );
          const receivedTimeAgo = Math.round(
            (now - received_datetimeHist) / 60000
          );
          const receivedTimeAgoF = minsHoursFormat(receivedTimeAgo);
          const incident_descHist = dataHistbyCAD[0].incident_description;
          const neighborhoodHist = neighborhoodFormat(
            dataHistbyCAD[0].analysis_neighborhood
          );
          const addressHist = textProperCase(dataHistbyCAD[0].intersection);
          const resolutionHist = dataHistbyCAD[0].resolution;

          // Create Twitter message content based on historical call data
          const tweetContent = `${incident_descHist} at ${addressHist} in ${neighborhoodHist} ${
            receivedTimeAgo <= 6
              ? `${receivedTimeAgoF} ago`
              : `${formatDate(receivedTimeAgo)}`
          }${
            resolutionHist
              ? resolutionHist === "Open or Active"
                ? ""
                : `<br>${resolutionHist}`
              : ""
          } https://urbanitesf.netlify.app/?cad=${cad_numberHist}`;

          // Create text message / iMessage content based on historical call data
          const textMessageContent = `"${incident_descHist} at ${addressHist} in ${neighborhoodHist} ${receivedTimeAgo} ago${
            resolutionHist
              ? resolutionHist === "Open or Active"
                ? ""
                : `, ${resolutionHist}`
              : ""
          }, Case #${cad_numberHist}" https://urbanitesf.netlify.app/?cad=${cad_numberHist}`;

          // Create Leaflet marker pop-up content based on historical call data
          const popupContent = `
          <div>
            <b>${incident_descHist}</b>
            \u2022 ${receivedTimeAgoF} 
            <br>${formatDate(received_datetimeHist)}
            <br>${addressHist}
            <br>Case #<a href="https://data.sfgov.org/resource/wg3w-h783.json?cad_number=${cad_numberHist}" target="_blank">${cad_numberHist}</a>
            ${
              resolutionHist
                ? resolutionHist === "Open or Active"
                  ? ""
                  : `<br>${resolutionHist}`
                : ""
            }<br>(Archived call)
            <a href="sms:&body=${encodeURIComponent(textMessageContent)}">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IMessage_logo.svg/20px-IMessage_logo.svg.png" alt="iMessage / text" style="height:20px; position: absolute; bottom: 0px; left: calc(50% - 27px); transform: translate(-50%, -50%);">
              </a>
              <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(
                tweetContent
              )}" target="_blank">
              <img src="https://icons.iconarchive.com/icons/xenatt/the-circle/256/App-Twitter-icon.png" alt="Twitter Bird Icon" style=" height: 22px; position: absolute; bottom: 0px; left: calc(50% + 25px); transform: translate(-50%, -50%);">
              </a>
              </div>
      `;
          // Create an ad-hoc circle marker for the historical call, incluidng pop-up content
          const markerHist = L.circleMarker(coordsHist, {
            radius: window.innerWidth <= 758 ? 3 : 4,
            keepInView: false,
            fillColor: "#98f5e1",
            color: "#333333",
            weight: 1,
            opacity: 0.6,
            fillOpacity: 0.9,
            data: {
              cadNumber: cad_numberHist,
              disposition: resolutionHist,
              neighborhood: neighborhoodHist,
              receivedTime: formatDate(received_datetimeHist),
              address: addressHist,
              callType: incident_descHist,
              receivedTimeAgo: receivedTimeAgo,
            },
            autoPan: false,
            closeOnClick: false,
            interactive: false,
            bubblingMouseEvents: false,
          }).bindPopup(popupContent, {
            closeButton: false,
            disableAnimation: true,
          });
          markerHist.addTo(callsLayer);
          callsLayer.addTo(map);
          moving = true;
          setTimeout(() => {
            moving = false;
          }, 3000);
          map.flyTo(coordsHist, 15);
          addHandlerMoveCenter(callsLayer, map);
          markerHist.openPopup();
        } catch (error) {
          console.log(error);
        }
      })();
    }
  } else {
    // If no archived historical call found, just popup the closest call to position (map center)
    closestZoom(position, callsLayer);
    addHandlerMoveCenter(callsLayer, map);
  }
};

/**
 * Find and zoom to the closest marker in the given layer group to a specified position.
 *
 * @param {number[]} position - The position (latitude, longitude) to find the closest marker to.
 * @param {L.LayerGroup} callsLayer - The layer group containing markers to search for the closest one.
 */
export const closestZoom = function (position, callsLayer) {
  let minDistance = Infinity;
  let nearestMarker = null;
  callsLayer.eachLayer((layer) => {
    if (layer instanceof L.CircleMarker) {
      const latLng = layer.getLatLng();
      const distance = Math.sqrt(
        Math.pow(position[0] - latLng.lat, 2) +
          Math.pow(position[1] - latLng.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestMarker = layer;
      }
    }
  });

  callsLayer.eachLayer((layer) => {
    if (layer instanceof L.CircleMarker) {
      if (layer === nearestMarker) {
        moving = true;
        setTimeout(() => {
          moving = false;
        }, 2000);
        layer.openPopup();
        const { neighborhood } = layer.options.data;
        const neighborhoodText = document.getElementById("neighborhood-text");
        neighborhoodText.textContent = neighborhood;
      } else {
        layer.closePopup();
      }
    }
  });
};
