import latestNumber from "../config.js";
const sortMarkers = function (layerGroups) {
  // Get all of the circle markers from the layer groups
  const allMarkers = Object.values(layerGroups).flatMap((layer) =>
    layer.getLayers()
  );

  // Sort the valid markers by receivedTime in descending order and take the first 15
  const latestMarkers = allMarkers
    .sort(
      (a, b) =>
        new Date(b.options.data.receivedTimeCalc).getTime() -
        new Date(a.options.data.receivedTimeCalc).getTime()
    )
    .slice(0, latestNumber);
  return latestMarkers;

  //   Set the latestCircleMarkers array to the sorted markers
  // this.#latestCircleMarkers = latestMarkers;
  //   this._updateCallList();
};

export default sortMarkers;
