import { toggleVisibleItems, toggleVisibleList } from "./buttonsView.js";
import { fetchHistData } from "../model.js";
import {
  formatDate,
  minsHoursFormat,
  textProperCase,
  neighborhoodFormat,
} from "../helpers.js";
import addHandlerMoveCenter from "./moveCenter.js";
import { showAlert } from "./getPosition.js";

const initPopupNieghborhood = (position, police48Layer, urlCAD, map) => {
  let minDistance = Infinity;
  let nearestMarker = null;
  const now = Date.now();

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
  let liveDataIncludesCAD = false;
  if (urlCAD) {
    police48Layer.addTo(map);
    police48Layer.eachLayer((layer) => {
      if (layer.options.data.cadNumber === urlCAD) {
        liveDataIncludesCAD = true;
        console.log(liveDataIncludesCAD);
        if (
          localStorage.getItem("openList") === "nearby" ||
          localStorage.getItem("openList") === "allSF"
        ) {
          toggleVisibleItems();
          toggleVisibleList();
        }
        layer.openPopup();
        map.flyTo(layer.getLatLng(), 15);
        addHandlerMoveCenter(police48Layer, map);
        const { neighborhood } = layer.options.data;
        const neighborhoodText = document.getElementById("neighborhood-text");
        neighborhoodText.textContent = neighborhood;
      }
    });
    if (!liveDataIncludesCAD) {
      (async () => {
        try {
          const dataHistbyCAD = await fetchHistData(urlCAD);
          dataHistbyCAD[0] ??
            showAlert(`Call pending DataSF archive entry, try later`);
          const coordsHist = [
            Number(dataHistbyCAD[0].latitude),
            Number(dataHistbyCAD[0].longitude),
          ];
          dataHistbyCAD[coordsHist.coordinates] = coordsHist;
          const cad_numberHist = dataHistbyCAD[0].cad_number;
          const received_datetimeHist = new Date(
            dataHistbyCAD[0].incident_datetime
          );
          const receivedTimeAgo = Math.round(
            (now - received_datetimeHist) / 60000
          );
          const receivedTimeAgoF = minsHoursFormat(receivedTimeAgo);
          const incident_descHist = dataHistbyCAD[0].incident_description;
          const neighborhoodHist = neighborhoodFormat(
            dataHistbyCAD[0].analysis_neighborhood
          );
          const addressHist = textProperCase(dataHistbyCAD[0].intersection);
          const resolutionHist = dataHistbyCAD[0].resolution;

          const tweetContent = `${incident_descHist} at ${addressHist} in ${neighborhoodHist} ${
            receivedTimeAgo <= 6
              ? `${receivedTimeAgoF} ago`
              : `${formatDate(receivedTimeAgo)}`
          }${
            resolutionHist
              ? resolutionHist === "Open or Active"
                ? ""
                : `<br>${resolutionHist}`
              : ""
          } #SanFrancisco https://urbanitesf.netlify.app/?cad_number=${cad_numberHist}`;

          const textMessageContent = `"${incident_descHist} at ${addressHist} in ${neighborhoodHist} ${receivedTimeAgo} ago${
            resolutionHist
              ? resolutionHist === "Open or Active"
                ? ""
                : `, ${resolutionHist}`
              : ""
          }, CAD #${cad_numberHist}" https://urbanitesf.netlify.app/?cad_number=${cad_numberHist}`;

          const popupContent = `
          <div>
            <b>${incident_descHist}</b>
            \u2022 ${receivedTimeAgoF} 
            <br>${formatDate(received_datetimeHist)}
            <br>${addressHist}
            <br>CAD #<a href="https://data.sfgov.org/resource/wg3w-h783.json?cad_number=${cad_numberHist}" target="_blank">${cad_numberHist}</a>
            ${
              resolutionHist
                ? resolutionHist === "Open or Active"
                  ? ""
                  : `<br>${resolutionHist}`
                : ""
            }<br>(Archived call)
            <a href="sms:&body=${encodeURIComponent(textMessageContent)}">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IMessage_logo.svg/20px-IMessage_logo.svg.png" alt="iMessage / text" style="height:20px; position: absolute; bottom: 0px; left: calc(50% - 27px); transform: translate(-50%, -50%);">
              </a>
              <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(
                tweetContent
              )}" target="_blank">
              <img src="https://icons.iconarchive.com/icons/xenatt/the-circle/256/App-Twitter-icon.png" alt="Twitter Bird Icon" style=" height: 22px; position: absolute; bottom: 0px; left: calc(50% + 25px); transform: translate(-50%, -50%);">
              </a>
              </div>
      `;

          const markerHist = L.circleMarker(coordsHist, {
            radius: window.innerWidth <= 758 ? 3 : 4,
            keepInView: false,
            fillColor: "#98f5e1",
            color: "#333333",
            weight: 1,
            opacity: 0.6,
            fillOpacity: 0.9,
            data: {
              cadNumber: cad_numberHist,
              disposition: resolutionHist,
              neighborhood: neighborhoodHist,
              receivedTime: formatDate(received_datetimeHist),
              address: addressHist,
              callType: incident_descHist,
              receivedTimeAgo: receivedTimeAgo,
            },
            autoPan: false,
            closeOnClick: false,
            interactive: false,
            bubblingMouseEvents: false,
          }).bindPopup(popupContent, {
            closeButton: false,
            disableAnimation: true,
          });
          markerHist.addTo(police48Layer);
          police48Layer.addTo(map);
          map.flyTo(coordsHist, 15);
          addHandlerMoveCenter(police48Layer, map);
          markerHist.openPopup();
        } catch (error) {
          console.log(error);
        }
      })();
    }
  } else {
    police48Layer.addTo(map);
    closestZoom();
    addHandlerMoveCenter(police48Layer, map);
  }
};

export default initPopupNieghborhood;
