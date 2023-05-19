const initPopupNieghborhood = (position, police48Layer) => {
  let minDistance = Infinity;
  let nearestMarker = null;

  police48Layer.eachLayer((layer) => {
    if (layer instanceof L.CircleMarker) {
      const latLng = layer.getLatLng();
      const distance = Math.sqrt(
        Math.pow(position[0] - latLng.lat, 2) +
          Math.pow(position[1] - latLng.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestMarker = layer;
      }
    }
  });

  police48Layer.eachLayer((layer) => {
    if (layer instanceof L.CircleMarker) {
      if (layer === nearestMarker) {
        layer.openPopup();
        const { neighborhood } = layer.options.data;
        const neighborhoodText = document.getElementById("neighborhood-text");
        neighborhoodText.textContent = neighborhood;
      } else {
        layer.closePopup();
      }
    }
  });
};

export default initPopupNieghborhood;
