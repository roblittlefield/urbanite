import { SFDATA_API_KEY } from "../../apikeys.js";
///////////-----Controls-----///////////
export const latestNumber = 700;
export const timeElapNearby = 120; // All SF: 2h
export const timeElapSF = 360; // Nearby: 6h
export const maxHoursAgo = 60; // 60h
export const centerPopupTolerance = 100;
///////////-----Leaflet Map-----///////////
export const getLatLngSF = () => {
  return window.innerWidth <= 758 ? [37.758, -122.43] : [37.762, -122.445];
};
export const getMapZoomLevel = () => {
  return window.innerWidth <= 758 ? 14 : 15;
};

export const MAP_LAYERS = [
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg",
  "https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg",
  "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png",
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
];

///////////-----SAN FRANCISCO .GOV DATA-----///////////
///////////-----Police - Last 48 hours-----///////////
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
  "INVESTIGATION DETAIL",
  "PERSON DUMPING",
  "TOW TRUCK",
  "MISSING ADULT",
];

export const includedCallTypes = [
  "FIGHT NO WEAPON",
  "TRESPASSER",
  "BURGLARY",
  "AUTO BOOST / STRIP",
  "ASSAULT / BATTERY",
  "STOLEN VEHICLE",
  "MENTALLY DISTURBED",
  "PERSON W/GUN",
  "INJURY VEH ACCIDENT",
  "SHOTS FIRED",
  "PERSON W/KNIFE",
  "STRONGARM ROBBERY",
  "PROWLER",
  "ROBBERY",
  "PERSON BREAKING IN",
  "SHOT SPOTTER",
  "INTOXICATED PERSON",
  "H&R VEH ACCIDENT",
  "DRUNK DRIVER",
  "AGG ASSAULT / ADW",
  "CITIZEN ARREST",
  "FIGHT W/WEAPONS",
  "GRAND THEFT",
  "SILENT HOLDUP ALARM",
  "STABBING",
  "PERSON SCREAMING",
  "H&R INJURY ACCIDENT",
  "PURSE SNATCH",
  "SHOOTING",
  "STALKING",
  "DEMO / PROTEST",
  "ARREST MADE",
  "RESISTING ARREST",
  // "SUSPICIOUS VEHICLE",
  // "SUSPICIOUS PERSON",
  // "VANDALISM",
  // "THREATS / HARASSMENT",
  // "INDECENT EXPOSURE",
];

export const colorMap = new Map([
  ["SHOOTING", "#E3173F"], // Crimson
  ["SHOTS FIRED", "#E3173F"],
  ["PERSON W/GUN", "#E3173F"],
  ["SHOT SPOTTER", "#E3173F"],

  ["STABBING", "#E3173F"],
  ["PERSON W/KNIFE", "#E3173F"],
  ["FIGHT W/WEAPONS", "#E3173F"],
  ["FIGHT NO WEAPON", "#E3173F"],

  ["AGG ASSAULT / ADW", "#FFF000"], // Yellow (darker)
  ["ASSAULT / BATTERY", "#FFF000"],
  ["STRONGARM ROBBERY", "#FFA500"], // Orange
  ["GRAND THEFT", "#FFA500"],
  ["PURSE SNATCH", "#FFA500"],
  ["ROBBERY", "#FFA500"],
  ["BURGLARY", "#FFA500"],
  ["PERSON BREAKING IN", "#FFA500"],
  ["SILENT HOLDUP ALARM", "#FFA500"],

  ["TRESPASSER", "#0000FF"], // Blue
  ["PROWLER", "#0000FF"],
  ["STALKING", "#0000FF"],

  ["MENTALLY DISTURBED", "#9ACD32"], // Puke Green
  ["INTOXICATED PERSON", "#9ACD32"],
  ["PERSON SCREAMING", "#9ACD32"],
  ["DRUNK DRIVER", "#9ACD32"],

  ["STOLEN VEHICLE", "#FF00FF"],
  ["AUTO BOOST / STRIP", "#FF00FF"], // Pink

  ["H&R INJURY ACCIDENT", "#000000"], // Black
  ["H&R VEH ACCIDENT", "#000000"],
  ["INJURY VEH ACCIDENT", "#000000"],
  ["ARREST MADE", "#000000"],
  ["RESISTING ARREST", "#000000"],
  ["CITIZEN ARREST", "#000000"],
  ["DEMO / PROTEST", "#000000"],
]);

