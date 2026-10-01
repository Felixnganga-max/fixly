const { m, v } = require("./_helpers");

const google = {
  brand: "Google", category: "phone",
  phones: {
    Pixel: {
      "Pixel 11 series": [...v(2026, "Pixel 11", "Pixel 11 Pro", "Pixel 11 Pro XL", "Pixel 11 Pro Fold")],
      "Pixel 10 series": [...m(2025, "Pixel 10", "Pixel 10 Pro", "Pixel 10 Pro XL", "Pixel 10 Pro Fold"), ...v(2026, "Pixel 10a")],
      "Pixel 9 series": [...m(2024, "Pixel 9", "Pixel 9 Pro", "Pixel 9 Pro XL", "Pixel 9 Pro Fold"), ...m(2025, "Pixel 9a")],
      "Pixel 8 series": [...m(2023, "Pixel 8", "Pixel 8 Pro"), ...m(2024, "Pixel 8a")],
      "Pixel 7 series": [...m(2022, "Pixel 7", "Pixel 7 Pro"), ...m(2023, "Pixel 7a", "Pixel Fold")],
      "Pixel 6 series": [...m(2021, "Pixel 6", "Pixel 6 Pro"), ...m(2022, "Pixel 6a")],
      "Pixel 5 / 4 / 3": [...m(2020, "Pixel 5", "Pixel 4a", "Pixel 4a 5G"), ...m(2019, "Pixel 4", "Pixel 4 XL", "Pixel 3a", "Pixel 3a XL"), ...m(2018, "Pixel 3", "Pixel 3 XL")],
      "Pixel 2 / 1": [...m(2017, "Pixel 2", "Pixel 2 XL"), ...m(2016, "Pixel", "Pixel XL")],
    },
  },
};

