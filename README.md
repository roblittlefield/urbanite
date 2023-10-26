# Urbanite SF

Live Link: https://urbanitesf.netlify.app

[![Netlify Status](https://api.netlify.com/api/v1/badges/8577fd5c-0a26-4efa-85cb-69155c7204d5/deploy-status)](https://app.netlify.com/sites/urbanitesf/deploys)

## Press Mentions

- [The Marina Times](https://twitter.com/TheMarinaTimes/status/1665401741821595649) - June 4, 2023

## Application Description

Urbanite SF is a San Francisco law enforcement dispatched calls for service incident mapping web application. Built as a lightweight & straightforward alternative to other incident mapping apps with pay-walls and ads, Urbanite SF additionally provides call priority, status, exact response time, and CAD ID #. No user data is stored. The application was developed by Rob Littlefield.

## Features

- **Explore Different Neighborhoods**: Navigate the map to access calls in various neighborhoods.
- **Identify Police Stations**: Locate San Francisco Police Station positions marked on the map.
- **Neighborhood Indicator**: Find out the neighborhood of each call at the bottom of the screen.
- **Call Details and Response Times**: Review call details, including response times.
- **Customize Map Style**: Personalize your map by changing its appearance.
- **Weather and Nearby Calls**: Share your location to view local weather and nearby calls. If not in San Francisco or if location sharing is disabled, get an overview of San Francisco's current weather and recent city-wide call count.
- **Browse Recent Calls**: Access a list of the latest calls in San Francisco, or narrow it down to calls in your vicinity.
- **Share Easily**: Share links with others through Twitter or Text Messages / iMessages.
- **Frequent Updates**: Stay up to date with fresh data as the map refreshes every 10 minutes.
- **Data Accessibility**: Access call data even when DataSF archives calls after 48 hours.

## Components

Urbanite SF was written using vanilla JavaScript. Includes "live" Police data, which is delayed 10 minutes and filtered for sensitive information.

## Future Work

- ~~Add median response times by neighborhood~~
- ~~Twitter/X bot in Python / Google Cloud Functions for severe calls~~ [@SFPDcallsBot](https://twitter.com/SFPDcallsBot)
- ~~Twitter/X bot in Python / Google Cloud Functions for call breakings~~ [@SFbippinBot](https://twitter.com/SFbippinBot)
- ~~Add Police Stations to map~~
- Add historic calls on map upon zoom-in
- Add historic Fire Dept calls

## Code

### Loading Leaflet Map

The root site opens to a map in the center of San Francisco, provided by Leaflet. This is the default load location. The app looks to see if the user has a map skin preference saved in local storage, and if so, loads that map skin tile layer. If not, the app looks to see if the browser is in light or dark mode, and then loads the light or dark map skin tile layer accordingly.

```javascript
/**
 * Initializes the map by creating a Leaflet map, setting its view, and adding layers.
 * @async
 * @function controlMap
 * @param {number} delay - The delay in milliseconds for stations to add to map.
 * @returns {L.Map} The Leaflet map instance.
 * @throws {Error} If an error occurs during map initialization.
 */
const controlMap = async function () {
  try {
    // Get the original position and zoom level
    originalPosition = sfapi.getLatLngSF();
    originalZoom = sfapi.getMapZoomLevel();

    // Remove any existing map
    if (map) map.remove();

    // Create a new Leaflet map and set its view
    map = L.map("map").setView(originalPosition, originalZoom);

    // Remove all existing map layers
    map.eachLayer((layer) => {
      map.removeLayer(layer);
    });

    // Get the user preferred map layer from localStorage or use the default.
    const mapLayer = localStorage.getItem("map");

    // Determine which default map to use based on dark/light mode of browser.
    let initialMapLayer = window.matchMedia("(prefers-color-scheme: dark")
      .matches
      ? 1
      : 0;
    L.tileLayer(sfapi.MAP_LAYERS[mapLayer ? mapLayer : initialMapLayer]).addTo(
      map
    );

    // Prevent touchstart event propagation
    map.addEventListener("touchstart", function (e) {
      e.stopPropagation();
    });

    // Get weather information for the original position
    getWeather(originalPosition);

    // Add stations to the map after 2 seconds
    setTimeout(function () {
      addStations(map);
    }, 1100);

    // Return the created map instance
    return map;
  } catch (err) {
    // If an error occurs, throw it
    throw err;
  }
};
```

### Accessing Data SF

After the map loads, the app calls the Data SF Real-Time Law Enforcement Dispatched Calls for Service API using a filter the excludes common calls types that are not of interest, such as noise nuisance. The application will retrieve up to 4,000 calls, although the typical range of calls retrieved usually falls between 750 and 1,000.

```javascript
// SFPD Real-Time calls base URL
const API_URL_POLICE_48h = "https://data.sfgov.org/resource/gnap-fj3t.json";

// List of excluded SFPD call types
const excludedCallTypes = [
  "PASSING CALL",
  "TRAF VIOLATION CITE",
  "TRAF VIOLATION TOW",
  "WELL BEING CHECK",
  "CITIZEN STANDBY",
  "MEET W/CITIZEN",
  "MEET W/CITY EMPLOYEE",
  "TRAFFIC HAZARD",
  "INVESTIGATION DETAIL",
  "TOW TRUCK",
  "COMPLAINT UNKN",
  "VEHICLE ALARM",
  "HOMELESS COMPLAINT",
  "PERSON DUMPING",
  "MISSING ADULT",
  "NOISE NUISANCE",
];

// SFPD Real-Time combined address for API call
const filterExpression = excludedCallTypes
  .map((callType) => `call_type_final_desc != '${callType}'`)
  .join(" and ");
export const API_URL_POLICE_48h_FILTERED = `${API_URL_POLICE_48h}?$where=${filterExpression} AND intersection_point IS NOT NULL&$$app_token=${SFDATA_API_KEY}&$limit=4000`;
```

### Controlling the Loading of Circle Markers, Buttons, Weather & Statistics

The app loads the rest of the functions, including the Leaflet markers, the site buttons, the weather, and the median response time statistics popup is calculated and generated. It also calls the addMoveCenter function, which causes the call closest to the center of the user's screen to open it's popup as the user moves around.

```javascript
/**
 * Controls the display of circle markers on the map, showing recent police calls.
 *
 * @async
 * @function controlCircleMarkers
 */
let callsLayer = "";
const controlCircleMarkers = async function () {
  try {
    // Remove any current Leaflet marker layers
    if (callsLayer) {
      map.removeLayer(callsLayer);
    }
    callsLayer = "";
    callsLayer = L.layerGroup();

    // Load time stamp on page
    loadLastUpdated();

    // Retrieve data from Data SF
    const responseSFPDAPI = await model.fetchApi(
      sfapi.API_URL_POLICE_48h_FILTERED
    );

    // Converto JSON data
    const dataSFPDraw = await responseSFPDAPI.json();

    // Process data and filter by included call types
    const dataResult = model.dataProcess(
      originalPosition,
      dataSFPDraw,
      sfapi.includedCallTypes,
      sfapi.PARAM_MAP_POLICE_48h
    );
    const data = dataResult.data;
    // Console log the number of calls
    console.log(`${data.length} calls`);

    // Add calls to map as circle markers
    callsLayer = addCircleMarkers(data, callsLayer);

    // Update call list popup with latest data
    document.getElementById("call-list").innerHTML = "";
    updateCallList(callsLayer, map, false);

    // Calculate median SFPD response time
    calcMedian();

    // Call count of calls specific time
    countContainer.textContent =
      dataResult.countCallsRecent.toString() +
      ` calls past ${sfapi.timeElapSF / 60}h`;
    callsLayer.addTo(map);

    // Load buttons and metrics if initial website load
    if (!initLoaded) {
      initPopupNieghborhood(originalPosition, callsLayer, urlCAD, map);
      loadLatestListButton(openCallList, closeAllPopups);
      loadNearbyListButton(loadNearbyCalls, openCallList, closeAllPopups);
      loadResponseTimesButton(closeAllPopups);
      loadCarBreakinsButton(controlCarBreakins);
      if (localStorage.getItem("openList") === "allSF")
        document.getElementById("latest-list-btn").click();
    } else {
      addHandlerMoveCenter(callsLayer, map);
      openPopup();
    }

    // If user location is known, update the nearby calls list
    if (initLoaded && position) loadNearbyCalls();

    // Mark the initial load as complete
    initLoaded = true;
  } catch (err) {
    // Catch any errors
    console.error(err);
  }
};
```

### Circle Markers Created using Calls Data

The app adds the law enforcement dispatched calls for service to the map as colored circle markers, as well as San Francisco Police Stations, denoted by '👮'. Each circle marker has popup content that is created and bound to the marker, including text message content and Tweet/X content.

```javascript
/**
 * Add circle markers to the Leaflet map based on provided data.
 *
 * @param {Array} data - An array of SFPD data to create circle markers from.
 * @param {L.LayerGroup} callsLayer - The layer group to which markers are added.
 * @returns {L.LayerGroup} The updated layer group with added markers.
 */
export function addCircleMarkers(data, callsLayer) {
  data.map((call) => {
    // Collecting all the time milestones: received time, response time, dispatched time ago, received time ago
    const receivedTimeF = formatDate(call.receivedTime);
    const responseTimeF = minsHoursFormat(call.responseTime);
    const dispatchedTimeAgoF = minsHoursFormat(call.dispatchedTimeAgo);
    const receivedTimeAgoF = minsHoursFormat(Math.round(call.receivedTimeAgo));

    // Collect call conclusion/disposition, if available yet
    const disposition =
      call.dispositionMeaning !== "" && call.dispositionMeaning !== "Unknown"
        ? `${call.dispositionMeaning}`
        : "";

    // Create Tweet / X message content from call data
    const tweetContent = `${call.callTypeFormatted} at ${
      call.properCaseAddress
    } in ${call.neighborhoodFormatted} ${
      call.receivedTimeAgo <= 6
        ? `${receivedTimeAgoF} ago`
        : `${formatDate(call.receivedTime)}`
    }, Priority ${call.priority}, ${
      call.onView === "Y"
        ? "SFPD officer observed"
        : call.responseTime
        ? `SFPD response time: ${responseTimeF}`
        : dispatchedTimeAgoF
        ? `SFPD dispatched ${dispatchedTimeAgoF} ago`
        : call.enteredTime
        ? `call entry in SFPD queue ${call.enteredTimeAgo} ago`
        : "call received by SFPD"
    }${
      disposition ? `, ${disposition.toLowerCase()}` : ""
    } https://urbanitesf.netlify.app/?cad=${call.cadNumber}`;

    // Create text message / iMessage content from call data
    const textMessageContent = `"${call.callTypeFormatted} at ${
      call.properCaseAddress
    } in ${call.neighborhoodFormatted} ${receivedTimeAgoF} ago, ${
      call.onView === "Y"
        ? "officer observed"
        : call.responseTime
        ? `SFPD response time: ${responseTimeF}`
        : dispatchedTimeAgoF
        ? `dispatched ${dispatchedTimeAgoF} ago`
        : call.enteredTime
        ? `call entry in queue ${call.enteredTimeAgo} ago`
        : "call received"
    }${
      disposition ? `, ${disposition.toLowerCase()}` : ""
    }" via https://urbanitesf.netlify.app/?cad=${call.cadNumber}`;

    // Create call circle marker pop-up content
    const popupContent = `
  <div>
    <b>${call.callTypeFormatted}</b>
    \u2022 ${receivedTimeAgoF} <a href="sms:&body=${encodeURIComponent(
      textMessageContent
    )}">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IMessage_logo.svg/20px-IMessage_logo.svg.png" alt="iMessage / text" style=" height:20px; position: absolute; bottom: 0px; left: calc(50% - 27px); transform: translate(-50%, -50%);">
    </a>
    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetContent
    )}" target="_blank">
    <img src="https://icons.iconarchive.com/icons/xenatt/the-circle/256/App-Twitter-icon.png" alt="Twitter Bird Icon" style=" height: 20px; position: absolute; bottom: 0px; left: calc(50% + 25px); transform: translate(-50%, -50%);">
    </a>
    <br>${call.properCaseAddress}
    <br>Priority ${
      call.priority
    } #<a href="https://data.sfgov.org/resource/gnap-fj3t.json?cad_number=${
      call.cadNumber
    }" target="_blank">${call.cadNumber}</a>
    ${
      call.onView === "Y"
        ? "<br>Officer observed"
        : call.responseTime
        ? `<br>Response time: ${responseTimeF}`
        : dispatchedTimeAgoF
        ? `<br>Dispatched ${dispatchedTimeAgoF} ago`
        : call.enteredTime
        ? `<br>Call entry in queue ${call.enteredTimeAgo} ago`
        : "<br>Call received"
    }<br>${disposition}
</div>
`;
    // Get the call latitude / longitude coordinates
    let callLatlng = [
      Number(call.coords.coordinates[1]),
      Number(call.coords.coordinates[0]),
    ];

    // Offset the call if it overlaps with another below it
    if (callsLayer) {
      callsLayer.eachLayer(function (layer) {
        if (layer.getLatLng().equals(callLatlng)) {
          callLatlng[0] += overlapOffset;
        }
      });
    }

    // Create a new circle marker with the combined call data
    const marker = L.circleMarker(callLatlng, {
      radius: window.innerWidth <= 758 ? 6 : 6,
      keepInView: false,
      fillColor: colorMap.get(call.call_type) || "#0000000",
      color: "#333333",
      weight: 1,
      opacity: 0.6,
      fillOpacity: 0.9,
      data: {
        cadNumber: call.cadNumber,
        disposition: call.dispositionMeaning,
        neighborhood: call.neighborhoodFormatted,
        receivedTime: receivedTimeF,
        enteredTimeAgo: call.enteredTimeAgo,
        dispatchedTimeAgoF: dispatchedTimeAgoF,
        responseTime: call.responseTime,
        responseTimeExact: call.responseTimeExact,
        address: call.properCaseAddress,
        callType: call.callTypeFormatted,
        receivedTimeAgo: Math.round(call.receivedTimeAgo),
        receivedTimeAgoExact: call.receivedTimeAgo,
        onView: call.onView,
        priority: call.priority,
      },
      autoPan: false,
      closeOnClick: false,
      interactive: true,
      bubblingMouseEvents: false,
    }).bindPopup(popupContent, {
      closeButton: false,
      disableAnimation: true,
    });

    // Add the circle marker to the calls layer
    marker.addTo(callsLayer);
  });
  return callsLayer;
}
```

### Add Police Stations to Map

```javascript
/**
 * Adds police station markers to the map.
 *
 * @param {L.Map} map - The Leaflet map object to which the police station markers will be added.
 */
export default function addStations(map) {
  // Go through station locations and get the lat/long coordinates for each station
  STATION_LOCATIONS.forEach((station, index) => {
    let popupContent = `${STATION_NAMES[index]}`;
    let stationIcon = L.divIcon({
      className: "station-marker",
      html: "👮",
      iconSize: [30, 30],
    });

    // Create a custom marker, add the popup content (station name and phone number), add to the map
    L.marker([station[0], station[1]], {
      icon: stationIcon,
    })
      .bindPopup(popupContent, {
        closeButton: false,
        disableAnimation: true,
        autoPan: false,
        className: "station-popup",
      })
      .addTo(map);
  });
}
```

### Move to Explore Other Calls

As the user navigates around the map using touch or a mouse, the circle marker that is closest to the X,Y center of the user's screen window is selected and its popup is opened to display the call details dynamically. With many calls in some neighborhoods, sometimes located very close to each other, this method of selecting calls makes fine tune call selection easy and intuitive.

```javascript
/**
 * Add a handler to move the center of the map based on the location of markers and open popups.
 *
 * @param {L.LayerGroup} callsLayer - The layer group containing markers to be used for centering the map.
 * @param {L.Map} map - The Leaflet map instance to which the handler is added.
 */
const addHandlerMoveCenter = function (callsLayer, map) {
  let timer = null;
  map.on("move", () => {
    // Check if the 'moving' flag is set; if true, exit the function
    if (moving) return;

    // Clear any previously scheduled timer to avoid rapid execution
    clearTimeout(timer);
    timer = setTimeout(() => {
      // Get the dimensions of the map
      const { x, y } = map.getSize();

      // Calculate the center of the map
      const centerX = x / 2;
      const centerY = y / 2;

      // Initialize variables to find the closest marker
      let minDistance = Infinity;
      let closestCoords = null;

      // Iterate over each layer in 'callsLayer'
      callsLayer.eachLayer((layer) => {
        // Extract latitude and longitude from the marker's _latlng property
        const lat = layer._latlng.lat;
        const lng = layer._latlng.lng;
        const latlng = [lat, lng];

        // Convert the marker's latitude and longitude to screen coordinates
        const { x: markerX, y: markerY } = map.latLngToContainerPoint(latlng);

        // Calculate the distance between the marker and the map center
        const distance = Math.sqrt(
          Math.pow(markerX - centerX, 2) + Math.pow(markerY - centerY, 2)
        );

        // Update 'minDistance' and 'closestCoords' if the current marker is closer
        if (distance < minDistance) {
          minDistance = distance;
          closestCoords = [markerX, markerY];
        }
      });

      // Check if the closest marker is within a tolerance of the map center
      if (minDistance <= centerPopupTolerance) {
        callsLayer.eachLayer((layer) => {
          if (layer instanceof L.CircleMarker) {
            // Convert the marker's latitude and longitude to screen coordinates
            const { x: markerX, y: markerY } = map.latLngToContainerPoint(
              layer.getLatLng()
            );
            // Check if the marker's screen coordinates are close to the closest marker's coordinates
            if (
              Math.abs(markerX - closestCoords[0]) < 1e-6 &&
              Math.abs(markerY - closestCoords[1]) < 1e-6
            ) {
              if (!isPopupOpen && currentPopup !== layer) {
                layer.openPopup();
                isPopupOpen = true;
                currentPopup = layer;
              }
              // Get the 'neighborhood' data from the marker's options
              const { neighborhood } = layer.options.data;
              const neighborhoodText =
                document.getElementById("neighborhood-text");
              neighborhoodText.textContent = neighborhood;
            } else if (currentPopup === layer) {
              // Close the popup if it's already open
              isPopupOpen = false;
              layer.closePopup();
            }
          }
        });
      } else {
        // If no marker is close to the center, close all popups
        callsLayer.eachLayer((layer) => {
          if (layer instanceof L.CircleMarker) {
            layer.closePopup();
          }
        });
      }
    }, 5);
  });
};
```

### Load Calls Nearby User

The 'Nearby' feature requests the user's location. Once permission is granted, it loads calls within a 500-meter radius of the user's location. A list of these calls is displayed, and a blue circle is added to the map, indicating the user's location and encompassing the relevant calls.

```javascript
// Load calls nearby user
let position;
let nearbyClicked = false;
const loadNearbyCalls = async function () {
  let [countCallsNearby, countCallsNearbyRecent] = [0, 0];
  try {
    // Get the user position if it does not exist yet
    if (!position) position = await getPosition();
    console.log(`finding calls near ${position}`);

    // Get the nearby weather
    getWeather(position);

    // Calculate distance from user to the calls
    let nearbyLayer = L.layerGroup();
    const positionLatLng = L.latLng(position[0], position[1]);
    callsLayer.eachLayer((marker) => {
      const distance = positionLatLng.distanceTo(marker.getLatLng());
      if (distance < sfapi.nearbyRadius) {
        countCallsNearby++;
        marker.addTo(nearbyLayer);
        if (marker.options.data.receivedTimeAgo <= sfapi.timeElapNearby) {
          countCallsNearbyRecent++;
        }
      }
    });
    countContainer.textContent =
      countCallsNearby.toString() +
      ` calls nearby, ` +
      countCallsNearbyRecent.toString() +
      ` past ${sfapi.timeElapNearby / 60}h`;

    // Open nearby call list
    if (!nearbyClicked) {
      const circle = L.circle(position, sfapi.nearbyCircleOpt).addTo(map);
      circle.getElement().style.pointerEvents = "none";
    }
    document.getElementById("alert").classList.add("hidden");
    updateCallList(nearbyLayer, map, true, openPopup);
    nearbyClicked = true;
  } catch (err) {
    throw err;
  }
};

// Close all Leaflet popups
const closeAllPopups = function () {
  map.eachLayer((layer) => {
    if (layer instanceof L.CircleMarker) {
      layer.closePopup();
    }
  });
};
```

```javascript
/**
 * Gets the user's geolocation and displays relevant messages.
 *
 * @returns {Promise<Array<number>} - A promise that resolves to an array with the user's latitude and longitude.
 * @throws {Error} - If the user's location is outside of San Francisco or if location access is denied.
 */
export const getPosition = async function () {
  showAlert(`Getting your location & loading nearby calls...`);
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // SF city bounds by latitude and longitude boundaries
          const expandedMinLatitude = 37.6398 - 0.0045;
          const expandedMaxLatitude = 37.9298 + 0.0045;
          const expandedMinLongitude = -123.1738 - 0.0045;
          const expandedMaxLongitude = -122.2815 + 0.0045;

          // Checking if user location is outside of SF
          if (
            latitude < expandedMinLatitude ||
            latitude > expandedMaxLatitude ||
            longitude < expandedMinLongitude ||
            longitude > expandedMaxLongitude
          ) {
            showAlert(`Nearby only works in San Francisco, sorry! 🌉`);
            reject(new Error("Location outside SF"));
          } else {
            resolve([latitude, longitude]);
          }
        },
        () => {
          showAlert(`Share your location to see nearby calls 🌉`);
          reject(new Error("Couldn't find position"));
        }
      );
    } else {
      showAlert(`Share your location to see nearby calls 🌉`);
      reject(new Error("Couldn't find position"));
    }
  }).catch((err) => {
    throw err;
  });
};
```

### Zoom to Closest Nearby Call

The closest circle marker to the user's current location is calculated and then its popup content is opened to show the call details. The bottom label neighborhood text is also updated to match the neighborhood of the closest popup.

```javascript
/**
 * Find and zoom to the closest marker in the given layer group to a specified position.
 *
 * @param {number[]} position - The position (latitude, longitude) to find the closest marker to.
 * @param {L.LayerGroup} callsLayer - The layer group containing markers to search for the closest one.
 */
