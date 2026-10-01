const { m, v } = require("./_helpers");

const tecno = {
  brand: "Tecno", category: "phone",
  phones: {
    "Spark": {
      "Spark 50 series": [...m(2026, "Spark 50", "Spark 50 5G", "Spark Go 3", "Spark Slim"), ...v(2026, "Spark 50 Pro", "Spark 50C")],
      "Spark 40 series": m(2025, "Spark 40", "Spark 40 Pro", "Spark 40 Pro+", "Spark 40C", "Spark Go 5G", "Spark Go 2"),
      "Spark 30 series": m(2024, "Spark 30", "Spark 30 5G", "Spark 30 Pro", "Spark 30C", "Spark 30C 5G"),
      "Spark 20 series": m(2023, "Spark 20", "Spark 20 Pro", "Spark 20 Pro+", "Spark 20C", "Spark Go 2024"),
      "Spark 10 series": m(2023, "Spark 10", "Spark 10 5G", "Spark 10 Pro", "Spark 10C"),
      "Spark 9 / 8": [...m(2022, "Spark 9", "Spark 9 Pro", "Spark 9T", "Spark Go 2022", "Spark 8C"), ...m(2021, "Spark 8", "Spark 8 Pro", "Spark 8P", "Spark 8T", "Spark 7", "Spark 7 Pro", "Spark 7P", "Spark 7T")],
      "Spark 6 / 5 / 4": [...m(2020, "Spark 6", "Spark 6 Go", "Spark 6 Air", "Spark 5", "Spark 5 Pro", "Spark 5 Air"), ...m(2019, "Spark 4", "Spark 4 Lite", "Spark 4 Air", "Spark 3 Pro", "Spark Power", "Spark Power 2")],
    },
    "Camon": {
      "Camon 50 series": [...m(2026, "Camon 50", "Camon 50 Ultra 5G"), ...v(2026, "Camon 50 Pro", "Camon 50 5G")],
      "Camon 40 series": m(2025, "Camon 40", "Camon 40 Pro", "Camon 40 Pro 5G", "Camon 40 Premier 5G"),
      "Camon 30 series": m(2024, "Camon 30", "Camon 30 5G", "Camon 30 Pro 5G", "Camon 30 Premier 5G", "Camon 30S", "Camon 30S Pro"),
      "Camon 20 series": m(2023, "Camon 20", "Camon 20 Pro", "Camon 20 Pro 5G", "Camon 20 Premier 5G"),
      "Camon 19 / 18": [...m(2022, "Camon 19", "Camon 19 Pro", "Camon 19 Pro 5G", "Camon 19 Neo"), ...m(2021, "Camon 18", "Camon 18 Premier", "Camon 18P", "Camon 18T", "Camon 17", "Camon 17 Pro", "Camon 17P")],
      "Camon 16 / 15": [...m(2020, "Camon 16", "Camon 16 Pro", "Camon 16 Premier", "Camon 16 SE", "Camon 15", "Camon 15 Pro", "Camon 15 Air", "Camon 15 Premier"), ...m(2019, "Camon 12", "Camon 12 Air", "Camon 12 Pro", "Camon iTwin", "Camon iSky 3", "Camon CM", "Camon X", "Camon X Pro")],
      "Camon 11 / older": m(2018, "Camon 11", "Camon 11 Pro", "Camon CX", "Camon CX Air"),
    },
    "Pova": {
      Pova: [...m(2020, "Pova"), ...m(2021, "Pova 2"), ...m(2022, "Pova 3", "Pova 4", "Pova 4 Pro", "Pova Neo 2"), ...m(2023, "Pova 5", "Pova 5 Pro", "Pova Neo 3"), ...m(2024, "Pova 6", "Pova 6 Pro 5G", "Pova 6 Neo 5G", "Pova 6 Neo"), ...m(2025, "Pova 7", "Pova 7 Pro", "Pova 7 5G", "Pova 7 Pro 5G", "Pova Slim", "Pova Curve"), ...m(2026, "Pova Curve 2"), ...v(2026, "Pova 8", "Pova 8 Pro")],
    },
    "Phantom": {
      "Phantom V (foldables)": [...m(2023, "Phantom V Fold", "Phantom V Flip"), ...m(2024, "Phantom V Fold2", "Phantom V Flip2")].map((d) => ({ ...d, name: d.name.replace("Fold2", "Fold 2").replace("Flip2", "Flip 2") })),
      "Phantom X": [...m(2021, "Phantom X"), ...m(2022, "Phantom X2", "Phantom X2 Pro"), ...m(2025, "Phantom X2 (2025)", "Phantom X2 Pro (2025)")].filter((d) => !d.name.includes("(2025)")).concat(v(2025, "Phantom X2 (new gen)", "Phantom X2 Pro (new gen)")),
      "Phantom Ultimate / Ultimate G": [...m(2023, "Phantom Ultimate")].concat(v(2025, "Phantom Ultimate G Fold")),
    },
    "Pop": {
      Pop: [...m(2019, "Pop 2F", "Pop 2 Power", "Pop 3"), ...m(2020, "Pop 4", "Pop 4 Air", "Pop 4 Pro", "Pop 5 LTE", "Pop 5P", "Pop 5 Go"), ...m(2021, "Pop 5", "Pop 5 Pro"), ...m(2022, "Pop 6", "Pop 6 Pro", "Pop 6 Go", "Pop 7", "Pop 7 Pro"), ...m(2023, "Pop 8"), ...m(2024, "Pop 9", "Pop 9 5G"), ...m(2025, "Pop 10", "Pop 10 5G")],
    },
    "Other": {
      "Tecno others": [...m(2020, "Tecno Camon CM", "Tecno F3", "Tecno Pouvoir 4", "Tecno Pouvoir 4 Pro", "Tecno Pouvoir 3", "Tecno Pouvoir 3 Air"), ...m(2021, "Tecno Pouvoir 5", "Tecno Pouvoir 5 Pro"), ...m(2019, "Tecno Phantom 9", "Tecno Phantom 8", "Tecno Phantom 6 Plus", "Tecno Spark 3", "Tecno Spark 3 Pro"), ...m(2018, "Tecno WX3", "Tecno WX4", "Tecno i3", "Tecno i5", "Tecno i7", "Tecno L8", "Tecno L9", "Tecno L9 Plus", "Tecno Pouvoir 2")],
      "Tecno Megapad / feature phones": [...m(2023, "Tecno Megapad 10"), ...m(2025, "Tecno Megapad 11"), ...v(2025, "Tecno T301", "Tecno T101", "Tecno T312", "Tecno T606", "Tecno T454", "Tecno T528")],
    },
  },
};

