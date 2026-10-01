const { m, v } = require("./_helpers");

const huawei = {
  brand: "Huawei", category: "all",
  phones: {
    "Mate": {
      "Mate 80 series": v(2025, "Mate 80", "Mate 80 Pro", "Mate 80 Pro Max", "Mate 80 RS Ultimate"),
      "Mate 70 series": m(2024, "Mate 70", "Mate 70 Pro", "Mate 70 Pro+", "Mate 70 RS Ultimate").concat(m(2025, "Mate 70 Air")),
      "Mate 60 series": m(2023, "Mate 60", "Mate 60 Pro", "Mate 60 Pro+", "Mate 60 RS Ultimate"),
      "Mate 50 series": m(2022, "Mate 50", "Mate 50 Pro", "Mate 50 E", "Mate 50 RS Porsche Design"),
      "Mate 40 series": m(2020, "Mate 40", "Mate 40 Pro", "Mate 40 Pro+", "Mate 40 RS Porsche Design", "Mate 40E"),
      "Mate 30 series": m(2019, "Mate 30", "Mate 30 Pro", "Mate 30 RS Porsche Design", "Mate 30 Pro 5G"),
      "Mate 20 series": m(2018, "Mate 20", "Mate 20 Pro", "Mate 20 X", "Mate 20 Lite", "Mate 20 RS Porsche Design"),
    },
    "Mate X / Foldables": {
      "Mate X": [...m(2019, "Mate X"), ...m(2020, "Mate Xs"), ...m(2021, "Mate X2"), ...m(2022, "Mate Xs 2"), ...m(2023, "Mate X3", "Mate X5"), ...m(2024, "Mate X6"), ...m(2025, "Mate X7")],
      "Mate XT (tri-fold)": [...m(2024, "Mate XT Ultimate Design"), ...m(2025, "Mate XTs")],
      "Pocket / Pura X": [...m(2021, "P50 Pocket"), ...m(2023, "Pocket 2"), ...m(2024, "nova Flip"), ...m(2025, "Pura X", "Pocket 3", "nova Flip S"), ...v(2026, "Pura X Max")],
    },
    "Pura / P": {
      "Pura 80 series": m(2025, "Pura 80", "Pura 80 Pro", "Pura 80 Pro+", "Pura 80 Ultra"),
      "Pura 70 series": m(2024, "Pura 70", "Pura 70 Pro", "Pura 70 Pro+", "Pura 70 Ultra"),
      "P60 series": m(2023, "P60", "P60 Pro", "P60 Art"),
      "P50 series": m(2021, "P50", "P50 Pro", "P50 Pocket"),
      "P40 series": m(2020, "P40", "P40 Pro", "P40 Pro+", "P40 Lite", "P40 Lite E", "P40 Lite 5G"),
      "P30 series": m(2019, "P30", "P30 Pro", "P30 Lite"),
      "P20 series": m(2018, "P20", "P20 Pro", "P20 Lite"),
      "P Smart": [...m(2018, "P Smart"), ...m(2019, "P Smart 2019", "P Smart Z", "P Smart+ 2019"), ...m(2020, "P Smart 2020", "P Smart S", "P Smart Pro"), ...m(2021, "P Smart 2021")],
    },
    "nova": {
      "nova (flagship-mid)": [
        ...m(2019, "nova 5T", "nova 5i", "nova 5 Pro"), ...m(2020, "nova 7", "nova 7 Pro", "nova 7 SE", "nova 7i", "nova 8i"),
        ...m(2021, "nova 8", "nova 8 Pro", "nova 9", "nova 9 SE"), ...m(2022, "nova 10", "nova 10 Pro", "nova 10 SE", "nova Y70", "nova Y90"),
        ...m(2023, "nova 11", "nova 11 Pro", "nova 11 Ultra", "nova 11i", "nova 11 SE", "nova Y71", "nova Y91"),
        ...m(2024, "nova 12", "nova 12 Pro", "nova 12 Ultra", "nova 12 SE", "nova 12i", "nova 12s", "nova Y61"),
        ...m(2025, "nova 13", "nova 13 Pro", "nova 14", "nova 14 Pro", "nova 14 Ultra", "nova 14 Vitality", "nova Y72", "nova Y73"),
        ...v(2026, "nova 15", "nova 15 Pro", "nova 15 Ultra"),
      ],
    },
    "Y series": { Y: [...m(2019, "Y5 2019", "Y6 2019", "Y7 Prime 2019", "Y7 Pro 2019", "Y9 2019", "Y9 Prime 2019"), ...m(2020, "Y5p", "Y6p", "Y7p", "Y8p", "Y9s", "Y6s", "Y9a", "Y7a"), ...m(2021, "Y6 2021", "Y7a", "Y9a"), ...m(2022, "Y9 Prime (new)")] },
    "Enjoy": { Enjoy: [...m(2020, "Enjoy 10", "Enjoy 20", "Enjoy Z 5G"), ...m(2021, "Enjoy 20 SE", "Enjoy 20 Pro", "Enjoy 50"), ...m(2022, "Enjoy 50", "Enjoy 50 Pro"), ...m(2023, "Enjoy 60", "Enjoy 60 Pro"), ...m(2024, "Enjoy 70", "Enjoy 70 Pro", "Enjoy 70X"), ...m(2025, "Enjoy 80", "Enjoy 80 Pro")] },
    "Honor-era (pre-2021)": { Honor: [...m(2018, "Honor 10", "Honor 9 Lite")] },
  },
  laptops: {
    MateBook: {
      "MateBook X": [...m(2018, "MateBook X Pro (2018)"), ...m(2020, "MateBook X Pro (2020)", "MateBook X (2020)"), ...m(2021, "MateBook X Pro (2021)"), ...m(2022, "MateBook X Pro (2022)"), ...m(2023, "MateBook X Pro (2023)"), ...m(2024, "MateBook X Pro (2024)")],
      "MateBook D": [...m(2019, "MateBook D 14", "MateBook D 15"), ...m(2021, "MateBook D 14 (2021)", "MateBook D 15 (2021)", "MateBook D 16"), ...m(2022, "MateBook D 16 (2022)"), ...m(2023, "MateBook D 14 (2023)", "MateBook D 16 (2023)"), ...m(2024, "MateBook D 16 (2024)")],
      "MateBook 14 / 16": [...m(2020, "MateBook 13", "MateBook 14 (2020)"), ...m(2021, "MateBook 14s", "MateBook 16"), ...m(2022, "MateBook 16s"), ...m(2023, "MateBook 14s (2023)", "MateBook 16s (2023)"), ...m(2024, "MateBook 14 (2024)")],
      "MateBook E / Fold / Pro": [...m(2019, "MateBook E (2019)"), ...m(2022, "MateBook E (2022)"), ...m(2023, "MateBook E (2023)"), ...m(2024, "MateBook Fold Ultimate Design"), ...m(2025, "MateBook Pro"), ...v(2025, "MateBook GT 14", "MateBook Fold (2025)")],
    },
  },
};

