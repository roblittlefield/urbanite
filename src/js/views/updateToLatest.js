import { minsHoursFormat } from "../helpers";
import { toggleVisibleItems } from "./buttonsView";

const updateCallList = function (latestMarkers, map, nearby) {
  const callList = document.getElementById("call-list");
  // const callListHeading = document.getElementById("call-list-heading");
  callList.innerHTML = "";
  let calcHour = 0;
  latestMarkers.forEach((circleMarker) => {
    const receivedTimeAgo = circleMarker.options.data.receivedTimeAgo;
    const receivedTimeAgoF = minsHoursFormat(receivedTimeAgo);
    const hours = Math.floor(receivedTimeAgo / 60);
    if (hours > calcHour) {
      calcHour = hours;

      const minutesNumber = document.createElement("span");
      minutesNumber.classList.add("received-time-ago-hours");
      if (nearby) {
        minutesNumber.style.fontSize = "15px";
      }
      minutesNumber.textContent = `${calcHour} hour${
        calcHour === 1 ? "" : "s"
      } ago`;
      callList.appendChild(minutesNumber);

      minutesNumber.addEventListener("click", () => {
        if (!minutesNumber) return;
        e.stopPropagation();
        minutesNumber.style.display =
          minutesNumber.style.display === "none" ? "" : "none";
      });
    }
    const responseTime = circleMarker.options.data.responseTime;
    const responseTimeF = minsHoursFormat(responseTime);
    if (circleMarker.options.data) {
      const callBox = document.createElement("li");
      callBox.classList.add("call-box");
      callBox.innerHTML = `
        <h3 style="color: ${
          circleMarker.options.fillColor === "#000000"
            ? "#D3D3D3"
            : circleMarker.options.fillColor === "#FF00FF"
            ? "#FF5AFF"
            : circleMarker.options.fillColor === "#0000FF"
            ? "#66CCFF"
            : circleMarker.options.fillColor
        };">${circleMarker.options.data.callType}${
        circleMarker.options.data.sensitive ? "  *sensitive call" : ""
      }</h3>
          <i><p>
          ${receivedTimeAgo === NaN ? "" : `${receivedTimeAgoF} ago in`} 
          ${circleMarker.options.data.neighborhood}
        </p></i>
          <p>${
            circleMarker.options.data.onView === "Y"
              ? `Officer observed`
              : responseTime
              ? `Response time: ${responseTimeF}`
              : circleMarker.options.data.dispatchTime
              ? `Dispatched ${circleMarker.options.data.dispatchedTimeAgo} ago`
              : circleMarker.options.data.entryTime
              ? `Call entry in queue ${circleMarker.options.data.enteredTimeAgo} ago`
              : `Call received, pending entry`
          }${
        circleMarker.options.data.disposition
          ? `, ${circleMarker.options.data.disposition.toLowerCase()}`
          : ", open"
      }
        </p>
          <p>${circleMarker.options.data.address.slice(0, 45)}</p>
        `;
      callBox.addEventListener("click", () => {
        toggleVisibleItems();
        map.flyTo(circleMarker.getLatLng(), 14);
        circleMarker.openPopup();
      });
      callList.appendChild(callBox);
    }
  });
};
export default updateCallList;
