import { useTranslation } from "react-i18next";
import { useCopy } from "../shared";

export const root = "/maintenance-plans";
export const idOf = (record) => record?._id || record || "";
export const assetName = (asset) =>
  asset?.displayName || asset?.uniqueId || "—";
export const localDate = (date = new Date(), timeZone = "Asia/Riyadh") =>
  new Intl.DateTimeFormat("sv-SE", { dateStyle: "short", timeZone }).format(
    date,
  );
export const usePlanDate = () => {
  const { i18n } = useTranslation();
  return (
    value,
    timezone = "Asia/Riyadh",
    options = { dateStyle: "medium" },
  ) =>
    value
      ? new Intl.DateTimeFormat(i18n.resolvedLanguage, {
          ...options,
          timeZone: timezone,
        }).format(new Date(value))
      : "—";
};
export function usePlanLabels() {
  const m = useCopy();
  return {
    frequency(plan) {
      if (!plan.calendar?.unit) return m("Operating hours");
      const unit = { day: "Day", week: "Week", month: "Month", year: "Year" }[
        plan.calendar.unit
      ];
      const calendar = `${plan.calendar.interval} ${m(plan.calendar.interval === 1 ? unit : unit + "s")}`;
      return plan.trigger === "combined"
        ? calendar + " / " + plan.meter.interval + " " + m("hours")
        : calendar;
    },
    status(plan) {
      if (plan.status === "paused") return [m("Paused"), "amber"];
      if (plan.dueAt && +new Date(plan.dueAt) < Date.now())
        return [m("Overdue"), "red"];
      return [m("Active"), "green"];
    },
  };
}
