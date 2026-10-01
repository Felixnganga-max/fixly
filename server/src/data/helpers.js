// m(year, ...names)  -> confirmed or high-confidence entries
// v(year, ...names)  -> entries flagged verify:true (unconfirmed, rumored, or from a single source)
const m = (year, ...names) => names.map((name) => ({ name, year }));
const v = (year, ...names) => names.map((name) => ({ name, year, verify: true }));
module.exports = { m, v };