import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const PHONE_SPEC_GROUPS = [
  {
    group: "Display",
    fields: [
      {
        key: "screenSize",
        label: "Screen Size",
        unit: '"',
        placeholder: "e.g. 6.7",
      },
      {
        key: "resolution",
        label: "Resolution",
        placeholder: "e.g. 2796 × 1290",
      },
      {
        key: "displayType",
        label: "Display Type",
        placeholder: "e.g. Super Retina XDR OLED",
      },
      {
        key: "refreshRate",
        label: "Refresh Rate",
        unit: "Hz",
        placeholder: "e.g. 120",
      },
    ],
  },
  {
    group: "Performance",
    fields: [
      {
        key: "processor",
        label: "Processor",
        placeholder: "e.g. Apple A17 Pro",
      },
      { key: "ram", label: "RAM", placeholder: "e.g. 8GB" },
      { key: "storage", label: "Storage", placeholder: "e.g. 256GB" },
      { key: "os", label: "Operating System", placeholder: "e.g. iOS 17" },
    ],
  },
  {
    group: "Camera",
    fields: [
      {
        key: "mainCamera",
        label: "Main Camera",
        placeholder: "e.g. 48MP + 12MP + 12MP",
      },
      {
        key: "frontCamera",
        label: "Front Camera",
        placeholder: "e.g. 12MP TrueDepth",
      },
      {
        key: "cameraFeatures",
        label: "Camera Features",
        placeholder: "e.g. ProRAW, Cinematic Mode",
      },
    ],
  },
  {
    group: "Battery & Connectivity",
    fields: [
      {
        key: "battery",
        label: "Battery",
        unit: "mAh",
        placeholder: "e.g. 4422",
      },
      {
        key: "charging",
        label: "Charging",
        placeholder: "e.g. 27W wired, 15W MagSafe",
      },
      {
        key: "connectivity",
        label: "Connectivity",
        placeholder: "e.g. 5G, Wi-Fi 6E, Bluetooth 5.3",
      },
      { key: "sim", label: "SIM", placeholder: "e.g. Dual SIM (nano + eSIM)" },
    ],
  },
];

const LAPTOP_SPEC_GROUPS = [
  {
    group: "Display",
    fields: [
      {
        key: "screenSize",
        label: "Screen Size",
        unit: '"',
        placeholder: "e.g. 14.2",
      },
      {
        key: "resolution",
        label: "Resolution",
        placeholder: "e.g. 3024 × 1964",
      },
      {
        key: "displayType",
        label: "Display Type",
        placeholder: "e.g. Liquid Retina XDR",
      },
      {
        key: "refreshRate",
        label: "Refresh Rate",
        unit: "Hz",
        placeholder: "e.g. 120",
      },
    ],
  },
  {
    group: "Performance",
    fields: [
      {
        key: "processor",
        label: "Processor",
        placeholder: "e.g. Apple M3 Pro 12-core",
      },
      { key: "ram", label: "RAM", placeholder: "e.g. 18GB Unified Memory" },
      { key: "storage", label: "Storage", placeholder: "e.g. 512GB SSD" },
      { key: "gpu", label: "GPU", placeholder: "e.g. 18-core GPU" },
      {
        key: "os",
        label: "Operating System",
        placeholder: "e.g. macOS Sonoma 14",
      },
    ],
  },
  {
    group: "Battery & Build",
    fields: [
      { key: "battery", label: "Battery", unit: "Wh", placeholder: "e.g. 70" },
      { key: "weight", label: "Weight", placeholder: "e.g. 1.61kg" },
      {
        key: "dimensions",
        label: "Dimensions",
        placeholder: "e.g. 312.6 × 221.2 × 15.5 mm",
      },
    ],
  },
  {
    group: "Connectivity",
    fields: [
      {
        key: "ports",
        label: "Ports",
        placeholder: "e.g. 3× USB-C, HDMI, SD card",
      },
      {
        key: "connectivity",
        label: "Wireless",
        placeholder: "e.g. Wi-Fi 6E, Bluetooth 5.3",
      },
      { key: "webcam", label: "Webcam", placeholder: "e.g. 1080p FaceTime HD" },
    ],
  },
];

function SpecGroup({ group, fields, specs, onChange }) {
  const [open, setOpen] = useState(false);
  const filled = fields.filter((f) => specs[f.key]).length;

  return (
    <div className="border border-beige-dark rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-beige hover:bg-beige-dark/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span
            className="font-semibold text-sm text-black"
            style={{ color: "#0D1117" }}
          >
            {group}
          </span>
          {filled > 0 && (
            <span className="text-[10px] font-bold bg-green/15 text-green px-2 py-0.5 rounded-full">
              {filled}/{fields.length} filled
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp size={15} className="text-gray-400" />
        ) : (
          <ChevronDown size={15} className="text-gray-400" />
        )}
      </button>

      {open && (
        <div className="grid grid-cols-2 gap-4 p-5 border-t border-beige-dark bg-white">
          {fields.map(({ key, label, unit, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400">
                {label}
                {unit && <span className="text-gray-300 ml-1">({unit})</span>}
              </label>
              <input
                type="text"
                placeholder={placeholder}
                value={specs[key] ?? ""}
                onChange={(e) => onChange(key, e.target.value)}
                className="w-full bg-beige border border-beige-dark hover:border-gray-300 focus:border-green rounded-xl px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-300"
                style={{ color: "#0D1117" }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SpecsForm({ category, specs, onChange }) {
  const groups = category === "phone" ? PHONE_SPEC_GROUPS : LAPTOP_SPEC_GROUPS;
  const setSpec = (key, val) => onChange({ ...specs, [key]: val });

  return (
    <div className="flex flex-col gap-3">
      {groups.map(({ group, fields }) => (
        <SpecGroup
          key={group}
          group={group}
          fields={fields}
          specs={specs}
          onChange={setSpec}
        />
      ))}
    </div>
  );
}
