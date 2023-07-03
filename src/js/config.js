import { SFDATA_API_KEY } from "../../apikeys.js";

export const maxCalls = 4000;
export const timeElapSF = 120;
export const nearbyRadius = 500;
export const timeElapNearby = 180;
export const maxHoursAgo = 48.5;
export const centerPopupTolerance = 100;

export const getLatLngSF = () => {
  return window.innerWidth <= 758 ? [37.764, -122.419] : [37.764, -122.424];
};
export const getMapZoomLevel = () => {
  return window.innerWidth <= 758 ? 14 : 15;
};

export const nearbyCircleOpt = {
  radius: 500, // m
  color: "white",
  fillColor: "blue",
  fillOpacity: 0.1,
  weight: 1,
};

export const MAP_LAYERS = [
  "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg",
  "https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg",
  "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png",
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
];

const API_URL_POLICE_48h = "https://data.sfgov.org/resource/gnap-fj3t.json";

const excludedCallTypes = [
  "PASSING CALL",
  "TRAF VIOLATION CITE",
  "TRAF VIOLATION TOW",
  "WELL BEING CHECK",
  "CITIZEN STANDBY",
  "MEET W/CITIZEN",
  "MEET W/CITY EMPLOYEE",
  "TRAFFIC HAZARD",
  "INVESTIGATION DETAIL",
  "TOW TRUCK",
  "COMPLAINT UNKN",
  "VEHICLE ALARM",
  "HOMELESS COMPLAINT",
  "PERSON DUMPING",
  "MISSING ADULT",
  "NOISE NUISANCE",
  // "SUSPICIOUS PERSON",
  // "WANTED VEHICLE / SUB",
];

export const includedCallTypes = [
  "FIGHT NO WEAPON",
  "TRESPASSER",
  "BURGLARY",
  "AUTO BOOST / STRIP",
  "STOLEN VEHICLE",
  "ASSAULT / BATTERY",
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
  "WANTED VEHICLE / SUB",
  "SUSPICIOUS PERSON",
  "FIRE",
];

export const colorMap = new Map([
  ["SHOOTING", "#d53e5c"], // Crimson
  ["SHOTS FIRED", "#d53e5c"],
  ["PERSON W/GUN", "#d53e5c"],
  ["SHOT SPOTTER", "#d53e5c"],

  ["STABBING", "#f46d43"], // Orange
  ["PERSON W/KNIFE", "#f46d43"],
  ["FIGHT W/WEAPONS", "#f46d43"],
  ["AGG ASSAULT / ADW", "#f46d43"], // YellowOrange
  ["FIRE", "#f46d43"],

  ["FIGHT NO WEAPON", "#fdae61"], // YellowOrange
  ["ASSAULT / BATTERY", "#fdae61"],

  ["STRONGARM ROBBERY", "#b4c15a"],
  ["GRAND THEFT", "#f0fe8b"], // Yellow
  ["PURSE SNATCH", "#f0fe8b"],
  ["ROBBERY", "#f0fe8b"],
  ["BURGLARY", "#f0fe8b"],
  ["PERSON BREAKING IN", "#f0fe8b"],
  ["SILENT HOLDUP ALARM", "#f0fe8b"],

  ["TRESPASSER", "#3288bd"], // Blue
  ["PROWLER", "#3288bd"],
  ["STALKING", "#3288bd"],

  ["WANTED VEHICLE / SUB", "#00af7c"], // Green
  ["SUSPICIOUS PERSON", "#888888"],

  ["MENTALLY DISTURBED", "#66c2a5"], // Yelow-Green
  ["INTOXICATED PERSON", "#66c2a5"],
  ["PERSON SCREAMING", "#66c2a5"],
  ["DRUNK DRIVER", "#66c2a5"],

  ["STOLEN VEHICLE", "#a358ea"],
  ["AUTO BOOST / STRIP", "#f598ea"], // Pink

  ["H&R INJURY ACCIDENT", "#3288bd"],
  ["H&R VEH ACCIDENT", "#3288bd"], // Black
  ["INJURY VEH ACCIDENT", "#3288bd"],
  ["ARREST MADE", "#00af7c"],
  ["RESISTING ARREST", "#00af7c"],
  ["CITIZEN ARREST", "#00af7c"],
  ["DEMO / PROTEST", "#a098f5"],
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

  ["AGG ASSAULT / ADW", "Aggravated assault"],
  ["ASSAULT / BATTERY", "Assault / battery"],
  ["STRONGARM ROBBERY", "Strong-arm robbery"],
  ["GRAND THEFT", "Grand theft"],
  ["PURSE SNATCH", "Purse snatch"],
  ["ROBBERY", "Robbery"],
  ["BURGLARY", "Burglary"],
  ["PERSON BREAKING IN", "Person breaking in"],
  ["SILENT HOLDUP ALARM", "Silent hold-up alarm"],
  ["FIRE", "Fire"],

  ["TRESPASSER", "Trespasser"],
  ["PROWLER", "Prowler"],
  ["STALKING", "Stalking"],

  ["WANTED VEHICLE / SUB", "Wanted vehicle / person"],
  ["SUSPICIOUS PERSON", "Suspicious person"],

  ["MENTALLY DISTURBED", "Mentally disturbed person"],
  ["INTOXICATED PERSON", "Intoxicated person"],
  ["PERSON SCREAMING", "Person screaming"],
  ["DRUNK DRIVER", "Drunk driver"],

  ["STOLEN VEHICLE", "Stolen vehicle"],
  ["AUTO BOOST / STRIP", "Car break-in/strip"],

  ["H&R INJURY ACCIDENT", "Hit & run with injuries"],
  ["H&R VEH ACCIDENT", "Hit & run with no injuries"],
  ["INJURY VEH ACCIDENT", "Car crash with injuries"],
  ["ARREST MADE", "Arrest made"],
  ["RESISTING ARREST", "Resisting arrest"],
  ["CITIZEN ARREST", "Citizen arrest"],
  ["DEMO / PROTEST", "Demonstration / protest"],
]);

const filterExpression = excludedCallTypes
  .map((callType) => `call_type_final_desc != '${callType}'`)
  .join(" and ");
export const API_URL_POLICE_48h_FILTERED = `${API_URL_POLICE_48h}?$where=${filterExpression} AND intersection_point IS NOT NULL&$$app_token=${SFDATA_API_KEY}&$limit=2500`;

export const PARAM_MAP_POLICE_48h = {
  cadNumber: "cad_number",
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
  priority: "priority_final",
  onView: "onview_flag",
  sensitive: "sensitive_call",
};

export const DISPOSITION_REF_POLICE = {
  ABA: "Officer abated",
  ADM: "Officer admonished",
  ADV: "Officer advised",
  ARR: "Arrest made",
  CAN: "Call cancelled",
  CSA: "CPSA assignment",
  CIT: "Citation issued",
  CRM: "Burglary alarm",
  GOA: "Gone on arrival",
  HAN: "Officer handled",
  NCR: "No issue found",
  ND: "Related call",
  NOM: "No merit",
  PAS: "Home alarm",
  REP: "Police report made",
  SFD: "EMS engaged",
  UTL: "Unable to locate",
  VAS: "Car alarm",
};