export const callTypeConversionMap = new Map([
  ["SHOOTING", "Shooting"],
  ["SHOTS FIRED", "Shots fired"],
  ["PERSON W/GUN", "Person with gun"],
  ["SHOT SPOTTER", "Shot Spotter"],

  ["STABBING", "Stabbing"],
  ["PERSON W/KNIFE", "Person with knife"],
  ["FIGHT W/WEAPONS", "Fight with weapons"],
  ["FIGHT NO WEAPON", "Fight"],

  ["AGG ASSAULT / ADW", "Aggravated assault / ADW"],
  ["ASSAULT / BATTERY", "Assault & battery"],
  ["STRONGARM ROBBERY", "Strong-arm robbery"],
  ["GRAND THEFT", "Grand theft"],
  ["PURSE SNATCH", "Purse snatch"],
  ["ROBBERY", "Robbery"],
  ["BURGLARY", "Burglary"],
  ["PERSON BREAKING IN", "Person breaking in"],
  ["SILENT HOLDUP ALARM", "Silent hold-up alarm"],

  ["TRESPASSER", "Trespasser"],
  ["PROWLER", "Prowler"],
  ["STALKING", "Stalking"],

  ["MENTALLY DISTURBED", "Mentally disturbed person"],
  ["INTOXICATED PERSON", "Intoxicated person"],
  ["PERSON SCREAMING", "Person screaming"],
  ["DRUNK DRIVER", "Drunk driver"],

  ["STOLEN VEHICLE", "Stolen vehicle"],
  ["AUTO BOOST / STRIP", "Car break-in"],

  ["H&R INJURY ACCIDENT", "Hit and run with injuries"],
  ["H&R VEH ACCIDENT", "Hit and run with no injuries"],
  ["INJURY VEH ACCIDENT", "Car crash with injuries"],
  ["ARREST MADE", "Arrest made"],
  ["RESISTING ARREST", "Resisting arrest"],
  ["CITIZEN ARREST", "Citizen arrest"],
  ["DEMO / PROTEST", "Demonstration / Protest"],
]);

const filterExpression = excludedCallTypes
  .map((callType) => `call_type_final_desc != '${callType}'`)
  .join(" and ");
export const API_URL_POLICE_48h_FILTERED = `${API_URL_POLICE_48h}?$where=${filterExpression} AND intersection_point IS NOT NULL&$$app_token=${SFDATA_API_KEY}&$limit=2500`;

export const API_REF_POLICE_48h = {
  incidentNumber: "cad_number",
  rowid: "id",
  call_type: "call_type_final_desc",
  call_type_original: "call_type_original_desc",
  callTypeCode: "call_type_final",
  coords: "intersection_point",
  receivedTime: "received_datetime",
  entryTime: "entry_datetime",
  dispatchTime: "dispatch_datetime",
  enrouteTime: "enroute_datetime",
  onSceneTime: "onscene_datetime",
  address: "intersection_name",
  neighborhood: "analysis_neighborhood",
  disposition: "disposition",
  // closeTime: "close_datetime",
  priority: "priority_final",
  onView: "onview_flag", // T/F officer observed activity of crime
  sensitive: "sensitive_call",
};

export const DISPOSITION_REF_POLICE = {
  ABA: "Officer abated",
  ADM: "Officer admonished",
  ADV: "Officer advised",
  ARR: "Arrest",
  CAN: "Cancelled",
  CSA: "CPSA assignment",
  CIT: "Citation issued",
  CRM: "Burglary alarm",
  GOA: "Gone on arrival",
  HAN: "Officer handled",
  NCR: "No issue found",
  ND: "related to another call",
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
