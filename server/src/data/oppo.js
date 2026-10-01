const { m, v } = require("./_helpers");

const oppo = {
  brand: "Oppo", category: "phone",
  phones: {
    "Find": {
      "Find X": [...m(2018, "Find X"), ...m(2019, "Find X2 Lite"), ...m(2020, "Find X2", "Find X2 Pro", "Find X2 Neo"), ...m(2021, "Find X3", "Find X3 Pro", "Find X3 Neo", "Find X3 Lite"), ...m(2022, "Find X5", "Find X5 Pro", "Find X5 Lite"), ...m(2023, "Find X6", "Find X6 Pro"), ...m(2024, "Find X7", "Find X7 Ultra"), ...m(2025, "Find X8", "Find X8 Pro", "Find X8 Ultra", "Find X8s", "Find X8s+", "Find X9", "Find X9 Pro"), ...v(2026, "Find X10", "Find X10 Pro", "Find X10 Ultra")],
      "Find N (foldables)": [...m(2021, "Find N"), ...m(2022, "Find N2", "Find N2 Flip"), ...m(2023, "Find N3", "Find N3 Flip"), ...m(2025, "Find N5")],
    },
    "Reno": {
      "Reno 15 / 14 / 13": [...v(2026, "Reno15", "Reno15 Pro", "Reno15 F", "Reno15 FS", "Reno15 c"), ...m(2025, "Reno14", "Reno14 Pro", "Reno14 F", "Reno14 FS", "Reno14 F 5G", "Reno13", "Reno13 Pro", "Reno13 F", "Reno13 F 5G"), ...m(2024, "Reno12", "Reno12 Pro", "Reno12 F", "Reno12 FS")],
      "Reno 11 / 10 / 8": [...m(2023, "Reno11", "Reno11 Pro", "Reno11 F", "Reno10", "Reno10 Pro", "Reno10 Pro+", "Reno8 T", "Reno8 T 5G", "Reno8 Z", "Reno8 Pro", "Reno8"), ...m(2022, "Reno8", "Reno8 Lite", "Reno7", "Reno7 Pro", "Reno7 Z", "Reno7 SE", "Reno7 Lite", "Reno6", "Reno6 Pro", "Reno6 Z", "Reno6 Pro+")],
      "Reno 5 / 4 / 3 / 2 / Reno": [...m(2021, "Reno5", "Reno5 Pro", "Reno5 Pro+", "Reno5 Lite", "Reno5 F", "Reno5 Z", "Reno5 K"), ...m(2020, "Reno4", "Reno4 Pro", "Reno4 Z", "Reno4 F", "Reno4 Lite", "Reno4 SE", "Reno3", "Reno3 Pro", "Reno3 Youth"), ...m(2019, "Reno", "Reno 10x zoom", "Reno Z", "Reno2", "Reno2 Z", "Reno2 F", "Reno Ace")],
    },
    "A series": {
      "A6 / A5 / A4 (2025-2026)": [...m(2025, "A5", "A5 Pro", "A5x", "A5 Energy", "A5i", "A5m", "A5 Pro 4G", "A5 5G", "A5i Pro"), ...v(2026, "A6", "A6 Pro", "A6x", "A6i", "A6 GT", "A6 5G"), ...m(2025, "A3", "A3 Pro", "A3x", "A3 4G")],
      "A3x - A2x (2023-2024)": [...m(2024, "A3", "A3 Pro", "A3x", "A60", "A79", "A18", "A38", "A58", "A78", "A57s", "A17", "A17k", "A77s", "A77", "A57", "A16e"), ...m(2023, "A98", "A78 5G", "A58", "A38", "A18", "A1 5G", "A1x", "A2", "A2 Pro", "A2x", "A1 Pro", "A1")],
      "A9x - A5x (2019-2022)": [...m(2022, "A96", "A76", "A55", "A54s", "A16", "A16s", "A16k", "A57", "A57e", "A77", "A17"), ...m(2021, "A94", "A94 5G", "A74", "A74 5G", "A95", "A54", "A53s", "A53", "A35", "A15", "A15s", "A11s"), ...m(2020, "A92", "A92s", "A72", "A52", "A32", "A31", "A12", "A9 2020", "A5 2020", "A91", "A73", "A53", "A11", "A11x", "A8"), ...m(2019, "A9", "A5", "A5s", "A7", "A7n", "A3s", "A1k", "A1", "A12", "A1 (2018)").filter((d) => !d.name.includes("A1 (2018)"))],
    },
    "F series": { F: [...m(2019, "F11", "F11 Pro", "F9", "F9 Pro"), ...m(2020, "F15", "F17", "F17 Pro", "F19 Pro", "F19 Pro+"), ...m(2021, "F19", "F19s", "F21 Pro", "F21s Pro"), ...m(2022, "F21 Pro 5G", "F21s Pro 5G", "F23 5G"), ...m(2023, "F25 Pro 5G"), ...m(2024, "F27 Pro+", "F27", "F27 Pro"), ...m(2025, "F29", "F29 Pro", "F31", "F31 Pro", "F31 Pro+")] },
    "K series": { K: [...m(2019, "K3", "K1", "K5"), ...m(2020, "K7", "K7x", "K9", "K9s"), ...m(2021, "K9 Pro", "K9x"), ...m(2022, "K10", "K10 5G", "K10x", "K10 Pro"), ...m(2023, "K11", "K11x"), ...m(2024, "K12", "K12x", "K12 Plus", "K12s"), ...m(2025, "K13", "K13 Turbo", "K13 Turbo Pro", "K13x")] },
  },
};

