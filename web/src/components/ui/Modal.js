"use client";
import { useEffect } from "react";

const WIDTH = { md: "max-w-md", lg: "max-w-lg" };

export default function Modal({ title, onClose, children, size = "md", locked = false }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !locked) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [locked, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(e) => { if (!locked && e.target === e.currentTarget) onClose(); }}
    >
      <div className={`max-h-[90vh] w-full ${WIDTH[size]} animate-fade-up overflow-y-auto border border-white/10 bg-panel p-5 motion-reduce:animate-none sm:p-6`}>
        <h2 className="mb-5 text-base font-medium">{title}</h2>
        {children}
      </div>
    </div>
  );
}