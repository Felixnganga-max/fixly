import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
} from "lucide-react";
import {
  createListing,
  updateListing,
  getListingById,
} from "../Hooks/marketplaceApi";
import ImageUploadZone from "./ImageUploadZone";
import CoreInfoForm from "./CoreInfoForm";
import SpecsForm from "./SpecsForm";
import FeaturesInput from "./FeaturesInput";

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
  const isEdit = Boolean(id);

  const [step, setStep] = useState("info");
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageFiles, setImageFiles] = useState([]); // new File objects
  const [existingImages, setExistingImages] = useState([]); // URLs already on server
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [apiErr, setApiErr] = useState("");
  const [completedSteps, setCompletedSteps] = useState([]);
  const [loadingListing, setLoadingListing] = useState(isEdit);

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
        });
        setExistingImages(data.images ?? []);
        // Mark all steps complete so progress bar fills
        setCompletedSteps(STEPS.map((s) => s.id));
      })
      .catch((err) => {
        setApiErr(err.message || "Failed to load listing.");
      })
      .finally(() => setLoadingListing(false));
  }, [id]);

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
    if (!form.price || Number(form.price) <= 0) e.price = "Enter a valid price";
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
      const payload = {
        ...form,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        rating: Number(form.rating) || 0,
        reviews: Number(form.reviews) || 0,
        features: form.features.filter(Boolean),
      };

      if (isEdit) {
        // Pass existing image URLs + any new File objects to the API
        await updateListing(id, payload, imageFiles, existingImages);
      } else {
        await createListing(payload, imageFiles);
      }

      setSaved(true);
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      setApiErr(err.message || "Failed to save listing. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Progress ─────────────────────────────────────────────────
  const progress = Math.round((completedSteps.length / STEPS.length) * 100);

  // Preview image — prefer new uploads, fall back to first existing URL
  const previewSrc = imageFiles[0]
    ? URL.createObjectURL(imageFiles[0])
    : (existingImages[0] ?? null);

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
                Marketplace Admin
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
                {form.price && (
                  <p
                    className="font-mono font-extrabold text-base mt-1.5"
                    style={{ color: "#0D1117" }}
                  >
                    KES {Number(form.price).toLocaleString()}
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
