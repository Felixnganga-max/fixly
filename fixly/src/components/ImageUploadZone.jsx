import { useState, useRef, useCallback } from "react";
import { Upload, X, ImagePlus, GripVertical, Star } from "lucide-react";

/**
 * ImageUploadZone
 * Props:
 *   files      {File[]}          — controlled list of File objects
 *   onChange   (files: File[]) => void
 *   max        {number}          — default 10
 */
export default function ImageUploadZone({ files = [], onChange, max = 10 }) {
  const [dragging, setDragging] = useState(false);
  const [dragOver, setDragOver] = useState(null); // index being hovered for reorder
  const inputRef = useRef(null);
  const dragSrc = useRef(null);

  // ── accept new files ────────────────────────────────────────
  const addFiles = useCallback(
    (incoming) => {
      const valid = Array.from(incoming).filter((f) =>
        f.type.startsWith("image/"),
      );
      const merged = [...files, ...valid].slice(0, max);
      onChange(merged);
    },
    [files, max, onChange],
  );

  // ── drop zone handlers ──────────────────────────────────────
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };
  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);

  // ── thumbnail reorder via drag ──────────────────────────────
  const onThumbDragStart = (i) => {
    dragSrc.current = i;
  };
  const onThumbDragEnter = (i) => setDragOver(i);
  const onThumbDragEnd = () => {
    if (
      dragSrc.current === null ||
      dragOver === null ||
      dragSrc.current === dragOver
    ) {
      dragSrc.current = null;
      setDragOver(null);
      return;
    }
    const next = [...files];
    const [moved] = next.splice(dragSrc.current, 1);
    next.splice(dragOver, 0, moved);
    onChange(next);
    dragSrc.current = null;
    setDragOver(null);
  };

  const remove = (i) => {
    const next = files.filter((_, idx) => idx !== i);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => files.length < max && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-3
          border-2 border-dashed rounded-2xl py-10 px-6 cursor-pointer
          transition-all duration-300 select-none
          ${
            dragging
              ? "border-green bg-green/5 scale-[1.01]"
              : "border-beige-dark hover:border-gray-300 bg-beige/50 hover:bg-beige"
          }
          ${files.length >= max ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
        `}
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${dragging ? "bg-green/20" : "bg-white border border-beige-dark"}`}
        >
          {dragging ? (
            <Upload size={24} className="text-green" strokeWidth={1.75} />
          ) : (
            <ImagePlus size={24} className="text-gray-400" strokeWidth={1.5} />
          )}
        </div>

        <div className="text-center">
          <p
            className="font-semibold text-sm text-black"
            style={{ color: "#0D1117" }}
          >
            {dragging ? "Release to upload" : "Drag & drop images here"}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            or <span className="text-green font-semibold">browse files</span> ·
            JPG, PNG, WEBP · max 8MB each
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${files.length > 0 ? "bg-green" : "bg-beige-dark"}`}
            style={{ width: `${Math.max(8, (files.length / max) * 120)}px` }}
          />
          <span className="text-gray-400 text-xs font-mono">
            {files.length}/{max}
          </span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Thumbnails grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {files.map((file, i) => {
            const url = URL.createObjectURL(file);
            const isMain = i === 0;
            const isDragTarget = dragOver === i;

            return (
              <div
                key={`${file.name}-${i}`}
                draggable
                onDragStart={() => onThumbDragStart(i)}
                onDragEnter={() => onThumbDragEnter(i)}
                onDragEnd={onThumbDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`
                  relative group aspect-square rounded-xl overflow-hidden
                  border-2 cursor-grab active:cursor-grabbing
                  transition-all duration-200
                  ${isMain ? "border-green ring-2 ring-green/20" : "border-beige-dark hover:border-gray-300"}
                  ${isDragTarget ? "scale-105 border-green/60 shadow-lg" : ""}
                `}
              >
                <img
                  src={url}
                  alt={`Upload ${i + 1}`}
                  className="w-full h-full object-cover"
                  onLoad={() => URL.revokeObjectURL(url)}
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                  <GripVertical
                    size={20}
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow"
                    strokeWidth={2}
                  />
                </div>

                {/* Main badge */}
                {isMain && (
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-green text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    <Star size={8} fill="black" /> Main
                  </div>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(i);
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <X size={10} className="text-white" strokeWidth={2.5} />
                </button>

                {/* Position number */}
                <div className="absolute bottom-1.5 right-1.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">
                    {i + 1}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Add more slot */}
          {files.length < max && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-beige-dark hover:border-green hover:bg-green/5 flex flex-col items-center justify-center gap-1 transition-all duration-200 group"
            >
              <ImagePlus
                size={18}
                className="text-gray-300 group-hover:text-green transition-colors"
                strokeWidth={1.5}
              />
              <span className="text-[10px] text-gray-300 group-hover:text-green font-semibold transition-colors">
                Add
              </span>
            </button>
          )}
        </div>
      )}

      {files.length > 1 && (
        <p className="text-gray-400 text-xs flex items-center gap-1.5">
          <GripVertical size={11} /> Drag thumbnails to reorder · First image is
          the main thumbnail
        </p>
      )}
    </div>
  );
}
