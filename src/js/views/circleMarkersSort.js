import { latestNumber } from "../config.js";

const sortMarkers = function (layer) {
  let total = 0;
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

  const count = latestMarkers.reduce((total, marker) => {
    console.log(marker.options.data.timeAgo);
    if (marker.options.data.timeAgo <= 120) {
      return total + 1;
    }
    return total;
  }, 0);
  console.log(count);

  return { latestMarkers, count };
};

export default sortMarkers;