const motorola = {
  brand: "Motorola", category: "phone",
  phones: {
    Razr: { Razr: [...m(2020, "Razr 5G"), ...m(2022, "Razr 2022"), ...m(2023, "Razr 40", "Razr 40 Ultra"), ...m(2024, "Razr 50", "Razr 50 Ultra", "Razr 50s"), ...m(2025, "Razr 2025", "Razr+ 2025", "Razr Ultra 2025", "Razr 60", "Razr 60 Ultra"), ...v(2026, "Razr 2026", "Razr+ 2026", "Razr Ultra 2026", "Razr Fold")] },
    Edge: { Edge: [...m(2020, "Edge", "Edge+"), ...m(2021, "Edge 20", "Edge 20 Pro", "Edge 20 Lite", "Edge 20 Fusion", "Edge S"), ...m(2022, "Edge 30", "Edge 30 Pro", "Edge 30 Ultra", "Edge 30 Neo", "Edge 30 Fusion", "Edge 30 Lite", "Edge 2022", "Edge+ 2022", "Edge X30", "Edge S30", "Edge S30 Pro"), ...m(2023, "Edge 40", "Edge 40 Pro", "Edge 40 Neo", "Edge+ 2023", "Edge 2023", "Edge 30 Ultra"), ...m(2024, "Edge 50", "Edge 50 Pro", "Edge 50 Ultra", "Edge 50 Fusion", "Edge 50 Neo", "Edge 2024", "Edge+ 2024", "Edge 50 Lite"), ...m(2025, "Edge 60", "Edge 60 Pro", "Edge 60 Fusion", "Edge 60 Stylus", "Edge 2025", "Edge+ 2025", "Edge 60 Neo"), ...v(2025, "Edge 70", "Edge 70 Fusion", "Edge 70 Plus", "Edge 70 Ultra")] },
    Moto: {
      "Moto G (2019-2022)": [...m(2019, "Moto G7", "Moto G7 Plus", "Moto G7 Power", "Moto G7 Play", "Moto G8", "Moto G8 Plus", "Moto G8 Power", "Moto G8 Play", "Moto G8 Power Lite"), ...m(2020, "Moto G9 Plus", "Moto G9 Play", "Moto G9 Power", "Moto G 5G", "Moto G 5G Plus", "Moto G Stylus", "Moto G Fast", "Moto G Power 2020", "Moto G Pro", "Moto G Stylus 2021", "Moto G Power 2021"), ...m(2021, "Moto G10", "Moto G30", "Moto G50", "Moto G60", "Moto G60s", "Moto G100", "Moto G20", "Moto G40 Fusion", "Moto G Play 2021", "Moto G Stylus 5G", "Moto G Power 2022", "Moto G51", "Moto G71", "Moto G200", "Moto G31", "Moto G41", "Moto G22", "Moto G52", "Moto G82", "Moto G42", "Moto G62", "Moto G32")],
      "Moto G (2023-2026)": [...m(2023, "Moto G13", "Moto G23", "Moto G53", "Moto G73", "Moto G14", "Moto G54", "Moto G84", "Moto G04", "Moto G24", "Moto G24 Power", "Moto G34", "Moto G64", "Moto G75", "Moto G85", "Moto G Stylus 2023", "Moto G Stylus 5G 2023", "Moto G 5G 2023", "Moto G Power 2023", "Moto G Play 2023", "Moto G Power 5G 2024", "Moto G 5G 2024", "Moto G Stylus 5G 2024", "Moto G Play 2024"), ...m(2025, "Moto G05", "Moto G15", "Moto G15 Power", "Moto G35", "Moto G55", "Moto G56", "Moto G86", "Moto G86 Power", "Moto G96", "Moto G Power 2025", "Moto G 2025", "Moto G Stylus 2025", "Moto G Play 2025", "Moto G Power 5G 2025", "Moto G Stylus 5G 2025"), ...v(2026, "Moto G07", "Moto G67", "Moto G77", "Moto G100 Pro")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i),
      "Moto E": [...m(2019, "Moto E6", "Moto E6 Plus", "Moto E6s", "Moto E6 Play"), ...m(2020, "Moto E7", "Moto E7 Plus", "Moto E7 Power", "Moto E7i Power"), ...m(2021, "Moto E20", "Moto E30", "Moto E40", "Moto E7 Power"), ...m(2022, "Moto E22", "Moto E22s", "Moto E32", "Moto E32s", "Moto E13"), ...m(2023, "Moto E13", "Moto E14"), ...m(2024, "Moto E14", "Moto E15"), ...m(2025, "Moto E15", "Moto E16", "Moto E20"), ...v(2026, "Moto E17")],
      "Moto One / Z / X": [...m(2019, "Motorola One", "Motorola One Vision", "Motorola One Action", "Motorola One Zoom", "Motorola One Macro", "Motorola One Hyper", "Motorola One Fusion", "Motorola One Fusion+", "Motorola One 5G", "Motorola One 5G Ace", "Moto Z4", "Moto Z3", "Moto Z3 Play", "Moto X4"), ...m(2021, "Motorola One 5G UW Ace", "Moto One 5G UW Ace")],
      "Moto Edge (older)": [...m(2019, "Motorola Edge (2019)"), ...m(2020, "Motorola Edge+ (2020)")].filter((d) => false),
      "ThinkPhone / Defy": [...m(2023, "ThinkPhone"), ...m(2023, "Defy 2"), ...m(2021, "Defy 2021")],
    },
  },
};

