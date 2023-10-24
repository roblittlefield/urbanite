# Urbanite SF

Live Link: https://urbanitesf.netlify.app

[![Netlify Status](https://api.netlify.com/api/v1/badges/8577fd5c-0a26-4efa-85cb-69155c7204d5/deploy-status)](https://app.netlify.com/sites/urbanitesf/deploys)

## Press Mentions

- [The Marina Times](https://twitter.com/TheMarinaTimes/status/1665401741821595649) - June 4, 2023

## Application Description

Urbanite SF is a San Francisco law enforcement dispatched calls for service incident mapping web application. Built as a lightweight & straightforward alternative to other incident mapping apps with pay-walls and ads, Urbanite SF additionally provides call priority, status, exact response time, and CAD ID #. No user data is stored. The application was developed by Rob Littlefield.

## Features

- Move around the map to open calls in different neighborhoods
- See SF Police Station locations marked on the map
- See what neighborhood the call is in at the bottom
- View call details and response times
- Change the map skin
- Share location to see nearby weather and calls
- See San Francisco weather and San Francisco city-wide recent call count if not in San Francisco or do not share location
- Open the list of latest calls in all San Francisco or just nearby
- Share links with others via Twitter or Text Mesage / iMessage
- View fresh data as map reloads every 10 minutes
- Access call data when DataSF archives the call after 48 hours

## Components

Urbanite SF was written using vanilla JavaScript. Includes "live" Police data, which is delayed 10 minutes and filtered for sensitive information.

## Future Work

- Add historic calls on map upon zoom-in
- Add historic Fire Dept calls

## Code

### Loading Leaflet Map

The first thing the app does upon load is ask for user's current position to load nearby calls. If the user is 500 or more feet outside of San Francisco city limits, or does not/cannot provide a location, the map loads in the center of the city without the nearby call count.

```javascript
export const getPosition = function (defaultMapSF) {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          const expandedMinLatitude = 37.6398 - 0.0045; // 500 feet
          const expandedMaxLatitude = 37.9298 + 0.0045;
          const expandedMinLongitude = -123.1738 - 0.0045;
          const expandedMaxLongitude = -122.2815 + 0.0045;

          if (
            latitude < expandedMinLatitude ||
            latitude > expandedMaxLatitude ||
            longitude < expandedMinLongitude ||
            longitude > expandedMaxLongitude
          ) {
            showAlert(`Outside San Francisco, loading city center 🌉`);
            reject(new Error("Location outside SF"));
          } else {
            resolve([latitude, longitude]);
          }
        },
        () => {
          showAlert(`Share your location to see nearby calls 🌉`);
          resolve(defaultMapSF);
        }
      );
    } else {
      showAlert(`Share your location to see nearby calls 🌉`);
      resolve(defaultMapSF);
    }
  });
};
```

### Accessing Data SF Dataset

The app then calls the DataSF Real-Time Law Enforcement Dispatched Calls for Service API using a filter the excludes common calls types that are not of interested, such as noise nuisance.

```javascript
const excludedCallTypes = [
  "PASSING CALL",
  "NOISE NUISANCE",
  "TRAF VIOLATION CITE",
  "TRAF VIOLATION TOW",
  "WELL BEING CHECK",
  "COMPLAINT UNKN",
  "CITIZEN STANDBY",
  "MEET W/CITIZEN",
  "MEET W/CITY EMPLOYEE",
  "VEHICLE ALARM",
  "WANTED VEHICLE / SUB",
  "HOMELESS COMPLAINT",
  "TRAFFIC HAZARD",
  "INVESTIGATION DETAIL",
  "PERSON DUMPING",
  "TOW TRUCK",
  "MISSING ADULT",
];
const filterExpression = excludedCallTypes
  .map((callType) => `call_type_final_desc != '${callType}'`)
  .join(" and ");
export const API_URL_POLICE_48h_FILTERED = `${API_URL_POLICE_48h}?$where=${filterExpression} AND intersection_point IS NOT NULL&$$app_token=${SFDATA_API_KEY}&$limit=2500`;
```

### Nearby Calls & Offsetting Overlapping Calls

The data is then processed and sorted by received date, and Leaflet map circle markers are created for each call. A list of nearby calls is created based on calls within 500 meters. Tweet and Text Message content is generated and assigned to the popups along with a hyperlink to raw call data by ID number, called CAD. If two circle markers overlap, then the second one is offset North by a few feet.

```javascript
const distance = positionLatLng.distanceTo(markerLatLng);
if (distance < 500) {
  marker.addTo(this.nearbyLayer);
}
////
const overlapOffset = 0.00008;
let callLatlng = [
  Number(call.coords.coordinates[1]),
  Number(call.coords.coordinates[0]),
];
this.police48Layer.eachLayer(function (layer) {
  if (layer.getLatLng().equals(callLatlng)) {
    callLatlng[0] += overlapOffset;
  }
});
```

### Adding Call Circle Markers & Leaflet Popup Content

```javascript
addCircleMarkers(data, police48Layer) {
    data.map((call) => {
      const receivedTimeF = formatDate(call.receivedTime);
      const responseTimeF = minsHoursFormat(call.responseTime);
      const dispatchedTimeAgoF = minsHoursFormat(call.dispatchedTimeAgo);
      const receivedTimeAgoF = minsHoursFormat(
        Math.round(call.receivedTimeAgo)
      );
      const disposition =
        call.dispositionMeaning !== "" && call.dispositionMeaning !== "Unknown"
          ? `${call.dispositionMeaning}`
          : "";
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
      let callLatlng = [
        Number(call.coords.coordinates[1]),
        Number(call.coords.coordinates[0]),
      ];
      if (police48Layer) {
        police48Layer.eachLayer(function (layer) {
          if (layer.getLatLng().equals(callLatlng)) {
            callLatlng[0] += overlapOffset;
          }
        });
      }

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
          // receivedTimeCalc: call.receivedTime,
          disposition: call.dispositionMeaning,
          neighborhood: call.neighborhoodFormatted,
          receivedTime: receivedTimeF,
          // entryTime: enteredTime,
          enteredTimeAgo: call.enteredTimeAgo,
          // dispatchTime: dispatchedTime,
          dispatchedTimeAgoF: dispatchedTimeAgoF,
          responseTime: call.responseTime,
          responseTimeExact: call.responseTimeExact,
          address: call.properCaseAddress,
          callType: call.callTypeFormatted,
          receivedTimeAgo: Math.round(call.receivedTimeAgo),
          receivedTimeAgoExact: call.receivedTimeAgo,
          // callTypeCode: call.callTypeCode,
          // desc: call.desc,
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
      marker.addTo(police48Layer);
      // if (call.callTypeFormatted === "Shooting") {
      //   //send Notification
      // }
    });
    return police48Layer;
  }
```

### Loading Calls Nearby User
```javascript
export const showAlert = function (message) {
  const alertElement = document.getElementById("alert");
  alertElement.textContent = "";
  alertElement.classList.remove("hidden");
  alertElement.textContent = message;
  setTimeout(function () {
    if (alertElement.parentElement) {
      alertElement.classList.add("hidden");
    }
  }, 2500);
};

export const getPosition = async function () {
  showAlert(`Getting your location & loading nearby calls...`);
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          const expandedMinLatitude = 37.6398 - 0.0045;
          const expandedMaxLatitude = 37.9298 + 0.0045;
          const expandedMinLongitude = -123.1738 - 0.0045;
          const expandedMaxLongitude = -122.2815 + 0.0045;

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

export const loadLastUpdated = function () {
  const lastUpdatedElement = document.getElementById("last-updated");
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZoneName: "short",
  });
  lastUpdatedElement.textContent = `${formattedDate}`;
};
```


### Zoom to Closest Nearby Call

The closest circle marker to the user's current location is calculated and then its popup content is opened to show the call details. The bottom label neighborhood text is also updated to match the neighborhood of the closest popup.

```javascript
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
```

### Move to Explore Other Calls

As the user navigates around the map using touch or a mouse, the circle marker that is closest to the X,Y center of the user's screen window is selected and its popup is opened to display the call details dynamically. With many calls in some neighborhoods, sometimes located very close to each other, this method of selecting calls makes fine tune call selection easy and intuitive.

```javascript
const addHandlerMoveCenter = function (police48Layer, map) {
  let timer = null;
  map.on("move", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const { x, y } = map.getSize();
      const centerX = x / 2;
      const centerY = y / 2;

      let minDistance = Infinity;
      let closestCoords = null;

      police48Layer.eachLayer((layer) => {
        const lat = layer._latlng.lat;
        const lng = layer._latlng.lng;
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
      if (minDistance <= centerPopupTolerance) {
        police48Layer.eachLayer((layer) => {
          if (layer instanceof L.CircleMarker) {
            const { x: markerX, y: markerY } = map.latLngToContainerPoint(
              layer.getLatLng()
            );
            if (
              Math.abs(markerX - closestCoords[0]) < 1e-6 &&
              Math.abs(markerY - closestCoords[1]) < 1e-6
            ) {
              if (!isPopupOpen && currentPopup !== layer) {
                layer.openPopup();
                isPopupOpen = true;
                currentPopup = layer;
              }
              const { neighborhood } = layer.options.data;
              const neighborhoodText =
                document.getElementById("neighborhood-text");
              neighborhoodText.textContent = neighborhood;
            } else if (currentPopup === layer) {
              isPopupOpen = false;
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
    }, 7);
  });
};
```

### Access Data SF Archives

If the user clicks on a link in a text message or tweet that matches a call that may no longer be available because 48 hours have passed, the app first tries the real-time database, and if it can't find the call, the app looks for the call in the Data SF archive which goes back to 2018 and adds a new circle marker with call details to the map. As of now, Urbanite SF does not map other historic calls beyond 48 hours, but can retrieve individual historic calls.

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
