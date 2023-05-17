const displayNearestMarkerPopup = (position, police48Layer) => {
  let minDistance = Infinity;
  let nearestMarker = null;
  console.log(position);
  console.log(police48Layer);

  police48Layer.eachLayer((layer) => {
    if (layer instanceof L.CircleMarker) {
      const latLng = layer.getLatLng();
      const distance = Math.sqrt(
        Math.pow(position[0] - latLng.lat, 2) +
          Math.pow(position[1] - latLng.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        console.log(minDistance);
        nearestMarker = layer;
        console.log(nearestMarker);
      }
    }
  });

  police48Layer.eachLayer((layer) => {
    if (layer instanceof L.CircleMarker) {
      if (layer === nearestMarker) {
        layer.openPopup();
        // layer.fire("click");
        const { neighborhood } = layer.options.data;
            const neighborhoodText =
              document.getElementById("neighborhood-text");
            neighborhoodText.textContent = neighborhood;
      }
      else {
        layer.closePopup();
      }
    }
  });
};

export default displayNearestMarkerPopup;