const nokia = {
  brand: "Nokia", category: "phone",
  phones: {
    "HMD-era Nokia smartphones": {
      "Nokia X / XR / XR21": [...m(2021, "Nokia X10", "Nokia X20", "Nokia XR20"), ...m(2022, "Nokia X30 5G", "Nokia XR21")],
      "Nokia G": [...m(2021, "Nokia G10", "Nokia G20", "Nokia G11", "Nokia G21", "Nokia G50"), ...m(2022, "Nokia G11 Plus", "Nokia G60 5G", "Nokia G400 5G", "Nokia G42 5G", "Nokia G22"), ...m(2023, "Nokia G42 5G", "Nokia G310 5G", "Nokia G22", "Nokia G11", "Nokia G21"), ...m(2024, "Nokia G42 5G", "Nokia G310")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i),
      "Nokia C": [...m(2020, "Nokia C3", "Nokia C2", "Nokia C1 Plus"), ...m(2021, "Nokia C10", "Nokia C20", "Nokia C30", "Nokia C01 Plus", "Nokia C20 Plus", "Nokia C21"), ...m(2022, "Nokia C31", "Nokia C21 Plus", "Nokia C12", "Nokia C32", "Nokia C22"), ...m(2023, "Nokia C110", "Nokia C12 Pro", "Nokia C32", "Nokia C22")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i),
      "Nokia 1-9 (2018-2020)": [...m(2018, "Nokia 1", "Nokia 2.1", "Nokia 3.1", "Nokia 5.1", "Nokia 6.1", "Nokia 7.1", "Nokia 8 Sirocco", "Nokia 3.1 Plus", "Nokia 5.1 Plus", "Nokia 6.1 Plus", "Nokia 7 Plus", "Nokia 8.1"), ...m(2019, "Nokia 1 Plus", "Nokia 2.2", "Nokia 3.2", "Nokia 4.2", "Nokia 6.2", "Nokia 7.2", "Nokia 9 PureView", "Nokia 2.3", "Nokia 7.1"), ...m(2020, "Nokia 1.3", "Nokia 2.3", "Nokia 2.4", "Nokia 3.4", "Nokia 5.3", "Nokia 5.4", "Nokia 8.3 5G", "Nokia 6.3")],
      "Nokia 2.x / 3.x (2021-2022)": [...m(2021, "Nokia 1.4", "Nokia 2.4", "Nokia 3.4", "Nokia 5.4", "Nokia 6.4", "Nokia 8 V 5G UW", "Nokia 2 V Tella", "Nokia 7.3"), ...m(2022, "Nokia 2.4")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i),
    },
    "Nokia feature phones": { Feature: [...m(2019, "Nokia 105 (2019)", "Nokia 210", "Nokia 110 (2019)", "Nokia 2720 Flip", "Nokia 800 Tough", "Nokia 6300 4G", "Nokia 8000 4G", "Nokia 3310 (2017)", "Nokia 3310 3G", "Nokia 3310 4G"), ...m(2020, "Nokia 5310 (2020)", "Nokia 215 4G", "Nokia 225 4G", "Nokia 150 (2020)", "Nokia 125", "Nokia 106 4G"), ...m(2021, "Nokia 105 4G", "Nokia 2660 Flip", "Nokia 6310 (2021)", "Nokia 110 4G", "Nokia 105 4G (2021)", "Nokia 105 Classic", "Nokia 2780 Flip", "Nokia 130", "Nokia 150"), ...m(2022, "Nokia 105 (2022)", "Nokia 110 (2022)", "Nokia 105 (2023)", "Nokia 110 (2023)", "Nokia 130 Music", "Nokia 150 (2023)", "Nokia 2660 Flip", "Nokia 8210 4G", "Nokia 5710 XpressAudio", "Nokia 3210 4G"), ...m(2024, "Nokia 3210 4G (2024)", "Nokia 235 4G", "Nokia 220 4G")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i) },
  },
};

const nothing = {
  brand: "Nothing", category: "phone",
  phones: {
    "Phone": { Phone: [...m(2022, "Phone (1)"), ...m(2023, "Phone (2)"), ...m(2024, "Phone (2a)", "Phone (2a) Plus"), ...m(2025, "Phone (3)", "Phone (3a)", "Phone (3a) Pro", "Phone (3a) Lite"), ...v(2026, "Phone (4a)", "Phone (4a) Pro")] },
    "CMF (sub-brand)": { CMF: [...m(2024, "CMF Phone 1"), ...m(2025, "CMF Phone 2 Pro"), ...v(2026, "CMF Phone 3 Pro")] },
  },
};

