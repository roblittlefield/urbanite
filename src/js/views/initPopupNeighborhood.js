import { toggleVisibleItems } from "./buttonsView.js";

const initPopupNieghborhood = (position, police48Layer, urlCAD, map) => {
  let minDistance = Infinity;
  let nearestMarker = null;

  const closestZoom = function () {
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
  if (urlCAD) {
    police48Layer.eachLayer((layer) => {
      if (layer.options.data.cadNumber === urlCAD) {
        toggleVisibleItems();
        layer.openPopup();
        map.flyTo(layer.getLatLng(), 15);
        const { neighborhood } = layer.options.data;
        const neighborhoodText = document.getElementById("neighborhood-text");
        neighborhoodText.textContent = neighborhood;
      }
    });
  } else {
    closestZoom();
  }
};

export default initPopupNieghborhood;
