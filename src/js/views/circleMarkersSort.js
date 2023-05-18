import { latestNumber } from "../config.js";

const sortMarkers = function (layer) {
  const markers = Array.from(layer.getLayers()).filter(
    (layer) => layer instanceof L.CircleMarker
  );

  const latestMarkers = markers
    .sort(
      (a, b) =>
        new Date(b.options.data.receivedTimeCalc).getTime() -
        new Date(a.options.data.receivedTimeCalc).getTime()
    )
    .slice(0, latestNumber);
  return latestMarkers;
};

export default sortMarkers;