const sony = {
  brand: "Sony", category: "phone",
  phones: {
    "Xperia 1": { "Xperia 1": [...m(2019, "Xperia 1"), ...m(2020, "Xperia 1 II"), ...m(2021, "Xperia 1 III"), ...m(2022, "Xperia 1 IV"), ...m(2023, "Xperia 1 V"), ...m(2024, "Xperia 1 VI"), ...m(2025, "Xperia 1 VII"), ...v(2026, "Xperia 1 VIII")] },
    "Xperia 5": { "Xperia 5": [...m(2019, "Xperia 5"), ...m(2020, "Xperia 5 II"), ...m(2021, "Xperia 5 III"), ...m(2022, "Xperia 5 IV"), ...m(2023, "Xperia 5 V")] },
    "Xperia 10": { "Xperia 10": [...m(2019, "Xperia 10", "Xperia 10 Plus"), ...m(2020, "Xperia 10 II"), ...m(2021, "Xperia 10 III", "Xperia 10 III Lite"), ...m(2022, "Xperia 10 IV"), ...m(2023, "Xperia 10 V"), ...m(2024, "Xperia 10 VI"), ...m(2025, "Xperia 10 VII")] },
    "Xperia Pro / Ace / L / XZ": { Other: [...m(2020, "Xperia Pro", "Xperia L4", "Xperia 5 II"), ...m(2021, "Xperia Pro-I", "Xperia Ace III"), ...m(2019, "Xperia L3", "Xperia Ace", "Xperia XZ3", "Xperia XZ2", "Xperia XZ2 Premium", "Xperia XZ1", "Xperia XZ Premium", "Xperia XA2", "Xperia XA2 Ultra")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i) },
  },
};

const lg = {
  brand: "LG", category: "all",
  phones: {
    "Velvet / Wing / Flagship": { Flagship: [...m(2020, "Velvet", "Wing", "V60 ThinQ"), ...m(2021, "Velvet 2 Pro", "Wing"), ...m(2019, "G8 ThinQ", "G8S ThinQ", "G8X ThinQ", "V50 ThinQ", "V50S ThinQ"), ...m(2018, "G7 ThinQ", "V40 ThinQ", "V35 ThinQ"), ...m(2017, "G6", "V30", "V30S ThinQ")] },
    "K series": { K: [...m(2019, "K40", "K40S", "K50", "K50S", "K12+", "K20", "K30"), ...m(2020, "K22", "K31", "K41S", "K51", "K51S", "K61", "K71", "K52", "K62", "K42", "K92 5G", "K22+"), ...m(2021, "K42", "K52", "K62", "K92")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i) },
    "Q / W series": { Other: [...m(2019, "Q60", "Q70", "W10", "W30", "W30 Pro", "Q60", "G7 Fit", "G7 One"), ...m(2020, "Q31", "Q51", "Q52", "Q92 5G", "Stylo 6", "Stylo 5", "Stylo 5+")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i) },
  },
  laptops: {
    "LG gram": {
      "LG gram (2025-2026)": [...m(2025, "LG gram Pro 16 (2025)", "LG gram Pro 17 (2025)", "LG gram 14 (2025)", "LG gram 16 (2025)", "LG gram 17 (2025)", "LG gram Pro 16 2-in-1 (2025)"), ...v(2026, "LG gram Pro (2026)", "LG gram 14 (2026)", "LG gram 16 (2026)", "LG gram 17 (2026)")],
      "LG gram (2021-2024)": [...m(2024, "LG gram 14 (2024)", "LG gram 15 (2024)", "LG gram 16 (2024)", "LG gram 17 (2024)", "LG gram Pro 16 (2024)", "LG gram Pro 17 (2024)", "LG gram Pro 360 (2024)", "LG gram SuperSlim (2024)", "LG gram Style 14 (2024)", "LG gram Style 16 (2024)"), ...m(2023, "LG gram 14 (2023)", "LG gram 15 (2023)", "LG gram 16 (2023)", "LG gram 17 (2023)", "LG gram Style 14 (2023)", "LG gram Style 16 (2023)"), ...m(2022, "LG gram 14 (2022)", "LG gram 15 (2022)", "LG gram 16 (2022)", "LG gram 17 (2022)", "LG gram 16 2-in-1 (2022)", "LG gram 14 2-in-1 (2022)"), ...m(2021, "LG gram 14 (2021)", "LG gram 15 (2021)", "LG gram 16 (2021)", "LG gram 17 (2021)", "LG gram 16 2-in-1 (2021)")],
      "LG gram (2017-2020)": [...m(2020, "LG gram 13 (2020)", "LG gram 14 (2020)", "LG gram 15 (2020)", "LG gram 16 (2020)", "LG gram 17 (2020)", "LG gram 14 2-in-1 (2020)"), ...m(2019, "LG gram 13 (2019)", "LG gram 14 (2019)", "LG gram 15 (2019)", "LG gram 17 (2019)", "LG gram 14 2-in-1 (2019)"), ...m(2018, "LG gram 13 (2018)", "LG gram 14 (2018)", "LG gram 15 (2018)", "LG gram 17 (2018)"), ...m(2017, "LG gram 13 (2017)", "LG gram 14 (2017)", "LG gram 15 (2017)")],
    },
    "LG UltraPC / UltraGear": { Other: [...m(2022, "LG UltraPC 14 (2022)", "LG UltraPC 16 (2022)", "LG UltraPC 17 (2022)"), ...m(2023, "LG UltraPC 14 (2023)", "LG UltraPC 16 (2023)"), ...m(2021, "LG UltraPC 14 (2021)", "LG UltraPC 15 (2021)"), ...m(2020, "LG UltraPC 15"), ...m(2021, "LG UltraGear 17G90Q"), ...m(2022, "LG UltraGear 17G90R")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i) },
  },
};

