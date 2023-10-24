import { STATION_LOCATIONS, STATION_NAMES } from "../config.js";

export default function addStations(map) {
  STATION_LOCATIONS.forEach((station, index) => {
    let popupContent = `${STATION_NAMES[index]}`;
    let stationIcon = L.divIcon({
      className: "station-marker",
      html: "👮",
      iconSize: [30, 30],
    });
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