const honor = {
  brand: "Honor", category: "all",
  phones: {
    "Magic": {
      "Magic8 series": [...v(2025, "Magic8", "Magic8 Pro", "Magic8 Pro Air", "Magic8 RSR Porsche Design", "Magic8 Lite")],
      "Magic7 series": m(2024, "Magic7", "Magic7 Pro", "Magic7 RSR Porsche Design").concat(m(2025, "Magic7 Lite")),
      "Magic6 series": m(2024, "Magic6", "Magic6 Pro", "Magic6 Lite", "Magic6 Ultimate", "Magic6 RSR Porsche Design"),
      "Magic5 series": m(2023, "Magic5", "Magic5 Pro", "Magic5 Lite", "Magic5 Ultimate"),
      "Magic4 series": m(2022, "Magic4", "Magic4 Pro", "Magic4 Lite", "Magic4 Ultimate", "Magic4 Pro+"),
      "Magic3 series": m(2021, "Magic3", "Magic3 Pro", "Magic3 Pro+", "Magic3 Pro+ Ultimate"),
      "Magic V (foldables)": [...m(2022, "Magic V"), ...m(2023, "Magic V2"), ...m(2024, "Magic V3"), ...m(2025, "Magic V5"), ...v(2026, "Magic V6")],
      "Magic V Flip": [...m(2024, "Magic V Flip"), ...m(2025, "Magic V Flip2")],
      "Magic Vs": [...m(2023, "Magic Vs", "Magic Vs2", "Magic Vs3")],
    },
    "Number series": {
      "Honor 400 / 500": [...m(2025, "Honor 400", "Honor 400 Pro", "Honor 400 Lite", "Honor 400 Smart"), ...v(2025, "Honor 500", "Honor 500 Pro"), ...v(2026, "Honor 600", "Honor 600 Pro")],
      "Honor 200": m(2024, "Honor 200", "Honor 200 Pro", "Honor 200 Lite", "Honor 200 Smart"),
      "Honor 100": m(2023, "Honor 100", "Honor 100 Pro").concat(m(2024, "Honor 100 Smart")),
      "Honor 90": m(2023, "Honor 90", "Honor 90 Lite", "Honor 90 GT", "Honor 90 Smart"),
      "Honor 80": m(2022, "Honor 80", "Honor 80 Pro", "Honor 80 GT", "Honor 80 SE"),
      "Honor 70": m(2022, "Honor 70", "Honor 70 Lite"),
      "Honor 60": m(2021, "Honor 60", "Honor 60 Pro", "Honor 60 SE"),
      "Honor 50": m(2021, "Honor 50", "Honor 50 Lite", "Honor 50 SE", "Honor 50 Pro"),
      "Honor 30 / 20 / 10": [...m(2020, "Honor 30", "Honor 30 Pro", "Honor 30 Pro+", "Honor 30S", "Honor 30 Lite"), ...m(2019, "Honor 20", "Honor 20 Pro", "Honor 20 Lite", "Honor 20i", "Honor 20S"), ...m(2018, "Honor 10", "Honor 10 Lite")],
    },
    "X series": {
      X: [...m(2021, "Honor X10", "Honor X20", "Honor X30"), ...m(2022, "Honor X7", "Honor X8", "Honor X9", "Honor X30i"), ...m(2023, "Honor X5", "Honor X6", "Honor X7a", "Honor X8a", "Honor X8b", "Honor X9a", "Honor X9b", "Honor X50", "Honor X50 GT", "Honor X50i"),
        ...m(2024, "Honor X5 Plus", "Honor X6a", "Honor X6b", "Honor X7b", "Honor X8b", "Honor X9c", "Honor X60", "Honor X60 GT"),
        ...m(2025, "Honor X5c", "Honor X5b", "Honor X6c", "Honor X7c", "Honor X9c Smart", "Honor X70", "Honor X9d")],
    },
    "Play / Power / Others": {
      Other: [...m(2019, "Honor 8S", "Honor 8A", "Honor 8X", "Honor 9X", "Honor 9X Pro", "Honor View 20"), ...m(2020, "Honor 9A", "Honor 9C", "Honor Play 4T", "Honor Play 9A"), ...m(2021, "Honor Play 5T", "Honor Play 20"), ...m(2024, "Honor Play 50 Plus", "Honor Play 60", "Honor Play 60 Plus"), ...m(2025, "Honor Power", "Honor Power 2"), ...m(2025, "Honor GT", "Honor GT Pro")],
    },
  },
  laptops: {
    MagicBook: {
      "MagicBook 14 / 15 / 16": [...m(2019, "MagicBook 14", "MagicBook 15"), ...m(2020, "MagicBook Pro 16.1"), ...m(2021, "MagicBook 14 (2021)", "MagicBook 15 (2021)", "MagicBook 16"), ...m(2022, "MagicBook 14 (2022)", "MagicBook 16 (2022)"), ...m(2023, "MagicBook 14 (2023)", "MagicBook 16 (2023)")],
      "MagicBook X": [...m(2021, "MagicBook X14", "MagicBook X15"), ...m(2022, "MagicBook X14 (2022)", "MagicBook X16"), ...m(2023, "MagicBook X14 Pro", "MagicBook X16 Pro"), ...m(2024, "MagicBook X14 Plus", "MagicBook X16 Plus")],
      "MagicBook Pro / Art": [...m(2023, "MagicBook 14 Pro", "MagicBook 16 Pro"), ...m(2024, "MagicBook Art 14"), ...m(2025, "MagicBook Pro 14", "MagicBook Pro 16", "MagicBook Art 14 Snapdragon"), ...v(2025, "MagicBook Pro 14 (2025)")],
    },
  },
};

