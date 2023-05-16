/////////////////////-----urbanite-----/////////////////////
/////////// Leaflet Map
export const getLatLngSF = () => {
  return window.innerWidth <= 758 ? [37.74, -122.447] : [37.762, -122.43];
};
export const getMapZoomLevel = () => {
  return window.innerWidth <= 758 ? 14 : 15;
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
  "MISC",
  "INVESTIGATION DETAIL",
  "PERSON DUMPING",
  "TOW TRUCK",
];

const filterExpression = excludedCallTypes
  .map((callType) => `call_type_final_desc != '${callType}'`)
  .join(" and ");

export const API_URL_POLICE_48h_FILTERED = `${API_URL_POLICE_48h}?$where=${filterExpression} AND intersection_point IS NOT NULL&$$app_token=${SFAPI_APP_TKN}&$limit=3000`;

export const latestNumber = 1000;

// export const REQUEST_PARAM_POLICE_48h = "call_type_final_desc";
// export const DATA_ORDER_POLICE_48h = "incident_datetime";
// export const ROW_ID_POLICE_48h = "row_id";
// export const COORDS_POLICE_48h = "point";

// prettier-ignore
// export const CALL_TYPES_POLICE_48h = ["STOLEN VEHICLE", "AUTO BOOST / STRIP", "TRESPASSER", "ASSAULT / BATTERY", "FIGHT NO WEAPON", "VEH ACCIDENT", "BURGLARY", "STRONGARM ROBBERY", "H&R INJURY ACCIDENT", "SHOTS FIRED", "PERSON W/GUN", "PERSON W/KNIFE",];
// Alt: SHOOTING, MENTALLY DISTURBED, DRUNK DRIVER, ROBBERY, PANIC ALARM, STABBING, EXPLOSIVE FOUND, GRAND THEFT, PERSON BREAKING IN, DEMO / PROTEST, SHOT SPOTTER, CITIZEN ARREST, URGENT NOTIFICATION, AGG ASSAULT / ADW, FIGHT W/WEAPONS, STOLEN PROPERTY, PETTY THEFT, THREATS / HARASSMENT, WANTED VEHICLE / SUB

export const API_MAP_POLICE_48h = {
    incidentNumber: "cad_number",
    rowid: "id",
    call_type: "call_type_final_desc",
    call_type_original: "call_type_original_desc",
    coords: "intersection_point",
    receivedTime: "received_datetime",
    entryTime: "entry_datetime",
    dispatchTime: "dispatch_datetime",
    responseTime: "enroute_datetime",
    onSceneTime: "onscene_datetime",
    address: "intersection_name",
    neighborhood: "analysis_neighborhood",
    desc: "call_final_disposition",
    disposition: "disposition", // SFPD only
    closeTime: "close_datetime",
    priority: "priority_final",
    onView: "onview_flag", // T/F officer observed activity of crime
    sensitive: "sensitive_call",
    priority: "priority_final",
  };

export const DISPOSITION_MAP_POLICE = {
  ABA: "Officer abated",
  ADM: "Officer admonished",
  ADV: "Officer advised",
  ARR: "Arrest",
  CAN: "Cancelled",
  CSA: "CPSA assignment",
  // 22: "Cancelled",
  CIT: "Citation issued",
  CRM: "Burglary alarm",
  GOA: "Gone on arrival",
  HAN: "Officer handled",
  NCR: "No issue found",
  ND: "No disposition",
  NOM: "No merit",
  PAS: "Home alarm",
  REP: "Police report made",
  SFD: "EMS engaged",
  UTL: "Unable to locate",
  VAS: "Car alarm",
};

// // Police Hist
// export const API_MAP_POLICE_HIST = {
//   incidentNumber: "incident_number",
//   rowid: "row_id",
//   call_type: "incident_subcategory",
//   coords: "intersection_point",
//   unit: "",
//   receivedTime: "incident_datetime",
//   entryTime: "",
//   dispatchTime: "",
//   responseTime: "",
//   onSceneTime: "",
//   reportTime: "report_datetime",
//   address: "",
//   neighborhood: "analysis_neighborhood",
//   desc: "incident_description",
//   disposition: "", // SFPD only
//   closeTime: "",
//   priority: "",
//   onView: "", // T/F officer observed activity of crime
//   sensitive: "",
// };

// // Fire
// export const API_MAP_FIRE_HIST = {
//   incidentNumber: "incident_number",
//   // rowid: "call_number",
//   rowid: "incident_number",
//   call_type: "call_type",
//   coords: "case_location",
//   unit: "unit_type",
//   receivedTime: "received_dttm",
//   entryTime: "entry_dttm",
//   dispatchTime: "dispatch_dttm",
//   responseTime: "response_dttm",
//   onSceneTime: "on_scene_dttm",
//   transportTime: "transport_dttm",
//   hospitalTime: "hospital_dttm",
//   availableTime: "available_dttm",
//   address: "address",
//   neighborhood: "neighborhoods_analysis_boundaries",
//   desc: "call_final_disposition",
//   battalion: "battalion", // SFFD only
//   numberAlarms: "number_of_alarms",
// };
