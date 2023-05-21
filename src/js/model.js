import {
  maxCalls,
  maxHoursAgo,
  callTypeConversionMap,
  DISPOSITION_REF_POLICE,
  timeElapSF,
  timeElapNearby,
  nearbyRadius,
} from "./config";
import {
  standardizeData,
  formatDate, // Using this?
  textProperCase,
  minsHoursFormat,
  neighborhoodFormat,
} from "./helpers.js";

export const fetchApi = async function (url, reqParam, order) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response for promise was not ok");
    }
    return response;
  } catch (err) {
    console.log(err);
  }
};

export const dataProcess = function (position, dataRaw, callTypeMap, paramMap) {
  const now = Date.now();
  let countCallsRecent = 0;
  let countCallsNearby = 0;
  let countCallsNearbyRecent = 0;
  // Filter calls
  const dataFiltered = dataRaw.filter((callRaw) => {
    const receivedTime = new Date(callRaw.received_datetime);
    const isCallTypeIncluded = callTypeMap.includes(
      callRaw.call_type_final_desc
    );
    const hoursAgo = Math.floor((now - receivedTime) / 3600000);
    const isWithinTimeRange = hoursAgo <= maxHoursAgo;
    return isCallTypeIncluded && isWithinTimeRange;
  });

  // Standardize calls
  const dataPreSort = dataFiltered.map((callRaw) => {
    // Standardize Parameters
    const call = standardizeData(callRaw, paramMap);
    // Call Type
    const callType = call.call_type || call.call_type_original;
    // Call Received Time
    const receivedTime = new Date(call.receivedTime);
    const receivedTimeAgo = Math.round((now - receivedTime) / 60000);
    // Call Entered Time
    const enteredTime = new Date(call.entryTime);
    const enteredTimeAgo = Math.round((now - enteredTime) / 60000);
    // Call Disatched Time
    const dispatchedTime = new Date(call.dispatchTime);
    const dispatchedTimeAgo = Math.round((now - dispatchedTime) / 60000);
    // Call OnScene Time
    const onSceneTime = new Date(call.onSceneTime);
    const responseTime = Math.round((onSceneTime - receivedTime) / 60000);

    // Text Formatting
    const properCaseAddress = textProperCase(call.address);
    const neighborhoodFormatted = neighborhoodFormat(call.neighborhood);
    const callTypeFormatted = callTypeConversionMap.get(callType) || callType;
    const dispositionMeaning = DISPOSITION_REF_POLICE[call.disposition] ?? "";

    // Count Recent, Nearby, Nearby Recent calls
    const positionLatLng = L.latLng(position[0], position[1]);
    const callLatLng = [
      Number(call.coords.coordinates[1]),
      Number(call.coords.coordinates[0]),
    ];
    const distance = positionLatLng.distanceTo(callLatLng);
    if (receivedTimeAgo <= timeElapSF) {
      countCallsRecent++;
    }
    if (distance <= nearbyRadius) {
      countCallsNearby++;
      if (receivedTimeAgo <= timeElapNearby) {
        countCallsNearbyRecent++;
      }
    }

    return {
      ...call,
      receivedTimeAgo,
      enteredTimeAgo,
      dispatchedTimeAgo,
      responseTime,
      properCaseAddress,
      neighborhoodFormatted,
      callTypeFormatted,
      dispositionMeaning,
      positionLatLng,
    };
  });
  // Sort calls
  const data = dataPreSort
    .sort((a, b) => a.receivedTimeAgo - b.receivedTimeAgo)
    .slice(0, maxCalls);
  return { data, countCallsNearby, countCallsRecent, countCallsNearbyRecent };
};
