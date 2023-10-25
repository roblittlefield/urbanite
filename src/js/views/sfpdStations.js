import { STATION_LOCATIONS, STATION_NAMES } from "../config.js";

/**
 * Adds police station markers to the map.
 *
 * @param {L.Map} map - The Leaflet map object to which the police station markers will be added.
 */
export default function addStations(map) {
  // Go through station locations and get the lat/long coordinates for each station
  STATION_LOCATIONS.forEach((station, index) => {
    let popupContent = `${STATION_NAMES[index]}`;
    let stationIcon = L.divIcon({
      className: "station-marker",
      html: "👮",
      iconSize: [30, 30],
    });

    // Create a custom marker, add the popup content (station name and phone number), add to the map
    L.marker([station[0], station[1]], {
      icon: stationIcon,
    })
      .bindPopup(popupContent, {
        closeButton: false,
        disableAnimation: true,
        autoPan: false,
        className: "station-popup",
      })
      .addTo(map);
  });
}
