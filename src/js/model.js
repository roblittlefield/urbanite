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
  textProperCase,
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

  const dataFiltered = dataRaw.filter((callRaw) => {
    const receivedTime = new Date(callRaw.received_datetime);
    const isCallTypeIncluded = callTypeMap.includes(
      callRaw.call_type_final_desc
    );
    const hoursAgo = Math.floor((now - receivedTime) / 3600000);
    const isWithinTimeRange = hoursAgo <= maxHoursAgo;
    return isCallTypeIncluded && isWithinTimeRange;
  });


  const dataPreSort = dataFiltered.map((callRaw) => {
    const call = standardizeData(callRaw, paramMap);
    const callType = call.call_type || call.call_type_original;
    const receivedTime = new Date(call.receivedTime);
    const receivedTimeAgo = Math.round((now - receivedTime) / 60000);
    const enteredTime = new Date(call.entryTime);
    const enteredTimeAgo = Math.round((now - enteredTime) / 60000);
    const dispatchedTime = new Date(call.dispatchTime);
    const dispatchedTimeAgo = Math.round((now - dispatchedTime) / 60000);
    const onSceneTime = new Date(call.onSceneTime);
    const responseTime = Math.round((onSceneTime - receivedTime) / 60000);
    const properCaseAddress = textProperCase(call.address);
    const neighborhoodFormatted = neighborhoodFormat(call.neighborhood);
    const callTypeFormatted = callTypeConversionMap.get(callType) || callType;
    const dispositionMeaning = DISPOSITION_REF_POLICE[call.disposition] ?? "";
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

  const data = dataPreSort
    .sort((a, b) => b.receivedTimeAgo - a.receivedTimeAgo)
    .slice(0, maxCalls);
  return { data, countCallsNearby, countCallsRecent, countCallsNearbyRecent };
};
