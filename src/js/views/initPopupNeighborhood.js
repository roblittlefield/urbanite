import { toggleVisibleItems, toggleVisibleList } from "./buttonsView.js";
import { fetchHistData } from "../model.js";
import {
  formatDate,
  minsHoursFormat,
  textProperCase,
  neighborhoodFormat,
} from "../helpers.js";
import { addHandlerMoveCenter } from "./moveCenter.js";
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
  console.log(urlCAD);
  let liveDataIncludesCAD = false;
  if (urlCAD) {
    if (/^\d{9,10}$/.test(urlCAD) && parseInt(urlCAD, 10) > 100000000) {
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
          layer.openPopup();
          const { neighborhood, callTweetContent, callMessageContent } =
            layer.options.data;
          document.getElementById("neighborhood-text").textContent =
            neighborhood;
          document.getElementById("tweet-content").textContent =
            callTweetContent;
          document.getElementById("text-message-content").textContent =
            callMessageContent;
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
            document.getElementById(
              "tweet-content"
            ).textContent = `${incident_descHist} at ${addressHist} in ${neighborhoodHist} ${
              receivedTimeAgo <= 6
                ? `${receivedTimeAgoF} ago`
                : `${formatDate(receivedTimeAgo)}`
            }${
              resolutionHist
                ? resolutionHist === "Open or Active"
                  ? ""
                  : `<br>${resolutionHist}`
                : ""
            } SFPDcalls.com/${cad_numberHist}`;

            // Create text message / iMessage content based on historical call data
            document.getElementById(
              "text-message-content"
            ).textContent = `"${incident_descHist} at ${addressHist} in ${neighborhoodHist} ${receivedTimeAgo} ago${
              resolutionHist
                ? resolutionHist === "Open or Active"
                  ? ""
                  : `, ${resolutionHist}`
                : ""
            }, Case #${cad_numberHist}" SFPDcalls.com/${cad_numberHist}`;

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
      showAlert(`Not a CAD number.`);
      window.location.href = "https://SFPDcalls.com/";
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
// Export a function called closestZoom that takes 'position' and 'callsLayer' as parameters
export const closestZoom = function (position, callsLayer) {
  // Initialize 'minDistance' to positive infinity and 'nearestMarker' to null
  let minDistance = Infinity;
  let nearestMarker = null;

  // Iterate over each layer in 'callsLayer'
  callsLayer.eachLayer((layer) => {
    // Check if the current layer is an instance of a CircleMarker
    if (layer instanceof L.CircleMarker) {
      // Get the latitude and longitude of the current layer
      const latLng = layer.getLatLng();

      // Calculate the distance between 'position' and the current marker's position
      const distance = Math.sqrt(
        Math.pow(
          position[0] -
            (latLng.lat + (window.innerWidth <= 450 ? 0.004 : 0.002)),
          2
        ) + Math.pow(position[1] - latLng.lng, 2)
      );

      // Update 'minDistance' and 'nearestMarker' if the current marker is closer
      if (distance < minDistance) {
        minDistance = distance;
        nearestMarker = layer;
      }
    }
  });

  // Iterate over each layer in 'callsLayer' again
  callsLayer.eachLayer((layer) => {
    // Check if the current layer is an instance of a CircleMarker
    if (layer instanceof L.CircleMarker) {
      // Check if the current layer is the nearest marker found earlier
      if (layer === nearestMarker) {
        // Set a flag 'moving' to true and schedule it to be reset to false after 2 seconds
        moving = true;
        setTimeout(() => {
          moving = false;
        }, 2000);

        // Open a popup for the nearest marker
        layer.openPopup();

        // Get the 'neighborhood', 'tweetContent' and 'Text Messsage Content' data from the marker's options
        const { neighborhood, callTweetContent, callMessageContent } =
          layer.options.data;
        document.getElementById("neighborhood-text").textContent = neighborhood;
        document.getElementById("tweet-content").textContent = callTweetContent;
        document.getElementById("text-message-content").textContent =
          callMessageContent;
      } else {
        // If the current layer is not the nearest marker, close its popup
        layer.closePopup();
      }
    }
  });
};
