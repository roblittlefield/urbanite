import { SFDATA_API_KEY } from "../../apikeys.js";

export const maxCalls = 700;
export const timeElapSF = 120; // 6h
export const nearbyRadius = 500;
export const timeElapNearby = 180; // Nearby
export const maxHoursAgo = 48; // 60h
export const centerPopupTolerance = 100;

export const getLatLngSF = () => {
  return window.innerWidth <= 758 ? [37.758, -122.43] : [37.762, -122.445];
};
export const getMapZoomLevel = () => {
  return window.innerWidth <= 758 ? 14 : 15;
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

export const includedCallTypesPDlive = [
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

  ["AGG ASSAULT / ADW", "#FFF000"], // Yellow
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
  ARR: "Arrest",
  CAN: "Cancelled",
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