const infinix = {
  brand: "Infinix", category: "phone",
  phones: {
    "Hot": {
      "Hot 70 series": [...v(2026, "Hot 70", "Hot 70 Pro", "Hot 70 Pro+", "Hot 70i", "Hot 70 Play")],
      "Hot 60 series": m(2025, "Hot 60", "Hot 60i", "Hot 60 5G+", "Hot 60i 5G", "Hot 60 Pro", "Hot 60 Pro+"),
      "Hot 50 series": m(2024, "Hot 50", "Hot 50 5G", "Hot 50i", "Hot 50 Pro", "Hot 50 Pro+", "Hot 50 Pro 4G", "Hot 50 Pro+ 4G"),
      "Hot 40 series": m(2023, "Hot 40", "Hot 40 Pro", "Hot 40i", "Hot 40 Play"),
      "Hot 30 series": m(2023, "Hot 30", "Hot 30 5G", "Hot 30i", "Hot 30 Play", "Hot 30 Free Fire Edition"),
      "Hot 20 / 12": [...m(2022, "Hot 20", "Hot 20 5G", "Hot 20i", "Hot 20S", "Hot 20 Play", "Hot 12", "Hot 12 Pro", "Hot 12 Play", "Hot 12i", "Hot 11", "Hot 11S", "Hot 11S NFC", "Hot 11 2022", "Hot 11 Play")],
      "Hot 10 and older": [...m(2021, "Hot 10", "Hot 10 Play", "Hot 10i", "Hot 10S", "Hot 10S NFC", "Hot 10T", "Hot 10 Lite"), ...m(2020, "Hot 9", "Hot 9 Play", "Hot 9 Pro"), ...m(2019, "Hot 8", "Hot 8 Lite", "Hot 7", "Hot 7 Pro"), ...m(2018, "Hot 6", "Hot 6 Pro", "Hot 6X", "Hot S3")],
    },
    "Note": {
      "Note 60 series": [...m(2026, "Note 60", "Note 60 Pro", "Note 60 Ultra")],
      "Note 50 series": m(2025, "Note 50", "Note 50 Pro", "Note 50 Pro+ 5G", "Note 50 Pro 4G", "Note 50x 5G", "Note 50s", "Note Edge"),
      "Note 40 series": m(2024, "Note 40", "Note 40 5G", "Note 40 Pro", "Note 40 Pro 4G", "Note 40 Pro 5G", "Note 40 Pro+ 5G", "Note 40s", "Note 40X 5G", "Note 40 Racing Edition"),
      "Note 30 series": m(2023, "Note 30", "Note 30 5G", "Note 30 Pro", "Note 30 VIP", "Note 30i", "Note 30 Play"),
      "Note 12 series": m(2022, "Note 12", "Note 12 5G", "Note 12 Pro", "Note 12 Pro 5G", "Note 12 VIP", "Note 12 G96", "Note 12i", "Note 12 2023", "Note 12 Turbo"),
      "Note 11 series": m(2022, "Note 11", "Note 11S", "Note 11 Pro", "Note 11i"),
      "Note 10 series": m(2021, "Note 10", "Note 10 Pro", "Note 10 Pro NFC", "Note 10 Pro Gaming", "Note 11 (2021)").filter((d) => !d.name.includes("(2021)")),
      "Note 8 / 7 / older": [...m(2020, "Note 8", "Note 8i", "Note 7", "Note 7 Lite"), ...m(2019, "Note 6", "Note 5", "Note 5 Stylus", "Note 4", "Note 4 Pro"), ...m(2017, "Note 4", "Note 3", "Note 3 Pro")],
    },
    "Zero": {
      "Zero / Zero Ultra / Zero Flip": [...m(2019, "Zero 6", "Zero 6 Pro", "Zero 5", "Zero 5 Pro", "Zero 4"), ...m(2021, "Zero 8", "Zero 8i", "Zero X", "Zero X Pro", "Zero X Neo"), ...m(2022, "Zero 20", "Zero Ultra", "Zero 5G", "Zero 5G 2023"), ...m(2023, "Zero 30 4G", "Zero 30 5G"), ...m(2024, "Zero 40", "Zero 40 4G", "Zero Flip", "Zero Flip 5G"), ...v(2025, "Zero 50", "Zero 50 5G")],
    },
    "Smart": {
      Smart: [...m(2019, "Smart 3", "Smart 3 Plus", "Smart 4", "Smart 4 Plus"), ...m(2020, "Smart 5", "Smart HD 2021", "Smart 5A"), ...m(2021, "Smart 6", "Smart 6 Plus", "Smart 6 HD", "Smart 6 NFC", "Smart 5 Pro"), ...m(2022, "Smart 7", "Smart 7 HD", "Smart 7 Plus", "Smart 6 Plus 2022"), ...m(2023, "Smart 8", "Smart 8 HD", "Smart 8 Plus", "Smart 8 Pro", "Smart 8 (India)"), ...m(2024, "Smart 9", "Smart 9 HD"), ...m(2025, "Smart 10", "Smart 10 HD", "Smart 10 Plus"), ...m(2026, "Smart 20")],
    },
    "GT": {
      GT: [...m(2023, "GT 10 Pro"), ...m(2024, "GT 20 Pro"), ...m(2025, "GT 30", "GT 30 5G+", "GT 30 Pro", "GT 30 Pro Gaming Master Edition"), ...m(2026, "GT 50 Pro")],
    },
    "Other": { Other: [...m(2024, "Infinix Xpad", "Infinix Xpad GT"), ...m(2025, "Infinix XPAD Edge"), ...m(2019, "Infinix S5", "Infinix S5 Lite", "Infinix S5 Pro"), ...m(2020, "Infinix S4", "Infinix S3X", "Infinix S3")] },
  },
};

