import { latestNumber } from "../config.js";

const sortMarkers = function (layer, timeElap) {
  let total = 0;
  const markers = Array.from(layer.getLayers()).filter(
    (layer) => layer instanceof L.CircleMarker
  );
  const latestMarkers = markers
    .sort(
      (a, b) => a.options.data.receivedTimeAgo - b.options.data.receivedTimeAgo
    )
    .slice(0, latestNumber);

  const count = latestMarkers.reduce((total, marker) => {
    if (marker.options.data.receivedTimeAgo <= timeElap) {
      return total + 1;
    }
    return total;
  }, 0);
  return { latestMarkers, count };
};

export default sortMarkers;
