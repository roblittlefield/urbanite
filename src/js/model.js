import {
  maxCalls,
  callTypeConversionMap,
  DISPOSITION_REF_POLICE,
  timeElapSF,
  callnotesMap,
} from "./config";
import {
  standardizeData,
  textProperCase,
  neighborhoodFormat,
  districtSupervisor,
} from "./helpers.js";

/**
 * Fetch data from an API using a given URL.
 *
 * @param {string} url - The URL of the API endpoint to fetch data from.
 * @returns {Promise<Response>} A promise that resolves to the API response.
 */
export const fetchApi = async function (url) {
  try {
    // Attempt to fetch data from the specified URL
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Network response for promise was not ok");
    }

    return response;
  } catch (err) {
    console.log(err);
  }
};

/**
 * Process and filter raw data from the API to prepare it for display on the map and call list.
 *
 * @param {number[]} position - The user's current geographical position [latitude, longitude].
 * @param {object[]} dataRaw - Raw data retrieved from the API.
 * @param {string[]} callTypeMap - An array of call types to include in the data.
 * @param {Map} paramMap - A map for parameter mapping and formatting.
 * @returns {object[]} Processed and filtered data ready for display.
 */
export const dataProcess = function (position, dataRaw, callTypeMap, paramMap) {
  const now = Date.now();
  let countCallsRecent = 0;

  // Filter and process the raw data
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

  // Transform and standardize the data
  const dataPreSort = dataFiltered.map((callRaw) => {
    // Standardize and format call data
    const call = standardizeData(callRaw, paramMap);
    const callType = call.call_type || call.call_type_original;
    const receivedTime = new Date(call.receivedTime);
    const receivedTimeAgo = ((now - receivedTime) / 60000).toFixed(5);
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
    const supervisor = districtSupervisor(call.district);
    const callTypeFormatted = callTypeConversionMap.get(callType) || callType;
    const callNotes =
      callnotesMap.get(call.notes_original) ||
      callnotesMap.get(call.notes_final);
    const dispositionMeaning = DISPOSITION_REF_POLICE[call.disposition] ?? "";
    const positionLatLng = L.latLng(position[0], position[1]);
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
      supervisor,
      callTypeFormatted,
      dispositionMeaning,
      positionLatLng,
      callNotes,
    };
  });

  const data = dataPreSort
    .sort((a, b) => b.receivedTimeAgo - a.receivedTimeAgo)
    .slice(0, maxCalls);
  // Return the processed and filtered data
  return { data, countCallsRecent };
};

/**
 * Fetch historical data based on the CAD (Computer-Aided Dispatch) number.
 *
 * @param {string} cad_number - The CAD number for which historical data is requested.
 * @returns {Promise<object[]>} A promise that resolves to an array of historical data.
 */
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