const alcatel = {
  brand: "Alcatel", category: "phone",
  phones: { "Alcatel phones": { "Alcatel 1 / 3 / 5": [...m(2019, "Alcatel 1S", "Alcatel 1B", "Alcatel 1V", "Alcatel 1C", "Alcatel 3", "Alcatel 3L", "Alcatel 3V", "Alcatel 3X", "Alcatel 3C", "Alcatel 5", "Alcatel 5V", "Alcatel 3T 8", "Alcatel 3T 10", "Alcatel 3 (2019)", "Alcatel 3X (2019)", "Alcatel 3L (2019)", "Alcatel 1V (2019)", "Alcatel 1S (2019)", "Alcatel 1C (2019)"), ...m(2020, "Alcatel 1S (2020)", "Alcatel 1V (2020)", "Alcatel 1B (2020)", "Alcatel 3L (2020)", "Alcatel 3X (2020)", "Alcatel 1 (2020)", "Alcatel 1A", "Alcatel 1E", "Alcatel 1SE", "Alcatel 3", "Alcatel 3L", "Alcatel 3T", "Alcatel 3X"), ...m(2021, "Alcatel 1L", "Alcatel 1L Pro", "Alcatel 1S (2021)", "Alcatel 1 (2021)", "Alcatel 1SE (2020)", "Alcatel 3L (2021)", "Alcatel 3X (2021)", "Alcatel 3T", "Alcatel 1V"), ...m(2022, "Alcatel 1L Pro (2021)"), ...m(2023, "Alcatel 1B (2022)", "Alcatel 1 (2022)", "Alcatel 1L (2022)", "Alcatel 1V (2022)", "Alcatel 3 (2022)", "Alcatel 3L (2022)", "Alcatel 3T (2022)", "Alcatel 3X (2022)", "Alcatel 5 (2022)", "Alcatel 5V (2022)"), ...m(2024, "Alcatel V3 Ultra", "Alcatel V3 Pro", "Alcatel V3 Classic", "Alcatel V3 Ultra 5G", "Alcatel V3 Pro 5G"), ...m(2025, "Alcatel V3 Ultra", "Alcatel V3 Pro", "Alcatel V3 Classic")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i && !/\((2019|2020|2021|2022)\)/.test(d.name)) } },
};

const htc = {
  brand: "HTC", category: "phone",
  phones: { "HTC": { "Desire / U / Wildfire": [...m(2018, "U12+", "U12 Life", "U12 Plus", "U11 Plus", "U11 Life", "U11 EYEs", "Desire 12", "Desire 12+", "Desire 12s", "Desire 12+ 2018", "Desire 12s 2018"), ...m(2019, "Desire 19+", "Desire 19s", "Desire 19+ 2019", "Exodus 1", "Wildfire X", "Wildfire R70", "Wildfire E", "Wildfire E1", "Wildfire E2", "Wildfire E3", "Wildfire E Plus", "Wildfire E Lite", "Wildfire E1 Plus", "Wildfire E1 Lite", "Wildfire E2 Plus", "Wildfire E3 Lite"), ...m(2020, "Desire 20 Pro", "Desire 20+", "Desire 20s", "Desire 20 Plus", "Desire 20 Pro 2020", "Desire 20+ 2020", "Desire 20s 2020"), ...m(2021, "Desire 21 Pro 5G", "Desire 22 Pro", "Desire 21 Pro", "Desire 22 Pro 5G"), ...m(2023, "U23 Pro", "U23", "Wildfire E Star", "Wildfire E Lite 2023"), ...m(2024, "Desire 24 Pro", "Desire 24 Pro 2024", "U24 Pro", "U24 Plus", "Vive Focus 3", "Vive XR Elite")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i && !/(2018|2019|2020|2023|2024)$/.test(d.name)) } },
};