const itel = {
  brand: "Itel", category: "phone",
  phones: {
    "A series (entry)": {
      "itel A (2023-2026)": [...v(2026, "A100", "A90 (2026)").filter((d) => !d.name.includes("2026")), ...m(2025, "itel A80", "itel A95 5G", "itel A90", "itel A70", "itel A60s", "itel A50", "itel A50C", "itel A49", "itel A18", "itel A05s", "itel A04", "itel A03"), ...m(2023, "itel A60", "itel A58", "itel A58 Pro", "itel A48", "itel A33", "itel A33 Plus")],
      "itel A (2019-2022)": [...m(2022, "itel A27", "itel A37", "itel A17", "itel A26", "itel A25", "itel A25 Pro", "itel A23", "itel A23 Pro"), ...m(2021, "itel A14", "itel A15", "itel A16 Plus", "itel A36"), ...m(2020, "itel A46", "itel A56", "itel A56 Pro", "itel A35", "itel A44", "itel A44 Pro", "itel A44 Air", "itel A55", "itel A53", "itel A51"), ...m(2019, "itel A45", "itel A62", "itel A32F", "itel A22", "itel A22 Pro", "itel A21")],
    },
    "P series (power)": {
      P: [...m(2022, "itel P37", "itel P38", "itel P38 Pro"), ...m(2023, "itel P40", "itel P40+", "itel P55", "itel P55+", "itel P55T", "itel P55 5G"), ...m(2024, "itel P55 5G", "itel P65", "itel P65 Pro"), ...m(2025, "itel P70", "itel Power 70", "itel P71")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i),
    },
    "S series": {
      S: [...m(2020, "itel S15", "itel S15 Pro", "itel S16", "itel S16 Pro", "itel S12", "itel S12 Pro"), ...m(2021, "itel S17", "itel S17 Pro"), ...m(2022, "itel S18", "itel S18 Pro"), ...m(2023, "itel S23", "itel S23+", "itel S23 Plus"), ...m(2024, "itel S24", "itel S25", "itel S25 Ultra", "itel S18 Pro 5G"), ...m(2025, "itel S25", "itel S25 Ultra", "itel S26", "itel S26 Ultra")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i),
    },
    "Vision / Color / City / Zeno / Super": {
      Other: [...m(2019, "itel Vision 1", "itel Vision 1 Plus", "itel Vision 1 Pro", "itel Vision 2", "itel Vision 2S", "itel Vision 3", "itel Vision 3 Plus", "itel Vision 3 Turbo"), ...m(2023, "itel Vision 5", "itel Vision 6"), ...m(2024, "itel Color Pro 5G", "itel City 100", "itel RS4", "itel Super 26 Ultra"), ...m(2025, "itel Zeno 10", "itel Zeno 20", "itel Zeno 50", "itel City 200", "itel Super 26 Ultra", "itel Flip One", "itel Super Guru 4G", "itel Magic X", "itel Magic X Pro")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i),
      "itel feature phones": [...m(2020, "itel it2160", "itel it5026", "itel it5606", "itel it5618"), ...m(2021, "itel it9210", "itel it2171"), ...v(2025, "itel Super Guru 4G", "itel Shine Guru", "itel Giant Pro")],
    },
  },
};

module.exports = [tecno, infinix, itel];