import {
  SFDATA_API_KEY,
  THUNDERFOREST_API_KEY,
  JAWG_API_KEY,
} from "../../apikeys.js";

// SFPD calls mapping key parameters
export const maxCalls = 4000;
export const timeElapSF = 120;
export const nearbyRadius = 500;
export const timeElapNearby = 180;
export const maxHoursAgo = 48.5;
export const centerPopupTolerance = 100;

// Defaulet Leaflet map starting coordinates for desktop and mobile
export const getLatLngSF = () => {
  return window.innerWidth <= 758 ? [37.7653, -122.419] : [37.7653, -122.424];
};

// Default Leaflet map starting zoom levels for desktop and mobile
export const getMapZoomLevel = () => {
  return window.innerWidth <= 758 ? 14 : 15;
};

// Specifications for "nearby" transparent blue circle added to Leaflet map
export const nearbyCircleOpt = {
  radius: 500, // m
  color: "white",
  fillColor: "yellow",
  fillOpacity: 0.2,
  weight: 1,
};

export const exactPositionCircleOpt = {
  radius: 12, // m
  color: "white",
  fillColor: "#3288bd",
  fillOpacity: 1,
  weight: 3,
};

// Specifications for police "recently on-scene" blue circle added to Leaflet map
export const onSceneCircleOpt = {
  radius: 120, // m
  color: "rgba(0, 0, 255, 0.6)",
  fillColor: "blue",
  fillOpacity: 0.25,
  opacity: 1,
  weight: 0,
  className: "response-circle",
};

// Leaflet map tile URL addresses
export const MAP_LAYERS = [
  // Light Mode
  // "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png", // 0 Gray/Green
  `https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=${THUNDERFOREST_API_KEY}`, // Thunderforest Atlas (light)
  "https://cdn.lima-labs.com/{z}/{x}/{y}.png?api=demo", // 5 Urban
  "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", // OpenStreet.HOT (light)
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", // 6 Open Street Map Urban (light)
  // `https://tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=${THUNDERFOREST_API_KEY}`, // Thunderforest Neighborhood (light)
  // `https://tile.jawg.io/f4092ed7-ed42-471b-84e3-a481315be2a6/{z}/{x}/{y}{r}.png?access-token=${JAWG_API_KEY}`, // Cusotom Jawg Lagoon
  // `https://tile.jawg.io/jawg-lagoon/{z}/{x}/{y}{r}.png?access-token=${JAWG_API_KEY}`, // Jawg Lagoon
  // Dark Mode
  // "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", // 1 Dark
  `https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=${JAWG_API_KEY}`, // Jawg Dark (ok)
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", // (very dark)
  // `https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=${THUNDERFOREST_API_KEY}`, // Thunderforest Landscape (purple light gray)
  // `https://tile.thunderforest.com/spinal-map/{z}/{x}/{y}.png?apikey=${THUNDERFOREST_API_KEY}`, // Thunderforest Spinal (black) Dark
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", // OpenTop (orange, gray, yellow)
  //
  // Fun Mode
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", // 4 Satellite Photos
  "https://{s}.tile-cyclosm.opens÷treetmap.fr/cyclosm/{z}/{x}/{y}.png", // CycloOSM (light)
  // `https://tile.thunderforest.com/pioneer/{z}/{x}/{y}.png?apikey=${THUNDERFOREST_API_KEY}`, // Pioneer (light: gray, green)
  // `https://tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey=${THUNDERFOREST_API_KEY}`, // Thunderforest Mobile Atlast (light: white w red lines)
  //
  // "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg", // 2 Watercolor
  // "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png", // 3 Black n White
  // "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png", // 5 Light
];

// SFPD Real-Time calls base URL
const API_URL_POLICE_48h = "https://data.sfgov.org/resource/gnap-fj3t.json";

// List of excluded SFPD call types
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
];

// List of included SFPD call types
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

