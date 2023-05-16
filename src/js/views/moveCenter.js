const addHandlerMoveCenter = function (map) {
  map.on("move", () => {
    // Get the center coordinates of the viewer's window
    const { x, y } = map.getSize();
    const centerX = x / 2;
    const centerY = y / 2;

    // Calculate the distance between the center coordinates and circle markers
    let minDistance = Infinity;
    let closestMarker = null;

    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        const { x: markerX, y: markerY } = map.latLngToContainerPoint(
          layer.getLatLng()
        );
        const distance = Math.sqrt(
          Math.pow(markerX - centerX, 2) + Math.pow(markerY - centerY, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestMarker = layer;
        }
      }
    });

    // Open the popup of the closest marker and close others
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        if (layer === closestMarker) {
          layer.openPopup();
        } else {
          layer.closePopup();
        }
      }
    });
  });
};
export default addHandlerMoveCenter;
