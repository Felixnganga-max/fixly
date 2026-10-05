import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image,
  Zap,
  ListChecks,
  Settings2,
  Save,
  BookMarked,
} from "lucide-react";
import {
  createListing,
  updateListing,
  getListingById,
} from "../Hooks/marketplaceApi";
import { getLibraryDevice } from "../Hooks/libraryApi";
import { getRole } from "../Hooks/loginApi";
import ImageUploadZone from "./ImageUploadZone";
import CoreInfoForm from "./CoreInfoForm";
import SpecsForm from "./SpecsForm";
import FeaturesInput from "./FeaturesInput";
import VariantPricing from "./VariantPricing";

// ── Step config ───────────────────────────────────────────────
const STEPS = [
  { id: "info", label: "Core Info", icon: Zap, desc: "Name, price, condition" },
  {
    id: "images",
    label: "Images",
    icon: Image,
    desc: "Upload up to 10 photos",
  },
  {
    id: "features",
    label: "Features",
    icon: ListChecks,
    desc: "Key selling points",
  },
  {
    id: "specs",
    label: "Tech Specs",
    icon: Settings2,
    desc: "Detailed specifications",
  },
];

const EMPTY_FORM = {
  category: "phone",
  brand: "",
  name: "",
  price: "",
  oldPrice: "",
  condition: "New",
  verified: false,
  active: true,
  rating: "0",
  reviews: "0",
  shortDescription: "",
  features: [""],
  specs: {},
  variants: [], // [{ ram, storage, price, oldPrice, inStock }]
};

