// Who ruled where, by year. Boundaries are approximate: ancient borders shifted and are known mostly from Josephus.
// Coordinates: [longitude, latitude]. Years: negative = BC (there is no year 0, so -4 means 4 BC).
const REALMS = {
  galilee:   { name: "Galilee", poly: [[35.18,33.05],[35.45,33.12],[35.60,33.10],[35.63,32.90],[35.65,32.80],[35.59,32.70],[35.55,32.56],[35.30,32.55],[35.12,32.65],[35.10,32.85]] },
  samaria:   { name: "Samaria", poly: [[35.55,32.56],[35.30,32.55],[35.12,32.65],[34.96,32.66],[34.86,32.40],[34.80,32.12],[35.00,32.06],[35.25,32.03],[35.54,32.06]] },
  judea:     { name: "Judea", poly: [[34.80,32.12],[35.00,32.06],[35.25,32.03],[35.54,32.06],[35.55,31.77],[35.45,31.70],[35.39,31.50],[35.38,31.35],[35.00,31.36],[34.75,31.55],[34.62,31.78]] },
  idumea:    { name: "Idumea", poly: [[35.38,31.35],[35.39,31.08],[35.10,30.95],[34.75,31.10],[34.55,31.40],[34.75,31.55],[35.00,31.36]] },
  perea:     { name: "Perea", poly: [[35.56,32.44],[35.75,32.42],[35.82,32.15],[35.76,31.85],[35.70,31.52],[35.58,31.52],[35.58,31.72],[35.55,31.77],[35.54,32.06],[35.55,32.25]] },
  decapolis: { name: "Decapolis", poly: [[35.65,32.80],[35.70,32.85],[36.00,32.85],[36.20,32.60],[36.10,32.10],[35.90,31.92],[35.82,32.15],[35.75,32.42],[35.56,32.44],[35.45,32.45],[35.45,32.56],[35.55,32.56],[35.59,32.70]] },
  philip:    { name: "Gaulanitis, Batanea, Trachonitis", poly: [[35.60,33.10],[35.63,32.90],[35.65,32.80],[35.70,32.85],[36.00,32.85],[36.20,32.60],[36.60,32.62],[36.75,33.00],[36.35,33.32],[35.88,33.38],[35.66,33.28]] },
  nabataea:  { name: "Nabataea", poly: [[35.58,31.52],[35.70,31.52],[35.76,31.85],[35.90,31.92],[36.10,32.10],[36.70,32.00],[37.60,31.00],[37.00,29.40],[35.00,29.40],[34.90,29.50],[34.55,30.40],[34.75,31.10],[35.10,30.95],[35.39,31.08],[35.42,30.96],[35.48,30.96],[35.52,31.10],[35.57,31.30]] },
  phoenicia: { name: "Phoenicia and Syria", poly: [[35.10,32.85],[35.18,33.05],[35.45,33.12],[35.60,33.10],[35.66,33.28],[35.88,33.38],[36.35,33.32],[36.75,33.00],[37.20,33.40],[36.80,34.60],[35.95,34.60],[35.64,34.12],[35.45,33.73],[35.19,33.27],[35.09,33.0]] },
  egypt:     { name: "Egypt", poly: [[29.00,30.85],[29.50,30.98],[29.90,31.20],[30.07,31.32],[30.36,31.46],[31.00,31.58],[31.60,31.55],[31.84,31.52],[32.30,31.27],[32.55,31.05],[32.70,31.10],[33.10,31.20],[33.50,31.15],[33.80,31.13],[34.00,30.40],[33.80,29.70],[32.55,29.95],[32.60,29.50],[32.95,29.15],[33.55,28.35],[33.83,27.25],[33.60,26.50],[29.00,26.50]] }
};

// Each ruler gets one color; the same ruler keeps the same color across years.
const RULER_COLORS = {
  herod: "#a3263f", archelaus: "#c4612a", antipas: "#7a3f9c", philip: "#1f8a7f", agrippa1: "#b03a78", agrippa2: "#3f7fb5",
  rome: "#c08a1c", syria: "#6b7a8f", decapolis: "#8a8f45", nabataea: "#8b5a3c", egypt: "#b59a52"
};

