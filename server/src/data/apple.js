const { m, v } = require("./_helpers");
module.exports = {
  brand: "Apple",
  category: "all",
  phones: {
    iPhone: {
      "iPhone 18 series": [...v(2026, "iPhone 18 Pro", "iPhone 18 Pro Max", "iPhone Fold"), ...v(2027, "iPhone 18", "iPhone 18e")],
      "iPhone 17 series": [...m(2025, "iPhone 17", "iPhone Air", "iPhone 17 Pro", "iPhone 17 Pro Max"), ...m(2026, "iPhone 17e")],
      "iPhone 16 series": [...m(2024, "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max"), ...m(2025, "iPhone 16e")],
      "iPhone 15 series": m(2023, "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max"),
      "iPhone 14 series": m(2022, "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max"),
      "iPhone 13 series": m(2021, "iPhone 13 mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max"),
      "iPhone 12 series": m(2020, "iPhone 12 mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max"),
      "iPhone 11 series": m(2019, "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max"),
      "iPhone X series": m(2017, "iPhone X").concat(m(2018, "iPhone XR", "iPhone XS", "iPhone XS Max")),
      "iPhone 8 / 7": [...m(2017, "iPhone 8", "iPhone 8 Plus"), ...m(2016, "iPhone 7", "iPhone 7 Plus")],
      "iPhone 6 / 6s": [...m(2015, "iPhone 6s", "iPhone 6s Plus"), ...m(2014, "iPhone 6", "iPhone 6 Plus")],
      "iPhone 5 series": [...m(2012, "iPhone 5"), ...m(2013, "iPhone 5c", "iPhone 5s")],
      "iPhone SE": [...m(2016, "iPhone SE (1st gen)"), ...m(2020, "iPhone SE (2nd gen)"), ...m(2022, "iPhone SE (3rd gen)")],
      "iPhone 4 and older": [...m(2007, "iPhone (1st gen)"), ...m(2008, "iPhone 3G"), ...m(2009, "iPhone 3GS"), ...m(2010, "iPhone 4"), ...m(2011, "iPhone 4s")],
    },
  },
  laptops: {
    "MacBook Air": {
      "Apple silicon": [
        ...m(2020, "MacBook Air (M1, 2020)"), ...m(2022, "MacBook Air 13 (M2)"),
        ...m(2023, "MacBook Air 15 (M2)"), ...m(2024, "MacBook Air 13 (M3)", "MacBook Air 15 (M3)"),
        ...m(2025, "MacBook Air 13 (M4)", "MacBook Air 15 (M4)"),
        ...v(2026, "MacBook Air 13 (M5)", "MacBook Air 15 (M5)"),
      ],
      Intel: [...m(2018, "MacBook Air (2018)"), ...m(2019, "MacBook Air (2019)"), ...m(2020, "MacBook Air (Intel, 2020)")],
    },
    "MacBook Pro": {
      "Apple silicon": [
        ...m(2020, "MacBook Pro 13 (M1, 2020)"), ...m(2021, "MacBook Pro 14 (M1 Pro/Max)", "MacBook Pro 16 (M1 Pro/Max)"),
        ...m(2022, "MacBook Pro 13 (M2)"), ...m(2023, "MacBook Pro 14 (M2 Pro/Max)", "MacBook Pro 16 (M2 Pro/Max)", "MacBook Pro 14 (M3)", "MacBook Pro 14 (M3 Pro/Max)", "MacBook Pro 16 (M3 Pro/Max)"),
        ...m(2024, "MacBook Pro 14 (M4)", "MacBook Pro 14 (M4 Pro/Max)", "MacBook Pro 16 (M4 Pro/Max)"),
        ...m(2025, "MacBook Pro 14 (M5)"), ...v(2026, "MacBook Pro 14 (M5 Pro/Max)", "MacBook Pro 16 (M5 Pro/Max)"),
      ],
      Intel: [...m(2016, "MacBook Pro 13/15 (2016)"), ...m(2017, "MacBook Pro 13/15 (2017)"), ...m(2018, "MacBook Pro 13/15 (2018)"), ...m(2019, "MacBook Pro 16 (2019)", "MacBook Pro 13 (2019)"), ...m(2020, "MacBook Pro 13 (Intel, 2020)")],
    },
    MacBook: { "12-inch": [...m(2015, "MacBook (Retina, 12-inch, 2015)"), ...m(2016, "MacBook (2016)"), ...m(2017, "MacBook (2017)")] },
    "Other / new": { "Low-cost": v(2026, "MacBook Neo") },
  },
};