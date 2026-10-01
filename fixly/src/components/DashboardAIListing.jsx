import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Smartphone,
  Laptop,
  Save,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import {
  getBrandNames,
  aiGenerateDevice,
  aiSaveDrafts,
} from "../Hooks/marketplaceApi";

const MAX_DEVICES = 30;

function StatusIcon({ status }) {
  if (status === "loading")
    return <Loader2 size={16} className="animate-spin text-gray-400" />;
  if (status === "done")
    return <CheckCircle2 size={16} className="text-green" strokeWidth={2} />;
  if (status === "duplicate")
    return <Copy size={16} className="text-amber-500" strokeWidth={2} />;
  if (status === "error")
    return <AlertTriangle size={16} className="text-red-500" strokeWidth={2} />;
  return <span className="w-4 h-4 rounded-full border border-beige-dark" />;
}

export default function DashboardAIListing() {
  const navigate = useNavigate();

  const [category, setCategory] = useState("phone");
  const [brands, setBrands] = useState([]);
  const [brand, setBrand] = useState("");
  const [input, setInput] = useState("");
  const [rows, setRows] = useState([]);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setBrand("");
    getBrandNames(category)
      .then(setBrands)
      .catch(() => setBrands([]));
  }, [category]);

  const patch = (id, p) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const names = [
    ...new Set(
      input
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ].slice(0, MAX_DEVICES);

  const generate = async () => {
    if (!brand || !names.length || running) return;
    const list = names.map((name, id) => ({
      id,
      name,
      status: "queued",
      keep: false,
    }));
    setRows(list);
    setSaved(null);
    setError("");
    setRunning(true);

    // 2 requests at a time; one device per request
    const queue = [...list];
    const worker = async () => {
      while (queue.length) {
        const r = queue.shift();
        patch(r.id, { status: "loading" });
        try {
          const d = await aiGenerateDevice({ category, brand, name: r.name });
          patch(
            r.id,
            d.duplicate
              ? { status: "duplicate", data: d }
              : { status: "done", data: d, keep: true },
          );
        } catch (e) {
          patch(r.id, { status: "error", error: e.message });
        }
      }
    };
    await Promise.all([worker(), worker()]);
    setRunning(false);
  };

  const ready = rows.filter((r) => r.status === "done" && r.keep);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await aiSaveDrafts({
        category,
        brand,
        items: ready.map((r) => ({
          name: r.data.name,
          shortDescription: r.data.shortDescription,
          features: r.data.features,
          specs: r.data.specs,
        })),
      });
      setSaved(res);
      setRows([]);
      setInput("");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const pill = (active) =>
    `flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold transition-all ${
      active
        ? "bg-black text-white border-black"
        : "bg-beige text-gray-500 border-beige-dark hover:border-gray-400"
    }`;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard/marketplace")}
          className="w-10 h-10 rounded-xl bg-white border border-beige-dark flex items-center justify-center hover:border-gray-400 transition-colors"
        >
          <ArrowLeft size={16} className="text-gray-500" />
        </button>
        <div>
          <h1
            className="font-display font-extrabold text-2xl text-black"
            style={{ color: "#0D1117" }}
          >
            AI Listing
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Enter device names. Specs, features and description are filled in
            for you. Saved as hidden drafts.
          </p>
        </div>
      </div>

      {/* Input card */}
      <div className="bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex gap-3">
          <button
            onClick={() => setCategory("phone")}
            className={pill(category === "phone")}
          >
            <Smartphone size={16} /> Phone
          </button>
          <button
            onClick={() => setCategory("laptop")}
            className={pill(category === "laptop")}
          >
            <Laptop size={16} /> Laptop
          </button>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-400">Brand</label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="mt-1.5 w-full bg-beige border border-beige-dark rounded-2xl px-5 py-3.5 text-sm text-gray-600 outline-none cursor-pointer"
          >
            <option value="">Select brand</option>
            {brands.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-400">
            Device names, one per line (max {MAX_DEVICES})
          </label>
          <textarea
            rows={6}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              category === "phone"
                ? "Galaxy S24 Ultra\nGalaxy A15\nGalaxy Z Flip 5"
                : "ProBook 450 G9\nEliteBook 840 G8"
            }
            className="mt-1.5 w-full bg-beige border border-beige-dark rounded-2xl px-5 py-3.5 text-sm outline-none resize-y placeholder:text-gray-300"
            style={{ color: "#0D1117" }}
          />
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-gray-400 text-xs">
            {names.length} device{names.length !== 1 ? "s" : ""} · images are
            added later on each listing
          </p>
          <button
            onClick={generate}
            disabled={!brand || !names.length || running}
            className="flex items-center gap-2 bg-green hover:bg-green-dark text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {running ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Sparkles size={15} strokeWidth={2} />
            )}
            {running ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {saved && (
        <div className="bg-green-light border border-green-dark/30 rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm font-semibold text-black">
            {saved.created} draft{saved.created !== 1 ? "s" : ""} saved
            {saved.skipped > 0 && ` · ${saved.skipped} skipped (already exist)`}
            . Set price and images to take them live.
          </p>
          <button
            onClick={() => navigate("/dashboard/marketplace")}
            className="flex items-center gap-1.5 text-sm font-semibold text-black underline"
          >
            Open marketplace <ExternalLink size={13} />
          </button>
        </div>
      )}

      {/* Results */}
      {rows.length > 0 && (
        <div className="flex flex-col gap-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className={`bg-white border border-beige-dark rounded-2xl p-5 ${
                r.status === "done" && !r.keep ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <StatusIcon status={r.status} />
                <p
                  className="font-semibold text-sm flex-1"
                  style={{ color: "#0D1117" }}
                >
                  {brand} {r.name}
                </p>
                {r.status === "done" && (
                  <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={r.keep}
                      onChange={(e) => patch(r.id, { keep: e.target.checked })}
                    />
                    Save
                  </label>
                )}
                {r.status === "duplicate" && (
                  <span className="text-xs text-amber-600 font-semibold">
                    Already listed
                  </span>
                )}
              </div>

              {r.status === "error" && (
                <p className="text-red-500 text-xs mt-2 ml-7">{r.error}</p>
              )}

              {r.status === "done" && (
                <div className="mt-4 ml-7 flex flex-col gap-4">
                  <textarea
                    rows={2}
                    value={r.data.shortDescription}
                    onChange={(e) =>
                      patch(r.id, {
                        data: { ...r.data, shortDescription: e.target.value },
                      })
                    }
                    className="w-full bg-beige border border-beige-dark rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
                    style={{ color: "#0D1117" }}
                  />

                  {r.data.features.length > 0 && (
                    <ul className="flex flex-col gap-1">
                      {r.data.features.map((f, i) => (
                        <li
                          key={i}
                          className="text-xs text-gray-600 flex items-start gap-2"
                        >
                          <CheckCircle2
                            size={12}
                            className="text-green mt-0.5 flex-shrink-0"
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
                    {Object.entries(r.data.specs).map(([k, v]) => (
                      <p key={k} className="text-xs text-gray-600">
                        <span className="text-gray-400">{k}: </span>
                        {v}
                      </p>
                    ))}
                  </div>

                  {r.data.sources?.length > 0 && (
                    <p className="text-xs text-gray-400">
                      Sources:{" "}
                      {r.data.sources.map((u, i) => (
                        <a
                          key={i}
                          href={u}
                          target="_blank"
                          rel="noreferrer"
                          className="underline mr-2"
                        >
                          {i + 1}
                        </a>
                      ))}
                      · verify before going live
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end">
            <button
              onClick={save}
              disabled={!ready.length || running || saving}
              className="flex items-center gap-2 bg-black text-white font-semibold text-sm px-6 py-3 rounded-xl disabled:opacity-40 transition-opacity"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              Save {ready.length} as drafts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}