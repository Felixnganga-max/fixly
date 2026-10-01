// data/devices/samsung.js
// Samsung catalog grouped by type -> series -> sub-series -> models.
// Shape is deliberately plain so you can map it onto your own Device model.
// Every model is { name, year } where year is the announcement year.
//
// CONFIDENCE NOTES
//  - 2026 entries were checked online on 30 Sep 2026 (Samsung newsroom, GSMArena,
//    GSMchoice, Wikipedia, SamMobile, Notebookcheck).
//  - Older entries come from background knowledge; spot-check before publishing.
//  - Regional 4G/5G/Duos twins and carrier variants are NOT listed separately.
//  - Not listed: pre-2018 A/J/C/E/Grand/Core-era handsets, feature phones, tablets, wearables.

const m = (year, ...names) => names.map((name) => ({ name, year }));

module.exports = {
  brand: "Samsung",
  category: "all", // matches seedBrands.js (sold as phones and laptops)

  phones: {
    "Galaxy S": {
      "S26 series": [
        ...m(2026, "Galaxy S26", "Galaxy S26+", "Galaxy S26 Ultra", "Galaxy S26 FE"),
      ],
      "S25 series": [
        ...m(2025, "Galaxy S25", "Galaxy S25+", "Galaxy S25 Ultra", "Galaxy S25 Edge", "Galaxy S25 FE"),
      ],
      "S24 series": [
        ...m(2024, "Galaxy S24", "Galaxy S24+", "Galaxy S24 Ultra", "Galaxy S24 FE"),
      ],
      "S23 series": [
        ...m(2023, "Galaxy S23", "Galaxy S23+", "Galaxy S23 Ultra", "Galaxy S23 FE"),
      ],
      "S22 series": [...m(2022, "Galaxy S22", "Galaxy S22+", "Galaxy S22 Ultra")],
      "S21 series": [
        ...m(2021, "Galaxy S21", "Galaxy S21+", "Galaxy S21 Ultra", "Galaxy S21 FE"),
      ],
      "S20 series": [
        ...m(2020, "Galaxy S20", "Galaxy S20+", "Galaxy S20 Ultra", "Galaxy S20 FE"),
      ],
      "S10 series": [
        ...m(2019, "Galaxy S10e", "Galaxy S10", "Galaxy S10+", "Galaxy S10 5G", "Galaxy S10 Lite"),
      ],
      "S9 series": [...m(2018, "Galaxy S9", "Galaxy S9+")],
      "S8 series": [...m(2017, "Galaxy S8", "Galaxy S8+", "Galaxy S8 Active")],
      "S7 series": [...m(2016, "Galaxy S7", "Galaxy S7 edge", "Galaxy S7 Active")],
      "S6 series": [
        ...m(2015, "Galaxy S6", "Galaxy S6 edge", "Galaxy S6 edge+", "Galaxy S6 Active"),
      ],
    },

    "Galaxy Note": {
      "Note 20 series": [...m(2020, "Galaxy Note20", "Galaxy Note20 Ultra")],
      "Note 10 series": [...m(2019, "Galaxy Note10", "Galaxy Note10+", "Galaxy Note10 Lite")],
      "Note 9": [...m(2018, "Galaxy Note9")],
      "Note 8": [...m(2017, "Galaxy Note8")],
      "Note FE": [...m(2017, "Galaxy Note FE")],
    },

    "Galaxy Z (Foldables)": {
      "Z Fold": [
        ...m(2019, "Galaxy Fold"),
        ...m(2020, "Galaxy Z Fold2"),
        ...m(2021, "Galaxy Z Fold3"),
        ...m(2022, "Galaxy Z Fold4"),
        ...m(2023, "Galaxy Z Fold5"),
        ...m(2024, "Galaxy Z Fold6", "Galaxy Z Fold Special Edition"),
        ...m(2025, "Galaxy Z Fold7"),
        ...m(2026, "Galaxy Z Fold8", "Galaxy Z Fold8 Ultra"),
      ],
      "Z Flip": [
        ...m(2020, "Galaxy Z Flip"),
        ...m(2021, "Galaxy Z Flip3"),
        ...m(2022, "Galaxy Z Flip4"),
        ...m(2023, "Galaxy Z Flip5"),
        ...m(2024, "Galaxy Z Flip6"),
        ...m(2025, "Galaxy Z Flip7", "Galaxy Z Flip7 FE"),
        ...m(2026, "Galaxy Z Flip8"),
      ],
      "Z TriFold": [...m(2025, "Galaxy Z TriFold")],
    },

    "Galaxy A": {
      "A0x (entry)": [
        ...m(2020, "Galaxy A01", "Galaxy A01 Core"),
        ...m(2021, "Galaxy A02", "Galaxy A02s"),
        ...m(2022, "Galaxy A03", "Galaxy A03s", "Galaxy A03 Core"),
        ...m(2023, "Galaxy A04", "Galaxy A04e", "Galaxy A04s"),
        ...m(2023, "Galaxy A05", "Galaxy A05s"),
        ...m(2024, "Galaxy A06", "Galaxy A06 5G"),
        ...m(2025, "Galaxy A07", "Galaxy A07 5G"),
        ...m(2026, "Galaxy A08 4G"),
      ],
      "A1x": [
        ...m(2019, "Galaxy A10", "Galaxy A10e", "Galaxy A10s"),
        ...m(2020, "Galaxy A11"),
        ...m(2021, "Galaxy A12"),
        ...m(2022, "Galaxy A13", "Galaxy A13 5G"),
        ...m(2023, "Galaxy A14", "Galaxy A14 5G"),
        ...m(2024, "Galaxy A15", "Galaxy A15 5G"),
        ...m(2024, "Galaxy A16", "Galaxy A16 5G"),
        ...m(2025, "Galaxy A17", "Galaxy A17 5G"),
        ...m(2026, "Galaxy A17 4G", "Galaxy A18"), // A18 listed by GSMchoice; verify before publishing
      ],
      "A2x": [
        ...m(2019, "Galaxy A20", "Galaxy A20e", "Galaxy A20s"),
        ...m(2020, "Galaxy A21", "Galaxy A21s"),
        ...m(2021, "Galaxy A22", "Galaxy A22 5G"),
        ...m(2022, "Galaxy A23", "Galaxy A23 5G"),
        ...m(2023, "Galaxy A24"),
        ...m(2023, "Galaxy A25 5G"),
        ...m(2025, "Galaxy A26 5G"),
        ...m(2026, "Galaxy A27"),
      ],
      "A3x": [
        ...m(2019, "Galaxy A30", "Galaxy A30s"),
        ...m(2020, "Galaxy A31"),
        ...m(2021, "Galaxy A32", "Galaxy A32 5G"),
        ...m(2022, "Galaxy A33 5G"),
        ...m(2023, "Galaxy A34 5G"),
        ...m(2024, "Galaxy A35 5G"),
        ...m(2025, "Galaxy A36 5G"),
        ...m(2026, "Galaxy A37"),
      ],
      "A4x": [
        ...m(2019, "Galaxy A40"),
        ...m(2020, "Galaxy A41"),
        ...m(2020, "Galaxy A42 5G"),
      ],
      "A5x": [
        ...m(2019, "Galaxy A50", "Galaxy A50s"),
        ...m(2020, "Galaxy A51", "Galaxy A51 5G"),
        ...m(2021, "Galaxy A52", "Galaxy A52 5G", "Galaxy A52s 5G"),
        ...m(2022, "Galaxy A53 5G"),
        ...m(2023, "Galaxy A54 5G"),
        ...m(2024, "Galaxy A55 5G"),
        ...m(2025, "Galaxy A56 5G"),
        ...m(2026, "Galaxy A57"),
      ],
      "A6x": [...m(2019, "Galaxy A60")],
      "A7x": [
        ...m(2019, "Galaxy A70", "Galaxy A70s"),
        ...m(2020, "Galaxy A71", "Galaxy A71 5G"),
        ...m(2021, "Galaxy A72"),
        ...m(2022, "Galaxy A73 5G"),
      ],
      "A8x / A9x": [
        ...m(2019, "Galaxy A80", "Galaxy A90 5G"),
      ],
      "A (2018 naming)": [
        ...m(2018, "Galaxy A6", "Galaxy A6+", "Galaxy A7 (2018)", "Galaxy A8 (2018)", "Galaxy A8+ (2018)", "Galaxy A8s", "Galaxy A9 (2018)"),
      ],
    },

    "Galaxy M": {
      "M0x": [
        ...m(2020, "Galaxy M01", "Galaxy M01 Core", "Galaxy M01s"),
        ...m(2021, "Galaxy M02", "Galaxy M02s"),
        ...m(2024, "Galaxy M05"),
        ...m(2025, "Galaxy M06 5G", "Galaxy M07"),
      ],
      "M1x": [
        ...m(2019, "Galaxy M10", "Galaxy M10s"),
        ...m(2020, "Galaxy M11"),
        ...m(2021, "Galaxy M12"),
        ...m(2022, "Galaxy M13", "Galaxy M13 5G"),
        ...m(2023, "Galaxy M14 5G"),
        ...m(2024, "Galaxy M15 5G"),
        ...m(2025, "Galaxy M16 5G", "Galaxy M17 5G"),
        ...m(2026, "Galaxy M17e 5G"),
      ],
      "M2x": [
        ...m(2019, "Galaxy M20"),
        ...m(2020, "Galaxy M21", "Galaxy M21s"),
        ...m(2021, "Galaxy M22"),
        ...m(2022, "Galaxy M23 5G"),
      ],
      "M3x": [
        ...m(2019, "Galaxy M30", "Galaxy M30s"),
        ...m(2020, "Galaxy M31", "Galaxy M31s"),
        ...m(2021, "Galaxy M32", "Galaxy M32 5G"),
        ...m(2022, "Galaxy M33 5G"),
        ...m(2023, "Galaxy M34 5G"),
        ...m(2024, "Galaxy M35 5G"),
        ...m(2025, "Galaxy M36 5G"),
      ],
      "M4x": [
        ...m(2019, "Galaxy M40"),
        ...m(2021, "Galaxy M42 5G"),
        ...m(2023, "Galaxy M44 5G"),
        ...m(2026, "Galaxy M47 5G"),
      ],
      "M5x / M6x": [
        ...m(2020, "Galaxy M51"),
        ...m(2021, "Galaxy M52 5G", "Galaxy M62"),
        ...m(2022, "Galaxy M53 5G"),
        ...m(2023, "Galaxy M54 5G"),
        ...m(2024, "Galaxy M55 5G", "Galaxy M55s 5G"),
        ...m(2025, "Galaxy M56 5G"),
      ],
    },

    "Galaxy F": {
      "F0x": [
        ...m(2021, "Galaxy F02s"),
        ...m(2022, "Galaxy F04"),
        ...m(2024, "Galaxy F05", "Galaxy F06 5G"),
        ...m(2025, "Galaxy F07"),
        ...m(2026, "Galaxy F08 4G"),
      ],
      "F1x": [
        ...m(2021, "Galaxy F12"),
        ...m(2022, "Galaxy F13"),
        ...m(2023, "Galaxy F14 5G"),
        ...m(2024, "Galaxy F15 5G"),
        ...m(2025, "Galaxy F16 5G", "Galaxy F17 5G"),
      ],
      "F2x - F6x": [
        ...m(2020, "Galaxy F41"),
        ...m(2021, "Galaxy F22", "Galaxy F42 5G", "Galaxy F52 5G", "Galaxy F62"),
        ...m(2022, "Galaxy F23 5G"),
        ...m(2023, "Galaxy F34 5G", "Galaxy F54 5G"),
        ...m(2024, "Galaxy F55 5G"),
        ...m(2025, "Galaxy F36 5G", "Galaxy F56 5G"),
      ],
      "F7x": [...m(2026, "Galaxy F70e 5G", "Galaxy F70 Pro 5G")],
    },

    "Galaxy XCover (rugged)": {
      XCover: [
        ...m(2020, "Galaxy XCover Pro"),
        ...m(2022, "Galaxy XCover6 Pro"),
        ...m(2023, "Galaxy XCover7"),
        ...m(2025, "Galaxy XCover7 Pro"),
      ],
    },

    "Galaxy Quantum (India)": {
      Quantum: [
        ...m(2020, "Galaxy Quantum2"),
        ...m(2022, "Galaxy Quantum3"),
        ...m(2023, "Galaxy Quantum4"),
        ...m(2024, "Galaxy Quantum5"),
        ...m(2025, "Galaxy Quantum6"),
        ...m(2026, "Galaxy Quantum7"),
      ],
    },

    "W series (China)": {
      W: [...m(2024, "Samsung W25", "Samsung W25 Flip"), ...m(2025, "Samsung W26")],
    },
  },

  laptops: {
    "Galaxy Book": {
      "Book6 series": [
        ...m(2026, "Galaxy Book6", "Galaxy Book6 Pro", "Galaxy Book6 Ultra"),
        // Book6 Edge / Book6 Pro 360 were still rumored as of April 2026; verify before adding.
      ],
      "Book5 series": [
        ...m(2025, "Galaxy Book5", "Galaxy Book5 360", "Galaxy Book5 Pro", "Galaxy Book5 Pro 360", "Galaxy Book5 Edge"),
      ],
      "Book4 series": [
        ...m(2024, "Galaxy Book4", "Galaxy Book4 360", "Galaxy Book4 Pro", "Galaxy Book4 Pro 360", "Galaxy Book4 Ultra", "Galaxy Book4 Edge"),
      ],
      "Book3 series": [
        ...m(2023, "Galaxy Book3", "Galaxy Book3 360", "Galaxy Book3 Pro", "Galaxy Book3 Pro 360", "Galaxy Book3 Ultra"),
      ],
      "Book2 series": [
        ...m(2022, "Galaxy Book2", "Galaxy Book2 360", "Galaxy Book2 Pro", "Galaxy Book2 Pro 360", "Galaxy Book2 Business", "Galaxy Book2 Go"),
      ],
      "Book (first gen)": [
        ...m(2021, "Galaxy Book Pro", "Galaxy Book Pro 360", "Galaxy Book Go", "Galaxy Book Odyssey"),
        ...m(2020, "Galaxy Book Flex", "Galaxy Book Flex5G", "Galaxy Book Ion", "Galaxy Book S"),
      ],
    },
    "Galaxy Chromebook": {
      Chromebook: [
        ...m(2020, "Galaxy Chromebook"),
        ...m(2021, "Galaxy Chromebook 2", "Galaxy Chromebook Go"),
        ...m(2022, "Galaxy Chromebook 2 360"),
      ],
    },
  },
};