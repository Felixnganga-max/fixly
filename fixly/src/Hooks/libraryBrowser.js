import { useState, useEffect } from "react";
import { Search, Loader2, ShieldCheck, Users, X, Trash2 } from "lucide-react";
import { searchLibrary, getLibraryMeta, updateLibraryDevice, deleteLibraryDevice } from "../Hooks/libraryApi";

const LABELS = {
  screenSize: "Screen size", resolution: "Resolution", displayType: "Display", refreshRate: "Refresh rate",
  processor: "Processor", ram: "RAM", storage: "Storage", os: "Operating system", gpu: "GPU",
  mainCamera: "Main camera", frontCamera: "Front camera", cameraFeatures: "Camera features",
  battery: "Battery", charging: "Charging", connectivity: "Connectivity", sim: "SIM",
  weight: "Weight", dimensions: "Dimensions", ports: "Ports", webcam: "Webcam",
};

const fmtSpec = (key, val, category) => {
  const v = String(val);
  if (key === "screenSize" && /^[\d.]+$/.test(v)) return `${v}"`;
  if (key === "refreshRate" && /^\d+$/.test(v)) return `${v} Hz`;
  if (key === "battery" && /^\d+$/.test(v)) return `${v} ${category === "laptop" ? "Wh" : "mAh"}`;
  return v;
};

const summary = (d) =>
  [
    d.specs?.screenSize && fmtSpec("screenSize", d.specs.screenSize, d.category),
    [d.specs?.ram, d.specs?.storage].filter(Boolean).join(" / "),
    d.specs?.battery && fmtSpec("battery", d.specs.battery, d.category),
  ]
    .filter(Boolean)
    .join(" · ");

/**
 * Searchable device library.
 * onSelect(device): shows a select button. category: lock to phone|laptop.
 * isAdmin: shows Verify / Delete.
 */
