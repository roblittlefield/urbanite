/////////////////////-----urbanite-----/////////////////////
/////////// Leaflet Map
export const getLatLngSF = () => {
  return window.innerWidth <= 758 ? [37.74, -122.447] : [37.762, -122.43];
};
export const getMapZoomLevel = () => {
  return window.innerWidth <= 758 ? 12 : 13;
};

export const MAP_LAYERS = [
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg",
  "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png",
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  "https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg",
];

/////////// SAN FRANCISCO .GOV DATA
const SFAPI_APP_TKN = "TmnsQZtPesideUfTbGU3BeaAV"; // How to use token: json?$$app_token=APP_TOKEN

/////////// Police - Last 48 hours
const API_URL_POLICE_48h = "https://data.sfgov.org/resource/gnap-fj3t.json";

const excludedCallTypes = [
  "PASSING CALL",
  "TRAF VIOLATION CITE",
  "WELL BEING CHECK",
  "COMPLAINT UNKN",
  "MISC",
];
const filterExpression = excludedCallTypes
  .map((callType) => `call_type_final_desc != '${callType}'`)
  .join(" and ");

export const API_URL_POLICE_48h_FILTERED = `${API_URL_POLICE_48h}?$where=${filterExpression} AND intersection_point IS NOT NULL&$$app_token=${SFAPI_APP_TKN}&$limit=3000`

// export const REQUEST_PARAM_POLICE_48h = "call_type_final_desc";
// export const DATA_ORDER_POLICE_48h = "incident_datetime";
// export const ROW_ID_POLICE_48h = "row_id";
// export const COORDS_POLICE_48h = "point";

// prettier-ignore
// export const CALL_TYPES_POLICE_48h = ["STOLEN VEHICLE", "AUTO BOOST / STRIP", "TRESPASSER", "ASSAULT / BATTERY", "FIGHT NO WEAPON", "VEH ACCIDENT", "BURGLARY", "STRONGARM ROBBERY", "H&R INJURY ACCIDENT", "SHOTS FIRED", "PERSON W/GUN", "PERSON W/KNIFE",];
// Alt: SHOOTING, MENTALLY DISTURBED, DRUNK DRIVER, ROBBERY, PANIC ALARM, STABBING, EXPLOSIVE FOUND, GRAND THEFT, PERSON BREAKING IN, DEMO / PROTEST, SHOT SPOTTER, CITIZEN ARREST, URGENT NOTIFICATION, AGG ASSAULT / ADW, FIGHT W/WEAPONS, STOLEN PROPERTY, PETTY THEFT, THREATS / HARASSMENT, WANTED VEHICLE / SUB

// export const API_MAP_POLICE_48h = {
//     incidentNumber: "cad_number",
//     rowid: "id",
//     call_type: "call_type_final_desc",
//     coords: "intersection_point",
//     unit: "",
//     receivedTime: "received_datetime",
//     entryTime: "entry_datetime",
//     dispatchTime: "dispatch_datetime",
//     responseTime: "enroute_datetime",
//     onSceneTime: "onscene_datetime",
//     address: "intersection_name",
//     neighborhood: "analysis_neighborhood",
//     desc: "call_final_disposition",
//     disposition: "disposition", // SFPD only
//     closeTime: "close_datetime",
//     priority: "priority_final",
//     onView: "onview_flag", // T/F officer observed activity of crime
//     sensitive: "sensitive_call",
//   };
