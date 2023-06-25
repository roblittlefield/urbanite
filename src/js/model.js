import {
  maxCalls,
  callTypeConversionMap,
  DISPOSITION_REF_POLICE,
  timeElapSF,
} from "./config";
import {
  standardizeData,
  textProperCase,
  neighborhoodFormat,
} from "./helpers.js";

export const fetchApi = async function (url) {
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

  const dataFiltered = dataRaw.filter((callRaw) => {
    const isCallTypeIncluded = callTypeMap.includes(
      callRaw.call_type_final_desc || callRaw.call_type_original_desc
    );
    const callReceivedTime = new Date(callRaw.received_datetime);
    const currentTime = new Date();
    const timeDifference = currentTime - callReceivedTime;
    const hoursDifference = timeDifference / 3600000;
    return isCallTypeIncluded && hoursDifference < 49;
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
    const responseTimeExact = Number(
      ((onSceneTime - receivedTime) / 60000).toFixed(2)
    );
    const properCaseAddress = textProperCase(call.address);
    const neighborhoodFormatted = neighborhoodFormat(call.neighborhood);
    const callTypeFormatted = callTypeConversionMap.get(callType) || callType;
    const dispositionMeaning = DISPOSITION_REF_POLICE[call.disposition] ?? "";
    const positionLatLng = L.latLng(position[0], position[1]);
    const callLatLng = [
      Number(call.coords.coordinates[1]),
      Number(call.coords.coordinates[0]),
    ];
    if (receivedTimeAgo <= timeElapSF) {
      countCallsRecent++;
    }

    return {
      ...call,
      receivedTimeAgo,
      enteredTimeAgo,
      dispatchedTimeAgo,
      responseTime,
      responseTimeExact,
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
  return { data, countCallsRecent };
};

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
