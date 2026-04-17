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
    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-zinc-800">
      <div className="flex items-start gap-3">
        <div className="text-gray-400 dark:text-zinc-500 mt-0.5">{icon}</div>
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-zinc-50">
            {label}
          </div>
          <div className="text-xs mt-0.5 text-gray-500 dark:text-zinc-400">
            {description}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors ${
          value ? "bg-gray-900 dark:bg-zinc-100" : "bg-gray-200 dark:bg-zinc-700"
        }`}
        aria-pressed={value}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full transition-all shadow-sm ${
            value
              ? "left-[22px] bg-white dark:bg-zinc-900"
              : "left-0.5 bg-white dark:bg-zinc-300"
          }`}
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
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 backdrop-blur-[2px]"
          onClick={onClose}
          aria-hidden
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full z-50 w-full max-w-sm flex flex-col bg-white dark:bg-zinc-950 border-l border-gray-200 dark:border-zinc-800 shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-gray-900 dark:text-zinc-50">
              Settings
            </h2>
            <p className="text-xs mt-0.5 text-gray-500 dark:text-zinc-400">
              Extraction preferences
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2">
          <div className="py-4 border-b border-gray-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <Languages className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-zinc-50">
                  Language
                </div>
                <div className="text-xs mt-0.5 text-gray-500 dark:text-zinc-400">
                  Preferred transcript language
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {LANGUAGES.map((lang) => {
                const active = local.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLocal({ ...local, language: lang.code })}
                    className={`px-3 py-2 text-xs text-left rounded-lg border transition-all ${
                      active
                        ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white font-semibold"
                        : "bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Toggle
            value={local.includeTimestamps}
            onChange={(v) => setLocal({ ...local, includeTimestamps: v })}
            label="Include timestamps"
            description="Add [MM:SS] prefix to each segment in exports"
            icon={<Clock className="w-4 h-4" />}
          />
          <Toggle
            value={local.speakerDetection}
            onChange={(v) => setLocal({ ...local, speakerDetection: v })}
            label="Speaker detection"
            description="Label segments by detected speaker when available"
            icon={<User className="w-4 h-4" />}
          />

          <div className="py-4">
            <div className="flex items-center gap-3 mb-3">
              <Gauge className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-zinc-50">
                  Rate limit
                </div>
                <div className="text-xs mt-0.5 text-gray-500 dark:text-zinc-400">
                  Pause after each transcript before the next (reduces throttling on
                  large channels)
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {RATE_LIMITS.map((rate) => {
                const active = local.rateLimitMs === rate.value;
                return (
                  <button
                    key={rate.value}
                    type="button"
                    onClick={() =>
                      setLocal({ ...local, rateLimitMs: rate.value })
                    }
                    className={`px-3 py-2 text-xs text-left rounded-lg border transition-all ${
                      active
                        ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white font-semibold"
                        : "bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    {rate.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-200 dark:border-zinc-800 flex-shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3 text-sm font-semibold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
          >
            Save settings
          </button>
        </div>
      </div>
    </>
  );
}