const sharp = {
  brand: "Sharp", category: "phone",
  phones: { "Aquos": { "Aquos R / Sense / Wish": [...m(2019, "Aquos R3", "Aquos Zero 2", "Aquos Sense 3", "Aquos Sense 3 Plus", "Aquos Sense 3 Basic", "Aquos Sense 3 Lite", "Aquos S3", "Aquos S3 mini", "Aquos S3 Plus"), ...m(2020, "Aquos R5G", "Aquos Sense 4", "Aquos Sense 4 Plus", "Aquos Sense 4 Basic", "Aquos Sense 4 Lite", "Aquos Zero 5G Basic", "Aquos Zero 6", "Aquos Wish", "Aquos Wish 2", "Aquos Wish 3", "Aquos Wish 4"), ...m(2021, "Aquos R6", "Aquos Sense 5G", "Aquos Sense 6", "Aquos Sense 6s", "Aquos Wish", "Aquos Zero 6"), ...m(2022, "Aquos R7", "Aquos Sense 7", "Aquos Sense 7 Plus", "Aquos Wish 2", "Aquos Wish 3"), ...m(2023, "Aquos R8", "Aquos R8 Pro", "Aquos R8s", "Aquos R8s Pro", "Aquos Sense 8", "Aquos Wish 3", "Aquos Wish 4"), ...m(2024, "Aquos R9", "Aquos R9 Pro", "Aquos Sense 9", "Aquos Wish 4", "Aquos Wish 5"), ...m(2025, "Aquos R10", "Aquos Sense 10", "Aquos Wish 5")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i) } },
};

const zte = {
  brand: "ZTE", category: "phone",
  phones: {
    "Axon / nubia": { Axon: [...m(2019, "Axon 10 Pro", "Axon 10 Pro 5G", "Axon 10s Pro", "Axon 11 SE", "Axon 11 SE 5G", "Axon 20 5G", "Axon 30", "Axon 30 5G", "Axon 30 Ultra", "Axon 30 Pro", "Axon 40 Pro", "Axon 40 Ultra", "Axon 40 SE", "Axon 50 Ultra", "Axon 60 Ultra", "Axon 60", "Axon 70 Ultra", "Axon 70", "Axon 80 Ultra", "Axon 80"), ...m(2023, "nubia Z50", "nubia Z50 Ultra", "nubia Z50S Pro", "nubia Z60 Ultra", "nubia Z60S Pro", "nubia Z70 Ultra", "nubia Z70S Ultra", "nubia Z80 Ultra"), ...m(2024, "nubia Neo 2", "nubia Neo 2 5G", "nubia V60 Design", "nubia V70 Design", "nubia V60", "nubia V50", "nubia Flip", "nubia Flip 2", "nubia Fold", "nubia Focus", "nubia Focus Pro", "nubia Music", "nubia Flip 3", "nubia Flip 3 5G")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i) },
    "Blade / Libero / Redmagic": { Blade: [...m(2019, "Blade V10", "Blade V10 Vita", "Blade 10 Prime", "Blade A7", "Blade A7s", "Blade A5", "Blade A3", "Blade A51", "Blade A71", "Blade A31", "Blade A31 Plus", "Blade A31 Lite", "Blade A51 Lite", "Blade A52", "Blade A72", "Blade A72 5G", "Blade A53", "Blade A53 Pro", "Blade A73", "Blade A73 5G", "Blade A33", "Blade A33s", "Blade A54", "Blade A54 Pro", "Blade A55", "Blade A75", "Blade A75 5G", "Blade A34", "Blade A35", "Blade A35e", "Blade A36", "Blade A36 5G", "Blade A56", "Blade V40", "Blade V40 Design", "Blade V40 Vita", "Blade V41 Smart", "Blade V50", "Blade V50 Design", "Blade V50 Vita", "Blade V60", "Blade V60 Design", "Blade V60 Vita", "Blade V70", "Blade V70 Design", "Blade V70 Vita", "Blade V75", "Blade V80", "Blade V90"), ...m(2021, "Libero 5G II", "Libero 5G III", "Libero 5G IV", "Libero Flip"), ...m(2022, "Libero 5G III"), ...m(2023, "Libero 5G IV")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i && !/^Blade (A(3[3-6]|5[3-6]|7[3-5])|V(4[0-1]|[5-9]0|[5-9]5)).*/.test(d.name)) },
  },
};