// Export a function called closestZoom that takes 'position' and 'callsLayer' as parameters
export const closestZoom = function (position, callsLayer) {
  // Initialize 'minDistance' to positive infinity and 'nearestMarker' to null
  let minDistance = Infinity;
  let nearestMarker = null;

  // Iterate over each layer in 'callsLayer'
  callsLayer.eachLayer((layer) => {
    // Check if the current layer is an instance of a CircleMarker
    if (layer instanceof L.CircleMarker) {
      // Get the latitude and longitude of the current layer
      const latLng = layer.getLatLng();

      // Calculate the distance between 'position' and the current marker's position
      const distance = Math.sqrt(
        Math.pow(position[0] - latLng.lat, 2) +
          Math.pow(position[1] - latLng.lng, 2)
      );

      // Update 'minDistance' and 'nearestMarker' if the current marker is closer
      if (distance < minDistance) {
        minDistance = distance;
        nearestMarker = layer;
      }
    }
  });

  // Iterate over each layer in 'callsLayer' again
  callsLayer.eachLayer((layer) => {
    // Check if the current layer is an instance of a CircleMarker
    if (layer instanceof L.CircleMarker) {
      // Check if the current layer is the nearest marker found earlier
      if (layer === nearestMarker) {
        // Set a flag 'moving' to true and schedule it to be reset to false after 2 seconds
        moving = true;
        setTimeout(() => {
          moving = false;
        }, 2000);

        // Open a popup for the nearest marker
        layer.openPopup();

        // Get the 'neighborhood' data from the marker's options
        const { neighborhood } = layer.options.data;

        // Find the HTML element with the id 'neighborhood-text'
        const neighborhoodText = document.getElementById("neighborhood-text");

        // Update the text content of the 'neighborhood-text' element
        neighborhoodText.textContent = neighborhood;
      } else {
        // If the current layer is not the nearest marker, close its popup
        layer.closePopup();
      }
    }
  });
};
```

### Access Data SF Archives

If the user clicks on a link in a text message or tweet that matches a call that may no longer be available because 48 hours have passed, the app first tries the real-time database, and if it can't find the call, the app looks for the call in the Data SF archive which goes back to 2018 and adds a new circle marker with call details to the map. As of now, Urbanite SF does not map other historic calls beyond 48 hours, but can retrieve individual historic calls.

```javascript
/**
 * Get the value of a URL parameter by its name.
 *
 * @param {string} cad_number - The name of the URL parameter to retrieve.
 * @returns {string|null} - The value of the URL parameter, or null if not found.
 */
