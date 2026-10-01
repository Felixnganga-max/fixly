// Rugged / AliExpress-style brands. Series-level only and ALL entries flagged verify: these brands ship
// dozens of near-identical SKUs a year and I did not check them online. Names below are the ones I am
// reasonably sure exist; the lists are known to be INCOMPLETE. Do a scrape of GSMArena's brand pages
// (Ulefone, Umidigi, Doogee, Blackview, Cubot, Oukitel, Oscal) for the full set.
const series = (...names) => ({ "Known lines (incomplete)": names.map((name) => ({ name, year: null, verify: true })) });
const brand = (name, ...names) => ({ brand: name, category: "phone", confidence: "low", phones: { [`${name}`]: series(...names) } });

module.exports = [
  brand("Ulefone", "Armor 11", "Armor 12", "Armor 13", "Armor 15", "Armor 16 Pro", "Armor 17 Pro", "Armor 18", "Armor 19", "Armor X5", "Armor X6", "Armor X7", "Armor X8", "Armor X9", "Note 14", "Note 15", "Note 16 Pro", "Power Armor 13", "Power Armor 14", "Power Armor 16 Pro", "Power Armor 18T"),
  brand("Umidigi", "A9", "A9 Pro", "A11", "A11 Pro Max", "A13", "A13 Pro", "A15", "A15C", "C1", "F1", "F3", "G5", "G6 5G", "G9 5G", "G9C", "Bison", "Bison X10", "Bison GT2", "Power 5", "Power 7"),
  brand("Doogee", "S59 Pro", "S61 Pro", "S88 Pro", "S89 Pro", "S96 Pro", "S97 Pro", "S98 Pro", "S100 Pro", "V20", "V20 Pro", "V30", "V30T", "V Max", "V Blade", "Blade10", "N50", "N50 Pro", "N55", "Smini"),
  brand("Blackview", "BV4900", "BV5100", "BV5300", "BV5500", "BV5800", "BV5900", "BV6600", "BV6800 Pro", "BV7100", "BV8800", "BV9300", "BV9500", "BV9600", "BV9800", "BV9900", "Shark 8", "Hero 10", "Active 8", "Tab 13", "Tab 16"),
  brand("Cubot", "Kingkong 5", "Kingkong 5 Pro", "Kingkong 7", "Kingkong 8", "Kingkong 9", "Kingkong Mini", "Kingkong Mini 2", "Kingkong Mini 3", "Kingkong Star", "Kingkong Power", "Kingkong AX", "Kingkong ACE", "Kingkong ACE 2", "Note 20", "Note 21", "Note 30", "Note 40", "Note 50", "P60", "P80", "X30", "X70", "X90", "Pocket 3", "Max 3"),
  brand("Oukitel", "WP5", "WP5 Pro", "WP6", "WP7", "WP8 Pro", "WP9", "WP10", "WP12", "WP13", "WP15", "WP16", "WP17", "WP18", "WP19", "WP20", "WP21", "WP23", "WP25", "WP26", "WP27", "WP28", "WP30 Pro", "WP32", "WP33 Pro", "WP35", "WP36", "WP38", "K9", "K10", "K15 Plus", "K15 Pro", "C21", "C21 Pro", "C22", "C23 Pro", "C32", "C33", "C35", "C36", "RT1", "RT2", "RT3", "RT5", "RT6", "RT7", "RT8"),
  brand("Oscal", "Tiger 10", "Tiger 12", "Spider 8", "Spider 10", "C20 Pro", "C30 Pro", "C60", "S60", "S60 Pro", "Pad 13", "Pad 15", "Pad 16", "Pad 60", "Pad 70", "Flat 1", "Pilot 1"),
  // Rugone: I could not recall reliable model names and did not look it up, so this stays empty on purpose.
  { brand: "Rugone", category: "phone", confidence: "unresearched", phones: {} },
];