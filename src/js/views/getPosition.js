const getPosition = function (defaultMapSF) {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(position);
          const { latitude, longitude } = position.coords;
          resolve([latitude, longitude]);
        },
        () => {
          resolve(defaultMapSF); // Use the default position if geolocation fails
        }
      );
    } else {
      resolve(defaultMapSF); // Use the default position if geolocation is not supported
    }
  });
};

export default getPosition;

// Handling clicks on map
// this.#map.on('click', this._showForm.bind(this));