const getURLParameter = function (cad_number) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(cad_number);
};

export default getURLParameter;
```

```javascript
export const fetchHistData = async function (cad_number) {
  try {
    const response = await fetch(
      `https://data.sfgov.org/resource/wg3w-h783.json?cad_number=${cad_number}`
    );
    if (!response.ok) {
      throw new Error("Network response for promise was not ok");
    }
    const dataHistbyCAD = await response.json();
    return dataHistbyCAD;
  } catch (err) {
    console.log(err);
  }
};
```

### Registering a Service Worker

The app registers a service worker in the user's navigator to cache the HTML, CSS, JavaScript files and images.

```javascript
<script type="module">
          window.addEventListener('load', () => {
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker
              .register(new URL('/service-worker.js', import.meta.url), { type: 'module' })
              .then((registration) => {
                console.log('Service Worker registered:', registration);
              })
              .catch((error) => {
                console.log('Service Worker registration failed:', error);
              });
            }
          });
          </script>
```

```javascript
import { manifest, version } from "@parcel/service-worker";

async function install() {
  const cache = await caches.open(version);
  console.log(version);
  await cache.addAll(manifest);
}

addEventListener("install", (e) => e.waitUntil(install()));

async function activate() {
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => key !== version && caches.delete(key)));
}

addEventListener("activate", (e) => e.waitUntil(activate()));

self.addEventListener("install", () => {
  setTimeout(() => {
    self.skipWaiting();
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.navigate(client.url);
      });
    });
  }, 60000 * 10);
});
```
