export const TIMEZONE_CHANGE_EVENT = "mirsat:timezone-change";
export const readSelectedTimezone = () => {
  try {
    const saved = localStorage.getItem("selectedTimezone") || "Asia/Riyadh";
    new Intl.DateTimeFormat("en", { timeZone: saved }).format();
    return saved;
  } catch {
    return "Asia/Riyadh";
  }
};
export const subscribeSelectedTimezone = (notify) => {
  const storage = (event) => {
    if (event.key === "selectedTimezone") notify();
  };
  window.addEventListener(TIMEZONE_CHANGE_EVENT, notify);
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener(TIMEZONE_CHANGE_EVENT, notify);
    window.removeEventListener("storage", storage);
  };
};