const vivo = {
  brand: "Vivo", category: "phone",
  phones: {
    "X": {
      "X300 / X200 / X100": [...m(2025, "X300", "X300 Pro", "X300 FE", "X200", "X200 Pro", "X200 Pro mini", "X200 FE", "X200 Ultra", "X200s", "X Fold5"), ...v(2026, "X300 Ultra", "X500", "X500 Pro"), ...m(2024, "X100", "X100 Pro", "X100 Ultra", "X100s", "X100s Pro", "X100 FE", "X Fold3", "X Fold3 Pro"), ...m(2023, "X90", "X90 Pro", "X90 Pro+", "X90s", "X Fold2", "X Flip", "X Note")],
      "X80 / X70 / X60": [...m(2022, "X80", "X80 Pro", "X80 Lite", "X Fold", "X Note"), ...m(2021, "X70", "X70 Pro", "X70 Pro+", "X60", "X60 Pro", "X60 Pro+", "X60t Pro+"), ...m(2020, "X50", "X50 Pro", "X50 Pro+", "X50e", "X51 5G")],
      "X30 / X27 / older": m(2019, "X30", "X30 Pro", "X27", "X27 Pro", "Nex 3", "Nex 3S", "Nex", "Nex S", "Nex Dual Display"),
    },
    "V": {
      V: [...m(2019, "V15", "V15 Pro", "V17", "V17 Pro", "V11", "V11 Pro"), ...m(2020, "V19", "V20", "V20 SE", "V20 Pro"), ...m(2021, "V21", "V21e", "V21 5G", "V23", "V23 Pro", "V23e"), ...m(2022, "V25", "V25 Pro", "V25e", "V27", "V27 Pro", "V27e", "V29", "V29 Pro", "V29e"), ...m(2023, "V29 Lite", "V30", "V30 Pro", "V30e", "V29e"), ...m(2024, "V40", "V40 Pro", "V40e", "V40 SE", "V40 Lite"), ...m(2025, "V50", "V50 Lite", "V50e", "V60", "V60e", "V60 Lite"), ...v(2026, "V70", "V70 FE", "V70e")],
    },
    "Y": {
      "Y (2019-2020)": [...m(2019, "Y11", "Y12", "Y15", "Y17", "Y19", "Y91", "Y91c", "Y93", "Y95"), ...m(2020, "Y1s", "Y12s", "Y20", "Y20i", "Y20s", "Y30", "Y31", "Y50", "Y51")],
      "Y (2021-2022)": [...m(2021, "Y01", "Y15s", "Y21", "Y21s", "Y33s", "Y53s", "Y72 5G", "Y73", "Y75", "Y76 5G"), ...m(2022, "Y02", "Y02s", "Y16", "Y22", "Y22s", "Y35", "Y55", "Y55 5G", "Y75 5G")],
      "Y (2023-2024)": [...m(2023, "Y02t", "Y17s", "Y27", "Y27s", "Y36", "Y56 5G", "Y78", "Y100", "Y100A"), ...m(2024, "Y03", "Y18", "Y28", "Y28s", "Y38", "Y58", "Y200", "Y200e", "Y200 GT", "Y300", "Y37", "Y04")],
      "Y (2025-2026)": [...m(2025, "Y19s", "Y29", "Y29s", "Y39", "Y300 Pro", "Y300 GT", "Y400", "Y400 Pro", "Y500", "Y05", "Y19e"), ...v(2026, "Y31", "Y31 Pro", "Y50", "Y50 Pro", "Y500 Pro")],
    },
    "T": { T: [...m(2021, "T1", "T1x", "T1 5G", "T1 Pro 5G"), ...m(2022, "T1 44W"), ...m(2023, "T2", "T2x", "T2 Pro", "T2x 5G"), ...m(2024, "T3", "T3x", "T3 Pro", "T3 Lite", "T3 Ultra", "T3x 5G"), ...m(2025, "T4", "T4 Pro", "T4 Lite", "T4x", "T4R", "T4 Ultra", "T4x 5G")] },
    "iQOO (sub-brand)": { iQOO: [...m(2025, "iQOO 13", "iQOO Neo 10", "iQOO Neo 10R", "iQOO Z10", "iQOO Z10x", "iQOO Z10R", "iQOO 15", "iQOO Z10 Turbo"), ...m(2024, "iQOO 12", "iQOO Neo 9 Pro", "iQOO Z9", "iQOO Z9x", "iQOO Z9s")] },
    "S series": { S: [...m(2019, "S1", "S1 Pro", "S5"), ...m(2020, "S6"), ...m(2021, "S9", "S10", "S10 Pro", "S12", "S12 Pro"), ...m(2023, "S17", "S17 Pro", "S18", "S18 Pro"), ...m(2024, "S19", "S19 Pro", "S20", "S20 Pro"), ...m(2025, "S30", "S30 Pro mini", "S50", "S50 Pro mini")] },
  },
};

