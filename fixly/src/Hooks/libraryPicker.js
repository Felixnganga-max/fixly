import { X } from "lucide-react";
import LibraryBrowser from "./libraryBrowser";

/**
 * "List from library" popup for the listing form.
 *   <LibraryPicker open={open} onClose={() => setOpen(false)} category={form.category}
 *                  onSelect={(device) => setForm((f) => ({ ...f, ...libraryToListing(device) }))} />
 */
export default function LibraryPicker({ open, onClose, onSelect, category = "" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-beige rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-display font-bold text-lg" style={{ color: "#0D1117" }}>Pick a device from the library</h3>
            <p className="text-xs text-gray-500 mt-1">
              Specs are filled in for you. Can't find it? Close this and list it yourself, and it joins the library.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-black"><X size={18} /></button>
        </div>
        <LibraryBrowser
          category={category}
          selectLabel="Use this device"
          onSelect={(d) => {
            onSelect(d);
            onClose();
          }}
        />
      </div>
    </div>
  );
}