// ── Step sidebar indicator ────────────────────────────────────
function StepNav({ steps, current, onChange, completedSteps }) {
  return (
    <nav className="flex flex-col gap-1">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = current === step.id;
        const isDone = completedSteps.includes(step.id);

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onChange(step.id)}
            className={`
              flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left
              transition-all duration-200 group w-full
              ${isActive ? "bg-black text-white shadow-md" : "hover:bg-beige text-gray-500 hover:text-black"}
            `}
          >
            <div
              className={`
              w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
              transition-all duration-200
              ${isActive ? "bg-white/15" : isDone ? "bg-green/10" : "bg-beige-dark group-hover:bg-white"}
            `}
            >
              {isDone && !isActive ? (
                <CheckCircle2
                  size={16}
                  className="text-green"
                  strokeWidth={2}
                />
              ) : (
                <Icon
                  size={16}
                  className={
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-black"
                  }
                  strokeWidth={1.75}
                />
              )}
            </div>
            <div>
              <p
                className={`text-sm font-semibold leading-tight ${isActive ? "text-white" : ""}`}
              >
                {step.label}
              </p>
              <p
                className={`text-xs mt-0.5 ${isActive ? "text-white/60" : "text-gray-400"}`}
              >
                {step.desc}
              </p>
            </div>
            <span
              className={`ml-auto text-xs font-mono flex-shrink-0 ${isActive ? "text-white/40" : "text-gray-300"}`}
            >
              0{i + 1}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Section wrapper ───────────────────────────────────────────
function Section({ title, subtitle, children }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-beige-dark pb-4">
        <h2
          className="font-display font-extrabold text-xl text-black"
          style={{ color: "#0D1117" }}
        >
          {title}
        </h2>
        {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function AddListingPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);

  // Set when the user arrives from the library via ?fromLibrary=<id>
  // The library page passes the whole device in router state, so no second request is needed.
  // If the page is opened or refreshed directly, the id in ?from= is fetched instead.
  const location = useLocation();
  const stateDevice = !isEdit ? location.state?.device : null;
  const libraryId = !isEdit
    ? stateDevice?._id || searchParams.get("fromLibrary") || searchParams.get("from")
    : null;
  const isShop = getRole() === "shop_owner";
  const libraryPath = isShop ? "/shop/library" : "/admin/library";

  const [step, setStep] = useState("info");
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageFiles, setImageFiles] = useState([]); // new File objects
  const [existingImages, setExistingImages] = useState([]); // URLs already on server
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [apiErr, setApiErr] = useState("");
  const [completedSteps, setCompletedSteps] = useState([]);
  const [loadingListing, setLoadingListing] = useState(
    isEdit || (Boolean(libraryId) && !stateDevice),
  );
  const [fromLibrary, setFromLibrary] = useState(false);
  const [libraryVariants, setLibraryVariants] = useState([]); // versions offered by the library entry
  const [variantsDirty, setVariantsDirty] = useState(false); // true once the seller edits the versions

  // ── Pre-fill form in edit mode ───────────────────────────────
  useEffect(() => {
    if (!id) return;

    setLoadingListing(true);
    getListingById(id)
      .then((data) => {
        setForm({
          category: data.category ?? "phone",
          brand: data.brand ?? "",
          name: data.name ?? "",
          price: String(data.price ?? ""),
          oldPrice: data.oldPrice ? String(data.oldPrice) : "",
          condition: data.condition ?? "New",
          verified: data.verified ?? false,
          active: data.active ?? true,
          rating: String(data.rating ?? 0),
          reviews: String(data.reviews ?? 0),
          shortDescription: data.shortDescription ?? "",
          features: data.features?.length ? data.features : [""],
          specs: data.specs ?? {},
          variants: (data.variants ?? []).map((v) => ({
            ram: v.ram ?? "",
            storage: v.storage ?? "",
            price: v.price != null ? String(v.price) : "",
            oldPrice: v.oldPrice ? String(v.oldPrice) : "",
            inStock: v.inStock !== false,
          })),
        });
        setExistingImages(data.images ?? []);
        // Mark all steps complete so progress bar fills
        setCompletedSteps(STEPS.map((s) => s.id));

        // Listings made from the library: offer the library's versions as one-tap choices
        const libId = data.libraryDevice?._id || data.libraryDevice;
        if (libId) {
          getLibraryDevice(libId)
            .then((res) => {
              const d = res?.data?.data ?? res?.data ?? res;
              if (Array.isArray(d?.variants)) setLibraryVariants(d.variants);
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        setApiErr(err.message || "Failed to load listing.");
      })
      .finally(() => setLoadingListing(false));
  }, [id]);

  // ── Pre-fill from the shared device library ──────────────────
  // Only specs-type info comes across. Price, condition and images stay the shop's own.
  useEffect(() => {
    if (!libraryId) return;

    const apply = (d) => {
      setForm((f) => ({
        ...f,
        category: d.category ?? f.category,
        brand: d.brand ?? "",
        name: d.name ?? "",
        shortDescription: d.shortDescription ?? "",
        features: d.features?.length ? d.features : [""],
        specs: d.specs ?? {},
      }));
      setFromLibrary(true);
      setLibraryVariants(Array.isArray(d.variants) ? d.variants : []);
      setCompletedSteps(["features", "specs"]);
    };

    // Fast path: the library page already handed us the full device
    if (stateDevice) {
      apply(stateDevice);
      return;
    }

    setLoadingListing(true);
    getLibraryDevice(libraryId)
      .then((res) => {
        // works whether the helper returns the device, the body, or the raw axios response
        const d = res?.data?.data ?? res?.data ?? res;
        if (!d || !d.name) throw new Error("Library device not found");
        apply(d);
      })
      .catch((err) => {
        setApiErr(
          err?.response?.data?.message ||
            err.message ||
            "Couldn't load that library device. You can still fill the form in manually.",
        );
      })
      .finally(() => setLoadingListing(false));
  }, [libraryId]);

  const setField = useCallback((key, val) => {
    setForm((f) => {
      if (key === "category")
        return { ...f, category: val, brand: "", specs: {} };
      return { ...f, [key]: val };
    });
    setErrors((e) => ({ ...e, [key]: "" }));
  }, []);

  const markComplete = (stepId) =>
    setCompletedSteps((prev) =>
      prev.includes(stepId) ? prev : [...prev, stepId],
    );

  const goStep = (id) => {
    markComplete(step);
    setStep(id);
  };

  // ── Validation ───────────────────────────────────────────────
  const validateInfo = () => {
    const e = {};
    if (!form.brand) e.brand = "Select a brand";
    if (!form.name.trim()) e.name = "Device name is required";
    const hasVariantPrice = (form.variants || []).some((v) => Number(v.price) > 0);
    if (!hasVariantPrice && (!form.price || Number(form.price) <= 0)) {
      e.price = "Enter a valid price";
    }
    const unpriced = (form.variants || []).find(
      (v) => (v.ram || v.storage) && !(Number(v.price) > 0),
    );
    if (unpriced) e.variants = "Every version needs a price, or remove it";
    if (!form.shortDescription.trim())
      e.shortDescription = "Description is required";
    return e;
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSave = async () => {
    const e = validateInfo();
    if (Object.keys(e).length) {
      setErrors(e);
      setStep("info");
      setApiErr("Please fix the highlighted fields before saving.");
      return;
    }

    setSaving(true);
    setApiErr("");
    try {
      const variants = (form.variants || [])
        .filter((v) => (v.ram || v.storage) && Number(v.price) > 0)
        .map((v) => ({
          ram: String(v.ram || "").trim(),
          storage: String(v.storage || "").trim(),
          price: Number(v.price),
          oldPrice: v.oldPrice ? Number(v.oldPrice) : null,
          inStock: v.inStock !== false,
        }));
      // With versions, the headline price is the lowest one that is in stock
      const stocked = variants.filter((v) => v.inStock);
      const headline = variants.length
        ? Math.min(...(stocked.length ? stocked : variants).map((v) => v.price))
        : Number(form.price);

      const payload = {
        ...form,
        price: headline,
        oldPrice: variants.length ? null : form.oldPrice ? Number(form.oldPrice) : null,
        rating: Number(form.rating) || 0,
        reviews: Number(form.reviews) || 0,
        features: form.features.filter(Boolean),
        variants,
      };

      // Editing without touching the versions section must not overwrite what is saved
      const sendVariants = !isEdit || variantsDirty;
      if (!sendVariants) delete payload.variants;
      // Removing every version is deliberate, so tell the server explicitly
      else if (isEdit && variants.length === 0) payload.clearVariants = true;

      let result;
      if (isEdit) {
        // Pass existing image URLs + any new File objects to the API
        result = await updateListing(id, payload, imageFiles, existingImages);
      } else {
        // libraryDevice links the listing to the shared library entry (server reads it)
        if (libraryId) payload.libraryDevice = libraryId;
        result = await createListing(payload, imageFiles);
      }

      // The server answers with the saved listing: confirm the versions really arrived
      if (sendVariants && variants.length) {
        const stored = Array.isArray(result?.variants) ? result.variants.length : 0;
        if (stored !== variants.length) {
          const m = result?._meta?.variants;
          const detail = m
            ? ` Server report: received ${m.received ? "yes" : "no"}, read ${m.parsed === -1 ? "unreadable" : (m.parsed ?? "?")}, stored ${m.saved ?? "?"}.`
            : " The server sent no report, so it is still running the old controller.";
          throw new Error(
            `The listing was saved, but the server stored ${stored} of ${variants.length} versions.${detail}`,
          );
        }
      }

      setSaved(true);
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      setApiErr(
        err?.response?.data?.message ||
          err.message ||
          "Failed to save listing. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Progress ─────────────────────────────────────────────────
  const progress = Math.round((completedSteps.length / STEPS.length) * 100);

  // Preview price: the lowest priced version, else the single price
  const pricedVariants = (form.variants || []).filter((v) => Number(v.price) > 0);
  const displayPrice = pricedVariants.length
    ? Math.min(...pricedVariants.map((v) => Number(v.price)))
    : Number(form.price) || 0;

  // Preview image — prefer new uploads, fall back to first existing URL.
  // Memoised so we don't create a new object URL on every render.
  const previewFile = imageFiles[0] ?? null;
  const objectUrl = useMemo(
    () => (previewFile ? URL.createObjectURL(previewFile) : null),
    [previewFile],
  );
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);
  const previewSrc = objectUrl ?? existingImages[0] ?? null;

  if (loadingListing) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige">
      {/* Top bar */}
      <div className="bg-white border-b border-beige-dark sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors font-medium"
            >
              <ArrowLeft size={15} strokeWidth={2} />
              Back
            </button>
            <div className="h-5 w-px bg-beige-dark" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                {isShop ? "My Listings" : "Marketplace Admin"}
              </p>
              <h1
                className="font-display font-extrabold text-lg text-black leading-tight"
                style={{ color: "#0D1117" }}
              >
                {isEdit ? "Edit Listing" : "Add New Listing"}
              </h1>
            </div>
          </div>

          {/* Progress + Save */}
          <div className="flex items-center gap-5">
            {!isEdit && !libraryId && (
              <button
                type="button"
                onClick={() => navigate(libraryPath)}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-beige-dark text-sm font-semibold text-gray-600 hover:bg-beige hover:text-black transition-colors"
              >
                <BookMarked size={15} strokeWidth={1.75} />
                List from library
              </button>
            )}

            <div className="hidden sm:flex items-center gap-3">
              <div className="w-32 h-1.5 bg-beige-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-green rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 font-mono">
                {progress}%
              </span>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm
                transition-all duration-300 min-w-36 justify-center
                ${saved ? "bg-green text-black" : "bg-black hover:bg-green hover:text-black text-white"}
                disabled:opacity-60
              `}
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Saving…
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 size={15} /> Saved!
                </>
              ) : (
                <>
                  <Save size={15} />{" "}
                  {isEdit ? "Update Listing" : "Save Listing"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8 items-start">
        {/* ── Sidebar ── */}
        <aside className="w-64 flex-shrink-0 sticky top-24">
          <div className="bg-white border border-beige-dark rounded-2xl p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 pt-1 pb-3">
              Listing Sections
            </p>
            <StepNav
              steps={STEPS}
              current={step}
              onChange={goStep}
              completedSteps={completedSteps}
            />
          </div>

          {/* Mini preview card */}
          {(form.name || previewSrc) && (
            <div className="mt-4 bg-white border border-beige-dark rounded-2xl overflow-hidden">
              {previewSrc && (
                <div className="w-full h-36 bg-beige overflow-hidden">
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                {form.brand && (
                  <p className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold">
                    {form.brand}
                  </p>
                )}
                {form.name && (
                  <p
                    className="font-display font-bold text-sm leading-tight mt-0.5"
                    style={{ color: "#0D1117" }}
                  >
                    {form.name}
                  </p>
                )}
                {displayPrice > 0 && (
                  <p
                    className="font-mono font-extrabold text-base mt-1.5"
                    style={{ color: "#0D1117" }}
                  >
                    {pricedVariants.length > 1 && (
                      <span className="text-[10px] font-semibold text-gray-400 mr-1">from</span>
                    )}
                    KES {displayPrice.toLocaleString()}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-2">
                  {form.condition && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-beige border border-beige-dark text-gray-500">
                      {form.condition}
                    </span>
                  )}
                  {(imageFiles.length > 0 || existingImages.length > 0) && (
                    <span className="text-[10px] text-gray-400">
                      {imageFiles.length + existingImages.length} photo
                      {imageFiles.length + existingImages.length !== 1
                        ? "s"
                        : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0">
          {/* Library banner */}
          {fromLibrary && (
            <div className="flex items-start gap-3 bg-green/10 border border-green/30 rounded-xl px-5 py-4 mb-6">
              <BookMarked
                size={16}
                className="text-green flex-shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <p className="text-sm" style={{ color: "#0D1117" }}>
                Name, specs and features are filled in from the library. Add
                your price, condition and photos, then save. You can still edit
                anything.
              </p>
            </div>
          )}

          {/* API error banner */}
          {apiErr && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6">
              <AlertCircle
                size={16}
                className="text-red-500 flex-shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <p className="text-red-600 text-sm">{apiErr}</p>
            </div>
          )}

          <div className="bg-white border border-beige-dark rounded-2xl p-8">
            {/* ── Core Info ── */}
            {step === "info" && (
              <Section
                title="Core Information"
                subtitle="The basics — these fields are required before the listing can go live."
              >
                <CoreInfoForm form={form} errors={errors} onChange={setField} />
                <VariantPricing
                  variants={form.variants}
                  suggestions={libraryVariants}
                  onChange={(v) => {
                    setVariantsDirty(true);
                    setField("variants", v);
                  }}
                />
                {errors.variants && (
                  <p className="text-red-500 text-sm -mt-3">{errors.variants}</p>
                )}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const e = validateInfo();
                      if (Object.keys(e).length) {
                        setErrors(e);
                        return;
                      }
                      markComplete("info");
                      setStep("images");
                    }}
                    className="flex items-center gap-2 bg-black hover:bg-green hover:text-black text-white font-bold text-sm px-8 py-3 rounded-xl transition-all duration-200"
                  >
                    Next: Images →
                  </button>
                </div>
              </Section>
            )}

            {/* ── Images ── */}
            {step === "images" && (
              <Section
                title="Product Images"
                subtitle={
                  isEdit
                    ? "Existing images are shown below. Upload new ones to add or replace them."
                    : "Upload up to 10 images. Drag thumbnails to reorder — first image is the main photo."
                }
              >
                {/* Existing image thumbnails (edit mode) */}
                {isEdit && existingImages.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                      Current Images
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {existingImages.map((url, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={url}
                            alt={`Image ${i + 1}`}
                            className="w-20 h-20 rounded-xl object-cover border border-beige-dark"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setExistingImages((prev) =>
                                prev.filter((_, idx) => idx !== i),
                              )
                            }
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-beige-dark my-5" />
                  </div>
                )}

                <ImageUploadZone
                  files={imageFiles}
                  onChange={setImageFiles}
                  max={10 - existingImages.length}
                />

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("info")}
                    className="text-gray-400 hover:text-black text-sm font-semibold transition-colors px-4 py-2"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      markComplete("images");
                      setStep("features");
                    }}
                    className="flex items-center gap-2 bg-black hover:bg-green hover:text-black text-white font-bold text-sm px-8 py-3 rounded-xl transition-all duration-200"
                  >
                    Next: Features →
                  </button>
                </div>
              </Section>
            )}

            {/* ── Features ── */}
            {step === "features" && (
              <Section
                title="Key Features"
                subtitle="Add bullet-point highlights shown on the product page. Press Enter to add a new line."
              >
                <FeaturesInput
                  features={form.features}
                  onChange={(val) => setField("features", val)}
                />
                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("images")}
                    className="text-gray-400 hover:text-black text-sm font-semibold transition-colors px-4 py-2"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      markComplete("features");
                      setStep("specs");
                    }}
                    className="flex items-center gap-2 bg-black hover:bg-green hover:text-black text-white font-bold text-sm px-8 py-3 rounded-xl transition-all duration-200"
                  >
                    Next: Specs →
                  </button>
                </div>
              </Section>
            )}

            {/* ── Specs ── */}
            {step === "specs" && (
              <Section
                title="Technical Specifications"
                subtitle="Expand each group and fill in the relevant fields. All spec fields are optional."
              >
                <SpecsForm
                  category={form.category}
                  specs={form.specs}
                  onChange={(specs) => setField("specs", specs)}
                />
                <div className="flex justify-between items-center pt-4 border-t border-beige-dark mt-2">
                  <button
                    type="button"
                    onClick={() => setStep("features")}
                    className="text-gray-400 hover:text-black text-sm font-semibold transition-colors px-4 py-2"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || saved}
                    className={`
                      flex items-center gap-2 px-10 py-3.5 rounded-xl font-bold text-sm
                      transition-all duration-300 min-w-44 justify-center
                      ${saved ? "bg-green text-black" : "bg-black hover:bg-green hover:text-black text-white"}
                      disabled:opacity-60
                    `}
                  >
                    {saving ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Saving…
                      </>
                    ) : saved ? (
                      <>
                        <CheckCircle2 size={15} />{" "}
                        {isEdit ? "Updated!" : "Listing saved!"}
                      </>
                    ) : (
                      <>
                        <Save size={15} />{" "}
                        {isEdit ? "Update Listing" : "Publish Listing"}
                      </>
                    )}
                  </button>
                </div>
              </Section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}