const realme = {
  brand: "Realme", category: "phone",
  phones: {
    "GT": { GT: [...m(2021, "GT 5G", "GT Master Edition", "GT Neo 2", "GT Neo 3"), ...m(2022, "GT 2", "GT 2 Pro", "GT Neo 3T", "GT Neo 5"), ...m(2023, "GT3", "GT Neo 5 SE", "GT5", "GT5 Pro", "GT Neo 6", "GT Neo 6 SE"), ...m(2024, "GT 6", "GT 6T", "GT 7 Pro", "GT 7 Pro Racing Edition"), ...m(2025, "GT 7", "GT 7T", "GT 8", "GT 8 Pro", "GT Neo 7", "GT Neo 7 SE", "GT Neo 7x")] },
    "Number series": {
      "Realme 16 / 15 / 14": [...v(2026, "Realme 16", "Realme 16 Pro", "Realme 16 Pro+", "Realme 16 5G", "Realme 16 Pro 5G"), ...m(2025, "Realme 15", "Realme 15 Pro", "Realme 15T", "Realme 15x", "Realme 14", "Realme 14 Pro", "Realme 14 Pro+", "Realme 14x", "Realme 14T", "Realme 14 5G")],
      "Realme 13 / 12 / 11": [...m(2024, "Realme 13", "Realme 13+", "Realme 13 Pro", "Realme 13 Pro+", "Realme 12", "Realme 12+", "Realme 12x", "Realme 12 Pro", "Realme 12 Pro+", "Realme 12 Lite", "Realme 12 4G"), ...m(2023, "Realme 11", "Realme 11 4G", "Realme 11 5G", "Realme 11 Pro", "Realme 11 Pro+", "Realme 11x")],
      "Realme 10 / 9 / 8": [...m(2023, "Realme 10", "Realme 10 Pro", "Realme 10 Pro+", "Realme 10s", "Realme 10T"), ...m(2022, "Realme 9", "Realme 9 4G", "Realme 9 5G", "Realme 9i", "Realme 9i 5G", "Realme 9 Pro", "Realme 9 Pro+", "Realme 9 SE", "Realme 9 Speed Edition"), ...m(2021, "Realme 8", "Realme 8 5G", "Realme 8 Pro", "Realme 8i", "Realme 8s")],
      "Realme 7 / 6 / 5 / 3 / 2": [...m(2020, "Realme 7", "Realme 7 5G", "Realme 7 Pro", "Realme 7i", "Realme 6", "Realme 6 Pro", "Realme 6i", "Realme 6s"), ...m(2019, "Realme 5", "Realme 5 Pro", "Realme 5i", "Realme 5s", "Realme 3", "Realme 3 Pro", "Realme 3i", "Realme 2", "Realme 2 Pro"), ...m(2018, "Realme 1", "Realme U1", "Realme C1")],
    },
    "Narzo": { Narzo: [...m(2020, "Narzo 10", "Narzo 10A", "Narzo 20", "Narzo 20A", "Narzo 20 Pro", "Narzo 30 Pro 5G"), ...m(2021, "Narzo 30", "Narzo 30A", "Narzo 30 5G", "Narzo 50", "Narzo 50A", "Narzo 50i", "Narzo 50 Pro", "Narzo 50A Prime", "Narzo 50 5G"), ...m(2022, "Narzo 50i Prime", "Narzo 50A Prime"), ...m(2023, "Narzo N53", "Narzo N55", "Narzo 60", "Narzo 60x", "Narzo 60 Pro", "Narzo N53"), ...m(2024, "Narzo N61", "Narzo 70", "Narzo 70x", "Narzo 70 Pro", "Narzo 70 Turbo", "Narzo 70x 5G", "Narzo 70 Curve"), ...m(2025, "Narzo 80 Pro", "Narzo 80x", "Narzo 80 Lite", "Narzo 80 Lite 5G", "Narzo N65", "Narzo 80"), ...v(2026, "Narzo 90", "Narzo 90x")] },
    "C series": { C: [...m(2019, "C2", "C3", "C2s"), ...m(2020, "C11", "C12", "C15", "C17", "C3", "C3i"), ...m(2021, "C11 2021", "C20", "C20A", "C21", "C21Y", "C25", "C25s", "C25Y", "C30"), ...m(2022, "C31", "C33", "C30s", "C35", "C35 Prime"), ...m(2023, "C51", "C53", "C55", "C67", "C67 5G", "C30"), ...m(2024, "C61", "C63", "C63 5G", "C65", "C65 5G", "C75", "C71"), ...m(2025, "C71", "C75x", "C73", "C73 5G", "C85 Pro", "C85", "C80"), ...v(2026, "C90", "C90 5G", "C81", "C83")] },
    "P series": { P: [...m(2024, "P1", "P1 Speed", "P1 Pro", "P2 Pro", "P3", "P3 Pro", "P3 Ultra", "P3x", "P3 Lite", "P4", "P4 Pro", "P4 Power")] },
    "Other": { Other: [...m(2019, "Realme X", "Realme X2", "Realme X2 Pro", "Realme XT", "Realme X Lite"), ...m(2020, "Realme X3", "Realme X3 SuperZoom", "Realme X50", "Realme X50 Pro", "Realme X7", "Realme X7 Pro"), ...m(2021, "Realme Q3", "Realme Q3 Pro", "Realme Q3s", "Realme Q3t", "Realme V11", "Realme V13", "Realme V15", "Realme V25", "Realme X7 Max", "Realme X7 Pro Ultra"), ...m(2022, "Realme Q5", "Realme Q5 Pro", "Realme Q5x", "Realme V20", "Realme V23", "Realme V30", "Realme V30t", "Realme Narzo 50"), ...m(2023, "Realme Q5i", "Realme V50", "Realme V50s", "Realme Note 50"), ...m(2024, "Realme Note 50", "Realme Note 60", "Realme Note 60x"), ...m(2025, "Realme Neo7", "Realme Neo7 SE", "Realme Neo7x", "Realme Note 70", "Realme Neo 8")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i) },
  },
};

