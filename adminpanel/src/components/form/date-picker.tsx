import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon, TimeIcon } from "../../icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  /** Time-only popup picker (no calendar). */
  timeOnly?: boolean;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
  timeOnly = false,
}: PropsType) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const flatPickr = flatpickr(`#${id}`, {
      mode: mode || "single",
      static: false,
      appendTo: document.body,
      monthSelectorType: "static",
      enableTime: timeOnly,
      noCalendar: timeOnly,
      dateFormat: timeOnly ? "H:i" : "Y-m-d",
      time_24hr: timeOnly,
      defaultDate,
      onChange: (selectedDates, dateStr, instance) => {
        const handler = onChangeRef.current;
        if (!handler) return;
        if (Array.isArray(handler)) {
          handler.forEach((h) => h(selectedDates, dateStr, instance));
        } else {
          handler(selectedDates, dateStr, instance);
        }
      },
      onReady: (_selectedDates, _dateStr, instance) => {
        instance.calendarContainer.style.zIndex = "100000";
      },
    });

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
    // Intentionally only re-init when id/mode/timeOnly change; defaultDate is applied on mount (remount via key).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, id, timeOnly]);

  const Icon = timeOnly ? TimeIcon : CalenderIcon;

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <Icon className="size-6" />
        </span>
      </div>
    </div>
  );
}