// Dictionary of SFPD call circle marker colors by call type
export const colorMap = new Map([
  ["SHOOTING", "#d53e5c"], // Crimson
  ["SHOTS FIRED", "#d53e5c"],
  ["PERSON W/GUN", "#d53e5c"],
  ["SHOT SPOTTER", "#d53e5c"],

  ["STABBING", "#f46d43"], // Orange
  ["PERSON W/KNIFE", "#f46d43"],
  ["STRONGARM ROBBERY", "#f46d43"],

  ["FIGHT W/WEAPONS", "#f46d43"],
  ["AGG ASSAULT / ADW", "#f46d43"], // YellowOrange
  ["FIRE", "#f46d43"],

  ["FIGHT NO WEAPON", "#fdae61"], // YellowOrange
  ["ASSAULT / BATTERY", "#fdae61"],

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

  ["STOLEN VEHICLE", "#a358ea"], // Purple
  ["AUTO BOOST / STRIP", "#f598ea"], // Pink

  ["H&R INJURY ACCIDENT", "#3288bd"],
  ["H&R VEH ACCIDENT", "#3288bd"], // Black
  ["INJURY VEH ACCIDENT", "#3288bd"],
  ["ARREST MADE", "#00af7c"],
  ["RESISTING ARREST", "#00af7c"],
  ["CITIZEN ARREST", "#00af7c"],
  ["DEMO / PROTEST", "#a098f5"],
]);

// Mapping of SFPD call types to more readible / easy to understand descriptive call types
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
  ["AUTO BOOST / STRIP", "Car break-in / strip"],

  ["H&R INJURY ACCIDENT", "Hit & run with injuries"],
  ["H&R VEH ACCIDENT", "Hit & run with no injuries"],
  ["INJURY VEH ACCIDENT", "Car crash with injuries"],
  ["ARREST MADE", "Arrest made"],
  ["RESISTING ARREST", "Resisting arrest"],
  ["CITIZEN ARREST", "Citizen arrest"],
  ["DEMO / PROTEST", "Demonstration / protest"],
]);

// SFPD Real-Time combined address for API call
const filterExpression = excludedCallTypes
  .map((callType) => `call_type_final_desc != '${callType}'`)
  .join(" and ");
export const API_URL_POLICE_48h_FILTERED = `${API_URL_POLICE_48h}?$where=${filterExpression} AND intersection_point IS NOT NULL&$$app_token=${SFDATA_API_KEY}&$limit=4000`;

// SFPD calls JSON data parameters
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
  notes_original: "call_type_original_notes",
  notes_final: "call_type_final_notes",
};

// SFPD Call disposition / conclusion dictionary
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

// SF Police station locations (latitude / longitude coordinates)
export const STATION_LOCATIONS = [
  [37.76293, -122.42198], // Mission
  [37.7987, -122.4099], // Central
  [37.772527, -122.38904], // Southern/HQ
  [37.78016, -122.43245], // Northern
  [37.72975, -122.39802], // Bayview
  [37.72466, -122.4463], // Ingleside
  [37.74374, -122.48147], // Taraval
  [37.78368, -122.41291], // Tenderloin
  [37.76779, -122.4552], // Park
  [37.78003, -122.46447], // Richmond
];

// Police station Leaflet custom marker pop-up content
export const STATION_NAMES = [
  "<strong>Mission<br>Station</strong><br>415-558-5400",
  "<strong>Central<br>Station</strong><br>415-315-2400",
  "<strong>Southern<br>Station /<br>SFPD HQ</strong><br>415-553-0123",
  "<strong>Northern<br>Station</strong><br>415-614-3400",
  "<strong>Bayview<br>Station</strong><br>415-671-2300",
  "<strong>Ingleside<br>Station</strong><br>415-404-4000",
  "<strong>Taraval<br>Station</strong><br>415-759-3100",
  "<strong>Tenderloin<br>Station</strong><br>415-345-7300",
  "<strong>Park<br>Station</strong><br>415-242-3000",
  "<strong>Richmond<br>Station</strong><br>415-666-8000",
];

