import { centerPopupTolerance } from "../config.js";
let currentPopup = null;
let isPopupOpen = false;
// let aaT = true;

// export function sH(v) {
//   aaT = v;
// }

/**
 * Add a handler to move the center of the map based on the location of markers and open popups.
 *
 * @param {L.LayerGroup} callsLayer - The layer group containing markers to be used for centering the map.
 * @param {L.Map} map - The Leaflet map instance to which the handler is added.
 */
export const addHandlerMoveCenter = function (callsLayer, map) {
  let timer = null;
  // let lineTimer = null;
  // let popupAffTimer = null;
  map.on("move", () => {
    document.querySelectorAll(".vert-line").forEach(function (el) {
      el.classList.add("hidden");
    });
    // Check if the 'moving' flag is set; if true, exit the function
    if (moving) return;
    // clearTimeout(lineTimer);
    // lineTimer = setTimeout(() => {
    //   document.querySelectorAll(".vert-line").forEach(function (el) {
    //     el.classList.remove("hidden");
    //   });
    // }, 3000);

    // // Popup Affiliate
    // clearTimeout(popupAffTimer);
    // if (!aaT) {
    //   const popupElements = document.querySelectorAll(".affiliate-popup");
    //   popupElements.forEach((el) => (el.style.display = "none"));
    // }

    // popupAffTimer = setTimeout(() => {
    //   document.querySelector(".affiliate-popup").classList.add("hidden");
    // }, 2800);
    // // End Popup Affiliate

    // Clear any previously scheduled timer to avoid rapid execution
    clearTimeout(timer);
    timer = setTimeout(() => {
      // Get the dimensions of the map
      const { x, y } = map.getSize();

      // Calculate the center of the map
      const centerX = x / 2;
      const centerY = y / 2 + 50;

      // Initialize variables to find the closest marker
      let minDistance = Infinity;
      let closestCoords = null;

      // Iterate over each layer in 'callsLayer'
      callsLayer.eachLayer((layer) => {
        // Extract latitude and longitude from the marker's _latlng property
        const lat = layer._latlng.lat;
        const lng = layer._latlng.lng;
        const latlng = [lat, lng];

        // Convert the marker's latitude and longitude to screen coordinates
        const { x: markerX, y: markerY } = map.latLngToContainerPoint(latlng);

        // Calculate the distance between the marker and the map center
        const distance = Math.sqrt(
          Math.pow(markerX - centerX, 2) + Math.pow(markerY - centerY, 2)
        );

        // Update 'minDistance' and 'closestCoords' if the current marker is closer
        if (distance < minDistance) {
          minDistance = distance;
          closestCoords = [markerX, markerY];
        }
      });

      // Check if the closest marker is within a tolerance of the map center
      if (minDistance <= centerPopupTolerance) {
        callsLayer.eachLayer((layer) => {
          if (layer instanceof L.CircleMarker || layer instanceof L.Marker) {
            // Convert the marker's latitude and longitude to screen coordinates
            const { x: markerX, y: markerY } = map.latLngToContainerPoint(
              layer.getLatLng()
            );
            // Check if the marker's screen coordinates are close to the closest marker's coordinates
            if (
              Math.abs(markerX - closestCoords[0]) < 1e-6 &&
              Math.abs(markerY - closestCoords[1]) < 1e-6
            ) {
              if (!isPopupOpen && currentPopup !== layer) {
                layer.openPopup();
                isPopupOpen = true;
                currentPopup = layer;
              }
              // Get the 'neighborhood', 'tweetContent' and 'Text Messsage Content' data from the marker's options
              const { neighborhood, callTweetContent, callMessageContent } =
                layer.options.data;
              document.getElementById("neighborhood-text").textContent =
                neighborhood;
              document.getElementById("tweet-content").textContent =
                callTweetContent;
              document.getElementById("text-message-content").textContent =
                callMessageContent;
            } else if (currentPopup === layer) {
              // Close the popup if it's already open
              isPopupOpen = false;
              layer.closePopup();
            }
          }
        });
      } else {
        // If no marker is close to the center, close all popups
        callsLayer.eachLayer((layer) => {
          if (layer instanceof L.CircleMarker) {
            layer.closePopup();
          }
        });
      }
    }, 5);
  });
};