const tcl = {
  brand: "TCL", category: "phone",
  phones: { "TCL phones": { "TCL 10 / 20 / 30 / 40 / 50": [...m(2020, "TCL 10 Pro", "TCL 10 Plus", "TCL 10L", "TCL 10 5G", "TCL 10 SE", "TCL 10 Lite", "TCL 10 Tab Max", "TCL 10 Tab Mid", "TCL 10 Pro 5G"), ...m(2021, "TCL 20 Pro 5G", "TCL 20 5G", "TCL 20 SE", "TCL 20 S", "TCL 20L", "TCL 20L+", "TCL 20 Y", "TCL 20 R 5G", "TCL 20 L", "TCL 20 XE"), ...m(2022, "TCL 30", "TCL 30+", "TCL 30 5G", "TCL 30 SE", "TCL 30 E", "TCL 30 V 5G", "TCL 30 XE 5G", "TCL 30 XL", "TCL 30 Z", "TCL 30 LE", "TCL 30 Pro", "TCL 30 XL"), ...m(2023, "TCL 40 SE", "TCL 40 NXTPAPER", "TCL 40 NXTPAPER 5G", "TCL 40 R 5G", "TCL 40 X 5G", "TCL 40 X", "TCL 40 XE 5G", "TCL 40 XL", "TCL 40 XL 5G", "TCL 40 Z", "TCL 40 NxtPaper", "TCL 405", "TCL 406", "TCL 408", "TCL 501", "TCL 502", "TCL 50 XL NXTPAPER 5G", "TCL 50 XL 5G", "TCL 50 SE", "TCL 50 5G", "TCL 50 Pro NXTPAPER 5G", "TCL 50 XE NXTPAPER 5G", "TCL 50 LE", "TCL 50 XL"), ...m(2024, "TCL 50 SE", "TCL 50 XL 5G", "TCL 50 Pro NXTPAPER 5G", "TCL 50 LE", "TCL 50 XE NXTPAPER 5G", "TCL 50 XL NXTPAPER 5G", "TCL 505", "TCL 50 5G", "TCL 50 XL"), ...m(2025, "TCL NxtPaper 60 Ultra", "TCL NxtPaper 70 Pro", "TCL NxtPaper 11", "TCL 60 SE", "TCL 60 XE NXTPAPER 5G", "TCL 60 XL NXTPAPER 5G", "TCL 60 Pro", "TCL 60 5G", "TCL 60 XL 5G", "TCL 605", "TCL 60 R")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i) } },
};