const oneplus = {
  brand: "OnePlus", category: "phone",
  phones: {
    "Flagship (number series)": {
      "OnePlus 15 series": m(2025, "OnePlus 15", "OnePlus 15R", "OnePlus 15T"),
      "OnePlus 13 series": m(2024, "OnePlus 13", "OnePlus 13R", "OnePlus 13s", "OnePlus 13T"),
      "OnePlus 12 series": m(2024, "OnePlus 12", "OnePlus 12R", "OnePlus 12R Genshin Edition"),
      "OnePlus 11 series": m(2023, "OnePlus 11", "OnePlus 11R", "OnePlus 11 Jupiter Rock Edition"),
      "OnePlus 10 series": m(2022, "OnePlus 10 Pro", "OnePlus 10T", "OnePlus 10R", "OnePlus 10R Endurance Edition"),
      "OnePlus 9 series": m(2021, "OnePlus 9", "OnePlus 9 Pro", "OnePlus 9R", "OnePlus 9RT"),
      "OnePlus 8 series": m(2020, "OnePlus 8", "OnePlus 8 Pro", "OnePlus 8T", "OnePlus 8T+ 5G"),
      "OnePlus 7 series": m(2019, "OnePlus 7", "OnePlus 7 Pro", "OnePlus 7 Pro 5G", "OnePlus 7T", "OnePlus 7T Pro", "OnePlus 7T Pro 5G McLaren"),
      "OnePlus 6 and older": [...m(2018, "OnePlus 6", "OnePlus 6T", "OnePlus 6T McLaren"), ...m(2017, "OnePlus 5", "OnePlus 5T"), ...m(2016, "OnePlus 3", "OnePlus 3T"), ...m(2015, "OnePlus 2", "OnePlus X"), ...m(2014, "OnePlus One")],
    },
    "Nord": {
      "Nord (number)": [...m(2020, "Nord", "Nord N10 5G", "Nord N100"), ...m(2021, "Nord 2", "Nord 2 5G", "Nord CE 5G", "Nord N200 5G"), ...m(2022, "Nord 2T", "Nord CE 2", "Nord CE 2 Lite 5G", "Nord N20 5G", "Nord N20 SE"), ...m(2023, "Nord 3", "Nord CE 3", "Nord CE 3 Lite 5G", "Nord N30 5G", "Nord N30 SE 5G"), ...m(2024, "Nord CE4", "Nord CE4 Lite 5G", "Nord N30 SE"), ...m(2025, "Nord 5", "Nord CE5", "Nord 4", "Nord CE4 Lite", "Nord N30", "Nord 5 Lite", "Nord CE 5 Lite"), ...v(2026, "Nord 6", "Nord CE6")],
    },
    "Ace / Turbo / Open / Pad": { Other: [...m(2022, "OnePlus Ace", "OnePlus Ace Racing Edition", "OnePlus Ace Pro"), ...m(2023, "OnePlus Ace 2", "OnePlus Ace 2 Pro", "OnePlus Ace 2V", "OnePlus Open"), ...m(2024, "OnePlus Ace 3", "OnePlus Ace 3 Pro", "OnePlus Ace 3V"), ...m(2025, "OnePlus Ace 5", "OnePlus Ace 5 Pro", "OnePlus Ace 5 Racing Edition", "OnePlus Ace 5 Ultra", "OnePlus Ace 6", "OnePlus Ace 6T"), ...v(2025, "OnePlus Open 2"), ...m(2025, "OnePlus Turbo 6", "OnePlus Turbo 6V")] },
  },
};

module.exports = [oppo, vivo, realme, oneplus];