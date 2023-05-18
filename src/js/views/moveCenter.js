const addHandlerMoveCenter = function (data, police48Layer, map) {
  let timer = null;
  map.on("move", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const { x, y } = map.getSize();
      const centerX = x / 2;
      const centerY = y / 2;

      let minDistance = Infinity;
      let closestCoords = null;

      data.forEach((call) => {
        const lat = call.coords.coordinates[1];
        const lng = call.coords.coordinates[0];
        const latlng = [lat, lng];
        const { x: markerX, y: markerY } = map.latLngToContainerPoint(latlng);
        const distance = Math.sqrt(
          Math.pow(markerX - centerX, 2) + Math.pow(markerY - centerY, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestCoords = [markerX, markerY];
        }
      });

      if (minDistance <= 200) {
        police48Layer.eachLayer((layer) => {
          if (layer instanceof L.CircleMarker) {
            const { x: markerX, y: markerY } = map.latLngToContainerPoint(
              layer.getLatLng()
            );

            if (
              Math.abs(markerX - closestCoords[0]) < 1e-6 &&
              Math.abs(markerY - closestCoords[1]) < 1e-6
            ) {
              layer.openPopup();
              const { neighborhood } = layer.options.data;
              const neighborhoodText =
                document.getElementById("neighborhood-text");
              neighborhoodText.textContent = neighborhood;
            } else {
              layer.closePopup();
            }
          }
        });
      } else {
        police48Layer.eachLayer((layer) => {
          if (layer instanceof L.CircleMarker) {
            layer.closePopup();
          }
        });
      }
    }, 5); // Delay of 5 ms
  });
};

export default addHandlerMoveCenter;