function emperorAt(y) {
  return y < 14 ? "Augustus (27 BC to AD 14)" : y < 37 ? "Tiberius (AD 14 to 37)" : y < 41 ? "Caligula (AD 37 to 41)" : y < 54 ? "Claudius (AD 41 to 54)" : y < 68.5 ? "Nero (AD 54 to 68)" : y < 70 ? "Galba, Otho and Vitellius (AD 68 to 69)" : y < 79 ? "Vespasian (AD 69 to 79)" : y < 81 ? "Titus (AD 79 to 81)" : y < 96 ? "Domitian (AD 81 to 96)" : "Nerva (AD 96 to 98)";
}

function prefectAt(y) {
  return y < 9 ? "Coponius" : y < 12 ? "Marcus Ambivulus" : y < 15 ? "Annius Rufus" : y < 26 ? "Valerius Gratus" : y < 36 ? "Pontius Pilate" : y < 37 ? "Marcellus" : "Marullus";
}

// Returns { regionId: { key, who, title } } for a year.
function rulersAt(y) {
  const R = {};
  const set = (ids, key, who, title) => ids.forEach(id => R[id] = { key, who, title });
  const herodian = ["galilee", "samaria", "judea", "idumea", "perea", "philip"];
  if (y < -4) set(herodian, "herod", "Herod the Great", "King of Judea, 37 to 4 BC, a client king of Rome");
  else if (y < 6) {
    set(["judea", "samaria", "idumea"], "archelaus", "Archelaus", "Ethnarch, 4 BC to AD 6, deposed by Augustus");
    set(["galilee", "perea"], "antipas", "Herod Antipas", "Tetrarch, 4 BC to AD 39");
    set(["philip"], "philip", "Philip", "Tetrarch, 4 BC to AD 34");
  } else if (y < 41) {
    set(["judea", "samaria", "idumea"], "rome", prefectAt(y), "Roman prefect of Judea, in Caesarea");
    if (y < 39) set(["galilee", "perea"], "antipas", "Herod Antipas", "Tetrarch, 4 BC to AD 39");
    else set(["galilee", "perea"], "agrippa1", "Agrippa I", "King, given Antipas' lands in AD 39");
    if (y < 34) set(["philip"], "philip", "Philip", "Tetrarch, 4 BC to AD 34");
    else if (y < 37) set(["philip"], "syria", "Province of Syria", "Annexed after Philip's death in AD 34");
    else set(["philip"], "agrippa1", "Agrippa I", "King from AD 37");
  } else if (y < 44) set(herodian, "agrippa1", "Agrippa I", "King of Judea, AD 41 to 44");
  else if (y >= 70) {
    set(["galilee", "samaria", "judea", "idumea", "perea"], "rome", "Roman legate of Judaea", "After Titus took Jerusalem in AD 70, a province with a legion camped in the ruined city");
    set(["philip"], "agrippa2", "Agrippa II", "King of Philip's former lands until his death, c. AD 93 to 100");
  } else {
    set(["galilee", "samaria", "judea", "idumea", "perea"], "rome", "Roman procurators", "Judea a Roman province again from AD 44");
    if (y < 53) set(["philip"], "rome", "Roman procurators", "Judea a Roman province again from AD 44");
    else set(["philip"], "agrippa2", "Agrippa II", "King of Philip's former lands from AD 53");
  }
  R.decapolis = { key: "decapolis", who: "Free cities of the Decapolis", title: "Self-governing Greek cities under the governor of Syria" };
  R.nabataea = y < -9 ? { key: "nabataea", who: "Obodas III", title: "King of the Nabataeans, at Petra" }
    : y < 40 ? { key: "nabataea", who: "Aretas IV", title: "King of the Nabataeans, 9 BC to AD 40, at Petra" }
    : { key: "nabataea", who: "Malichus II", title: "King of the Nabataeans, AD 40 to 70" };
  R.phoenicia = { key: "syria", who: "Province of Syria", title: "Governed by a Roman legate at Antioch" };
  R.egypt = { key: "egypt", who: "Roman Egypt", title: "Ruled for the emperor by a prefect at Alexandria" };
  return R;
}

// A year for an event: its own `year`, or the first year in its date ("c. 6–4 BC" is -6, "Spring AD 32" is 32).
function yearOf(e) {
  if (typeof e.year === "number") return e.year;
  const ad = String(e.date).match(/AD (\d+)/); if (ad) return +ad[1];
  const bc = String(e.date).match(/(\d+)(?:[–-]\d+)? BC/); return bc ? -bc[1] : 0;
}
