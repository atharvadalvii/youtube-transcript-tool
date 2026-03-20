"use client";

import { useState } from "react";
import { ExtractorSettings } from "@/types/bulkscript";
import { X, Languages, Clock, User, Gauge } from "lucide-react";

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
  icon: React.ReactNode;
}

function Toggle({ value, onChange, label, description, icon }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: "#2A2D35" }}>
      <div className="flex items-start gap-3">
        <div style={{ color: "#8A8D95", marginTop: "2px" }}>{icon}</div>
        <div>
          <div className="text-sm font-medium" style={{ color: "#F0EDE6" }}>
            {label}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "#8A8D95" }}>
            {description}
          </div>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative flex-shrink-0 w-10 h-5 transition-all"
        style={{
          backgroundColor: value ? "#C8FF00" : "#2A2D35",
        }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 transition-all"
          style={{
            backgroundColor: value ? "#0F1117" : "#8A8D95",
            left: value ? "22px" : "2px",
          }}
        />
      </button>
    </div>
  );
}

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ExtractorSettings;
  onSave: (settings: ExtractorSettings) => void;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ja", label: "Japanese" },
  { code: "zh", label: "Chinese" },
  { code: "pt", label: "Portuguese" },
  { code: "ar", label: "Arabic" },
  { code: "ko", label: "Korean" },
  { code: "ru", label: "Russian" },
];

const RATE_LIMITS = [
  { value: 500, label: "Fast (500ms)" },
  { value: 1000, label: "Normal (1s)" },
  { value: 2000, label: "Slow (2s)" },
  { value: 5000, label: "Conservative (5s)" },
];

export default function SettingsDrawer({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsDrawerProps) {
  const [local, setLocal] = useState<ExtractorSettings>(settings);

  function handleSave() {
    onSave(local);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: "#00000060" }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 font-space transition-transform duration-300 flex flex-col"
        style={{
          width: "360px",
          backgroundColor: "#0F1117",
          borderLeft: "1px solid #2A2D35",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: "#2A2D35", backgroundColor: "#0A0C11" }}
        >
          <div>
            <h2 className="text-sm font-bold tracking-widest uppercase font-syne" style={{ color: "#F0EDE6" }}>
              Settings
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#8A8D95" }}>
              Configure extraction preferences
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors hover:opacity-80"
            style={{ border: "1px solid #2A2D35", color: "#8A8D95" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bs-scroll px-6 py-2">
          {/* Language */}
          <div className="py-4 border-b" style={{ borderColor: "#2A2D35" }}>
            <div className="flex items-center gap-3 mb-3">
              <Languages className="w-4 h-4" style={{ color: "#8A8D95" }} />
              <div>
                <div className="text-sm font-medium" style={{ color: "#F0EDE6" }}>
                  Language
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#8A8D95" }}>
                  Preferred transcript language
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLocal({ ...local, language: lang.code })}
                  className="px-3 py-2 text-xs text-left transition-all"
                  style={{
                    backgroundColor:
                      local.language === lang.code ? "#C8FF0015" : "#1A1D24",
                    border: `1px solid ${local.language === lang.code ? "#C8FF00" : "#2A2D35"}`,
                    color:
                      local.language === lang.code ? "#C8FF00" : "#8A8D95",
                    fontWeight: local.language === lang.code ? 600 : 400,
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <Toggle
            value={local.includeTimestamps}
            onChange={(v) => setLocal({ ...local, includeTimestamps: v })}
            label="Include Timestamps"
            description="Add [MM:SS] prefix to each segment in exports"
            icon={<Clock className="w-4 h-4" />}
          />
          <Toggle
            value={local.speakerDetection}
            onChange={(v) => setLocal({ ...local, speakerDetection: v })}
            label="Speaker Detection"
            description="Label segments by detected speaker when available"
            icon={<User className="w-4 h-4" />}
          />

          {/* Rate Limit */}
          <div className="py-4">
            <div className="flex items-center gap-3 mb-3">
              <Gauge className="w-4 h-4" style={{ color: "#8A8D95" }} />
              <div>
                <div className="text-sm font-medium" style={{ color: "#F0EDE6" }}>
                  Rate Limit Throttle
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#8A8D95" }}>
                  Delay between extraction requests
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {RATE_LIMITS.map((rate) => (
                <button
                  key={rate.value}
                  onClick={() =>
                    setLocal({ ...local, rateLimitMs: rate.value })
                  }
                  className="px-3 py-2 text-xs text-left transition-all"
                  style={{
                    backgroundColor:
                      local.rateLimitMs === rate.value
                        ? "#C8FF0015"
                        : "#1A1D24",
                    border: `1px solid ${local.rateLimitMs === rate.value ? "#C8FF00" : "#2A2D35"}`,
                    color:
                      local.rateLimitMs === rate.value ? "#C8FF00" : "#8A8D95",
                    fontWeight: local.rateLimitMs === rate.value ? 600 : 400,
                  }}
                >
                  {rate.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex-shrink-0"
          style={{ borderColor: "#2A2D35", backgroundColor: "#0A0C11" }}
        >
          <button
            onClick={handleSave}
            className="w-full py-3 text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90"
            style={{ backgroundColor: "#C8FF00", color: "#0F1117" }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </>
  );
}