const xiaomi = {
  brand: "Xiaomi", category: "all",
  phones: {
    "Xiaomi (flagship number series)": {
      "Xiaomi 18 series": v(2026, "Xiaomi 18", "Xiaomi 18 Pro", "Xiaomi 18 Pro Max", "Xiaomi 18 Ultra"),
      "Xiaomi 17 series": m(2025, "Xiaomi 17", "Xiaomi 17 Pro", "Xiaomi 17 Pro Max", "Xiaomi 17 Ultra", "Xiaomi 17T", "Xiaomi 17T Pro"),
      "Xiaomi 15 series": m(2024, "Xiaomi 15", "Xiaomi 15 Pro").concat(m(2025, "Xiaomi 15 Ultra", "Xiaomi 15S Pro", "Xiaomi 15T", "Xiaomi 15T Pro")),
      "Xiaomi 14 series": m(2023, "Xiaomi 14", "Xiaomi 14 Pro").concat(m(2024, "Xiaomi 14 Ultra", "Xiaomi 14T", "Xiaomi 14T Pro", "Xiaomi 14 Civi")),
      "Xiaomi 13 series": m(2022, "Xiaomi 13", "Xiaomi 13 Pro").concat(m(2023, "Xiaomi 13 Lite", "Xiaomi 13 Ultra", "Xiaomi 13T", "Xiaomi 13T Pro")),
      "Xiaomi 12 series": m(2021, "Xiaomi 12", "Xiaomi 12 Pro", "Xiaomi 12X").concat(m(2022, "Xiaomi 12 Lite", "Xiaomi 12S", "Xiaomi 12S Pro", "Xiaomi 12S Ultra", "Xiaomi 12T", "Xiaomi 12T Pro")),
      "Xiaomi 11 series": m(2021, "Xiaomi Mi 11", "Xiaomi Mi 11 Ultra", "Xiaomi Mi 11i", "Xiaomi Mi 11 Lite", "Xiaomi Mi 11 Lite 5G", "Xiaomi 11T", "Xiaomi 11T Pro", "Xiaomi 11 Lite 5G NE"),
      "Mi 10 series": m(2020, "Mi 10", "Mi 10 Pro", "Mi 10 Ultra", "Mi 10T", "Mi 10T Pro", "Mi 10T Lite", "Mi 10i", "Mi 10 Lite 5G"),
      "Mi 9 series": m(2019, "Mi 9", "Mi 9 SE", "Mi 9T", "Mi 9T Pro", "Mi 9 Lite", "Mi 9 Pro 5G"),
      "Mi Note / Mi Mix": [...m(2019, "Mi Note 10", "Mi Note 10 Pro", "Mi Note 10 Lite", "Mi Mix 3"), ...m(2021, "Mi Mix 4"), ...m(2022, "Xiaomi 12S Ultra"), ...m(2023, "Xiaomi Mix Fold 3"), ...m(2024, "Xiaomi Mix Flip", "Xiaomi Mix Fold 4"), ...m(2025, "Xiaomi Mix Flip 2")],
      "Civi": [...m(2021, "Xiaomi Civi"), ...m(2022, "Xiaomi Civi 2"), ...m(2023, "Xiaomi Civi 3"), ...m(2024, "Xiaomi Civi 4 Pro"), ...m(2025, "Xiaomi Civi 5 Pro")],
    },
    "Redmi Note": {
      "Redmi Note 15 series": v(2026, "Redmi Note 15", "Redmi Note 15 Pro", "Redmi Note 15 Pro+", "Redmi Note 15 5G", "Redmi Note 15 Pro 5G", "Redmi Note 15 Pro+ 5G"),
      "Redmi Note 14 series": m(2024, "Redmi Note 14", "Redmi Note 14 5G", "Redmi Note 14 Pro", "Redmi Note 14 Pro 5G", "Redmi Note 14 Pro+", "Redmi Note 14 Pro+ 5G", "Redmi Note 14S", "Redmi Note 14 SE"),
      "Redmi Note 13 series": m(2023, "Redmi Note 13", "Redmi Note 13 5G", "Redmi Note 13 Pro", "Redmi Note 13 Pro 5G", "Redmi Note 13 Pro+ 5G", "Redmi Note 13R", "Redmi Note 13R Pro", "Redmi Note 13 Pro 4G"),
      "Redmi Note 12 series": m(2022, "Redmi Note 12", "Redmi Note 12 4G", "Redmi Note 12 Pro", "Redmi Note 12 Pro+", "Redmi Note 12 Pro 4G", "Redmi Note 12S", "Redmi Note 12 Turbo", "Redmi Note 12R", "Redmi Note 12T Pro", "Redmi Note 12 Explorer"),
      "Redmi Note 11 series": m(2021, "Redmi Note 11", "Redmi Note 11S", "Redmi Note 11 Pro", "Redmi Note 11 Pro+ 5G", "Redmi Note 11 Pro 5G", "Redmi Note 11T Pro", "Redmi Note 11T Pro+", "Redmi Note 11SE", "Redmi Note 11E", "Redmi Note 11E Pro", "Redmi Note 11 Pro+"),
      "Redmi Note 10 series": m(2021, "Redmi Note 10", "Redmi Note 10S", "Redmi Note 10 5G", "Redmi Note 10 Pro", "Redmi Note 10 Pro Max", "Redmi Note 10T", "Redmi Note 10 Lite", "Redmi Note 10 JE"),
      "Redmi Note 9 series": m(2020, "Redmi Note 9", "Redmi Note 9S", "Redmi Note 9 Pro", "Redmi Note 9 Pro Max", "Redmi Note 9T", "Redmi Note 9 5G", "Redmi Note 9 Pro 5G", "Redmi Note 9 4G"),
      "Redmi Note 8 series": m(2019, "Redmi Note 8", "Redmi Note 8 Pro", "Redmi Note 8T", "Redmi Note 8 (2021)"),
    },
    "Redmi numbered / A / C": {
      "Redmi 15 / 14 / 13 / 12": [...m(2025, "Redmi 15", "Redmi 15C", "Redmi 15 5G"), ...m(2024, "Redmi 14C", "Redmi 14C 5G", "Redmi 13", "Redmi 13 5G", "Redmi 13C", "Redmi 13C 5G", "Redmi 14R 5G"), ...m(2023, "Redmi 12", "Redmi 12 5G", "Redmi 12C", "Redmi 12R")],
      "Redmi 10 / 9": [...m(2021, "Redmi 10", "Redmi 10 2022", "Redmi 10 Prime", "Redmi 10C", "Redmi 10 Power", "Redmi 10A", "Redmi 10 5G"), ...m(2020, "Redmi 9", "Redmi 9 Power", "Redmi 9 Prime", "Redmi 9A", "Redmi 9C", "Redmi 9T", "Redmi 9i", "Redmi 9AT", "Redmi 9 Activ")],
      "Redmi A series": [...m(2022, "Redmi A1", "Redmi A1+"), ...m(2023, "Redmi A2", "Redmi A2+"), ...m(2024, "Redmi A3", "Redmi A3x"), ...m(2025, "Redmi A5", "Redmi A5 4G", "Redmi A4 5G")],
      "Redmi earlier": [...m(2019, "Redmi 7", "Redmi 7A", "Redmi 8", "Redmi 8A", "Redmi 8A Dual", "Redmi Go", "Redmi Y3", "Redmi K20", "Redmi K20 Pro"), ...m(2018, "Redmi 6", "Redmi 6A", "Redmi 6 Pro", "Redmi S2", "Redmi Note 6 Pro")],
    },
    "Redmi K / Turbo": {
      K: [...m(2020, "Redmi K30", "Redmi K30 Pro", "Redmi K30S Ultra", "Redmi K30 Ultra"), ...m(2021, "Redmi K40", "Redmi K40 Pro", "Redmi K40 Pro+", "Redmi K40 Gaming", "Redmi K40S"), ...m(2022, "Redmi K50", "Redmi K50 Pro", "Redmi K50 Gaming", "Redmi K50 Ultra", "Redmi K50i", "Redmi K50G"), ...m(2023, "Redmi K60", "Redmi K60 Pro", "Redmi K60E", "Redmi K60 Ultra"), ...m(2024, "Redmi K70", "Redmi K70 Pro", "Redmi K70E", "Redmi K70 Ultra"), ...m(2025, "Redmi K80", "Redmi K80 Pro", "Redmi K80 Ultra")],
      Turbo: [...m(2024, "Redmi Turbo 3"), ...m(2025, "Redmi Turbo 4", "Redmi Turbo 4 Pro"), ...v(2026, "Redmi Turbo 5")],
    },
    "Poco": {
      "Poco F": [...m(2019, "Poco F1"), ...m(2020, "Poco F2 Pro"), ...m(2021, "Poco F3", "Poco F3 GT"), ...m(2022, "Poco F4", "Poco F4 GT"), ...m(2023, "Poco F5", "Poco F5 Pro"), ...m(2024, "Poco F6", "Poco F6 Pro"), ...m(2025, "Poco F7", "Poco F7 Pro", "Poco F7 Ultra"), ...v(2026, "Poco F8", "Poco F8 Pro", "Poco F8 Ultra")],
      "Poco X": [...m(2020, "Poco X2", "Poco X3", "Poco X3 NFC", "Poco X3 Pro"), ...m(2021, "Poco X3 GT"), ...m(2022, "Poco X4 Pro 5G", "Poco X4 GT"), ...m(2023, "Poco X5", "Poco X5 Pro"), ...m(2024, "Poco X6", "Poco X6 Pro", "Poco X6 Neo"), ...m(2025, "Poco X7", "Poco X7 Pro"), ...v(2026, "Poco X8 Pro", "Poco X8 Power", "Poco X8")],
      "Poco M": [...m(2020, "Poco M2", "Poco M2 Pro", "Poco M3"), ...m(2021, "Poco M3 Pro 5G", "Poco M4 Pro", "Poco M4 Pro 5G"), ...m(2022, "Poco M4 5G", "Poco M5", "Poco M5s"), ...m(2023, "Poco M6 Pro", "Poco M6 5G", "Poco M6", "Poco M6 Plus 5G"), ...m(2024, "Poco M7 Pro 5G"), ...m(2025, "Poco M7", "Poco M7 Plus 5G"), ...v(2026, "Poco M8", "Poco M8 Pro")],
      "Poco C": [...m(2021, "Poco C3", "Poco C31"), ...m(2022, "Poco C40", "Poco C50"), ...m(2023, "Poco C51", "Poco C55", "Poco C65"), ...m(2024, "Poco C61", "Poco C75"), ...m(2025, "Poco C71", "Poco C85")],
    },
    "Black Shark": { "Black Shark": [...m(2019, "Black Shark 2", "Black Shark 2 Pro"), ...m(2020, "Black Shark 3", "Black Shark 3 Pro", "Black Shark 3S"), ...m(2021, "Black Shark 4", "Black Shark 4 Pro", "Black Shark 4S"), ...m(2022, "Black Shark 5", "Black Shark 5 Pro", "Black Shark 5 RS")] },
  },
  laptops: {
    "Xiaomi Notebook": {
      "Xiaomi Book / Notebook Pro": [...m(2021, "Mi Notebook Pro X 14", "Mi Notebook Pro X 15", "Mi Notebook Pro 14", "Mi Notebook Pro 15"), ...m(2022, "Xiaomi Book Pro 14 (2022)", "Xiaomi Book Pro 16 (2022)"), ...m(2023, "Xiaomi Book Pro 14 (2023)", "Xiaomi Book Pro 16 (2023)", "Xiaomi Book 14 (2023)", "Xiaomi Book 15"), ...m(2024, "Xiaomi Book Pro 14 (2024)", "Xiaomi Book Pro 16 (2024)", "Xiaomi Book Air 13"), ...m(2025, "Xiaomi Book Pro 14 (2025)", "Xiaomi Book Pro 16 (2025)", "Xiaomi Book 14 (2025)", "Xiaomi Book 15 (2025)")],
      "RedmiBook": [...m(2020, "RedmiBook 13", "RedmiBook 14 II", "RedmiBook 16"), ...m(2021, "RedmiBook Pro 14", "RedmiBook Pro 15"), ...m(2022, "RedmiBook 15", "RedmiBook Pro 15 (2022)", "RedmiBook 16 (2022)"), ...m(2023, "RedmiBook 15E", "RedmiBook Pro 14 (2023)", "RedmiBook Pro 15 (2023)", "RedmiBook 14 (2023)"), ...m(2024, "Redmi Book 16 (2024)", "Redmi Book Pro 14 (2024)", "Redmi Book 14 (2024)", "Redmi Book Pro 16 (2024)"), ...m(2025, "Redmi Book 14 (2025)", "Redmi Book 16 (2025)", "Redmi Book Pro 14 (2025)", "Redmi Book Pro 16 (2025)")],
      "Xiaomi Gaming": [...m(2019, "Mi Gaming Laptop 2019"), ...m(2020, "Mi Gaming Laptop 2020"), ...m(2021, "Redmi G 2021"), ...m(2022, "Redmi G 2022", "Redmi G Pro 2022"), ...m(2023, "Redmi G 2023", "Redmi G Pro 2023"), ...m(2024, "Redmi G Pro 2024"), ...m(2025, "Redmi G Pro 2025")],
    },
  },
};

module.exports = [huawei, honor, xiaomi];