const meizu = {
  brand: "Meizu", category: "phone",
  phones: { "Meizu": { Meizu: [...m(2019, "Meizu 16s", "Meizu 16s Pro", "Meizu 16Xs", "Meizu 16T", "Meizu Note 9", "Meizu X8", "Meizu C9", "Meizu C9 Pro", "Meizu M10", "Meizu Zero"), ...m(2020, "Meizu 17", "Meizu 17 Pro", "Meizu 17 Lite", "Meizu 17T", "Meizu 17S"), ...m(2021, "Meizu 18", "Meizu 18 Pro", "Meizu 18X", "Meizu 18s", "Meizu 18s Pro", "Meizu 18x"), ...m(2022, "Meizu 19", "Meizu 19 Pro", "Meizu 19s", "Meizu 19s Pro", "Meizu 19X", "Meizu 19 Plus"), ...m(2023, "Meizu 20", "Meizu 20 Pro", "Meizu 20 Classic", "Meizu 20 Infinity", "Meizu 20x", "Meizu 20 Plus", "Meizu 20 Air"), ...m(2024, "Meizu 21", "Meizu 21 Pro", "Meizu 21 Note", "Meizu 21 Note Pro", "Meizu 21 Plus", "Meizu 21 Ultra", "Meizu 21x"), ...m(2025, "Meizu Note 16", "Meizu Note 16 Pro", "Meizu Note 16 Pro+", "Meizu Note 16 Plus", "Meizu Note 16 Ultra", "Meizu Note 16 SE", "Meizu Note 16X", "Meizu 22", "Meizu 22 Pro", "Meizu 22 Plus", "Meizu 22 Ultra", "Meizu 22 Air")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i && !/(Plus|Air|Ultra|x|X|Classic|Infinity|SE)$/.test(d.name)) } },
};

const micromax = {
  brand: "Micromax", category: "phone",
  phones: { "Micromax": { "In series": [...m(2020, "In Note 1", "In 1b", "In 1", "In 2b", "In 2c", "In 2"), ...m(2021, "In Note 2", "In 2b", "In 2c", "In 3", "In 4"), ...m(2022, "In Note 2", "In 2b", "In 1 Pro", "In 3b", "In 2 Pro", "In 3 Lite"), ...m(2023, "In Note 3", "In 3 Plus", "In 3 Pro", "In 3b Pro"), ...m(2024, "In 4", "In 4 Plus", "In 4 Pro", "In 4b", "In 5"), ...m(2025, "In 5", "In 5 Plus", "In 5 Pro", "In 5b"), ...m(2019, "Bharat 5 Pro", "Bharat 4", "Bharat 3", "Bharat 2", "Bharat 5", "Bharat 5 Plus", "Canvas Infinity", "Canvas Infinity Pro", "Canvas 1", "Canvas 2", "Canvas 3", "Canvas 4", "Canvas 5", "Canvas 6", "Canvas 7", "Canvas 8", "Canvas 9", "Canvas 10", "Canvas Infinity Pro 2", "Canvas Infinity 2", "Canvas Infinity Plus", "Canvas Infinity Lite")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i && !/^(In (3 Lite|3 Pro|3 Plus|3b Pro|4|4 Plus|4 Pro|4b|5|5 Plus|5 Pro|5b|2 Pro|1 Pro|3b|Note 3)|Canvas (1|2|3|4|5|6|7|8|9|10|Infinity|Infinity Pro|Infinity 2|Infinity Plus|Infinity Lite|Infinity Pro 2)|Bharat (2|3|4|5|5 Pro|5 Plus))$/.test(d.name)) } },
};

const coolpad = {
  brand: "Coolpad", category: "phone",
  phones: { "Coolpad": { Coolpad: [...m(2019, "Cool 3", "Cool 5", "Cool 3 Plus", "Cool 6", "Cool 7", "Cool 8", "Cool 9"), ...m(2020, "Cool 10", "Cool 10A", "Cool 11", "Cool 12", "Cool 12A"), ...m(2021, "Legacy", "Legacy SR", "Legacy Brisa", "Legacy S", "Legacy Go", "Legacy 5G"), ...m(2022, "Legacy Go", "Coolpad 20", "Cool 20", "Cool 20s", "Coolpad 20 Pro", "Coolpad 20S", "Coolpad 21", "Coolpad 22", "Coolpad 23", "Coolpad 24", "Coolpad 25", "Coolpad 26", "Coolpad 27", "Coolpad 28", "Coolpad 29", "Coolpad 30")].filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i && !/^(Coolpad (2[0-9]|30)|Cool (3|5|6|7|8|9|10|10A|11|12|12A|20|20s|3 Plus))$/.test(d.name)) } },
};

module.exports = [google, motorola, nokia, nothing, sony, lg, alcatel, htc, sharp, zte, tcl, meizu, micromax, coolpad];