export default function LibraryBrowser({ onSelect, selectLabel = "Use this device", category = "", isAdmin = false }) {
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const [cat, setCat] = useState(category);
  const [brand, setBrand] = useState("");
  const [brands, setBrands] = useState([]);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDq(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setBrand("");
    getLibraryMeta(cat).then((m) => setBrands(m.brands)).catch(() => {});
  }, [cat]);

  useEffect(() => setPage(1), [dq, cat, brand]);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError("");
    searchLibrary({ q: dq, category: cat, brand, page, limit: 24 }, ctrl.signal)
      .then((r) => {
        setItems((prev) => (page === 1 ? r.data : [...prev, ...r.data]));
        setTotal(r.total);
        setHasMore(r.hasMore);
      })
      .catch((e) => e.name !== "AbortError" && setError(e.message))
      .finally(() => !ctrl.signal.aborted && setLoading(false));
    return () => ctrl.abort();
  }, [dq, cat, brand, page]);

  const patchLocal = (d) => {
    setItems((prev) => prev.map((x) => (x._id === d._id ? d : x)));
    setOpen(d);
  };
  const toggleVerified = async (d) => patchLocal(await updateLibraryDevice(d._id, { verified: !d.verified }));
  const remove = async (d) => {
    if (!window.confirm(`Remove ${d.brand} ${d.name} from the library? Listings keep working.`)) return;
    await deleteLibraryDevice(d._id);
    setItems((prev) => prev.filter((x) => x._id !== d._id));
    setTotal((t) => t - 1);
    setOpen(null);
  };

  const chip = (active) =>
    `px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-colors ${
      active ? "bg-black text-white border-black" : "bg-white text-gray-500 border-beige-dark hover:border-gray-400"
    }`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a device, e.g. samsung s24"
            className="w-full bg-white border border-beige-dark focus:border-black outline-none rounded-xl pl-10 pr-3 py-3 text-sm"
          />
        </div>
        {!category && (
          <div className="flex gap-2">
            {[["", "All"], ["phone", "Phones"], ["laptop", "Laptops"]].map(([v, l]) => (
              <button key={v} onClick={() => setCat(v)} className={chip(cat === v)}>{l}</button>
            ))}
          </div>
        )}
      </div>

      {brands.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setBrand("")} className={chip(!brand)}>All brands</button>
          {brands.map((b) => (
            <button key={b} onClick={() => setBrand(b)} className={chip(brand === b)}>{b}</button>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && items.length === 0 && !error ? (
        <div className="bg-white border border-beige-dark rounded-2xl p-8 text-center">
          <p className="font-semibold text-sm">No devices found</p>
          <p className="text-gray-400 text-sm mt-1">
            If a device isn't here, list it yourself. It is added to the library for everyone.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400">{total.toLocaleString()} device{total === 1 ? "" : "s"}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((d) => (
              <div key={d._id} className="bg-white border border-beige-dark rounded-2xl p-4 flex flex-col gap-3">
                <button onClick={() => setOpen(d)} className="text-left">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 truncate">
                      {d.brand}{d.series ? ` · ${d.series}` : ""}
                    </p>
                    {d.verified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-dark">
                        <ShieldCheck size={11} /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-gray-400">Community</span>
                    )}
                  </div>
                  <p className="font-semibold text-sm mt-1" style={{ color: "#0D1117" }}>{d.name}</p>
                  <p className="text-xs text-gray-500 mt-1 min-h-[1rem]">{summary(d)}</p>
                </button>
                <div className="flex items-center justify-between mt-auto">
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Users size={11} /> {d.usageCount || 0} listing{d.usageCount === 1 ? "" : "s"}
                  </span>
                  {onSelect && (
                    <button
                      onClick={() => onSelect(d)}
                      className="bg-green hover:bg-green-dark text-black font-semibold text-xs px-3 py-2 rounded-lg transition-colors"
                    >
                      {selectLabel}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {loading && <div className="flex justify-center py-6"><Loader2 className="animate-spin text-gray-400" /></div>}
          {hasMore && !loading && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="self-center text-sm font-semibold border border-beige-dark bg-white hover:border-gray-400 rounded-xl px-5 py-2.5"
            >
              Load more
            </button>
          )}
        </>
      )}

      {open && (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">
                  {open.brand}{open.series ? ` · ${open.series}` : ""}{open.releaseYear ? ` · ${open.releaseYear}` : ""}
                </p>
                <h3 className="font-display font-bold text-lg" style={{ color: "#0D1117" }}>{open.name}</h3>
              </div>
              <button onClick={() => setOpen(null)} aria-label="Close" className="text-gray-400 hover:text-black"><X size={18} /></button>
            </div>

            <p className="text-xs mt-2 text-gray-500">
              {open.verified ? "Specs checked by Fixly." : "Community entry: added by a shop and not checked yet. Confirm the specs before relying on them."}
            </p>

            <dl className="mt-4 divide-y divide-beige-dark">
              {Object.entries(open.specs || {})
                .filter(([, v]) => v !== "" && v != null)
                .map(([k, v]) => (
                  <div key={k} className="flex gap-4 py-2 text-sm">
                    <dt className="w-32 flex-shrink-0 text-gray-400">{LABELS[k] || k}</dt>
                    <dd className="font-medium" style={{ color: "#0D1117" }}>{fmtSpec(k, v, open.category)}</dd>
                  </div>
                ))}
            </dl>

            {open.variants?.length > 0 && (
              <p className="text-sm mt-4 text-gray-600">
                <span className="text-gray-400">Versions: </span>
                {open.variants.map((v) => [v.ram, v.storage].filter(Boolean).join("/")).join(", ")}
              </p>
            )}
            {open.features?.length > 0 && (
              <ul className="mt-4 list-disc pl-5 text-sm text-gray-600 space-y-1">
                {open.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            )}

            <div className="flex flex-wrap gap-2 mt-6">
              {onSelect && (
                <button
                  onClick={() => onSelect(open)}
                  className="bg-green hover:bg-green-dark text-black font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
                >
                  {selectLabel}
                </button>
              )}
              {isAdmin && (
                <>
                  <button onClick={() => toggleVerified(open)} className="text-sm font-semibold border border-beige-dark hover:border-gray-400 rounded-xl px-4 py-2.5">
                    {open.verified ? "Mark as unverified" : "Mark as verified"}
                  </button>
                  <button onClick={() => remove(open)} className="flex items-center gap-1.5 text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-xl px-4 py-2.5">
                    <Trash2 size={14} /> Remove
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}