// SFPD Call Notes Dictionary
export const callnotesMap = new Map([
  ["212", "strongarm robbery"],
  ["212 POSS", "strongarm robbery, possesion"],
  ["221", "person with a gun"],
  ["221 POSS", "person with a gun, possession"],
  ["222", "person with a knife"],
  ["311X", "indecent exposure"],
  ["5150", "mental health detention"],
  ["531", "suspected explosive device found"],
  ["594", "malicious mischief/graffiti"],
  ["600", "roadblock"],
  ["647B", "prostitute"],
  ["650", "threats"],
  ["802", "dead person"],
  ["806", "juvenile beyond control"],
  ["811", "intoxicated person"],
  ["819", "drunk rolling"],
  ["910", "check on a well being"],
  ["911", "broken window"],
  ["911 OPEN", "broken window"],
  ["912", "person dumping trash"],
  ["916", "suspicious person in a vehicle"],
  ["917", "suspicious person"],
  ["918", "suspicious yelling/screaming for help"],
  ["AGGRESIVE", "aggressive"],
  ["AGGRESSIVE", "aggressive"],
  ["AGRESSIVE", "aggressive"],
  ["APS", "adult protective service"],
  ["ATT", "attempt"],
  ["AXE", "axe"],
  ["BB GUN", "BB gun"],
  ["BULLET HOLE", "bullet hole"],
  ["CASER", "caser"],
  ["DEALERS", "dealers"],
  ["DOG", "dog"],
  ["DOG BITE", "dog bite"],
  ["DOG BITE REP", "report of dog bite"],
  ["DPW", "DPW"],
  ["DRINKING", "drinking"],
  ["DRUG DEALER", "drug dealer"],
  ["DRUG DEALERS", "drug dealers"],
  ["DRUG SALES", "drug sales"],
  ["DRUGS", "drugs"],
  ["DRUGS DEALER", "drug dealer"],
  ["DRUGS DEALERS", "drug dealers"],
  ["E BIKE", "e-bike"],
  ["FEMALE", "female"],
  ["FOUND PROPERTY", "found property"],
  ["FRIEND", "friend"],
  ["FAMILY", "family"],
  ["GAS", "gas"],
  ["HEATED", "heated"],
  ["JO", "juvenile offender"],
  ["LEP", "limited english proficiency"],
  ["LEP/JO", "juvenile offender, limited english proficiency"],
  ["LOITERING", "loitering"],
  ["MACE", "mace"],
  ["MALE", "male"],
  ["METAL POLE", "metal pole"],
  ["MULTIPLE VEHS", "multiple vehicles"],
  ["MUSIC", "music"],
  ["OUTSIDE FIRE", "outside fire"],
  ["PARTY", "party"],
  ["PED", "pedestrian"],
  ["PEPPERSPRAY", "pepper spray"],
  ["PHYSICAL", "physical"],
  ["PICK AX", "pick axe"],
  ["PICK AXE", "pick axe"],
  ["PRIVATE PROPERTY", "private property"],
  ["R/O", "restraining order"],
  ["R/O VIOLATION", "restraining order violation"],
  ["ROAD RAGE", "road rage"],
  ["RO VIOLATION", "restraining order violation"],
  ["SALES", "sales"],
  ["SCOOTER", "scooter"],
  ["SHELTER", "shelter"],
  ["SKATEBOARDERS", "skateboarders"],
  ["TEXT TO 911", "text to 911"],
  ["THROWING THING ON SW", "throwing things on sidewalk"],
  ["UNOCCUPIED", "unoccupied"],
  ["VEHICLE FIRE", "vehicle fire"],
  ["VERBAL", "verbal"],
  ["VIOLENT OD", "violent OD"],
  ["WALK THROUGH", "walk through"],
  ["WATER DEPT", "water department"],
  ["488", "petty theft"],
  ["488/240", "petty theft, assault/battery"],
  ["459 CASER", "burglary caser"],
  ["MACHETE", "machete"],
]);
