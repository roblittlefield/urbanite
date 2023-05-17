const getPosition = function (defaultMapSF) {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Calculate expanded bounds
          const expandedMinLatitude = 37.6398 - 0.0045;
          const expandedMaxLatitude = 37.9298 + 0.0045;
          const expandedMinLongitude = -123.1738 - 0.0045;
          const expandedMaxLongitude = -122.2815 + 0.0045;

          // Check if latitude and longitude are outside expanded SF bounds
          if (
            latitude < expandedMinLatitude ||
            latitude > expandedMaxLatitude ||
            longitude < expandedMinLongitude ||
            longitude > expandedMaxLongitude
          ) {
            alert(`Looks like you're outside San Francisco, loading city center.`)
            reject(new Error("Location outside expanded SF bounds"));
          } else {
            resolve([latitude, longitude]);
          }
        },
        () => {
          alert(`Couldn't find your location, loading San Francisco`)
          resolve(defaultMapSF); // Use the default position if geolocation fails
        }
        );
      } else {
      alert(`Couldn't find your location, loading San Francisco`)
      resolve(defaultMapSF); // Use the default position if geolocation is not supported
    }
  });
};

export default getPosition;

